import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { LogIn, Info } from 'lucide-react';

export default function Login() {
  const { login } = useStore();
  const nav = useNavigate();
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = login(username.trim(), password);
    if (!res.ok) { setError(res.error ?? 'Gagal login.'); return; }
    const db = JSON.parse(localStorage.getItem('klikcuan_db_v1') || '{}');
    const u = db.users?.find((x: any) => x.id === db.currentUserId);
    nav(u?.role === 'admin' ? '/admin' : '/member');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <div className="stamp text-rust mb-4">Masuk</div>
          <h1 className="font-display text-5xl font-bold">Selamat datang kembali.</h1>
          <p className="mt-4 text-ink-soft text-lg">Lanjutkan perjalanan cuan Anda hari ini.</p>

          <div className="ticket-amber p-5 mt-8">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 mt-0.5" />
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="ticket p-8">
          <h2 className="font-display text-2xl font-bold mb-6">Masuk ke akun Anda</h2>
          {error && <div className="mb-4 p-3 border-2 border-berry bg-berry/10 text-berry text-sm font-medium">{error}</div>}
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Username / Email</span>
            <input className="input-field mt-1" value={username} onChange={e => setU(e.target.value)} required />
          </label>
          <label className="block mb-6">
            <span className="font-mono text-xs uppercase tracking-widest">Kata Sandi</span>
            <input type="password" className="input-field mt-1" value={password} onChange={e => setP(e.target.value)} required />
          </label>
          <button type="submit" className="btn-amber w-full justify-center"><LogIn className="w-4 h-4" /> Masuk</button>
          <p className="mt-5 text-sm text-center text-ink-soft">
            Belum punya akun? <Link to="/register" className="underline font-semibold">Daftar gratis</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
