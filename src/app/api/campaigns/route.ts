import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadCampaignImage } from '@/lib/supabase-storage';

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
  const formData = await req.formData();

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || null;
  const basePrompt = formData.get('basePrompt') as string;
  const channel = (formData.get('channel') as string) || 'whatsapp';
  const stepsJson = formData.get('steps') as string;
  const imageFile = formData.get('image') as File | null;

  const steps = JSON.parse(stepsJson || '[]') as {
    stepNumber: number;
    delayDays: number;
    promptOverride?: string;
  }[];

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadCampaignImage(imageFile);
  }

  const campaign = await prisma.campaign.create({
    data: {
      name,
      description,
      basePrompt,
      channel,
      imageUrl,
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
}
