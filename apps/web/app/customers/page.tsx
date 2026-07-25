'use client';

import { useQuery } from '@tanstack/react-query';
import { Shell } from '../../components/shell';
import { Card, ErrorBox, Loading, PageTitle } from '../../components/ui';
import { api } from '../../lib/api';

export default function CustomersPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['customers'], queryFn: () => api<any[]>('/customers') });
  return (
    <Shell>
      <PageTitle title="Customers" />
      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}
      <div className="grid gap-3">
        {data?.map((c) => <Card key={c.id}><h2 className="font-semibold">{c.name}</h2><p className="text-sm text-slate-500">{c.primaryPhone} · {c.vehicles.length} vehicles</p></Card>)}
      </div>
    </Shell>
  );
}
