import z from "zod/v4";

export const storeSchemaClient = z.object({
    name: z.string().min(2),
    slug: z.string().min(1),
    description: z.string().nullable().optional(),
    isActive: z.boolean(),
    theme: z
        .object({
            light: z.record(z.string(), z.string()).optional(),
            dark: z.record(z.string(), z.string()).optional(),
            branding: z
                .object({
                    logoUrl: z.string().min(1).optional(),
                    logoAlt: z.string().optional(),
                    logoWidth: z.number().optional(),
                    logoHeight: z.number().optional(),
                    contactEmail: z.string().optional(),
                    contactPhone: z.string().optional(),
                    contactAddress: z.string().optional(),
                    socialFacebook: z.string().optional(),
                    socialInstagram: z.string().optional(),
                    socialTwitter: z.string().optional(),
                })
                .optional(),
            fontId: z.string().optional(),
        })
        .optional(),
});