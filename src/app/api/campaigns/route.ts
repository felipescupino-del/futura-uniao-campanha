import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      steps: { orderBy: { stepNumber: 'asc' } },
      _count: { select: { brokers: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const campaign = await prisma.campaign.create({
    data: {
      name: body.name,
      description: body.description || null,
      basePrompt: body.basePrompt,
      totalSteps: body.steps?.length || 5,
      steps: {
        create: (body.steps || []).map((s: { stepNumber: number; delayDays: number; promptOverride?: string }) => ({
          stepNumber: s.stepNumber,
          delayDays: s.delayDays,
          promptOverride: s.promptOverride || null,
        })),
      },
    },
    include: { steps: true },
  });

  return NextResponse.json(campaign, { status: 201 });
}
