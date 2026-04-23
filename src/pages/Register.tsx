import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const { register } = useStore();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== confirm) return setError('Konfirmasi kata sandi tidak cocok.');
    if (form.password.length < 6) return setError('Kata sandi minimal 6 karakter.');
    const res = register(form);
    if (!res.ok) return setError(res.error ?? 'Gagal mendaftar.');
    nav('/member');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <div className="stamp text-forest mb-4">Daftar</div>
          <h1 className="font-display text-5xl font-bold">Gabung komunitas<br/><em className="text-amber-deep">klik cuan</em>.</h1>
          <p className="mt-4 text-ink-soft text-lg">Pendaftaran gratis. Dapatkan bonus selamat datang untuk klik pertama Anda.</p>
          <ul className="mt-8 space-y-3 font-mono text-sm">
            <li className="flex gap-3"><span className="text-amber-brand">✮</span> Reward instan setiap klik iklan</li>
            <li className="flex gap-3"><span className="text-amber-brand">✮</span> Pasang iklan teks & banner dengan harga fleksibel</li>
            <li className="flex gap-3"><span className="text-amber-brand">✮</span> Sistem referral & saldo sewa</li>
            <li className="flex gap-3"><span className="text-amber-brand">✮</span> Withdraw Bank, E-Wallet, Crypto</li>
          </ul>
        </div>

        <form onSubmit={submit} className="ticket p-8">
          <h2 className="font-display text-2xl font-bold mb-6">Buat akun baru</h2>
          {error && <div className="mb-4 p-3 border-2 border-berry bg-berry/10 text-berry text-sm font-medium">{error}</div>}
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Nama Lengkap</span>
            <input className="input-field mt-1" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
          </label>
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Username</span>
            <input className="input-field mt-1" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </label>
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Email</span>
            <input type="email" className="input-field mt-1" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Kata Sandi</span>
            <input type="password" className="input-field mt-1" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </label>
          <label className="block mb-6">
            <span className="font-mono text-xs uppercase tracking-widest">Konfirmasi Kata Sandi</span>
            <input type="password" className="input-field mt-1" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </label>
          <button type="submit" className="btn-amber w-full justify-center"><UserPlus className="w-4 h-4" /> Daftar Gratis</button>
          <p className="mt-5 text-sm text-center text-ink-soft">
            Sudah punya akun? <Link to="/login" className="underline font-semibold">Masuk</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
