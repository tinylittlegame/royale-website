/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'tinybackend-dev.tinylittle.xyz',
      'tinylittlefly.io',
      'royaleapp.tinylittle.io',
      'lh3.googleusercontent.com',      // Google profile images
      'platform-lookaside.fbsbx.com',   // Facebook profile images
      'profile.line-scdn.net',          // Line profile images
    ],
  },
}

module.exports = nextConfig
