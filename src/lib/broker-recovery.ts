import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/zapi';

interface RecoveryResult {
  recovered: boolean;
  isBroker: boolean;
  brokerName?: string;
  campaignNames?: string[];
}

/**
 * Marks a broker as recovered by phone number.
 * Idempotent: if already recovered, returns { recovered: false }.
 */
export async function markBrokerAsRecovered(phone: string): Promise<RecoveryResult> {
  const broker = await prisma.broker.findUnique({
    where: { phone },
    include: {
      campaigns: {
        where: { status: { in: ['pending', 'in_progress'] } },
        include: { campaign: { select: { name: true } } },
      },
    },
  });

  if (!broker) return { recovered: false, isBroker: false };

  // Already recovered — idempotent, no-op
  if (broker.status === 'recovered' && broker.campaigns.length === 0) {
    return { recovered: false, isBroker: true };
  }

  const campaignNames = broker.campaigns.map((cb) => cb.campaign.name);

  // Mark broker as recovered
  await prisma.broker.update({
    where: { id: broker.id },
    data: { status: 'recovered' },
  });

  // Stop all active follow-ups
  await prisma.campaignBroker.updateMany({
    where: {
      brokerId: broker.id,
      status: { in: ['pending', 'in_progress'] },
    },
    data: {
      status: 'responded',
      respondedAt: new Date(),
      nextMessageAt: null,
    },
  });

  return { recovered: true, isBroker: true, brokerName: broker.name, campaignNames };
}

/**
 * Notifies the admin via WhatsApp that a broker replied.
 * Failures are logged but never thrown — notification must not block the flow.
 */
export async function notifyAdminOfRecovery(
  brokerName: string,
  phone: string,
  campaignNames: string[],
): Promise<void> {
  const adminPhone = process.env.ADMIN_WHATSAPP_PHONE;
  if (!adminPhone) {
    console.warn('[broker-recovery] ADMIN_WHATSAPP_PHONE not configured, skipping notification');
    return;
  }

  const campaigns = campaignNames.length > 0
    ? campaignNames.join(', ')
    : 'nenhuma campanha ativa';

  const message =
    `📩 *Corretor respondeu!*\n\n` +
    `*Nome:* ${brokerName}\n` +
    `*Telefone:* ${phone}\n` +
    `*Campanhas:* ${campaigns}\n\n` +
    `O corretor foi marcado como recuperado e os follow-ups foram parados.`;

  try {
    await sendWhatsAppMessage(adminPhone, message);
  } catch (err) {
    console.error('[broker-recovery] Failed to notify admin:', err);
  }
}
