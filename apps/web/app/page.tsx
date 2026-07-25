'use client';

import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Shell } from '../components/shell';
import { Card, ErrorBox, Loading, PageTitle } from '../components/ui';
import { api } from '../lib/api';

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard'], queryFn: () => api<any>('/dashboard/summary') });
  return (
    <Shell>
      <PageTitle title="Dashboard" />
      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}
      {data && (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(data.cards).map(([key, value]) => (
              <Card key={key}>
                <p className="text-sm text-slate-500">{key.replace(/[A-Z]/g, (m) => ` ${m}`).trim()}</p>
                <p className="mt-2 text-3xl font-bold">{String(value)}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="h-80">
              <h2 className="mb-3 font-semibold">Status distribution</h2>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data.charts.statusDistribution} dataKey="value" nameKey="label" outerRadius={100} label>
                    {data.charts.statusDistribution.map((_: any, i: number) => (
                      <Cell key={i} fill={['#0f766e', '#0369a1', '#b45309', '#be123c', '#475569'][i % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card className="h-80">
              <h2 className="mb-3 font-semibold">Branch volume</h2>
              <ResponsiveContainer>
                <BarChart data={data.charts.branchVolume}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}
    </Shell>
  );
}
