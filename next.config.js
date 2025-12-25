/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'tinybackend-dev.tinylittle.xyz',
      'tinylittlefly.io',
      'royaleapp.tinylittle.io',
      'img.tinylittle.me',              // Tiny Little image CDN
      'lh3.googleusercontent.com',      // Google profile images
      'platform-lookaside.fbsbx.com',   // Facebook profile images
      'profile.line-scdn.net',          // Line profile images
      't.me',                           // Telegram profile images
    ],
  },
}

module.exports = nextConfig
