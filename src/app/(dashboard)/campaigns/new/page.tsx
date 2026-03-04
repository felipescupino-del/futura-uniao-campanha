'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CampaignChannel } from '@/lib/types';

interface StepConfig {
  stepNumber: number;
  delayDays: number;
  promptOverride: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrompt, setBasePrompt] = useState(
    'Você é parte da equipe do Grupo Futura União, uma assessoria de seguros. Sua missão é reativar corretores que pararam de produzir. Escreva uma mensagem WhatsApp curta e pessoal.',
  );
  const [steps, setSteps] = useState<StepConfig[]>([
    { stepNumber: 1, delayDays: 0, promptOverride: '' },
    { stepNumber: 2, delayDays: 3, promptOverride: '' },
    { stepNumber: 3, delayDays: 5, promptOverride: '' },
    { stepNumber: 4, delayDays: 7, promptOverride: '' },
    { stepNumber: 5, delayDays: 10, promptOverride: '' },
  ]);
  const [channel, setChannel] = useState<CampaignChannel>('whatsapp');
  const [loading, setLoading] = useState(false);

  function updateStep(idx: number, field: keyof StepConfig, value: string | number) {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description: description || null,
        basePrompt,
        channel,
        steps: steps.map((s) => ({
          stepNumber: s.stepNumber,
          delayDays: s.delayDays,
          promptOverride: s.promptOverride || null,
        })),
      }),
    });

    if (res.ok) {
      const campaign = await res.json();
      toast.success('Campanha criada com sucesso!');
      router.push(`/campaigns/${campaign.id}`);
    } else {
      toast.error('Erro ao criar campanha');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold">Nova Campanha</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da campanha</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Reativação Março 2026"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição da campanha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basePrompt">Prompt base (para IA gerar mensagens)</Label>
              <Textarea
                id="basePrompt"
                value={basePrompt}
                onChange={(e) => setBasePrompt(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Canal de envio</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as CampaignChannel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="both">Ambos (WhatsApp + E-mail)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {channel === 'whatsapp' && 'Mensagens enviadas apenas por WhatsApp.'}
                {channel === 'email' && 'Mensagens enviadas apenas por e-mail. Corretores sem e-mail serão ignorados.'}
                {channel === 'both' && 'Mensagens enviadas por WhatsApp e e-mail. Corretores sem e-mail recebem apenas WhatsApp.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Etapas (Follow-ups)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, idx) => (
              <div key={step.stepNumber} className="rounded border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Etapa {step.stepNumber}</span>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Dias de espera:</Label>
                    <Input
                      type="number"
                      min={0}
                      className="w-20"
                      value={step.delayDays}
                      onChange={(e) => updateStep(idx, 'delayDays', Number(e.target.value))}
                    />
                  </div>
                </div>
                <Textarea
                  placeholder="Prompt específico desta etapa (opcional — usa o prompt base se vazio)"
                  value={step.promptOverride}
                  onChange={(e) => updateStep(idx, 'promptOverride', e.target.value)}
                  rows={2}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Campanha'}
          </Button>
        </div>
      </form>
    </div>
  );
}
