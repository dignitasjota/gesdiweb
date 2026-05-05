/**
 * Datos placeholder de servicios.
 * En Fase 3 migran a content collections (MDX) — esta estructura ya está
 * pensada para ser equivalente al schema Zod final.
 */

export interface Service {
  slug: string;
  title: string;
  headline: string;
  excerpt: string;
  features: string[];
  approach: string[];
  order: number;
}

export const services: Service[] = [
  {
    slug: 'posicionamiento-web',
    title: 'Posicionamiento web',
    headline: 'SEO técnico que mueve el negocio.',
    excerpt:
      'Auditoría, estrategia y ejecución continua de SEO. Resultados medibles, no humo.',
    features: [
      'Auditoría técnica completa',
      'Estrategia de palabras clave',
      'Optimización on-page',
      'Linkbuilding ético',
      'Reporting mensual transparente',
    ],
    approach: [
      'Análisis de la competencia y del estado actual.',
      'Plan de acción a 6-12 meses con hitos medibles.',
      'Optimización técnica de Core Web Vitals.',
      'Contenido enfocado a intención de búsqueda real.',
      'Seguimiento mensual con métricas claras.',
    ],
    order: 1,
  },
  {
    slug: 'apps-moviles',
    title: 'Apps móviles',
    headline: 'Aplicaciones nativas y híbridas.',
    excerpt:
      'Desde una idea hasta la App Store. Diseño UX, desarrollo y mantenimiento.',
    features: [
      'iOS y Android con un solo código',
      'Notificaciones push y analítica',
      'Integración con tu backend o creamos uno',
      'Publicación en App Store y Google Play',
      'Mantenimiento evolutivo',
    ],
    approach: [
      'Workshop inicial para definir alcance y métricas.',
      'Prototipado rápido validado con usuarios reales.',
      'Desarrollo iterativo con builds semanales.',
      'Acompañamiento en publicación y review de las stores.',
      'Soporte y evolución tras el lanzamiento.',
    ],
    order: 2,
  },
  {
    slug: 'hosting-web',
    title: 'Hosting web',
    headline: 'Servidores rápidos, seguros y bien atendidos.',
    excerpt:
      'Hosting profesional con SSL, backups y monitorización incluidos.',
    features: [
      'SSD NVMe en datacenter europeo',
      'SSL Let’s Encrypt automático',
      'Backups diarios cifrados',
      'Monitorización 24/7',
      'Soporte humano en español',
    ],
    approach: [
      'Plan adaptado al tipo de proyecto y carga prevista.',
      'Migración asistida sin downtime.',
      'Caché y CDN configurados de fábrica.',
      'Backups diarios con retención de 30 días.',
      'Atención directa por email o teléfono.',
    ],
    order: 3,
  },
  {
    slug: 'marketing-online',
    title: 'Marketing online',
    headline: 'Campañas que generan negocio, no clics.',
    excerpt:
      'SEM, social ads, email marketing y analítica medida con rigor.',
    features: [
      'Google Ads y Meta Ads',
      'Email marketing y automatizaciones',
      'Auditoría de tracking y eventos',
      'Dashboards de métricas reales',
      'Optimización continua',
    ],
    approach: [
      'Análisis de objetivos y embudo actual.',
      'Setup limpio de tracking (GA4, Meta, server-side cuando aplique).',
      'Campañas piloto con presupuesto controlado.',
      'Iteración semanal sobre los resultados.',
      'Reporting mensual con foco en ROI.',
    ],
    order: 4,
  },
  {
    slug: 'mantenimiento-informatico',
    title: 'Mantenimiento informático',
    headline: 'Tu infraestructura, sin sorpresas.',
    excerpt:
      'Mantenimiento preventivo y correctivo de sistemas, redes y servidores.',
    features: [
      'Soporte remoto y presencial',
      'Auditoría de seguridad inicial',
      'Actualizaciones programadas',
      'Monitorización de equipos',
      'Acuerdos de nivel de servicio (SLA)',
    ],
    approach: [
      'Inventario y diagnóstico inicial.',
      'Plan de mantenimiento con calendario fijo.',
      'Resolución de incidencias con tiempos comprometidos.',
      'Reporte trimestral de estado y mejoras.',
      'Asesoramiento en renovación tecnológica.',
    ],
    order: 5,
  },
];

export const getServiceBySlug = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug);

export const getOrderedServices = (): Service[] =>
  [...services].sort((a, b) => a.order - b.order);
