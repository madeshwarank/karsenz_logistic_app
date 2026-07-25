'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Shell } from '../../../components/shell';
import { Badge, Card, ErrorBox, fmtDate, Loading, PageTitle, statusTone } from '../../../components/ui';
import { api } from '../../../lib/api';

export default function DriverJobsPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['driver-jobs'], queryFn: () => api<any>('/bookings?take=100') });
  return (
    <Shell>
      <PageTitle title="Driver Mobile Jobs" />
      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}
      <div className="mx-auto grid max-w-md gap-3">
        {data?.items?.map((b: any) => (
          <Link href={`/driver/jobs/${b.id}`} key={b.id}>
            <Card className="min-h-32">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{b.customerName}</p>
                  <p className="text-sm text-slate-500">{fmtDate(b.scheduledPickupAt)}</p>
                  <p className="mt-1 text-sm">{b.vehicleRegistrationNumber} · {b.vehicleManufacturer} {b.vehicleModel}</p>
                </div>
                <Badge tone={statusTone(b.currentStatus) as any}>{b.currentStatus}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">{b.pickupAddress}, {b.city}</p>
            </Card>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
