import clsx from 'clsx';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export function Button({
  className,
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-11 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const palette = status.includes('CANCEL')
    ? 'bg-rose-100 text-rose-700'
    : status.includes('COMPLETED')
      ? 'bg-emerald-100 text-emerald-700'
      : status.includes('UNASSIGNED') || status.includes('OVERDUE')
        ? 'bg-amber-100 text-amber-800'
        : 'bg-sky-100 text-sky-700';
  return <span className={clsx('rounded px-2 py-1 text-xs font-semibold', palette)}>{status.replaceAll('_', ' ')}</span>;
}

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <section className={clsx('rounded-md border border-slate-200 bg-white p-4 shadow-sm', className)}>{children}</section>;
}
