/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['services', 'ts-rest'],
  env: {
    NEXT_PUBLIC_API_HOST_URL: process.env.NEXT_PUBLIC_API_HOST_URL || '',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_EMAIL: process.env.SUPABASE_SERVICE_EMAIL || '',
    SUPABASE_SERVICE_PASSWORD: process.env.SUPABASE_SERVICE_PASSWORD || '',
  },
}

module.exports = nextConfig
