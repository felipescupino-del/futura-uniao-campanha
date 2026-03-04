import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const lists = await prisma.brokerList.findMany({
    include: { _count: { select: { brokers: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(lists);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }

  const list = await prisma.brokerList.create({
    data: {
      name: body.name.trim(),
      description: body.description?.trim() || null,
    },
  });

  return NextResponse.json(list, { status: 201 });
}
