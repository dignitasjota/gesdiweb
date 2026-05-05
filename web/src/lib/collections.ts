import { getCollection, type CollectionEntry } from 'astro:content';

export type ServiceEntry = CollectionEntry<'services'>;
export type ProjectEntry = CollectionEntry<'portfolio'>;
export type PostEntry = CollectionEntry<'blog'>;

const isPublished = (e: { data: { status?: string } }) =>
  e.data.status !== 'draft';

// ─── Services ────────────────────────────────────────────

export async function getOrderedServices(): Promise<ServiceEntry[]> {
  const all = await getCollection('services', isPublished);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getServiceById(
  id: string,
): Promise<ServiceEntry | undefined> {
  const all = await getCollection('services');
  return all.find((s) => s.id === id);
}

// ─── Portfolio ───────────────────────────────────────────

export async function getAllProjects(): Promise<ProjectEntry[]> {
  const all = await getCollection('portfolio', isPublished);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getFeaturedProjects(): Promise<ProjectEntry[]> {
  const all = await getAllProjects();
  return all.filter((p) => p.data.featured);
}

export async function getProjectById(
  id: string,
): Promise<ProjectEntry | undefined> {
  const all = await getCollection('portfolio');
  return all.find((p) => p.id === id);
}

// ─── Blog ────────────────────────────────────────────────

export async function getAllPosts(): Promise<PostEntry[]> {
  const all = await getCollection('blog', isPublished);
  return all.sort(
    (a, b) =>
      b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

export async function getRecentPosts(limit = 3): Promise<PostEntry[]> {
  const all = await getAllPosts();
  return all.slice(0, limit);
}

export async function getPostById(
  id: string,
): Promise<PostEntry | undefined> {
  const all = await getCollection('blog');
  return all.find((p) => p.id === id);
}

// ─── Utilidades ─────────────────────────────────────────

export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function isoDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}
