import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY not configured');
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function textToHtml(text: string, imageUrl?: string | null): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const withLinks = escaped.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" style="color:#2563eb">$1</a>',
  );

  const paragraphs = withLinks
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

  const imageBlock = imageUrl
    ? `<div style="margin:0 0 24px"><img src="${imageUrl}" alt="Campanha" style="max-width:100%;border-radius:8px" /></div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:24px">
  ${imageBlock}
  ${paragraphs}
  <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0 16px">
  <p style="font-size:12px;color:#888;margin:0">Issy Tecnologia</p>
</body>
</html>`.trim();
}

export async function sendCampaignEmail({
  to,
  subject,
  text,
  imageUrl,
}: {
  to: string;
  subject: string;
  text: string;
  imageUrl?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'felipescupino@issyseg.com.br';

  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: `Issy Tecnologia <${fromEmail}>`,
      to,
      subject,
      html: textToHtml(text, imageUrl),
      text,
    });

    if (error) {
      console.error('[email] Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error';
    console.error('[email] Send failed:', message);
    return { success: false, error: message };
  }
}
