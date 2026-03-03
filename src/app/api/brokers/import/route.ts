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
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const text = await file.text();
  const { data, errors } = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim().toLowerCase(),
  });

  if (errors.length > 0) {
    return NextResponse.json({ error: 'CSV parse error', details: errors }, { status: 400 });
  }

  let imported = 0;
  let skipped = 0;
  const issues: string[] = [];

  for (const row of data) {
    const raw = row as Record<string, string>;
    const phone = (raw.telefone || raw.phone || raw.cel || raw.celular)?.replace(/\D/g, '');
    const name = (raw.nome || raw.corretora || raw.name || raw.empresa)?.trim();

    if (!phone || !name) {
      skipped++;
      issues.push(`Row skipped: missing nome or telefone`);
      continue;
    }

    try {
      await prisma.broker.upsert({
        where: { phone },
        update: {
          name,
          cnpj: row.cnpj?.trim() || undefined,
          email: row.email?.trim() || undefined,
        },
        create: {
          name,
          phone,
          cnpj: row.cnpj?.trim() || null,
          email: row.email?.trim() || null,
        },
      });
      imported++;
    } catch {
      skipped++;
      issues.push(`Failed to import: ${name} (${phone})`);
    }
  }

  return NextResponse.json({ imported, skipped, issues });
}
