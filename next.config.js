/** @type {import('next').NextConfig} */
const path = require('path');
const withBundleAnalyzer = process.env.ANALYZE === 'true' 
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const isDevelopment = process.env.NODE_ENV !== 'production';

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
  publicRuntimeConfig: {
    isDevelopment,
    fileConfig: {
      development: {
        uploads: 'public/uploads',
        static: 'public/static',
        images: 'public/uploads/images',
        pdfs: 'public/uploads/pdfs',
        models: 'public/uploads/models'
      },
      production: {
        uploads: '.next/static/uploads',
        static: '.next/static/static',
        images: '.next/static/uploads/images',
        pdfs: '.next/static/uploads/pdfs',
        models: '.next/static/uploads/models'
      }
    }
  },
  async redirects() {
    return [
      {
        source: '/contact/model',
        destination: '/contact/models',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/serveUpload/:path*',
      },
    ];
  },
  // This ensures the server listens on all network interfaces
  webpack: (config, { isServer }) => {
    // Add module resolution paths
    config.resolve.alias = {
      ...config.resolve.alias,
      '@models': path.resolve(__dirname, 'src/models'),
      '@components': path.resolve(__dirname, 'components'),
      '@pages': path.resolve(__dirname, 'pages'),
      '@public': path.resolve(__dirname, 'public'),
      '@src': path.resolve(__dirname, 'src'),
      '@styles': path.resolve(__dirname, 'styles')
    };

    // Add file extensions to resolve
    config.resolve.extensions = [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.css',
      '.module.css',
      ...config.resolve.extensions
    ];
    
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