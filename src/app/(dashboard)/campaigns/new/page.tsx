'use client';

import { useState, useEffect } from 'react';
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

interface BrokerListSummary {
  id: number;
  name: string;
  _count: { brokers: number };
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
  const [lists, setLists] = useState<BrokerListSummary[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  useEffect(() => {
    fetch('/api/lists')
      .then((r) => r.json())
      .then((data) => setLists(Array.isArray(data) ? data : []));
  }, []);

  function updateStep(idx: number, field: keyof StepConfig, value: string | number) {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  }

  function handleMediaSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      setMediaFile(file);
      setMediaType('image');
      const reader = new FileReader();
      reader.onload = (ev) => setMediaPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      setMediaFile(file);
      setMediaType('video');
      setMediaPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || '');
    formData.append('basePrompt', basePrompt);
    formData.append('channel', channel);
    formData.append('steps', JSON.stringify(steps.map((s) => ({
      stepNumber: s.stepNumber,
      delayDays: s.delayDays,
      promptOverride: s.promptOverride || null,
    }))));
    if (mediaFile) {
      formData.append('image', mediaFile);
      formData.append('mediaType', mediaType || 'image');
    }

    const res = await fetch('/api/campaigns', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const campaign = await res.json();
      toast.success('Campanha criada com sucesso!');
      const listParam = selectedListId ? `?listId=${selectedListId}` : '';
      router.push(`/campaigns/${campaign.id}${listParam}`);
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
            {lists.length > 0 && (
              <div className="space-y-2">
                <Label>Lista de corretores</Label>
                <Select value={selectedListId} onValueChange={setSelectedListId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar lista (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma (selecionar depois)</SelectItem>
                    {lists.map((list) => (
                      <SelectItem key={list.id} value={String(list.id)}>
                        {list.name} ({list._count.brokers} corretores)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Ao ativar a campanha, os corretores desta lista serão pré-selecionados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mídia (opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="media">Imagem ou vídeo para enviar na 1a etapa (WhatsApp + Email)</Label>
              <input
                id="media"
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaSelect}
                className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm"
              />
              {mediaPreview && (
                <div className="relative">
                  {mediaType === 'video' ? (
                    <video src={mediaPreview} controls className="max-h-48 rounded border" />
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="max-h-48 rounded border" />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 text-destructive"
                    onClick={() => { setMediaFile(null); setMediaPreview(null); setMediaType(null); }}
                  >
                    Remover
                  </Button>
                </div>
              )}
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
