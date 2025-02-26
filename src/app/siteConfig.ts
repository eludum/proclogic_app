export const siteConfig = {
  name: "ProcLogic",
  url: "https://app.proclogic.be",
  api_base_url: "http://localhost:8000",
  description: "ProcLogic: het meest geavanceerde publieke sector aanbiedingen platform.",
  baseLinks: {
    quotes: {
      overview: "/quotes/overview",
      monitoring: "/quotes/monitoring",
      audits: "/quotes/audits",
    },
  },
}

export type siteConfig = typeof siteConfig
