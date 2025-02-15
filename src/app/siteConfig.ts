export const siteConfig = {
  name: "ProcLogic",
  url: "https://proc.koselogic.be",
  api_base_url: "http://localhost:8000",
  description: "ProcLogic: het meest geavanceerde publieke sector aanbiedingen platform.",
  baseLinks: {
    reports: "/reports",
    publications: "/publications",
    settings: {
      audit: "/settings/audit",
      users: "/settings/users",
      billing: "/settings/billing",
    },
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    onboarding: "/onboarding/products",
  },
}

export type siteConfig = typeof siteConfig
