import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCampaignMessage } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const campaign = await prisma.campaign.findUnique({
    where: { id: Number(id) },
    include: {
      steps: { orderBy: { stepNumber: 'asc' } },
      brokers: {
        include: {
          broker: true,
          messages: { orderBy: { sentAt: 'asc' } },
        },
      },
    },
  });

  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const target =
    campaign.brokers.find((b) => b.broker.id === body.brokerId) ??
    campaign.brokers.find((b) => b.status === 'in_progress' || b.status === 'pending');

  if (!target) {
    return NextResponse.json({ error: 'No broker available for preview' }, { status: 400 });
  }

  const step = campaign.steps.find((s) => s.stepNumber === target.currentStep) ?? campaign.steps[0];

  const message = await generateCampaignMessage({
    brokerName: target.broker.name,
    stepNumber: target.currentStep,
    totalSteps: campaign.totalSteps,
    basePrompt: campaign.basePrompt,
    promptOverride: step?.promptOverride,
    previousMessages: target.messages.map((m) => m.content),
  });

  return NextResponse.json({
    message,
    brokerName: target.broker.name,
    stepNumber: target.currentStep,
  });
}
