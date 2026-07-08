/**
 * Helpers de SEO: builders de JSON-LD por tipo de página.
 * Todos devuelven objetos JS que se serializan con JSON.stringify
 * dentro de un <script type="application/ld+json">.
 */

const SITE_URL = 'https://gesdiweb.es';
const SITE_NAME = 'gesdiweb';
const SITE_TAGLINE = 'Diseño web y posicionamiento SEO';
const DEFAULT_OG = `${SITE_URL}/og-default.png`;

const ORG_LOGO = `${SITE_URL}/logo.png`;

// ──────────────────────────────────────────────────────────
// Organization + LocalBusiness (singleton, se reutiliza)
// ──────────────────────────────────────────────────────────

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness', 'ProfessionalService'],
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: SITE_NAME,
  url: SITE_URL,
  logo: ORG_LOGO,
  image: DEFAULT_OG,
  description: SITE_TAGLINE,
  email: 'hola@gesdiweb.es',
  areaServed: {
    '@type': 'Country',
    name: 'España',
  },
  // El address y telephone reales se rellenan cuando el dueño aporte
  // los datos legales. Hasta entonces, comentado para no publicar
  // datos placeholder al graph de Google.
  // address: { ... },
  // telephone: '+34 ...',
  sameAs: [
    // Redes sociales, GitHub, etc. (a rellenar cuando estén)
  ],
  knowsAbout: [
    'Diseño web',
    'Posicionamiento SEO',
    'Apps móviles',
    'Hosting web',
    'Marketing online',
    'Mantenimiento informático',
  ],
});

// ──────────────────────────────────────────────────────────
// WebSite (singleton)
// ──────────────────────────────────────────────────────────

export const webSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_TAGLINE,
  inLanguage: 'es-ES',
  publisher: { '@id': `${SITE_URL}/#organization` },
});

// ──────────────────────────────────────────────────────────
// WebPage genérico (legales, contacto, etc.)
// ──────────────────────────────────────────────────────────

export const webPageSchema = (params: {
  url: string;
  name: string;
  description: string;
  type?: 'WebPage' | 'ContactPage' | 'AboutPage';
}) => ({
  '@context': 'https://schema.org',
  '@type': params.type ?? 'WebPage',
  url: params.url,
  name: params.name,
  description: params.description,
  inLanguage: 'es-ES',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  publisher: { '@id': `${SITE_URL}/#organization` },
});

// ──────────────────────────────────────────────────────────
// Service (página de servicio individual)
// ──────────────────────────────────────────────────────────

export const serviceSchema = (params: {
  slug: string;
  name: string;
  description: string;
  features: string[];
  image?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}/servicios/${params.slug}#service`,
  serviceType: params.name,
  name: params.name,
  description: params.description,
  url: `${SITE_URL}/servicios/${params.slug}`,
  image: params.image ?? DEFAULT_OG,
  provider: { '@id': `${SITE_URL}/#organization` },
  areaServed: { '@type': 'Country', name: 'España' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: `Características de ${params.name}`,
    itemListElement: params.features.map((feature, i) => ({
      '@type': 'Offer',
      position: i + 1,
      itemOffered: { '@type': 'Service', name: feature },
    })),
  },
});

// ──────────────────────────────────────────────────────────
// ItemList (listados: /servicios, /portfolio, /blog)
// ──────────────────────────────────────────────────────────

export const itemListSchema = (params: {
  name: string;
  items: { url: string; name: string }[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: params.name,
  itemListElement: params.items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: item.url,
    name: item.name,
  })),
});

// ──────────────────────────────────────────────────────────
// CreativeWork (proyecto del portfolio)
// ──────────────────────────────────────────────────────────

export const creativeWorkSchema = (params: {
  slug: string;
  name: string;
  description: string;
  year: number;
  client: string;
  image?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  '@id': `${SITE_URL}/portfolio/${params.slug}#work`,
  name: params.name,
  description: params.description,
  url: `${SITE_URL}/portfolio/${params.slug}`,
  dateCreated: `${params.year}-01-01`,
  inLanguage: 'es-ES',
  creator: { '@id': `${SITE_URL}/#organization` },
  about: params.client,
  image: params.image ?? DEFAULT_OG,
});

// ──────────────────────────────────────────────────────────
// BlogPosting (post individual)
// ──────────────────────────────────────────────────────────

export const blogPostingSchema = (params: {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  author: string;
  image?: string;
  keywords?: string[];
  wordCount?: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  '@id': `${SITE_URL}/blog/${params.slug}#post`,
  headline: params.title,
  description: params.description,
  url: `${SITE_URL}/blog/${params.slug}`,
  datePublished: params.publishedAt.toISOString(),
  dateModified: (params.updatedAt ?? params.publishedAt).toISOString(),
  inLanguage: 'es-ES',
  author: {
    '@type': 'Person',
    name: params.author,
    url: SITE_URL,
  },
  publisher: { '@id': `${SITE_URL}/#organization` },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SITE_URL}/blog/${params.slug}`,
  },
  image: params.image ?? DEFAULT_OG,
  keywords: params.keywords?.join(', '),
  wordCount: params.wordCount,
});

// ──────────────────────────────────────────────────────────
// Blog (página listado)
// ──────────────────────────────────────────────────────────

export const blogSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${SITE_URL}/blog#blog`,
  url: `${SITE_URL}/blog`,
  name: 'Blog · gesdiweb',
  description: 'Artículos sobre SEO técnico, diseño web, rendimiento y estrategia digital.',
  inLanguage: 'es-ES',
  publisher: { '@id': `${SITE_URL}/#organization` },
});

// ──────────────────────────────────────────────────────────
// BreadcrumbList (cualquier página interna)
// ──────────────────────────────────────────────────────────

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
});

// ──────────────────────────────────────────────────────────
// Helpers de strings utilitarios
// ──────────────────────────────────────────────────────────

export const SITE = {
  url: SITE_URL,
  name: SITE_NAME,
  tagline: SITE_TAGLINE,
  defaultOgImage: DEFAULT_OG,
};
