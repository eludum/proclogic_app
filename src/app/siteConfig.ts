export const siteConfig = {
  name: "ProcLogic",
  url: "https://app.proclogic.be",
  api_base_url: process.env.API_URL || "http://localhost:8000",
  description: "ProcLogic: het meest geavanceerde publieke sector aanbiedingen platform.",
}

export type siteConfig = typeof siteConfig
