/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',

  // Performance optimizations
  compress: true,
  productionBrowserSourceMaps: false,

  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: [
      '@clerk/nextjs',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tooltip',
    ],
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/search",
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
