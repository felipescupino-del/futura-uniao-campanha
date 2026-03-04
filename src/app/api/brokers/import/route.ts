import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

interface CsvRow {
  nome: string;
  telefone: string;
  cnpj?: string;
  email?: string;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const listName = (formData.get('listName') as string)?.trim();

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (!listName) return NextResponse.json({ error: 'listName is required' }, { status: 400 });

  const text = await file.text();
  const { data, errors } = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim().toLowerCase(),
  });

  if (errors.length > 0) {
    return NextResponse.json({ error: 'CSV parse error', details: errors }, { status: 400 });
  }

  // Create the broker list
  const brokerList = await prisma.brokerList.create({
    data: { name: listName },
  });

  let imported = 0;
  let skipped = 0;
  const issues: string[] = [];

  for (const row of data) {
    const raw = row as unknown as Record<string, string>;
    const phone = (raw.telefone || raw.phone || raw.cel || raw.celular)?.replace(/\D/g, '');
    const name = (raw.nome || raw.corretora || raw.name || raw.empresa)?.trim();
    const email = (raw.email || raw['e-mail'] || raw.mail)?.trim() || null;
    const cnpj = (raw.cnpj || raw['cnpj/cpf'] || raw.documento)?.trim() || null;

    if (!phone || !name) {
      skipped++;
      issues.push(`Row skipped: missing nome or telefone`);
      continue;
    }

    try {
      const broker = await prisma.broker.upsert({
        where: { phone },
        update: {
          name,
          cnpj: cnpj || undefined,
          email: email || undefined,
        },
        create: {
          name,
          phone,
          cnpj,
          email,
        },
      });

      // Link broker to the list (ignore if already linked)
      await prisma.brokerListBroker.create({
        data: { listId: brokerList.id, brokerId: broker.id },
      }).catch(() => {
        // unique constraint — broker already in this list
      });

      imported++;
    } catch {
      skipped++;
      issues.push(`Failed to import: ${name} (${phone})`);
    }
  }

  return NextResponse.json({ imported, skipped, issues, listId: brokerList.id, listName });
}
