'use client';

import { useEffect, useState, useCallback } from 'react';
import { BrokerTable } from '@/components/brokers/BrokerTable';
import { CsvImportDialog } from '@/components/brokers/CsvImportDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, Trash2 } from 'lucide-react';

interface BrokerListSummary {
  id: number;
  name: string;
  _count: { brokers: number };
}

export default function BrokersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState<BrokerListSummary[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('all');

  const loadLists = useCallback(() => {
    fetch('/api/lists')
      .then((r) => r.json())
      .then((data) => setLists(Array.isArray(data) ? data : []));
  }, []);

  const loadBrokers = useCallback(() => {
    const params = selectedListId !== 'all' ? `?listId=${selectedListId}` : '';
    fetch(`/api/brokers${params}`)
      .then((r) => r.json())
      .then((data) => setBrokers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [selectedListId]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    setLoading(true);
    loadBrokers();
  }, [loadBrokers]);

  function handleImported() {
    loadBrokers();
    loadLists();
  }

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Corretores</h2>
        <CsvImportDialog onImported={handleImported} />
      </div>

      {lists.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filtrar por lista:</span>
          <Select value={selectedListId} onValueChange={setSelectedListId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Todas as listas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as listas</SelectItem>
              {lists.map((list) => (
                <SelectItem key={list.id} value={String(list.id)}>
                  {list.name} ({list._count.brokers})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedListId !== 'all' && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={async () => {
                const listName = lists.find((l) => String(l.id) === selectedListId)?.name;
                if (!confirm(`Excluir a lista "${listName}"? Os corretores não serão removidos.`)) return;
                await fetch(`/api/lists/${selectedListId}`, { method: 'DELETE' });
                toast.success(`Lista "${listName}" excluída`);
                setSelectedListId('all');
                loadLists();
                loadBrokers();
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      )}

      {brokers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum corretor"
          description={
            selectedListId !== 'all'
              ? 'Nenhum corretor encontrado nesta lista.'
              : 'Importe um CSV com seus corretores para começar.'
          }
        />
      ) : (
        <div className="rounded-lg border bg-card">
          <BrokerTable brokers={brokers} />
        </div>
      )}
    </div>
  );
}
