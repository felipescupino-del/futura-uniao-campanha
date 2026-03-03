'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CampaignSummary } from '@/lib/types';

interface CampaignPerformanceChartProps {
  campaigns: CampaignSummary[];
}

export function CampaignPerformanceChart({ campaigns }: CampaignPerformanceChartProps) {
  const data = campaigns.map((c) => ({
    name: c.name.length > 20 ? c.name.slice(0, 20) + '...' : c.name,
    Responderam: c.responded,
    'Em Progresso': c.inProgress,
    'Sem Resposta': c.noResponse,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Performance por Campanha</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Nenhuma campanha ativa
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" width={110} fontSize={12} tick={{ fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Responderam" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Em Progresso" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Sem Resposta" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
