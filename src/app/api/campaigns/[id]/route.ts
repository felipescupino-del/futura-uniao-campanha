import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id: Number(id) },
    include: {
      steps: { orderBy: { stepNumber: 'asc' } },
      brokers: {
        include: { broker: true, messages: { orderBy: { sentAt: 'desc' } } },
        orderBy: { status: 'asc' },
      },
    },
  });

  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const stats = {
    total: campaign.brokers.length,
    pending: campaign.brokers.filter((b) => b.status === 'pending').length,
    inProgress: campaign.brokers.filter((b) => b.status === 'in_progress').length,
    responded: campaign.brokers.filter((b) => b.status === 'responded').length,
    unresponsive: campaign.brokers.filter((b) => b.status === 'unresponsive').length,
  };

  return NextResponse.json({ ...campaign, stats });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.campaign.delete({ where: { id: Number(id) } });
  return NextResponse.json({ deleted: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const campaign = await prisma.campaign.update({
    where: { id: Number(id) },
    data: {
      name: body.name,
      description: body.description,
      basePrompt: body.basePrompt,
      status: body.status,
    },
  });

  return NextResponse.json(campaign);
}
