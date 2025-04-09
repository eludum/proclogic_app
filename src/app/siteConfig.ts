export const siteConfig = {
  name: "ProcLogic",
  url: process.env.NEXT_PUBLIC_URL || "https://app.proclogic.be",
  api_base_url: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.proclogic.be",
  description: "ProcLogic: het meest geavanceerde publieke sector aanbiedingen platform.",
}

export type siteConfig = typeof siteConfig
