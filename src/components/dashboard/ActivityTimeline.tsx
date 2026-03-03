'use client';

import { MessageSquare, MessageSquareReply } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ActivityEvent } from '@/lib/types';

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins} min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {events.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Nenhuma atividade recente
          </div>
        ) : (
          <ScrollArea className="h-[400px] px-6 pb-4">
            <div className="space-y-0">
              {events.map((ev) => {
                const isResponse = ev.type === 'broker_responded';
                return (
                  <div key={ev.id} className="flex gap-3 border-b py-3 last:border-0">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isResponse ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {isResponse ? (
                        <MessageSquareReply className="h-4 w-4" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{ev.brokerName}</span>
                        <span className="text-muted-foreground"> — {ev.description}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ev.campaignName} · {timeAgo(ev.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
