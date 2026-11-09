'use server';
import { Resend } from 'resend';
import { contact } from '@/content/site';

export type InquiryState = { status: 'idle' | 'ok' | 'error' | 'unconfigured'; message?: string; errors?: Record<string, string> };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Contact form → email via Resend.
 * TODO (client): set RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL in Vercel.
 */
export async function sendInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  if (String(form.get('company_site') || '')) return { status: 'ok' }; // honeypot
  const f = (k: string) =>
    String(form.get(k) || '')
      .trim()
      .slice(0, 4000);
  const data = {
    name: f('name'),
    email: f('email'),
    phone: f('phone'),
    type: f('type'),
    budget: f('budget'),
    date: f('date'),
    location: f('location'),
    message: f('message'),
  };
  const errors: Record<string, string> = {};
  if (!data.name) errors.name = 'Tell us your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'We need a valid email to reply.';
  if (data.type && !contact.projectTypes.includes(data.type)) errors.type = 'Pick a project type.';
  if (data.message.length < 10) errors.message = 'A sentence or two about the project helps.';
  if (Object.keys(errors).length) return { status: 'error', message: 'Check the highlighted fields.', errors };

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !to || !from) {
    console.warn('[inquiry] Resend is not configured — set RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL');
    return { status: 'unconfigured', message: 'Our inbox isn’t connected yet — please use the inquiry form instead.' };
  }

  const rows = Object.entries(data)
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#888;text-transform:uppercase;font:12px monospace">${k}</td><td style="padding:6px 12px">${esc(v).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('');
  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `⚡ New inquiry — ${data.type || 'Project'} — ${data.name}`,
      html: `<h2 style="font-family:sans-serif">New Culture Shock inquiry</h2><table>${rows}</table>`,
      text: Object.entries(data)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n'),
    });
    if (error) throw new Error(error.message);
    return { status: 'ok', message: 'Message received. We’ll be in touch.' };
  } catch (e) {
    console.error('[inquiry] send failed', e);
    return { status: 'error', message: 'Something went wrong sending that. Please try the inquiry form.' };
  }
}
