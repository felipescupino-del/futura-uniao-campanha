import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; brokerId: string }> },
) {
  const { id, brokerId } = await params;

  const cb = await prisma.campaignBroker.findFirst({
    where: {
      campaignId: Number(id),
      brokerId: Number(brokerId),
    },
  });

  if (!cb) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.campaignBroker.update({
    where: { id: cb.id },
    data: { nextMessageAt: null },
  });

  return NextResponse.json({ success: true });
}
