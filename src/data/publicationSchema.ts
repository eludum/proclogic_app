import { z } from "zod";

const PublicationOutSchema = z.object({
    title: z.string(), // corrected typo
    dispatch_date: z.date(),
    publication_date: z.date(),
    submission_deadline: z.date().nullable().optional(),
    is_active: z.boolean().nullable().optional(),
    original_description: z.string(),
    ai_summary: z.string(),
    organisation: z.string(),
    cpv_code: z.string(),
    time_remaining: z.string().nullable().optional(),
    accreditations: z.record(z.any()).nullable().optional(),
    publication_value: z.string().nullable().optional(),
    documents: z.array(z.string()).nullable().optional(),
    publication_in_your_sector: z.boolean().nullable().optional(),
    is_recommended: z.boolean().optional()
});

export type Publication = z.infer<typeof PublicationOutSchema>;
