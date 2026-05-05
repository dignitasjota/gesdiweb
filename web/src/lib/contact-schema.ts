import { z } from 'zod';

/**
 * Schema único compartido entre cliente (validación previa) y servidor
 * (validación de seguridad). Si cambia la forma del formulario, cambia aquí.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre es demasiado largo.'),
  email: z
    .string()
    .email('El email no parece válido.')
    .max(150, 'El email es demasiado largo.'),
  phone: z.string().max(40).optional().or(z.literal('')),
  company: z.string().max(120).optional().or(z.literal('')),
  service: z.string().max(60).optional().or(z.literal('')),
  budget: z.string().max(20).optional().or(z.literal('')),
  message: z
    .string()
    .min(10, 'Cuéntanos un poco más (mínimo 10 caracteres).')
    .max(4000, 'El mensaje es demasiado largo (máximo 4000 caracteres).'),
  privacy: z.union([z.literal(true), z.literal('on'), z.literal('true')]),
  // Honeypot: si llega rellenado, es un bot.
  company_url: z.string().max(200).optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;
