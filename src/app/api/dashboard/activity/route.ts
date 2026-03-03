import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [recentMessages, recentResponses] = await Promise.all([
    prisma.messageLog.findMany({
      take: 15,
      orderBy: { sentAt: 'desc' },
      include: {
        campaignBroker: {
          include: {
            broker: { select: { name: true } },
            campaign: { select: { name: true } },
          },
        },
      },
    }),
    prisma.campaignBroker.findMany({
      where: { respondedAt: { not: null } },
      take: 10,
      orderBy: { respondedAt: 'desc' },
      include: {
        broker: { select: { name: true } },
        campaign: { select: { name: true } },
      },
    }),
  ]);

  const events = [
    ...recentMessages.map((m) => ({
      id: `msg-${m.id}`,
      type: 'message_sent' as const,
      description: `Mensagem etapa ${m.stepNumber} enviada`,
      brokerName: m.campaignBroker.broker.name,
      campaignName: m.campaignBroker.campaign.name,
      timestamp: m.sentAt.toISOString(),
    })),
    ...recentResponses.map((cb) => ({
      id: `resp-${cb.id}`,
      type: 'broker_responded' as const,
      description: 'Corretor respondeu',
      brokerName: cb.broker.name,
      campaignName: cb.campaign.name,
      timestamp: cb.respondedAt!.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  return NextResponse.json(events);
}
