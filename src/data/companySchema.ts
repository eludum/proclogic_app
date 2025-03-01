import { z } from "zod";

const SectorSchema = z.object({
    sector: z.string(),
    cpv_codes: z.array(z.string()),
});

const CompanySchema = z.object({
    vat_number: z.string(),
    name: z.string(),
    email: z.string().email(),
    interested_sectors: z.array(SectorSchema),
    summary_activities: z.string(),
    accreditations: z.record(z.any()).optional(),
    // Allow both null and number values for max_publication_value
    max_publication_value: z.number().int().nullable().optional(),
});

export { CompanySchema, SectorSchema };
