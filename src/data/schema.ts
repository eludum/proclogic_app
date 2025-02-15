import { z } from "zod"

export const DescriptionSchema = z.object({
  language: z.string(),
  text: z.string(),
});

export const CPVCodeSchema = z.object({
  code: z.string(),
  descriptions: z.array(DescriptionSchema),
});

export const CompanySchema = z.object({
  vat_number: z.string(),
  name: z.string(),
  email: z.string(),
  interested_cpv_codes: z.array(CPVCodeSchema),
  summary_activities: z.string(),
  accreditations: z.record(z.unknown()).optional(),
  max_publication_value: z.number(),
});

export const EnterpriseCategorySchema = z.object({
  categoryCode: z.string(),
  levels: z.array(z.number()),
});

export const DossierSchema = z.object({
  accreditations: z.record(z.unknown()).optional(),
  descriptions: z.array(DescriptionSchema),
  enterpriseCategories: z.array(EnterpriseCategorySchema),
  legalBasis: z.string(),
  number: z.string(),
  procurementProcedureType: z.string().optional(),
  referenceNumber: z.string(),
  specialPurchasingTechnique: z.string().optional(),
  titles: z.array(DescriptionSchema),
});

export const LotSchema = z.object({
  descriptions: z.array(DescriptionSchema),
  reservedExecution: z.array(z.string()),
  reservedParticipation: z.array(z.string()),
  titles: z.array(DescriptionSchema),
});

export const OrganisationNameSchema = z.object({
  language: z.string(),
  text: z.string(),
});

export const OrganisationSchema = z.object({
  organisationId: z.number(),
  organisationNames: z.array(OrganisationNameSchema),
  tree: z.string(),
});

export const PublicationSchema = z.object({
  cpvAdditionalCodes: z.array(CPVCodeSchema),
  cpvMainCode: CPVCodeSchema,
  dispatchDate: z.date(),
  dossier: DossierSchema,
  insertionDate: z.date(),
  lots: z.array(LotSchema),
  natures: z.array(z.string()),
  noticeIds: z.array(z.string()),
  noticeSubType: z.string(),
  nutsCodes: z.array(z.string()),
  organisation: OrganisationSchema,
  procedureId: z.string(),
  publicationDate: z.date(),
  publicationLanguages: z.array(z.string()),
  publicationReferenceNumbersBDA: z.array(z.string()),
  publicationReferenceNumbersTED: z.array(z.string()),
  publicationType: z.string(),
  publicationWorkspaceId: z.string(),
  publishedAt: z.array(z.date()),
  referenceNumber: z.string(),
  sentAt: z.array(z.date()),
  tedPublished: z.boolean(),
  vaultSubmissionDeadline: z.date().optional(),
  recommended: z.array(CompanySchema).optional(),
  ai_summary: z.string().optional(),
});


export const transactionSchema = z.object({
  transaction_id: z.string(),
  transaction_date: z.string(),
  expense_status: z.string(),
  payment_status: z.string(),
  merchant: z.string(),
  category: z.string(),
  amount: z.number(),
  currency: z.string(),
  lastEdited: z.string(),
  continent: z.string(),
  country: z.string(),
})

export type Transaction = z.infer<typeof transactionSchema>

export const categories = [
  "Office Supplies",
  "Rent",
  "Utilities",
  "Employee Salaries",
  "Marketing",
  "Travel",
  "Training & Development",
  "Consulting Fees",
  "Professional Services",
  "Insurance",
  "Technology & Software",
  "Internet",
  "Phone",
  "Legal Fees",
  "Accounting Services",
  "Subscriptions & Memberships",
  "Maintenance & Repairs",
  "Shipping & Delivery",
  "Inventory",
  "Advertising",
]

export const merchants = [
  "Adobe",
  "AliExpress",
  "Amazon",
  "Amazon Advertising",
  "American Airlines",
  "Apple",
  "Best Buy",
  "Delta Air Lines",
  "DoorDash",
  "Facebook Ads",
  "FedEx",
  "Google Ads",
  "Google G Suite",
  "Linkedin",
  "Lyft",
  "Microsoft",
  "Starbucks",
  "The Home Depot",
  "Twilio",
  "Uber",
  "Uber Eats",
  "Uber HQ",
  "United Airlines",
  "USPS",
  "Walmart",
]

export const expense_statuses = [
  {
    value: "approved",
    label: "Approved",
    variant: "success",
    weight: 0.9,
  },
  {
    value: "pending",
    label: "Pending",
    variant: "neutral",
    weight: 0.05,
  },
  {
    value: "actionRequired",
    label: "Action required",
    variant: "error",
    weight: 0.04,
  },
  {
    value: "inAudit",
    label: "In audit",
    variant: "warning",
    weight: 0.01,
  },
]

export const payment_statuses = [
  {
    value: "processing",
    label: "Processing",
    weight: 0.01,
  },
  {
    value: "cleared",
    label: "Cleared",
    weight: 0.99,
  },
]

export const currencies = [
  {
    value: "usd",
    label: "USD",
    weight: 0.85,
  },
  {
    value: "eur",
    label: "EUR",
    weight: 0.15,
  },
]

export const locations = [
  {
    name: "Africa",
    countries: [
      "Nigeria",
      "Ethiopia",
      "Egypt",
      "South Africa",
      "Kenya",
      "Uganda",
    ],
    weight: 10,
  },
  {
    name: "Asia",
    countries: [
      "China",
      "India",
      "Indonesia",
      "Japan",
      "Philippines",
      "Vietnam",
      "Thailand",
      "South Korea",
      "Iraq",
      "Saudi Arabia",
      "Uzbekistan",
      "Malaysia",
      "Nepal",
      "Sri Lanka",
    ],
    weight: 10,
  },
  {
    name: "Europe",
    countries: [
      "Germany",
      "France",
      "United Kingdom",
      "Italy",
      "Spain",
      "Poland",
      "Netherlands",
      "Belgium",
      "Czech Republic",
      "Greece",
      "Portugal",
      "Switzerland",
      "Austria",
      "Sweden",
      "Hungary",
      "Denmark",
      "Norway",
    ],
    weight: 25,
  },
  {
    name: "North America",
    countries: [
      "United States",
      "Canada",
      "Mexico",
      "Guatemala",
      "Honduras",
      "El Salvador",
    ],
    weight: 25,
  },
  {
    name: "South America",
    countries: [
      "Brazil",
      "Argentina",
      "Colombia",
      "Chile",
      "Peru",
      "Venezuela",
    ],
    weight: 10,
  },
  {
    name: "Australia",
    countries: ["Australia", "New Zealand", "Fiji"],
    weight: 10,
  },
]
