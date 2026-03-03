'use client';

import { useEffect, useState, useCallback } from 'react';
import { BrokerTable } from '@/components/brokers/BrokerTable';
import { CsvImportDialog } from '@/components/brokers/CsvImportDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Users } from 'lucide-react';

export default function BrokersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBrokers = useCallback(() => {
    fetch('/api/brokers')
      .then((r) => r.json())
      .then((data) => setBrokers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadBrokers();
  }, [loadBrokers]);

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Corretores</h2>
        <CsvImportDialog onImported={loadBrokers} />
      </div>
      {brokers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum corretor"
          description="Importe um CSV com seus corretores para começar."
        />
      ) : (
        <div className="rounded-lg border bg-card">
          <BrokerTable brokers={brokers} />
        </div>
      )}
    </div>
  );
}
