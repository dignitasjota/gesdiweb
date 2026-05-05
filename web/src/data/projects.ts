/**
 * Proyectos placeholder. Migrarán a content collections en Fase 3.
 * Imágenes y datos reales pendientes de aportar por el dueño.
 */

export interface Project {
  slug: string;
  title: string;
  client: string;
  year: number;
  excerpt: string;
  body: string;
  techStack: string[];
  servicesUsed: string[]; // slugs de services
  url?: string;
  featured: boolean;
  order: number;
}

export const projects: Project[] = [
  {
    slug: 'tienda-aceite-ecologico',
    title: 'Tienda online de aceite ecológico',
    client: '[PLACEHOLDER · cliente]',
    year: 2025,
    excerpt:
      'WooCommerce optimizada y con SEO local. Multiplicó por 4 el tráfico orgánico en 6 meses.',
    body: 'Caso de estudio pendiente de redacción definitiva con datos reales del cliente.',
    techStack: ['WordPress', 'WooCommerce', 'Cloudflare', 'GA4'],
    servicesUsed: ['posicionamiento-web', 'hosting-web'],
    featured: true,
    order: 1,
  },
  {
    slug: 'app-clinica-fisioterapia',
    title: 'App de gestión de clínica',
    client: '[PLACEHOLDER · cliente]',
    year: 2024,
    excerpt:
      'App nativa para iOS y Android para gestionar reservas y pacientes.',
    body: 'Caso de estudio pendiente.',
    techStack: ['React Native', 'Node.js', 'PostgreSQL'],
    servicesUsed: ['apps-moviles'],
    featured: true,
    order: 2,
  },
  {
    slug: 'web-corporativa-asesoria',
    title: 'Web corporativa para asesoría',
    client: '[PLACEHOLDER · cliente]',
    year: 2024,
    excerpt:
      'Web institucional con sección de noticias y embudo de captación de leads.',
    body: 'Caso de estudio pendiente.',
    techStack: ['Astro', 'Tailwind', 'HubSpot'],
    servicesUsed: ['posicionamiento-web', 'marketing-online'],
    featured: true,
    order: 3,
  },
  {
    slug: 'plataforma-formacion-online',
    title: 'Plataforma de formación online',
    client: '[PLACEHOLDER · cliente]',
    year: 2023,
    excerpt:
      'Plataforma de cursos con pasarelas de pago y zona privada de alumnos.',
    body: 'Caso de estudio pendiente.',
    techStack: ['Next.js', 'Stripe', 'Sanity', 'Vercel'],
    servicesUsed: ['posicionamiento-web', 'mantenimiento-informatico'],
    featured: false,
    order: 4,
  },
  {
    slug: 'rediseno-web-restaurante',
    title: 'Rediseño web de restaurante',
    client: '[PLACEHOLDER · cliente]',
    year: 2023,
    excerpt:
      'Rediseño con foco en reservas y SEO local. Mejoras significativas en Maps.',
    body: 'Caso de estudio pendiente.',
    techStack: ['WordPress', 'OpenTable', 'Google Business Profile'],
    servicesUsed: ['posicionamiento-web'],
    featured: false,
    order: 5,
  },
];

export const getProjectBySlug = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug);

export const getFeaturedProjects = (): Project[] =>
  projects.filter((p) => p.featured).sort((a, b) => a.order - b.order);

export const getAllProjects = (): Project[] =>
  [...projects].sort((a, b) => a.order - b.order);
