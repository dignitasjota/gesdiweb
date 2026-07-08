import type { APIRoute } from 'astro';
import { RESEND_API_KEY, RESEND_FROM_EMAIL, LEAD_NOTIFICATION_EMAIL } from 'astro:env/server';
import { Resend } from 'resend';
import { contactSchema } from '../../lib/contact-schema';
import { checkRateLimit } from '../../lib/rate-limit';
import {
  renderContactEmailHtml,
  renderContactEmailText,
  type ContactPayload,
} from '../../lib/email/contact-template';

export const prerender = false;

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const getClientIp = (request: Request): string => {
  // Detrás de Nginx Proxy Manager. NPM sobrescribe X-Real-IP con el $remote_addr
  // real (no falsificable por el cliente), así que es la fuente preferida.
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  // Fallback: en X-Forwarded-For el cliente solo puede falsear los valores de la
  // izquierda; el ÚLTIMO es el hop que añadió el proxy de confianza.
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return 'unknown';
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
    if (import.meta.env.DEV) {
      // En desarrollo sin .env no rompemos el flujo: logueamos y simulamos OK.
      console.warn('[contact] RESEND_API_KEY no configurada — modo dev, solo log local');
      console.info('[contact] payload:', payload);
      return json(200, { ok: true, accepted: true, devMode: true });
    }
    // En producción la ausencia de la key es un fallo de configuración. NO
    // fingimos éxito: perderíamos el lead en silencio mostrando "¡Recibido!" al
    // visitante. Devolvemos 503 para que el cliente muestre error real.
    console.error('[contact] RESEND_API_KEY ausente en producción — lead NO enviado');
    return json(503, { ok: false, error: 'email_not_configured' });
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `gesdiweb <${RESEND_FROM_EMAIL}>`,
      to: LEAD_NOTIFICATION_EMAIL,
      replyTo: data.email,
      subject: `[gesdiweb] Nuevo contacto desde la web — ${data.name}${data.service ? ` · ${data.service}` : ''}`,
      html: renderContactEmailHtml(payload),
      text: renderContactEmailText(payload),
      headers: {
        // Identifica el email como generado automáticamente (RFC 3834).
        // Gmail y Outlook lo usan para no clasificar transaccionales como
        // promociones ni para responder con auto-replies en bucle.
        'Auto-Submitted': 'auto-generated',
        // Aunque List-Unsubscribe es típico de marketing, Gmail recomienda
        // incluirlo en cualquier email automatizado para mejor deliverability.
        // Apunta a un mailto del propio remitente con el ID en subject.
        'List-Unsubscribe': `<mailto:${RESEND_FROM_EMAIL}?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
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
export const ALL: APIRoute = () => json(405, { ok: false, error: 'method_not_allowed' });
