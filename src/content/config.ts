import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(['review', 'comparison', 'roundup']),
    category: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    score: z.number().optional(),
    verdict: z.string().optional(),
    verdictSub: z.string().optional(),
    affiliateUrl: z.string().optional(),
    affiliateCta: z.string().optional(),
    affiliateNote: z.string().optional(),
    priceRange: z.string().optional(),
    bestFor: z.string().optional(),
    notFor: z.string().optional(),
  }),
});

export const collections = { articles };
