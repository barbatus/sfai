/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['services', 'ts-rest'],
  env: {
    NEXT_PUBLIC_API_HOST_URL: process.env.NEXT_PUBLIC_API_HOST_URL || '',
  },
  webpack: (config) => {
    // Enable polling for file changes in development
    // This helps with hot reload when packages change
    config.watchOptions = {
      poll: 1000, // Check for changes every second
      aggregateTimeout: 300, // Delay rebuild after the first change
    }
    return config
  },
}

module.exports = nextConfig