'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shell } from '../../components/shell';
import { Badge, Card, ErrorBox, fmtDate, Loading, PageTitle } from '../../components/ui';
import { api } from '../../lib/api';

export default function HandoversPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['handovers'], queryFn: () => api<any[]>('/handovers') });
  const accept = useMutation({
    mutationFn: (b: any) => api(`/bookings/${b.id}/handover`, { method: 'POST', body: JSON.stringify({ confirmedOdometer: b.inspection?.odometerReading ?? 0, confirmedKeys: b.inspection?.numberOfKeysReceived ?? 1, receivedAt: new Date().toISOString(), receivingEmployee: 'Workshop Receiver', discrepancyNotes: '' }) }),
    onSuccess: () => qc.invalidateQueries(),
  });
  return (
    <Shell>
      <PageTitle title="Workshop Handover Queue" />
      {isLoading && <Loading />}
      {(error || accept.error) && <ErrorBox error={error || accept.error} />}
      <div className="grid gap-3">
        {data?.map((b) => (
          <Card key={b.id} className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-2"><h2 className="font-semibold">{b.referenceNumber} · {b.vehicleRegistrationNumber}</h2><Badge tone="amber">{b.currentStatus}</Badge></div>
              <p className="text-sm text-slate-500">{b.customerName} · {b.destinationBranch.name} · {fmtDate(b.updatedAt)}</p>
              <p className="text-sm">Odometer: {b.inspection?.odometerReading ?? 'Pending'} · Keys: {b.inspection?.numberOfKeysReceived ?? 'Pending'}</p>
            </div>
            <button onClick={() => accept.mutate(b)} className="min-h-11 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white">Accept handover</button>
          </Card>
        ))}
        {data?.length === 0 && <Card>No vehicles are waiting for workshop handover.</Card>}
      </div>
    </Shell>
  );
}
