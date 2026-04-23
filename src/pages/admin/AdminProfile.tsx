import { useState } from 'react';
import { useStore } from '../../lib/store';
import { User as UserIcon, KeyRound, Save } from 'lucide-react';

export default function AdminProfile() {
  const { currentUser, update } = useStore();
  const [msg, setMsg] = useState('');
  const [profile, setProfile] = useState({
    fullName: currentUser?.fullName ?? '',
    email: currentUser?.email ?? '',
    username: currentUser?.username ?? '',
  });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  if (!currentUser) return null;
  const me = currentUser;

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    update(d => {
      const u = d.users.find(x => x.id === me.id)!;
      u.fullName = profile.fullName;
      u.email = profile.email;
      u.username = profile.username;
      return d;
    });
    setMsg('Profil disimpan.');
  }

  function changePw(e: React.FormEvent) {
    e.preventDefault();
    if (pw.current !== me.password) { setMsg('Sandi saat ini salah.'); return; }
    if (pw.next.length < 6) { setMsg('Min 6 karakter.'); return; }
    if (pw.next !== pw.confirm) { setMsg('Konfirmasi tidak cocok.'); return; }
    update(d => {
      const u = d.users.find(x => x.id === me.id)!;
      u.password = pw.next;
      return d;
    });
    setPw({ current: '', next: '', confirm: '' });
    setMsg('Sandi berhasil diubah.');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="stamp text-rust mb-3">Profil Admin</div>
      <h1 className="font-display text-4xl font-bold">Akun Administrator</h1>
      {msg && <div className="ticket p-3 mt-4">{msg}</div>}

      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        <form onSubmit={saveProfile} className="ticket p-6">
          <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2"><UserIcon className="w-6 h-6" /> Edit Profil</h2>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Nama</span>
            <input className="input-field mt-1" value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} /></label>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Username</span>
            <input className="input-field mt-1" value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value })} /></label>
          <label className="block mb-4"><span className="font-mono text-xs uppercase tracking-widest">Email</span>
            <input type="email" className="input-field mt-1" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} /></label>
          <button type="submit" className="btn-amber"><Save className="w-4 h-4" /> Simpan</button>
        </form>

        <form onSubmit={changePw} className="ticket p-6">
          <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2"><KeyRound className="w-6 h-6" /> Edit Kata Sandi</h2>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Sandi Saat Ini</span>
            <input type="password" className="input-field mt-1" value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} /></label>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Sandi Baru</span>
            <input type="password" className="input-field mt-1" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} /></label>
          <label className="block mb-4"><span className="font-mono text-xs uppercase tracking-widest">Konfirmasi</span>
            <input type="password" className="input-field mt-1" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} /></label>
          <button type="submit" className="btn-amber"><Save className="w-4 h-4" /> Ubah Sandi</button>
        </form>
      </div>
    </div>
  );
}
