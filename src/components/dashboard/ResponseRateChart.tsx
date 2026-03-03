'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResponseRateChartProps {
  recovered: number;
  unresponsive: number;
  inactive: number;
  responseRate: number;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export function ResponseRateChart({ recovered, unresponsive, inactive, responseRate }: ResponseRateChartProps) {
  const data = [
    { name: 'Recuperados', value: recovered },
    { name: 'Sem Resposta', value: unresponsive },
    { name: 'Inativos', value: inactive },
  ].filter((d) => d.value > 0);

  const isEmpty = data.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Taxa de Resposta</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Sem dados
          </div>
        ) : (
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}`]}
                  contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{responseRate}%</span>
              <span className="text-xs text-muted-foreground">resposta</span>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-center gap-4 text-xs">
          {[
            { label: 'Recuperados', color: COLORS[0] },
            { label: 'Sem Resposta', color: COLORS[1] },
            { label: 'Inativos', color: COLORS[2] },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
