import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/zapi';
import { sendCampaignEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await params; // validate route param
  const { messageLogId } = await req.json();

  const log = await prisma.messageLog.findUnique({
    where: { id: Number(messageLogId) },
    include: {
      campaignBroker: {
        include: {
          broker: true,
          campaign: true,
        },
      },
    },
  });

  if (!log) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

  try {
    if (log.channel === 'email') {
      if (!log.campaignBroker.broker.email) {
        return NextResponse.json({ error: 'Broker has no email' }, { status: 400 });
      }
      const subject = `${log.campaignBroker.campaign.name} — Etapa ${log.stepNumber}`;
      const result = await sendCampaignEmail({
        to: log.campaignBroker.broker.email,
        subject,
        text: log.content,
      });
      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Email send failed' }, { status: 500 });
      }
    } else {
      await sendWhatsAppMessage(log.campaignBroker.broker.phone, log.content);
    }

    await prisma.messageLog.update({
      where: { id: log.id },
      data: { status: 'sent', sentAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to resend' }, { status: 500 });
  }
}
