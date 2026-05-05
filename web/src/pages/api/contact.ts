import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { contactSchema } from '../../lib/contact-schema';
import { checkRateLimit } from '../../lib/rate-limit';
import {
  renderContactEmailHtml,
  renderContactEmailText,
  type ContactPayload,
} from '../../lib/email/contact-template';

export const prerender = false;

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL =
  import.meta.env.RESEND_FROM_EMAIL || 'hola@gesdiweb.es';
const LEAD_NOTIFICATION_EMAIL =
  import.meta.env.LEAD_NOTIFICATION_EMAIL || 'hola@gesdiweb.es';

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const getClientIp = (request: Request): string => {
  // Detrás de Nginx Proxy Manager. Confiar en X-Forwarded-For first hop.
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
};

export const POST: APIRoute = async ({ request }) => {
  // 1. Parse seguro del body
  let raw: Record<string, unknown>;
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      raw = await request.json();
    } else {
      const fd = await request.formData();
      raw = Object.fromEntries(fd.entries());
    }
  } catch {
    return json(400, { ok: false, error: 'invalid_body' });
  }

  // 2. Honeypot: si está relleno, fingir éxito y descartar (no informar al bot)
  if (typeof raw.company_url === 'string' && raw.company_url.trim() !== '') {
    return json(200, { ok: true, accepted: true });
  }

  // 3. Validación de schema
  const result = contactSchema.safeParse(raw);
  if (!result.success) {
    return json(400, {
      ok: false,
      error: 'validation_failed',
      issues: result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
  }
  const data = result.data;

  // 4. Rate limit por IP
  const ip = getClientIp(request);
  const rate = checkRateLimit(`contact:${ip}`);
  if (!rate.allowed) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'rate_limited',
        retryAfterSeconds: rate.retryAfterSeconds,
      }),
      {
        status: 429,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'retry-after': String(rate.retryAfterSeconds ?? 60),
        },
      },
    );
  }

  // 5. Enviar el email vía Resend (si hay API key configurada)
  const payload: ContactPayload = {
    name: data.name,
    email: data.email,
    phone: data.phone || undefined,
    company: data.company || undefined,
    service: data.service || undefined,
    budget: data.budget || undefined,
    message: data.message,
    sourcePage: request.headers.get('referer') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
    ip,
    receivedAt: new Date(),
  };

  if (!RESEND_API_KEY) {
    // En dev sin .env, no rompemos: logueamos y devolvemos OK.
    // En producción, RESEND_API_KEY debe estar definida (validar al desplegar).
    console.warn('[contact] RESEND_API_KEY no configurada — solo log local');
    console.info('[contact] payload:', payload);
    return json(200, { ok: true, accepted: true, devMode: true });
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `gesdiweb <${RESEND_FROM_EMAIL}>`,
      to: LEAD_NOTIFICATION_EMAIL,
      replyTo: data.email,
      subject: `Nuevo lead · ${data.name}${data.service ? ` · ${data.service}` : ''}`,
      html: renderContactEmailHtml(payload),
      text: renderContactEmailText(payload),
    });

    if (error) {
      console.error('[contact] Resend error:', error);
      return json(502, { ok: false, error: 'email_provider_error' });
    }

    return json(200, { ok: true, accepted: true });
  } catch (err) {
    console.error('[contact] unexpected error:', err);
    return json(500, { ok: false, error: 'internal_error' });
  }
};

// Bloquear el resto de métodos
export const ALL: APIRoute = () =>
  json(405, { ok: false, error: 'method_not_allowed' });
