'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Shell } from '../../../../components/shell';
import { Card, ErrorBox, Loading, PageTitle } from '../../../../components/ui';
import { api } from '../../../../lib/api';

export default function EditBookingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const booking = useQuery({ queryKey: ['booking-edit', id], queryFn: () => api<any>(`/bookings/${id}`) });
  const reschedule = useMutation({ mutationFn: (body: any) => api(`/bookings/${id}/reschedule`, { method: 'POST', body: JSON.stringify(body) }), onSuccess: () => router.push(`/bookings/${id}`) });
  const cancel = useMutation({ mutationFn: () => api(`/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason: 'Cancelled from edit screen' }) }), onSuccess: () => router.push(`/bookings/${id}`) });
  return (
    <Shell>
      <PageTitle title="Edit Booking" />
      {booking.isLoading && <Loading />}
      {(booking.error || reschedule.error || cancel.error) && <ErrorBox error={booking.error || reschedule.error || cancel.error} />}
      {booking.data && (
        <Card>
          <p className="mb-4 text-sm text-slate-600">Reschedule or cancel {booking.data.referenceNumber}. Full field editing is intentionally narrow in the MVP to protect booking audit history.</p>
          <form className="flex flex-wrap gap-3" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); reschedule.mutate({ scheduledPickupAt: new Date(String(fd.get('scheduledPickupAt'))).toISOString(), reason: String(fd.get('reason')) }); }}>
            <input name="scheduledPickupAt" type="datetime-local" defaultValue={booking.data.scheduledPickupAt.slice(0, 16)} />
            <input name="reason" placeholder="Reschedule reason" defaultValue="Customer requested new slot" />
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Reschedule</button>
            <button type="button" onClick={() => confirm('Cancel booking?') && cancel.mutate()} className="rounded-md bg-rose-700 px-4 py-2 text-sm font-semibold text-white">Cancel</button>
          </form>
        </Card>
      )}
    </Shell>
  );
}
