'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Shell } from '../../components/shell';
import { Badge, Card, ErrorBox, fmtDate, Loading, PageTitle, statusTone } from '../../components/ui';
import { api } from '../../lib/api';

export default function CalendarPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['bookings-calendar'], queryFn: () => api<any>('/bookings?take=100') });
  const groups = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const b of data?.items ?? []) {
      const key = b.scheduledPickupAt.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), b]);
    }
    return [...map.entries()];
  }, [data]);
  return (
    <Shell>
      <PageTitle title="Booking Calendar" />
      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}
      <div className="grid gap-4 lg:grid-cols-3">
        {groups.map(([day, bookings]) => (
          <Card key={day}>
            <h2 className="mb-3 font-semibold">{day}</h2>
            <div className="space-y-2">
              {bookings.map((b) => (
                <Link href={`/bookings/${b.id}`} key={b.id} className="block rounded-md border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{b.customerName}</span>
                    <Badge tone={statusTone(b.currentStatus) as any}>{b.currentStatus}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{fmtDate(b.scheduledPickupAt)} · {b.vehicleRegistrationNumber}</p>
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
