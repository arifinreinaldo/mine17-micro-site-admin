import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,

  // Optimize for SPA behavior
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // Configure webpack to handle SVG imports as React components
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    return config
  },
}

export default nextConfig
