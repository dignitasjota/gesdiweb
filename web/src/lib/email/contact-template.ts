/**
 * Plantilla HTML del email de notificación de leads.
 * Diseño inline (sin CSS externo) para máxima compatibilidad con clientes
 * de email. Paleta corporativa de gesdiweb.
 */

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
  sourcePage?: string;
  userAgent?: string;
  ip?: string;
  receivedAt: Date;
}

const escape = (s: string): string =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );

export function renderContactEmailHtml(p: ContactPayload): string {
  const fields: { label: string; value?: string }[] = [
    { label: 'Nombre', value: p.name },
    { label: 'Email', value: p.email },
    { label: 'Teléfono', value: p.phone || '—' },
    { label: 'Empresa', value: p.company || '—' },
    { label: 'Servicio de interés', value: p.service || '—' },
    { label: 'Presupuesto', value: p.budget || '—' },
  ];

  const rows = fields
    .map(
      (f) => `
        <tr>
          <td style="padding:8px 16px 8px 0;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#a7a7a7;width:160px;vertical-align:top;">${escape(f.label)}</td>
          <td style="padding:8px 0;font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#0a0a0a;">${escape(f.value ?? '—')}</td>
        </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8"><title>Nuevo lead · gesdiweb</title></head>
  <body style="margin:0;padding:24px;background:#fafafa;font-family:system-ui,-apple-system,sans-serif;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:16px;overflow:hidden;">
      <div style="background:#77c2da;padding:24px 32px;color:#ffffff;">
        <p style="margin:0 0 8px 0;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;opacity:0.85;">// nuevo lead · gesdiweb.es</p>
        <h1 style="margin:0;font-family:system-ui,-apple-system,sans-serif;font-size:22px;font-weight:700;letter-spacing:-0.02em;">${escape(p.name)} ha enviado el formulario</h1>
      </div>

      <div style="padding:24px 32px;">
        <table style="width:100%;border-collapse:collapse;">${rows}</table>

        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e5e5;">
          <p style="margin:0 0 12px 0;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#a7a7a7;">Mensaje</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#0a0a0a;white-space:pre-wrap;">${escape(p.message)}</p>
        </div>

        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e5e5;font-family:ui-monospace,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#a7a7a7;">
          <p style="margin:4px 0;">recibido: ${p.receivedAt.toISOString()}</p>
          ${p.sourcePage ? `<p style="margin:4px 0;">desde: ${escape(p.sourcePage)}</p>` : ''}
          ${p.ip ? `<p style="margin:4px 0;">ip: ${escape(p.ip)}</p>` : ''}
        </div>

        <div style="margin-top:24px;display:flex;gap:8px;">
          <a href="mailto:${escape(p.email)}?subject=${encodeURIComponent('Re: tu consulta')}" style="display:inline-block;padding:10px 18px;border-radius:9999px;background:#0a0a0a;color:#ffffff;text-decoration:none;font-family:system-ui,-apple-system,sans-serif;font-size:13px;font-weight:500;">Responder a ${escape(p.name)}</a>
        </div>
      </div>
    </div>

    <p style="text-align:center;margin:24px 0;font-family:ui-monospace,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.18em;color:#a7a7a7;">// notificación automática · gesdiweb</p>
  </body>
</html>`;
}

export function renderContactEmailText(p: ContactPayload): string {
  return [
    `Nuevo lead recibido en gesdiweb.es`,
    ``,
    `Nombre: ${p.name}`,
    `Email: ${p.email}`,
    `Teléfono: ${p.phone || '—'}`,
    `Empresa: ${p.company || '—'}`,
    `Servicio: ${p.service || '—'}`,
    `Presupuesto: ${p.budget || '—'}`,
    ``,
    `Mensaje:`,
    p.message,
    ``,
    `---`,
    `Recibido: ${p.receivedAt.toISOString()}`,
    p.sourcePage ? `Desde: ${p.sourcePage}` : '',
    p.ip ? `IP: ${p.ip}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
