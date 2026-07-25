'use client';

import { useQuery } from '@tanstack/react-query';
import { Shell } from '../../components/shell';
import { Card, ErrorBox, Loading, PageTitle } from '../../components/ui';
import { api } from '../../lib/api';

export default function AdminPage() {
  const users = useQuery({ queryKey: ['users'], queryFn: () => api<any[]>('/users') });
  const branches = useQuery({ queryKey: ['admin-branches'], queryFn: () => api<any[]>('/branches') });
  return (
    <Shell>
      <PageTitle title="Administration" />
      {(users.isLoading || branches.isLoading) && <Loading />}
      {(users.error || branches.error) && <ErrorBox error={users.error || branches.error} />}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Users</h2>
          <div className="space-y-2">{users.data?.map((u) => <p className="rounded-md bg-slate-50 p-2 text-sm" key={u.id}>{u.name} · {u.email} · {u.roles.map((r: any) => r.role.name).join(', ')}</p>)}</div>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Branches</h2>
          <div className="space-y-2">{branches.data?.map((b) => <p className="rounded-md bg-slate-50 p-2 text-sm" key={b.id}>{b.name} · {b.code} · capacity {b.dailyCapacity}</p>)}</div>
        </Card>
      </div>
    </Shell>
  );
}
