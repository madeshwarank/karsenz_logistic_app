'use client';

import clsx from 'clsx';
import { format } from 'date-fns';

export function PageTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx('rounded-md border border-slate-200 bg-white p-4 shadow-sm', className)}>{children}</section>;
}

export function Badge({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'red' | 'slate' }) {
  const tones = {
    blue: 'bg-sky-100 text-sky-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-rose-100 text-rose-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  return <span className={clsx('rounded px-2 py-1 text-xs font-semibold', tones[tone])}>{children}</span>;
}

export function statusTone(status: string) {
  if (status.includes('COMPLETED')) return 'green';
  if (status.includes('CANCEL') || status.includes('FAILED')) return 'red';
  if (status.includes('UNASSIGNED') || status.includes('HANDOVER')) return 'amber';
  return 'blue';
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function fmtDate(value: string) {
  return format(new Date(value), 'dd MMM yyyy, h:mm a');
}

export function Loading() {
  return <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading...</div>;
}

export function ErrorBox({ error }: { error: unknown }) {
  return <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{String((error as Error)?.message ?? error)}</div>;
}
