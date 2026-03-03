import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/zapi';

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
        include: { broker: true },
      },
    },
  });

  if (!log) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

  try {
    await sendWhatsAppMessage(log.campaignBroker.broker.phone, log.content);
    await prisma.messageLog.update({
      where: { id: log.id },
      data: { status: 'sent', sentAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to resend' }, { status: 500 });
  }
}
