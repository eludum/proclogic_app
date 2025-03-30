/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
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
