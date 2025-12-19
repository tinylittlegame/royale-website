import NextAuth, { NextAuthOptions } from 'next-auth';
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
        }),
        // Line provider configuration
        {
            id: 'line',
            name: 'LINE',
            type: 'oauth',
            clientId: process.env.LINE_CLIENT_ID || '',
            clientSecret: process.env.LINE_CLIENT_SECRET || '',
            authorization: {
                url: 'https://access.line.me/oauth2/v2.1/authorize',
                params: { scope: 'profile openid email' },
            },
            token: 'https://api.line.me/oauth2/v2.1/token',
            userinfo: 'https://api.line.me/v2/profile',
            profile(profile: any) {
                return {
                    id: profile.userId,
                    name: profile.displayName,
                    email: profile.email || `${profile.userId}@line.me`,
                    image: profile.pictureUrl,
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
            }
            if (profile) {
                token.email = profile.email || token.email;
                token.name = profile.name || token.name;
                token.picture = profile.picture || profile.image || token.picture;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            // Send properties to the client
            if (session.user) {
                session.user.email = token.email || '';
                session.user.name = token.name || '';
                session.user.image = token.picture as string || '';
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
