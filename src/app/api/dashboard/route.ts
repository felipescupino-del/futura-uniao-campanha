import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [totalBrokers, recovered, unresponsive, activeCampaigns, messagesThisWeek, activeCampaignDetails] =
    await Promise.all([
      prisma.broker.count(),
      prisma.broker.count({ where: { status: 'recovered' } }),
      prisma.broker.count({ where: { status: 'unresponsive' } }),
      prisma.campaign.count({ where: { status: 'active' } }),
      prisma.messageLog.count({
        where: { sentAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.campaign.findMany({
        where: { status: 'active' },
        include: {
          brokers: { select: { status: true } },
        },
      }),
    ]);

  const campaignsSummary = activeCampaignDetails.map((c) => ({
    id: c.id,
    name: c.name,
    responded: c.brokers.filter((b) => b.status === 'responded').length,
    inProgress: c.brokers.filter((b) => b.status === 'in_progress' || b.status === 'pending').length,
    noResponse: c.brokers.filter((b) => b.status === 'unresponsive' || b.status === 'completed').length,
  }));

  const responseRate =
    totalBrokers > 0 ? Math.round((recovered / totalBrokers) * 100) : 0;

  return NextResponse.json({
    totalBrokers,
    recovered,
    unresponsive,
    activeCampaigns,
    inactive: totalBrokers - recovered - unresponsive,
    responseRate,
    messagesThisWeek,
    campaignsSummary,
  });
}
