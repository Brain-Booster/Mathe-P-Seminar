/** @type {import('next').NextConfig} */
const withBundleAnalyzer = process.env.ANALYZE === 'true' 
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Creates a standalone build that's easier to deploy
  poweredByHeader: false, // Removes the X-Powered-By header for security
  compress: true, // Enables gzip compression
  generateEtags: true, // Enables ETag generation for caching
  images: {
    domains: [], // Add domains that host images if using next/image
    deviceSizes: [640, 750, 828, 1080, 1200], // Optimize image sizes
    minimumCacheTTL: 60 * 60 * 24, // Cache images for 24 hours
  },
  experimental: {
    optimizeCss: false, // Disabled to avoid critters dependency
  },
  async rewrites() {
    return [];
  },
  // This ensures the server listens on all network interfaces
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Add terser for minification
    if (process.env.NODE_ENV === 'production') {
      // Enable tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
      };
    }
    
    return config;
  },
}

module.exports = withBundleAnalyzer(nextConfig); 