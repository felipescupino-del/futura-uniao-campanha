'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Megaphone } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ResponseRateChart } from '@/components/dashboard/ResponseRateChart';
import { CampaignPerformanceChart } from '@/components/dashboard/CampaignPerformanceChart';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import type { DashboardStats, ActivityEvent } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then((r) => r.json()),
      fetch('/api/dashboard/activity').then((r) => r.json()),
    ]).then(([s, a]) => {
      setStats(s);
      setActivity(Array.isArray(a) ? a : []);
    });
  }, []);

  if (!stats) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {/* Row 1: KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Importados"
          value={stats.totalBrokers}
          icon={Users}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Recuperados"
          value={stats.recovered}
          description="Responderam a campanha"
          icon={UserCheck}
          iconColor="bg-emerald-100 text-emerald-600"
        />
        <StatsCard
          title="Sem Resposta"
          value={stats.unresponsive}
          description="Completaram todas as etapas"
          icon={UserX}
          iconColor="bg-red-100 text-red-600"
        />
        <StatsCard
          title="Campanhas Ativas"
          value={stats.activeCampaigns}
          icon={Megaphone}
          iconColor="bg-amber-100 text-amber-600"
          description={`${stats.messagesThisWeek} msgs esta semana`}
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <ResponseRateChart
          recovered={stats.recovered}
          unresponsive={stats.unresponsive}
          inactive={stats.inactive}
          responseRate={stats.responseRate}
        />
        <CampaignPerformanceChart campaigns={stats.campaignsSummary} />
      </div>

      {/* Row 3: Activity Timeline */}
      <ActivityTimeline events={activity} />
    </div>
  );
}
