/**
 * Posts placeholder del blog. Migrarán a MDX en Fase 3.
 */

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  publishedAt: string; // ISO date
  readingMinutes: number;
  categories: string[];
  tags: string[];
}

export const posts: Post[] = [
  {
    slug: 'como-mejorar-core-web-vitals',
    title: 'Cómo mejorar tus Core Web Vitals sin volverte loco',
    excerpt:
      'Una guía práctica para entender LCP, CLS e INP, y cómo atacarlos en orden de impacto.',
    body: 'Contenido completo del post pendiente de redacción.',
    author: 'Jota',
    publishedAt: '2026-04-12',
    readingMinutes: 7,
    categories: ['SEO técnico'],
    tags: ['Core Web Vitals', 'rendimiento'],
  },
  {
    slug: 'wordpress-vs-astro-cuando-usar-cada-uno',
    title: 'WordPress vs. Astro: cuándo usar cada uno en 2026',
    excerpt:
      'No todo proyecto es WordPress, pero tampoco todo es Astro. Cuándo conviene cada uno.',
    body: 'Contenido completo del post pendiente de redacción.',
    author: 'Jota',
    publishedAt: '2026-03-21',
    readingMinutes: 9,
    categories: ['Estrategia'],
    tags: ['WordPress', 'Astro', 'CMS'],
  },
  {
    slug: 'guia-seo-local-pymes-2026',
    title: 'Guía de SEO local para pymes en 2026',
    excerpt:
      'Cómo posicionar tu negocio en Google Maps y en las búsquedas con intención local.',
    body: 'Contenido completo del post pendiente de redacción.',
    author: 'Jota',
    publishedAt: '2026-02-08',
    readingMinutes: 11,
    categories: ['SEO local'],
    tags: ['Google Business Profile', 'pymes', 'reseñas'],
  },
];

export const getPostBySlug = (slug: string): Post | undefined =>
  posts.find((p) => p.slug === slug);

export const getRecentPosts = (limit = 3): Post[] =>
  [...posts]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, limit);

export const getAllPosts = (): Post[] =>
  [...posts].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );

export function formatDateLong(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
