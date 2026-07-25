'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shell } from '../../components/shell';
import { Badge, Card, ErrorBox, fmtDate, Loading, PageTitle, statusTone } from '../../components/ui';
import { api } from '../../lib/api';

export default function DispatchPage() {
  const qc = useQueryClient();
  const [driver, setDriver] = useState<Record<string, string>>({});
  const bookings = useQuery({ queryKey: ['dispatch-bookings'], queryFn: () => api<any>('/bookings?take=100') });
  const drivers = useQuery({ queryKey: ['drivers'], queryFn: () => api<any[]>('/drivers') });
  const assign = useMutation({
    mutationFn: ({ id, driverProfileId }: { id: string; driverProfileId: string }) => api(`/bookings/${id}/assign`, { method: 'POST', body: JSON.stringify({ driverProfileId }) }),
    onSuccess: () => qc.invalidateQueries(),
  });
  const unassigned = bookings.data?.items?.filter((b: any) => b.currentStatus === 'UNASSIGNED' || b.currentStatus === 'RESCHEDULED') ?? [];
  const active = bookings.data?.items?.filter((b: any) => !['COMPLETED', 'CANCELLED', 'FAILED'].includes(b.currentStatus)) ?? [];
  return (
    <Shell>
      <PageTitle title="Dispatcher Board" />
      {(bookings.isLoading || drivers.isLoading) && <Loading />}
      {(bookings.error || drivers.error || assign.error) && <ErrorBox error={bookings.error || drivers.error || assign.error} />}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <Card>
          <h2 className="mb-3 font-semibold">Unassigned and future pickups</h2>
          <div className="space-y-3">
            {unassigned.map((b: any) => (
              <div key={b.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{b.referenceNumber} · {b.customerName}</p>
                    <p className="text-sm text-slate-500">{fmtDate(b.scheduledPickupAt)} · {b.pickupAddress}</p>
                  </div>
                  <Badge tone={statusTone(b.currentStatus) as any}>{b.currentStatus}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <select value={driver[b.id] ?? ''} onChange={(e) => setDriver((d) => ({ ...d, [b.id]: e.target.value }))}>
                    <option value="">Select driver</option>
                    {drivers.data?.map((d: any) => <option key={d.id} value={d.id}>{d.user.name} · {d.currentState} · {d.jobsForSelectedDate} jobs</option>)}
                  </select>
                  <button disabled={!driver[b.id] || assign.isPending} onClick={() => assign.mutate({ id: b.id, driverProfileId: driver[b.id] })} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Assign</button>
                  <a className="rounded-md border border-slate-300 px-4 py-2 text-sm" href={`tel:${b.primaryPhone}`}>Call</a>
                  <a className="rounded-md border border-slate-300 px-4 py-2 text-sm" target="_blank" href={`https://wa.me/91${b.primaryPhone}?text=${encodeURIComponent(`Karsenz pickup ${b.referenceNumber} is scheduled for ${fmtDate(b.scheduledPickupAt)}`)}`}>WhatsApp</a>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Active pickups</h2>
          <div className="space-y-2">
            {active.map((b: any) => (
              <div key={b.id} className="rounded-md border border-slate-200 p-3 text-sm">
                <p className="font-medium">{b.customerName} · {b.vehicleRegistrationNumber}</p>
                <p className="text-slate-500">{b.assignedDriver?.user?.name ?? 'Unassigned'} · {fmtDate(b.scheduledPickupAt)}</p>
                <Badge tone={statusTone(b.currentStatus) as any}>{b.currentStatus}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
