import { NextRequest, NextResponse } from 'next/server';
import { markBrokerAsRecovered, notifyAdminOfRecovery } from '@/lib/broker-recovery';

const ISSY_ASSISTANT_WEBHOOK = 'https://issy-assistant-1.onrender.com/whatsapp-webhook';

/**
 * Z-API incoming message webhook (fanout proxy).
 * 1. Processes broker recovery for campaign-platform
 * 2. Forwards the full payload to issy-assistant so the chatbot keeps working
 *
 * Configure in Z-API panel → "Mensagens Recebidas":
 *   https://futura-uniao-campanha.onrender.com/api/webhook/zapi/incoming?token=YOUR_TOKEN
 */
export async function POST(req: NextRequest) {
  // Validate token from query string
  const token = req.nextUrl.searchParams.get('token');
  if (!token || token !== process.env.ZAPI_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // --- Campaign-platform processing below ---

  // Validate instanceId matches our instance
  if (body.instanceId && body.instanceId !== process.env.ZAPI_INSTANCE_ID) {
    forwardToIssyAssistant(body);
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Ignore messages sent by us
  if (body.fromMe === true) {
    forwardToIssyAssistant(body);
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Ignore group messages
  if (body.isGroup === true || (typeof body.chatId === 'string' && body.chatId.includes('@g.us'))) {
    forwardToIssyAssistant(body);
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Extract phone number
  let phone = body.phone as string | undefined;
  if (!phone && typeof body.chatId === 'string') {
    phone = body.chatId.replace('@c.us', '');
  }

  if (!phone) {
    forwardToIssyAssistant(body);
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Check if sender is a broker — if so, process recovery and do NOT forward to issy-assistant
  try {
    const result = await markBrokerAsRecovered(phone);

    if (result.isBroker) {
      // Broker = human service, do NOT send to chatbot
      if (result.recovered) {
        await notifyAdminOfRecovery(result.brokerName!, phone, result.campaignNames!);
      }
      return NextResponse.json({ ok: true, broker: true });
    }
  } catch (err) {
    console.error('[zapi-incoming] Error processing reply:', err);
  }

  // Not a broker — forward to issy-assistant chatbot
  forwardToIssyAssistant(body);

  // Always 200 — Z-API retries on non-2xx
  return NextResponse.json({ ok: true });
}

/**
 * Forwards the raw Z-API payload to the issy-assistant webhook.
 * Fire-and-forget: errors are logged but never block the response.
 */
function forwardToIssyAssistant(body: Record<string, unknown>): void {
  fetch(ISSY_ASSISTANT_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch((err) => {
    console.error('[zapi-incoming] Failed to forward to issy-assistant:', err);
  });
}
