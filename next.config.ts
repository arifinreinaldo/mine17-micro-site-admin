import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Use SWC minification for faster builds
  swcMinify: true,
  
  // Optimize for SPA behavior
  poweredByHeader: false,
  
  // Disable x-powered-by header
  compress: true,
}

export default nextConfig
