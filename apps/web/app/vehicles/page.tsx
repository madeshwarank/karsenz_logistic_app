'use client';

import { useQuery } from '@tanstack/react-query';
import { Shell } from '../../components/shell';
import { Card, ErrorBox, Loading, PageTitle } from '../../components/ui';
import { api } from '../../lib/api';

export default function VehiclesPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['vehicles'], queryFn: () => api<any[]>('/vehicles') });
  return (
    <Shell>
      <PageTitle title="Vehicles" />
      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((v) => <Card key={v.id}><h2 className="font-semibold">{v.registrationNumber}</h2><p className="text-sm text-slate-500">{v.manufacturer} {v.model} · {v.year}</p><p className="text-sm">{v.customer.name}</p></Card>)}
      </div>
    </Shell>
  );
}
