/**
 * Rate limiter en memoria muy simple, suficiente para un formulario de
 * contacto en una sola instancia. Si en el futuro escalamos a varias
 * réplicas habría que mover esto a Redis o KV.
 *
 * Reglas por defecto:
 *   - 5 envíos máximos
 *   - en una ventana de 10 minutos
 *   - por IP
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

export function checkRateLimit(key: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= MAX_HITS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

// Limpieza periódica de buckets caducados (evitar fuga de memoria si la
// instancia vive mucho tiempo).
if (typeof globalThis.setInterval === 'function') {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, bucket] of buckets) {
        if (bucket.resetAt < now) buckets.delete(key);
      }
    },
    5 * 60 * 1000,
  );
}
