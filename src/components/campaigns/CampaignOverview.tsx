'use client';

import { useState } from 'react';
import { Users, UserCheck, Loader, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StepFunnel } from './StepFunnel';
import type { CampaignDetail } from '@/lib/types';

export function CampaignOverview({ campaign }: { campaign: CampaignDetail }) {
  const [promptExpanded, setPromptExpanded] = useState(false);

  const { stats, totalSteps, brokers, basePrompt, createdAt, steps } = campaign;
  const responsePercent = stats.total > 0 ? Math.round((stats.responded / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total"
          value={stats.total}
          icon={Users}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Responderam"
          value={stats.responded}
          icon={UserCheck}
          iconColor="bg-emerald-100 text-emerald-600"
        />
        <StatsCard
          title="Em Progresso"
          value={stats.inProgress + stats.pending}
          icon={Loader}
          iconColor="bg-amber-100 text-amber-600"
        />
        <StatsCard
          title="Sem Resposta"
          value={stats.unresponsive}
          icon={UserX}
          iconColor="bg-red-100 text-red-600"
        />
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taxa de resposta</span>
              <span className="font-semibold">{responsePercent}%</span>
            </div>
            <Progress value={responsePercent} className="h-3" />
            <p className="mt-2 text-xs text-muted-foreground">
              {stats.responded} de {stats.total} corretores responderam
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step Funnel */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline de Etapas</CardTitle>
          </CardHeader>
          <CardContent>
            <StepFunnel totalSteps={totalSteps} brokers={brokers} />
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Criada em</span>
            <span>{new Date(createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total de etapas</span>
            <span>{totalSteps}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delays</span>
            <span>{steps.map((s) => `${s.delayDays}d`).join(' → ')}</span>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Prompt base</span>
              <button
                onClick={() => setPromptExpanded(!promptExpanded)}
                className="text-xs text-primary hover:underline"
              >
                {promptExpanded ? 'Recolher' : 'Expandir'}
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {promptExpanded ? basePrompt : basePrompt.slice(0, 120) + (basePrompt.length > 120 ? '...' : '')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
