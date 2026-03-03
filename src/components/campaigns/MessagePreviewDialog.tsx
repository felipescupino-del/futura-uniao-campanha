'use client';

import { useState } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PreviewResult {
  message: string;
  brokerName: string;
  stepNumber: number;
}

export function MessagePreviewDialog({ campaignId }: { campaignId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [error, setError] = useState('');

  async function loadPreview() {
    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao gerar preview');
        return;
      }

      setPreview(await res.json());
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) loadPreview();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Preview da Próxima Mensagem</DialogTitle>
        </DialogHeader>
        <div className="min-h-[120px]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Gerando mensagem...</span>
            </div>
          )}
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
          {preview && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{preview.brokerName}</span>
                <span>·</span>
                <span>Etapa {preview.stepNumber}</span>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[90%] rounded-lg rounded-tr-sm bg-emerald-50 px-3 py-2 shadow-sm">
                  <p className="whitespace-pre-wrap text-sm">{preview.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
