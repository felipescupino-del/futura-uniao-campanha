'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CampaignDetailSkeleton } from '@/components/campaigns/CampaignDetailSkeleton';
import { CampaignOverview } from '@/components/campaigns/CampaignOverview';
import { CampaignBrokersTab } from '@/components/campaigns/CampaignBrokersTab';
import { CampaignMessagesTab } from '@/components/campaigns/CampaignMessagesTab';
import { MessagePreviewDialog } from '@/components/campaigns/MessagePreviewDialog';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import type { CampaignDetail } from '@/lib/types';

interface Broker {
  id: number;
  name: string;
  phone: string;
}

interface BrokerListSummary {
  id: number;
  name: string;
  _count: { brokers: number };
}

const campaignStatusLabels: Record<string, string> = {
  draft: 'Rascunho',
  active: 'Ativa',
  paused: 'Pausada',
  completed: 'Concluída',
};

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  paused: 'outline',
  completed: 'secondary',
};

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedListId = searchParams.get('listId');
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [activating, setActivating] = useState(false);
  const [brokerSelectOpen, setBrokerSelectOpen] = useState(false);
  const [availableBrokers, setAvailableBrokers] = useState<Broker[]>([]);
  const [selectedBrokerIds, setSelectedBrokerIds] = useState<Set<number>>(new Set());
  const [brokerLists, setBrokerLists] = useState<BrokerListSummary[]>([]);
  const [filterListId, setFilterListId] = useState<string>('all');

  const load = useCallback(() => {
    fetch(`/api/campaigns/${id}`)
      .then((r) => r.json())
      .then(setCampaign);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleActivate() {
    if (selectedBrokerIds.size === 0) return;
    setActivating(true);

    await fetch(`/api/campaigns/${id}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brokerIds: Array.from(selectedBrokerIds) }),
    });

    setBrokerSelectOpen(false);
    setActivating(false);
    toast.success('Campanha ativada!');
    load();
  }

  async function handlePause() {
    await fetch(`/api/campaigns/${id}/pause`, { method: 'POST' });
    toast.info('Campanha pausada');
    load();
  }

  function openBrokerSelect() {
    const initialListId = preselectedListId || 'all';
    setFilterListId(initialListId);
    const brokerParams = initialListId !== 'all' ? `?listId=${initialListId}` : '';
    Promise.all([
      fetch(`/api/brokers${brokerParams}`).then((r) => r.json()),
      fetch('/api/lists').then((r) => r.json()),
    ]).then(([brokers, lists]: [Broker[], BrokerListSummary[]]) => {
      setAvailableBrokers(brokers);
      setSelectedBrokerIds(new Set(brokers.map((b) => b.id)));
      setBrokerLists(Array.isArray(lists) ? lists : []);
      setBrokerSelectOpen(true);
    });
  }

  function handleListFilter(listId: string) {
    setFilterListId(listId);
    const params = listId !== 'all' ? `?listId=${listId}` : '';
    fetch(`/api/brokers${params}`)
      .then((r) => r.json())
      .then((brokers: Broker[]) => {
        setAvailableBrokers(brokers);
        setSelectedBrokerIds(new Set(brokers.map((b) => b.id)));
      });
  }

  function toggleBroker(brokerId: number) {
    setSelectedBrokerIds((prev) => {
      const next = new Set(prev);
      if (next.has(brokerId)) next.delete(brokerId);
      else next.add(brokerId);
      return next;
    });
  }

  if (!campaign) return <CampaignDetailSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{campaign.name}</h2>
            <Badge variant={statusVariant[campaign.status]}>
              {campaignStatusLabels[campaign.status]}
            </Badge>
          </div>
          {campaign.description && (
            <p className="mt-1 text-sm text-muted-foreground">{campaign.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(campaign.status === 'active' || campaign.status === 'paused') && (
            <MessagePreviewDialog campaignId={campaign.id} />
          )}
          {campaign.status === 'draft' && (
            <Dialog open={brokerSelectOpen} onOpenChange={setBrokerSelectOpen}>
              <DialogTrigger asChild>
                <Button onClick={openBrokerSelect}>Ativar Campanha</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Selecionar Corretores</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  {brokerLists.length > 0 && (
                    <div className="mb-2">
                      <Select value={filterListId} onValueChange={handleListFilter}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Filtrar por lista" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as listas</SelectItem>
                          {brokerLists.map((list) => (
                            <SelectItem key={list.id} value={String(list.id)}>
                              {list.name} ({list._count.brokers})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                    <span>{selectedBrokerIds.size} selecionados</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedBrokerIds(
                          selectedBrokerIds.size === availableBrokers.length
                            ? new Set()
                            : new Set(availableBrokers.map((b) => b.id)),
                        )
                      }
                    >
                      {selectedBrokerIds.size === availableBrokers.length
                        ? 'Desmarcar todos'
                        : 'Selecionar todos'}
                    </Button>
                  </div>
                  {availableBrokers.map((broker) => (
                    <label
                      key={broker.id}
                      className="flex cursor-pointer items-center gap-3 rounded border p-3 hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrokerIds.has(broker.id)}
                        onChange={() => toggleBroker(broker.id)}
                      />
                      <div>
                        <div className="text-sm font-medium">{broker.name}</div>
                        <div className="text-xs text-muted-foreground">{broker.phone}</div>
                      </div>
                    </label>
                  ))}
                  <Button
                    onClick={handleActivate}
                    disabled={activating || selectedBrokerIds.size === 0}
                    className="mt-4 w-full"
                  >
                    {activating ? 'Ativando...' : `Ativar com ${selectedBrokerIds.size} corretores`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {campaign.status === 'active' && (
            <Button variant="outline" onClick={handlePause}>
              Pausar
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={async () => {
              if (!confirm(`Excluir a campanha "${campaign.name}"? Esta ação não pode ser desfeita.`)) return;
              await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
              toast.success('Campanha excluída');
              router.push('/campaigns');
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="brokers">Corretores</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <CampaignOverview campaign={campaign} />
        </TabsContent>

        <TabsContent value="brokers" className="mt-4">
          <CampaignBrokersTab
            campaignId={campaign.id}
            totalSteps={campaign.totalSteps}
            brokers={campaign.brokers}
            onRefresh={load}
          />
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <CampaignMessagesTab
            campaignId={campaign.id}
            brokers={campaign.brokers}
            onRefresh={load}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
