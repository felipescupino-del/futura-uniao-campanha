'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface BrokerList {
  list: { id: number; name: string };
}

interface Broker {
  id: number;
  name: string;
  phone: string;
  cnpj: string | null;
  email: string | null;
  status: string;
  importedAt: string;
  lists?: BrokerList[];
}

const statusLabels: Record<string, string> = {
  inactive: 'Inativo',
  recovered: 'Recuperado',
  unresponsive: 'Sem Resposta',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  inactive: 'secondary',
  recovered: 'default',
  unresponsive: 'destructive',
};

export function BrokerTable({ brokers }: { brokers: Broker[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>CNPJ</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Listas</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Importado em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {brokers.map((broker) => (
          <TableRow key={broker.id}>
            <TableCell className="font-medium">{broker.name}</TableCell>
            <TableCell>{broker.phone}</TableCell>
            <TableCell>{broker.cnpj || '-'}</TableCell>
            <TableCell>{broker.email || '-'}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {broker.lists && broker.lists.length > 0
                  ? broker.lists.map((bl) => (
                      <Badge key={bl.list.id} variant="outline" className="text-xs">
                        {bl.list.name}
                      </Badge>
                    ))
                  : <span className="text-muted-foreground">-</span>}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariants[broker.status] || 'secondary'}>
                {statusLabels[broker.status] || broker.status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(broker.importedAt).toLocaleDateString('pt-BR')}
            </TableCell>
          </TableRow>
        ))}
        {brokers.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              Nenhum corretor importado
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
