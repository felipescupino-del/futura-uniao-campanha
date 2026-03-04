import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const listId = parseInt(id, 10);
  if (isNaN(listId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  await prisma.brokerList.delete({ where: { id: listId } });

  return NextResponse.json({ deleted: true });
}
