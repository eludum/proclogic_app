/** @type {import('next').NextConfig} */

const nextConfig = {
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/publications",
        destination: "/publications/overview",
        permanent: true,
      },
      {
        source: "/analytics",
        destination: "/analytics/competition",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
