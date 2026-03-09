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
  try {
    const body = await req.json();

    const { name, description, basePrompt, channel, mediaUrl, mediaType, steps } = body as {
      name: string;
      description: string | null;
      basePrompt: string;
      channel: string;
      mediaUrl: string | null;
      mediaType: string | null;
      steps: { stepNumber: number; delayDays: number; promptOverride?: string | null }[];
    };

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        basePrompt,
        channel: channel || 'whatsapp',
        imageUrl: mediaUrl,
        mediaType,
        totalSteps: steps.length || 5,
        steps: {
          create: steps.map((s) => ({
            stepNumber: s.stepNumber,
            delayDays: s.delayDays,
            promptOverride: s.promptOverride || null,
          })),
        },
      },
      include: { steps: true },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('[campaigns POST] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
