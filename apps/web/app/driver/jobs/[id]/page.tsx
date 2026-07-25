'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shell } from '../../../../components/shell';
import { Badge, Card, ErrorBox, fmtDate, Loading, PageTitle, statusTone } from '../../../../components/ui';
import { api } from '../../../../lib/api';

const flow = ['DRIVER_ACCEPTED', 'TRIP_STARTED', 'ARRIVED_AT_CUSTOMER', 'INSPECTION_IN_PROGRESS', 'VEHICLE_PICKED_UP', 'EN_ROUTE_TO_BRANCH', 'ARRIVED_AT_BRANCH', 'HANDOVER_PENDING'];

export default function DriverJobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const booking = useQuery({ queryKey: ['driver-job', id], queryFn: () => api<any>(`/bookings/${id}`) });
  const transition = useMutation({ mutationFn: (status: string) => api(`/bookings/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }), onSuccess: () => qc.invalidateQueries() });
  const reject = useMutation({ mutationFn: () => api(`/bookings/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason: 'Driver unavailable' }) }), onSuccess: () => qc.invalidateQueries() });
  const currentIndex = flow.indexOf(booking.data?.currentStatus);
  const next = currentIndex < 0 ? 'DRIVER_ACCEPTED' : flow[currentIndex + 1];
  return (
    <Shell>
      <PageTitle title="Driver Job" />
      {booking.isLoading && <Loading />}
      {(booking.error || transition.error || reject.error) && <ErrorBox error={booking.error || transition.error || reject.error} />}
      {booking.data && (
        <div className="mx-auto grid max-w-md gap-4">
          <Card>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold">{booking.data.customerName}</h2>
              <Badge tone={statusTone(booking.data.currentStatus) as any}>{booking.data.currentStatus}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-500">{fmtDate(booking.data.scheduledPickupAt)}</p>
            <p className="mt-3 font-medium">{booking.data.vehicleRegistrationNumber} · {booking.data.vehicleManufacturer} {booking.data.vehicleModel}</p>
            <p className="mt-1 text-sm">{booking.data.pickupAddress}, {booking.data.city}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a className="min-h-12 rounded-md bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white" href={`tel:${booking.data.primaryPhone}`}>Call</a>
              <a className="min-h-12 rounded-md border border-slate-300 px-4 py-3 text-center text-sm" target="_blank" href={`https://wa.me/91${booking.data.primaryPhone}`}>WhatsApp</a>
              <a className="col-span-2 min-h-12 rounded-md border border-slate-300 px-4 py-3 text-center text-sm" target="_blank" href={`https://maps.google.com/?q=${encodeURIComponent(booking.data.pickupAddress + ', Chennai')}`}>Open Google Maps</a>
            </div>
          </Card>
          <Card>
            <h3 className="mb-3 font-semibold">Workflow</h3>
            {booking.data.currentStatus === 'ARRIVED_AT_CUSTOMER' || booking.data.currentStatus === 'INSPECTION_IN_PROGRESS' ? (
              <Link className="block min-h-12 rounded-md bg-slate-900 px-4 py-3 text-center font-semibold text-white" href={`/driver/jobs/${id}/inspection`}>Complete inspection</Link>
            ) : next ? (
              <button onClick={() => transition.mutate(next)} className="w-full min-h-12 rounded-md bg-slate-900 px-4 py-3 font-semibold text-white">{next.replaceAll('_', ' ')}</button>
            ) : (
              <p className="text-sm text-slate-500">No driver action available.</p>
            )}
            {booking.data.currentStatus === 'ASSIGNED' && <button onClick={() => reject.mutate()} className="mt-2 w-full min-h-12 rounded-md border border-rose-300 text-rose-700">Reject with reason</button>}
          </Card>
        </div>
      )}
    </Shell>
  );
}
