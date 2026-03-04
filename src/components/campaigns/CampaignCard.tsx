import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Campaign {
  id: number;
  name: string;
  description: string | null;
  status: string;
  channel?: string;
  totalSteps: number;
  createdAt: string;
  _count: { brokers: number };
}

const channelLabels: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  both: 'Ambos',
};

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  active: 'Ativa',
  paused: 'Pausada',
  completed: 'Concluída',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  paused: 'outline',
  completed: 'secondary',
};

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{campaign.name}</CardTitle>
            <Badge variant={statusVariants[campaign.status] || 'secondary'}>
              {statusLabels[campaign.status] || campaign.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {campaign.description && (
            <p className="mb-2 text-sm text-muted-foreground">{campaign.description}</p>
          )}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>{campaign.totalSteps} etapas</span>
            <span>{campaign._count.brokers} corretores</span>
            {campaign.channel && (
              <span>{channelLabels[campaign.channel] || campaign.channel}</span>
            )}
            <span>{new Date(campaign.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
