'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { CalendarDays, Car, ClipboardList, Gauge, LayoutDashboard, LogOut, MapPinned, Settings, Users, Wrench } from 'lucide-react';
import { getUser, logout } from '../lib/api';

const nav = [
  ['Dashboard', '/', LayoutDashboard],
  ['Bookings', '/bookings', ClipboardList],
  ['Calendar', '/calendar', CalendarDays],
  ['Dispatch', '/dispatch', MapPinned],
  ['Drivers', '/drivers', Users],
  ['Driver Mobile', '/driver/jobs', Car],
  ['Customers', '/customers', Users],
  ['Vehicles', '/vehicles', Car],
  ['Handovers', '/handovers', Wrench],
  ['Reports', '/reports', Gauge],
  ['Administration', '/admin', Settings],
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = getUser();
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="border-b border-slate-200 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-service">Karsenz</p>
          <h1 className="text-lg font-bold">Pickup Logistics</h1>
          <p className="mt-1 text-xs text-slate-500">{user?.email ?? 'Local MVP'}</p>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium',
                pathname === href ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100',
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-xs text-slate-500">Operations portal</p>
            <h2 className="text-lg font-semibold">{nav.find((n) => n[1] === pathname)?.[0] ?? 'Karsenz'}</h2>
          </div>
          <button onClick={logout} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </header>
        <div className="p-4 lg:p-6">{children}</div>
        <nav className="fixed inset-x-0 bottom-0 grid grid-cols-5 border-t border-slate-200 bg-white lg:hidden">
          {nav.slice(0, 5).map(([label, href, Icon]) => (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 p-2 text-[11px]">
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
