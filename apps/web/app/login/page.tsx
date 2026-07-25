'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../lib/api';

const demos = [
  'customer.service@karsenz.local',
  'dispatcher@karsenz.local',
  'driver1@karsenz.local',
  'workshop@karsenz.local',
  'manager@karsenz.local',
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(demos[0]);
  const [password, setPassword] = useState('Karsenz@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(String((err as Error).message));
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-service">Karsenz</p>
        <h1 className="mt-1 text-2xl font-bold">Pickup Logistics Login</h1>
        <p className="mt-2 text-sm text-slate-600">Development credentials only. Password for all demo accounts: `Karsenz@123`.</p>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-1">
            Email
            <select value={email} onChange={(e) => setEmail(e.target.value)}>
              {demos.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <button disabled={loading} className="min-h-11 rounded-md bg-slate-900 px-4 font-semibold text-white">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </main>
  );
}
