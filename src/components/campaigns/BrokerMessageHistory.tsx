import { Badge } from '@/components/ui/badge';
import type { MessageLogEntry } from '@/lib/types';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  sent: { label: 'Enviada', variant: 'secondary' },
  delivered: { label: 'Entregue', variant: 'default' },
  read: { label: 'Lida', variant: 'default' },
  failed: { label: 'Falhou', variant: 'destructive' },
};

interface BrokerMessageHistoryProps {
  messages: MessageLogEntry[];
  onRetry?: (messageId: number) => void;
}

export function BrokerMessageHistory({ messages, onRetry }: BrokerMessageHistoryProps) {
  if (messages.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma mensagem enviada</p>
    );
  }

  return (
    <div className="space-y-3 py-2">
      {messages.map((msg) => {
        const config = statusConfig[msg.status] || statusConfig.sent;
        return (
          <div key={msg.id} className="flex justify-end">
            <div className={`max-w-[85%] rounded-lg rounded-tr-sm px-3 py-2 shadow-sm ${msg.channel === 'email' ? 'bg-blue-50' : 'bg-emerald-50'}`}>
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              <div className="mt-1.5 flex items-center justify-end gap-2">
                <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                  {msg.channel === 'email' ? 'E-mail' : 'WhatsApp'}
                </Badge>
                <span className="text-[11px] text-muted-foreground">Etapa {msg.stepNumber}</span>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(msg.sentAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <Badge variant={config.variant} className="h-4 px-1.5 text-[10px]">
                  {config.label}
                </Badge>
                {msg.status === 'failed' && onRetry && (
                  <button
                    onClick={() => onRetry(msg.id)}
                    className="text-[11px] font-medium text-red-600 hover:underline"
                  >
                    Reenviar
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
