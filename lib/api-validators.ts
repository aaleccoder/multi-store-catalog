import { z } from 'zod'

export const idString = z.string().min(1)

export const categorySchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    filters: z.array(z.any()).optional(),
})

export const subcategorySchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    categoryId: idString,
    isActive: z.boolean().optional(),
    filters: z.array(z.any()).optional(),
})

export const currencySchema = z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    symbol: z.string().min(1),
    symbolPosition: z.string().optional(),
    decimalSeparator: z.string().optional(),
    thousandsSeparator: z.string().optional(),
    decimalPlaces: z.number().int().optional(),
    isActive: z.boolean().optional(),
})

export const priceInputSchema = z.object({
    currency: z.string().min(1),
    price: z.number().optional(),
    salePrice: z.number().optional(),
    isDefault: z.boolean().optional(),
    taxIncluded: z.boolean().optional(),
})

export const productSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().min(1),
    shortDescription: z.string().optional(),
    categoryId: idString,
    subcategoryId: z.string().optional().nullable(),
    coverImages: z.array(z.any()).optional(),
    specifications: z.any().optional(),
    filterValues: z.array(z.any()).optional(),
    tags: z.array(z.any()).optional(),
    metaData: z.any().optional(),
    isActive: z.boolean().optional(),
    inStock: z.boolean().optional(),
    featured: z.boolean().optional(),
    prices: z.array(priceInputSchema).optional(),
})

export const mediaAltSchema = z.object({ alt: z.string().optional() })

// For update endpoints we will reuse the same shape (server expects values) but you
// could make fields optional if you want partial updates.
export const productUpdateSchema = productSchema
export const categoryUpdateSchema = categorySchema
export const subcategoryUpdateSchema = subcategorySchema
export const currencyUpdateSchema = currencySchema

export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type SubcategoryInput = z.infer<typeof subcategorySchema>