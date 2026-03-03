import { cn } from '@/lib/utils';
import type { CampaignBrokerEntry } from '@/lib/types';

interface StepFunnelProps {
  totalSteps: number;
  brokers: CampaignBrokerEntry[];
}

export function StepFunnel({ totalSteps, brokers }: StepFunnelProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => {
    const step = i + 1;
    const count = brokers.filter((b) => b.currentStep === step && b.status !== 'responded').length;
    return { step, count };
  });

  const maxCount = Math.max(...steps.map((s) => s.count), 1);

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {steps.map((s, i) => (
        <div key={s.step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all',
                s.count > 0
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground/30 text-muted-foreground',
              )}
              style={
                s.count > 0
                  ? { transform: `scale(${0.8 + (s.count / maxCount) * 0.4})` }
                  : undefined
              }
            >
              {s.count}
            </div>
            <span className="mt-1 text-[11px] text-muted-foreground">Etapa {s.step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="mx-1 h-0.5 w-6 bg-muted-foreground/20" />
          )}
        </div>
      ))}
    </div>
  );
}
