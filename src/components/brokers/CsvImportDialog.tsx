'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ImportResult {
  imported: number;
  skipped: number;
  issues: string[];
}

export function CsvImportDialog({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/brokers/import', { method: 'POST', body: formData });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    toast.success(`${data.imported} corretores importados`);
    onImported();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setResult(null); }}>
      <DialogTrigger asChild>
        <Button>Importar CSV</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Corretores</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O CSV deve ter as colunas: <strong>nome</strong>, <strong>telefone</strong>, e opcionalmente <strong>cnpj</strong>, <strong>email</strong>.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm"
          />
          <Button onClick={handleUpload} disabled={loading} className="w-full">
            {loading ? 'Importando...' : 'Enviar'}
          </Button>
          {result && (
            <div className="rounded border p-3 text-sm">
              <p className="font-medium">Importados: {result.imported}</p>
              <p className="text-muted-foreground">Ignorados: {result.skipped}</p>
              {result.issues && result.issues.length > 0 && (
                <ul className="mt-2 list-disc pl-4 text-xs text-muted-foreground">
                  {result.issues.slice(0, 5).map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
