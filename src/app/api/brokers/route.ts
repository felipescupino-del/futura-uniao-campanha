import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const listId = searchParams.get('listId');

  const brokers = await prisma.broker.findMany({
    where: {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
          { cnpj: { contains: search } },
        ],
      }),
      ...(listId && {
        lists: { some: { listId: parseInt(listId, 10) } },
      }),
    },
    include: {
      lists: {
        include: { list: { select: { id: true, name: true } } },
      },
    },
    orderBy: { importedAt: 'desc' },
  });

  return NextResponse.json(brokers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const broker = await prisma.broker.create({
    data: {
      name: body.name,
      phone: body.phone,
      cnpj: body.cnpj || null,
      email: body.email || null,
    },
  });

  return NextResponse.json(broker, { status: 201 });
}
