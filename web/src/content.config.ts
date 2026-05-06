import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections de gesdiweb.
 * El `id` de cada entry es el filename sin extensión y se usa como slug.
 */

const services = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    headline: z.string(),
    excerpt: z.string(),
    features: z.array(z.string()),
    approach: z.array(z.string()),
    order: z.number().int().positive(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    status: z.enum(['draft', 'published']).default('published'),
    lang: z.string().default('es'),
  }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/portfolio' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      client: z.string(),
      year: z.number().int(),
      excerpt: z.string(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      gallery: z.array(image()).optional(),
      techStack: z.array(z.string()),
      servicesUsed: z.array(z.string()),
      url: z.string().url().optional(),
      featured: z.boolean().default(false),
      order: z.number().int().positive(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      status: z.enum(['draft', 'published']).default('published'),
      lang: z.string().default('es'),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    author: z.string().default('Jota'),
    publishedAt: z.coerce.date(),
    readingMinutes: z.number().int().positive(),
    categories: z.array(z.string()),
    tags: z.array(z.string()),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    status: z.enum(['draft', 'scheduled', 'published']).default('published'),
    lang: z.string().default('es'),
  }),
});

export const collections = { services, portfolio, blog };
