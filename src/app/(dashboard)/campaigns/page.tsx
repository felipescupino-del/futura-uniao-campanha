'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Megaphone } from 'lucide-react';

export default function CampaignsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/campaigns')
      .then((r) => r.json())
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Campanhas</h2>
        <Link href="/campaigns/new">
          <Button>Nova Campanha</Button>
        </Link>
      </div>
      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Nenhuma campanha"
          description="Crie sua primeira campanha de reativação para começar."
          action={{ label: 'Nova Campanha', href: '/campaigns/new' }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((campaign: { id: number }) => (
            <CampaignCard key={campaign.id} campaign={campaign as any} />
          ))}
        </div>
      )}
    </div>
  );
}
