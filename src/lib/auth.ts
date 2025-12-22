import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                    scope: 'openid email profile',
                },
            },
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID || '',
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
            authorization: {
                params: {
                    scope: 'email public_profile',
                },
            },
            // Facebook returns profile info differently
            profile(profile) {
                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture?.data?.url,
                };
            },
        }),
        // Line provider configuration - using OpenID Connect for email access
        {
            id: 'line',
            name: 'LINE',
            type: 'oauth',
            clientId: process.env.LINE_CLIENT_ID || '',
            clientSecret: process.env.LINE_CLIENT_SECRET || '',
            wellKnown: 'https://access.line.me/.well-known/openid-configuration',
            authorization: {
                params: {
                    scope: 'profile openid email',
                },
            },
            checks: ['state'],
            idToken: true,
            // LINE uses HS256 (HMAC with client secret) instead of RS256 (RSA) for ID tokens
            client: {
                id_token_signed_response_alg: 'HS256',
            },
            profile(profile: any) {
                console.log('[LINE Auth] Profile received:', JSON.stringify(profile, null, 2));
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email || `${profile.sub}@line.me`,
                    image: profile.picture,
                };
            },
        },
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, account, profile }: { token: JWT; account: any; profile?: any }) {
            // Persist the OAuth provider and user info in the token
            if (account) {
                token.provider = account.provider;
                token.accessToken = account.access_token;
                console.log(`[Auth] JWT callback - provider: ${account.provider}`);
            }
            if (profile) {
                token.email = profile.email || token.email;
                token.name = profile.name || profile.displayName || token.name;
                token.picture = profile.picture || profile.image || profile.pictureUrl || token.picture;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            // Send properties to the client
            if (session.user) {
                session.user.email = (token.email as string) || '';
                session.user.name = (token.name as string) || '';
                session.user.image = (token.picture as string) || '';
            }
            // Add provider info
            (session as any).provider = token.provider;
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/signin',
    },
    debug: process.env.NODE_ENV === 'development',
};
