'use client';

import { useQuery } from '@tanstack/react-query';
import { Shell } from '../../components/shell';
import { Badge, Card, ErrorBox, Loading, PageTitle } from '../../components/ui';
import { api } from '../../lib/api';

export default function DriversPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['drivers-page'], queryFn: () => api<any[]>('/drivers') });
  return (
    <Shell>
      <PageTitle title="Drivers" />
      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((d) => (
          <Card key={d.id}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{d.user.name}</h2>
              <Badge tone={d.currentState === 'AVAILABLE' ? 'green' : d.currentState === 'OFFLINE' ? 'red' : 'amber'}>{d.currentState}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-500">{d.phone} · {d.branch.name}</p>
            <p className="text-sm">Jobs selected date: {d.jobsForSelectedDate}</p>
            <p className="text-sm">License: {d.licenseNumber}</p>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
