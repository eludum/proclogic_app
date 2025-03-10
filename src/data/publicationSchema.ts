import { z } from "zod";

const PublicationOutSchema = z.object({
    // Basic information about the publication
    title: z.string(),
    workspace_id: z.string(),
    dispatch_date: z.date(),
    publication_date: z.date(),
    submission_deadline: z.date().nullable().optional(),
    is_active: z.boolean().nullable().optional(),

    // Description and summaries
    original_description: z.string(),
    ai_summary_without_documents: z.string().nullable().optional(),
    ai_summary_with_documents: z.string().nullable().optional(),

    // Organisation and CPV information
    organisation: z.string(),
    cpv_code: z.string(),
    cpv_additional_codes: z.array(z.string()).nullable().optional(),

    // Additional information
    accreditations: z.record(z.any()).nullable().optional(),
    estimated_value: z.string().nullable().optional(),
    documents: z.array(z.string()).nullable().optional(),

    // User-specific information
    publication_in_your_sector: z.boolean().nullable().optional(),
    is_recommended: z.boolean().nullable().optional(),
    is_saved: z.boolean().nullable().optional(),
    is_viewed: z.boolean().nullable().optional(),

    // Location and sector information
    region: z.array(z.string()).nullable().optional(),
    sector: z.string(),

    // Lot information
    lots: z.array(z.string()).nullable().optional(),

    // Forum information
    forum: z.record(z.any()).nullable().optional(),
});

export type Publication = z.infer<typeof PublicationOutSchema>;