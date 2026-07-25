'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shell } from '../../../components/shell';
import { Badge, Card, ErrorBox, fmtDate, Loading, PageTitle, statusTone } from '../../../components/ui';
import { api } from '../../../lib/api';

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['booking', id], queryFn: () => api<any>(`/bookings/${id}`) });
  const transition = useMutation({ mutationFn: (status: string) => api(`/bookings/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }), onSuccess: () => qc.invalidateQueries() });
  return (
    <Shell>
      <PageTitle title="Booking Details" action={<Link className="rounded-md border border-slate-300 px-4 py-2 text-sm" href={`/bookings/${id}/edit`}>Edit</Link>} />
      {isLoading && <Loading />}
      {(error || transition.error) && <ErrorBox error={error || transition.error} />}
      {data && (
        <div className="grid gap-4 xl:grid-cols-[1fr_.8fr]">
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{data.referenceNumber}</h2>
              <Badge tone={statusTone(data.currentStatus) as any}>{data.currentStatus}</Badge>
              <Badge tone="slate">{data.priority}</Badge>
            </div>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div><dt className="text-slate-500">Schedule</dt><dd className="font-medium">{fmtDate(data.scheduledPickupAt)}</dd></div>
              <div><dt className="text-slate-500">Customer</dt><dd>{data.customerName} · {data.primaryPhone}</dd></div>
              <div><dt className="text-slate-500">Vehicle</dt><dd>{data.vehicleRegistrationNumber} · {data.vehicleManufacturer} {data.vehicleModel}</dd></div>
              <div><dt className="text-slate-500">Branch</dt><dd>{data.destinationBranch.name}</dd></div>
              <div><dt className="text-slate-500">Driver</dt><dd>{data.assignedDriver?.user?.name ?? 'Unassigned'}</dd></div>
              <div><dt className="text-slate-500">Address</dt><dd>{data.pickupAddress}, {data.city}</dd></div>
              <div><dt className="text-slate-500">Complaint</dt><dd>{data.serviceComplaint}</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <a className="rounded-md border border-slate-300 px-4 py-2 text-sm" href={`tel:${data.primaryPhone}`}>Call customer</a>
              <a className="rounded-md border border-slate-300 px-4 py-2 text-sm" target="_blank" href={`https://wa.me/91${data.primaryPhone}`}>WhatsApp</a>
              <a className="rounded-md border border-slate-300 px-4 py-2 text-sm" target="_blank" href={`https://maps.google.com/?q=${encodeURIComponent(data.pickupAddress + ', Chennai')}`}>Maps</a>
            </div>
          </Card>
          <Card>
            <h2 className="mb-3 font-semibold">Status history</h2>
            <div className="space-y-2">
              {data.statusHistory.map((h: any) => <p key={h.id} className="rounded-md bg-slate-50 p-2 text-sm">{h.toStatus} · {fmtDate(h.createdAt)} · {h.notes}</p>)}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['DRIVER_ACCEPTED','TRIP_STARTED','ARRIVED_AT_CUSTOMER','INSPECTION_IN_PROGRESS','VEHICLE_PICKED_UP','EN_ROUTE_TO_BRANCH','ARRIVED_AT_BRANCH','HANDOVER_PENDING'].map((s) => (
                <button key={s} onClick={() => transition.mutate(s)} className="rounded-md border border-slate-300 px-3 py-2 text-xs">{s}</button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </Shell>
  );
}
