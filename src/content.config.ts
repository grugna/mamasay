import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Privacy Policy and Terms of Service: Markdown files, one per page, editable in TinaCMS.
const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    effective: z.string().optional(),
    lastUpdated: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { legal };
