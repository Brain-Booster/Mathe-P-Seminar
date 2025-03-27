/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure source directory
  distDir: '.next',
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Configure pages directory in src
  dir: './src',

  // Configure path aliases for new directory structure
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.join(__dirname, '../src/components'),
      '@contexts': path.join(__dirname, '../src/contexts'),
      '@styles': path.join(__dirname, '../src/styles'),
    };
    
    return config;
  },
  
  async rewrites() {
    return [];
  },
  // Force server to listen on all interfaces to allow external connections
  experimental: {
    hostname: '0.0.0.0', // This allows connections from any IP
    port: 33355,
  },
}

// Import path module at the top
const path = require('path');

module.exports = nextConfig 