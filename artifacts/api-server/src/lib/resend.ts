import { Resend } from 'resend';

export function getResendClient(): { client: Resend; fromEmail: string } {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY env var is not set');
  return {
    client: new Resend(apiKey),
    fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  };
}
