'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shell } from '../../components/shell';
import { Card, ErrorBox, Loading, PageTitle } from '../../components/ui';
import { API_URL, api, getToken } from '../../lib/api';

const reports = ['booking-register', 'driver-performance', 'pickup-turnaround-time', 'booking-cancellation', 'rescheduling-history', 'branch-performance', 'customer-pickup-history', 'vehicle-pickup-history', 'pending-workshop-handovers'];

export default function ReportsPage() {
  const [name, setName] = useState(reports[0]);
  const { data, isLoading, error } = useQuery({ queryKey: ['report', name], queryFn: () => api<any>(`/reports/${name}`) });
  return (
    <Shell>
      <PageTitle title="Reports" action={<a className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white" href={`${API_URL}/reports/${name}.csv?token=${getToken()}`}>CSV export</a>} />
      <Card className="mb-4">
        <select value={name} onChange={(e) => setName(e.target.value)}>{reports.map((r) => <option key={r}>{r}</option>)}</select>
      </Card>
      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr>{data?.rows?.[0] && Object.keys(data.rows[0]).map((h: string) => <th key={h} className="border-b p-2">{h}</th>)}</tr></thead>
          <tbody>{data?.rows?.map((row: any, i: number) => <tr key={i}>{Object.values(row).map((v: any, j) => <td key={j} className="border-b p-2">{String(v)}</td>)}</tr>)}</tbody>
        </table>
      </Card>
    </Shell>
  );
}
