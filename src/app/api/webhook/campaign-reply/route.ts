import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  // Verify webhook secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: 'Missing phone' }, { status: 400 });

  // Find active campaign entries for this broker
  const broker = await prisma.broker.findUnique({ where: { phone } });
  if (!broker) return NextResponse.json({ found: false });

  // Mark broker as recovered
  await prisma.broker.update({
    where: { id: broker.id },
    data: { status: 'recovered' },
  });

  // Mark all active campaign entries as responded, stop follow-ups
  const updated = await prisma.campaignBroker.updateMany({
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

  return NextResponse.json({ found: true, updated: updated.count });
}
