import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const campaignId = Number(id);
  const body = await req.json();
  const brokerIds: number[] = body.brokerIds;

  if (!brokerIds?.length) {
    return NextResponse.json({ error: 'No brokers selected' }, { status: 400 });
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { steps: { orderBy: { stepNumber: 'asc' } } },
  });

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  if (campaign.steps.length === 0) {
    return NextResponse.json({ error: 'Campaign has no steps configured' }, { status: 400 });
  }

  const firstStep = campaign.steps[0];
  const now = new Date();
  const nextMessageAt = new Date(now.getTime() + firstStep.delayDays * 24 * 60 * 60 * 1000);

  // Create CampaignBroker entries (skip existing)
  let created = 0;
  for (const brokerId of brokerIds) {
    try {
      await prisma.campaignBroker.create({
        data: {
          campaignId,
          brokerId,
          currentStep: 0,
          status: 'pending',
          nextMessageAt,
        },
      });
      created++;
    } catch {
      // Unique constraint — broker already in this campaign
    }
  }

  // Activate campaign
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'active' },
  });

  return NextResponse.json({ activated: true, brokersAdded: created });
}
