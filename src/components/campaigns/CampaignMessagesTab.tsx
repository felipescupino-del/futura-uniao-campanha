'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/shared/EmptyState';
import { MessageSquare, RotateCcw } from 'lucide-react';
import type { CampaignBrokerEntry, MessageLogEntry } from '@/lib/types';

interface FlatMessage extends MessageLogEntry {
  brokerName: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  sent: { label: 'Enviada', variant: 'secondary' },
  delivered: { label: 'Entregue', variant: 'default' },
  read: { label: 'Lida', variant: 'default' },
  failed: { label: 'Falhou', variant: 'destructive' },
};

interface CampaignMessagesTabProps {
  campaignId: number;
  brokers: CampaignBrokerEntry[];
  onRefresh: () => void;
}

export function CampaignMessagesTab({ campaignId, brokers, onRefresh }: CampaignMessagesTabProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const allMessages: FlatMessage[] = brokers
    .flatMap((b) =>
      b.messages.map((m) => ({
        ...m,
        brokerName: b.broker.name,
      })),
    )
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

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

  if (allMessages.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Nenhuma mensagem"
        description="As mensagens aparecerão aqui conforme forem enviadas."
      />
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-2">
        {allMessages.map((msg) => {
          const config = statusConfig[msg.status] || statusConfig.sent;
          const isExpanded = expandedId === msg.id;
          const content = isExpanded ? msg.content : msg.content.slice(0, 120) + (msg.content.length > 120 ? '...' : '');

          return (
            <div
              key={msg.id}
              className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/50"
              onClick={() => setExpandedId(isExpanded ? null : msg.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{msg.brokerName}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">Etapa {msg.stepNumber}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {msg.channel === 'email' ? 'E-mail' : 'WhatsApp'}
                    </Badge>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{content}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.sentAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <Badge variant={config.variant} className="text-[10px]">
                    {config.label}
                  </Badge>
                  {msg.status === 'failed' && (
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetry(msg.id);
                      }}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Reenviar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
