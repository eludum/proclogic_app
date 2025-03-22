/** @type {import('next').NextConfig} */

module.exports = {
  output: 'standalone'
}

const nextConfig = {
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
