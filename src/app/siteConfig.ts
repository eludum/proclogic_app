export const siteConfig = {
  name: "ProcLogic",
  url: "https://app.proclogic.be",
  api_base_url: process.env.API_URL || "https://api.proclogic.be", // TODO: this doesnt work
  description: "ProcLogic: het meest geavanceerde publieke sector aanbiedingen platform.",
}

export type siteConfig = typeof siteConfig
