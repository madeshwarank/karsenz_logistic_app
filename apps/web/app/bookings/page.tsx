'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Shell } from '../../components/shell';
import { Badge, Card, ErrorBox, fmtDate, Loading, PageTitle, statusTone } from '../../components/ui';
import { api } from '../../lib/api';

export default function BookingListPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['bookings'], queryFn: () => api<any>('/bookings') });
  return (
    <Shell>
      <PageTitle title="Bookings" action={<Link className="rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white" href="/bookings/new">Create booking</Link>} />
      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}
      <div className="grid gap-3">
        {data?.items?.map((b: any) => (
          <Link key={b.id} href={`/bookings/${b.id}`}>
            <Card className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{b.referenceNumber}</h2>
                  <Badge tone={statusTone(b.currentStatus) as any}>{b.currentStatus.replaceAll('_', ' ')}</Badge>
                  <Badge tone="slate">{b.priority}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{b.customerName} · {b.vehicleRegistrationNumber} · {b.vehicleManufacturer} {b.vehicleModel}</p>
                <p className="text-sm text-slate-500">{b.pickupAddress}, {b.city}</p>
              </div>
              <div className="text-sm md:text-right">
                <p className="font-medium">{fmtDate(b.scheduledPickupAt)}</p>
                <p className="text-slate-500">{b.destinationBranch.name}</p>
                <p className="text-slate-500">{b.assignedDriver?.user?.name ?? 'Unassigned'}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
