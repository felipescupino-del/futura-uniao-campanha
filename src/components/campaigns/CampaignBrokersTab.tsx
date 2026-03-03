'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, SkipForward, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { BrokerMessageHistory } from './BrokerMessageHistory';
import { EmptyState } from '@/components/shared/EmptyState';
import { Users } from 'lucide-react';
import type { CampaignBrokerEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em progresso',
  responded: 'Respondeu',
  completed: 'Concluído',
  unresponsive: 'Sem resposta',
};

interface CampaignBrokersTabProps {
  campaignId: number;
  totalSteps: number;
  brokers: CampaignBrokerEntry[];
  onRefresh: () => void;
}

export function CampaignBrokersTab({ campaignId, totalSteps, brokers, onRefresh }: CampaignBrokersTabProps) {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = filter === 'all' ? brokers : brokers.filter((b) => b.status === filter);

  async function handleSkip(brokerId: number) {
    const res = await fetch(`/api/campaigns/${campaignId}/brokers/${brokerId}/skip`, { method: 'POST' });
    if (res.ok) {
      toast.success('Etapa pulada');
      onRefresh();
    } else {
      toast.error('Erro ao pular etapa');
    }
  }

  async function handlePause(brokerId: number) {
    const res = await fetch(`/api/campaigns/${campaignId}/brokers/${brokerId}/pause`, { method: 'POST' });
    if (res.ok) {
      toast.success('Corretor pausado');
      onRefresh();
    } else {
      toast.error('Erro ao pausar');
    }
  }

  async function handleRetry(messageId: number) {
    const res = await fetch(`/api/campaigns/${campaignId}/retry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageLogId: messageId }),
    });
    if (res.ok) {
      toast.success('Mensagem reenviada');
      onRefresh();
    } else {
      toast.error('Erro ao reenviar');
    }
  }

  if (brokers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum corretor"
        description="Ative a campanha para adicionar corretores."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos ({brokers.length})</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em progresso</SelectItem>
            <SelectItem value="responded">Respondeu</SelectItem>
            <SelectItem value="unresponsive">Sem resposta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última msg</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((entry) => (
              <Collapsible
                key={entry.id}
                open={expandedId === entry.id}
                onOpenChange={(open) => setExpandedId(open ? entry.id : null)}
                asChild
              >
                <>
                  <CollapsibleTrigger asChild>
                    <TableRow className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            expandedId === entry.id && 'rotate-180',
                          )}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{entry.broker.name}</TableCell>
                      <TableCell>{entry.broker.phone}</TableCell>
                      <TableCell>
                        {entry.currentStep}/{totalSteps}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            entry.status === 'responded'
                              ? 'default'
                              : entry.status === 'unresponsive'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {statusLabels[entry.status] || entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.lastMessageAt
                          ? new Date(entry.lastMessageAt).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {(entry.status === 'in_progress' || entry.status === 'pending') && (
                            <>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSkip(entry.broker.id);
                                }}
                                title="Pular Etapa"
                              >
                                <SkipForward className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePause(entry.broker.id);
                                }}
                                title="Pausar"
                              >
                                <Pause className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <tr>
                      <td colSpan={7} className="bg-muted/30 px-6 py-3">
                        <BrokerMessageHistory
                          messages={entry.messages}
                          onRetry={handleRetry}
                        />
                      </td>
                    </tr>
                  </CollapsibleContent>
                </>
              </Collapsible>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
