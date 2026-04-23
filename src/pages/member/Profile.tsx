import { useState } from 'react';
import { useStore, newId } from '../../lib/store';
import type { PaymentAddress } from '../../lib/types';
import { User as UserIcon, KeyRound, Plus, Trash2, Banknote, Wallet, Bitcoin, Save } from 'lucide-react';

export default function Profile() {
  const { currentUser, update } = useStore();
  const [msg, setMsg] = useState('');
  const [profile, setProfile] = useState({
    fullName: currentUser?.fullName ?? '',
    email: currentUser?.email ?? '',
    username: currentUser?.username ?? '',
  });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [addr, setAddr] = useState<Omit<PaymentAddress, 'id'>>({ type: 'bank', name: '', account: '', holder: '' });
  const [editId, setEditId] = useState<string | null>(null);

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
    setMsg('Profil berhasil diperbarui.');
  }

  function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.current !== me.password) { setMsg('Kata sandi saat ini salah.'); return; }
    if (pw.next.length < 6) { setMsg('Kata sandi baru minimal 6 karakter.'); return; }
    if (pw.next !== pw.confirm) { setMsg('Konfirmasi tidak cocok.'); return; }
    update(d => {
      const u = d.users.find(x => x.id === me.id)!;
      u.password = pw.next;
      return d;
    });
    setPw({ current: '', next: '', confirm: '' });
    setMsg('Kata sandi berhasil diubah.');
  }

  function saveAddr(e: React.FormEvent) {
    e.preventDefault();
    update(d => {
      const u = d.users.find(x => x.id === me.id)!;
      if (editId) {
        const a = u.paymentAddresses.find(x => x.id === editId);
        if (a) Object.assign(a, addr);
      } else {
        u.paymentAddresses.push({ id: newId('pay'), ...addr });
      }
      return d;
    });
    setAddr({ type: 'bank', name: '', account: '', holder: '' });
    setEditId(null);
    setMsg(editId ? 'Alamat diperbarui.' : 'Alamat ditambahkan.');
  }

  function removeAddr(id: string) {
    if (!confirm('Hapus alamat ini?')) return;
    update(d => {
      const u = d.users.find(x => x.id === me.id)!;
      u.paymentAddresses = u.paymentAddresses.filter(a => a.id !== id);
      return d;
    });
  }

  function startEdit(a: PaymentAddress) {
    setEditId(a.id);
    setAddr({ type: a.type, name: a.name, account: a.account, holder: a.holder });
  }

  const icon = { bank: Banknote, ewallet: Wallet, crypto: Bitcoin };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="stamp text-rust mb-3">Pengaturan Akun</div>
      <h1 className="font-display text-4xl font-bold">Profil &amp; Keamanan</h1>
      {msg && <div className="ticket p-3 mt-4 font-medium">{msg}</div>}

      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        <form onSubmit={saveProfile} className="ticket p-6">
          <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2"><UserIcon className="w-6 h-6" /> Edit Profil</h2>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Nama Lengkap</span>
            <input className="input-field mt-1" value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} required /></label>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Username</span>
            <input className="input-field mt-1" value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value })} required /></label>
          <label className="block mb-4"><span className="font-mono text-xs uppercase tracking-widest">Email</span>
            <input type="email" className="input-field mt-1" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} required /></label>
          <button type="submit" className="btn-amber"><Save className="w-4 h-4" /> Simpan Profil</button>
        </form>

        <form onSubmit={changePassword} className="ticket p-6">
          <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2"><KeyRound className="w-6 h-6" /> Edit Kata Sandi</h2>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Sandi Saat Ini</span>
            <input type="password" className="input-field mt-1" value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} required /></label>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Sandi Baru</span>
            <input type="password" className="input-field mt-1" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} required /></label>
          <label className="block mb-4"><span className="font-mono text-xs uppercase tracking-widest">Konfirmasi</span>
            <input type="password" className="input-field mt-1" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} required /></label>
          <button type="submit" className="btn-amber"><Save className="w-4 h-4" /> Ubah Sandi</button>
        </form>
      </div>

      <h2 className="font-display text-2xl font-bold mt-12 mb-4">Alamat Pembayaran (untuk Withdraw)</h2>
      <div className="grid lg:grid-cols-[2fr_3fr] gap-6">
        <form onSubmit={saveAddr} className="ticket p-6">
          <h3 className="font-display text-lg font-bold mb-3">{editId ? 'Edit' : 'Tambah'} Alamat</h3>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Jenis</span>
            <select className="input-field mt-1" value={addr.type} onChange={e => setAddr({ ...addr, type: e.target.value as 'bank' | 'ewallet' | 'crypto' })}>
              <option value="bank">Bank</option>
              <option value="ewallet">E-Wallet</option>
              <option value="crypto">Crypto</option>
            </select>
          </label>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Nama Bank / Provider / Network</span>
            <input className="input-field mt-1" value={addr.name} onChange={e => setAddr({ ...addr, name: e.target.value })} placeholder="BCA / DANA / USDT-TRC20" required /></label>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Nomor / Alamat</span>
            <input className="input-field mt-1" value={addr.account} onChange={e => setAddr({ ...addr, account: e.target.value })} required /></label>
          <label className="block mb-4"><span className="font-mono text-xs uppercase tracking-widest">Atas Nama</span>
            <input className="input-field mt-1" value={addr.holder} onChange={e => setAddr({ ...addr, holder: e.target.value })} required /></label>
          <div className="flex gap-2">
            <button type="submit" className="btn-amber flex-1 justify-center"><Plus className="w-4 h-4" /> {editId ? 'Simpan' : 'Tambah'}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setAddr({ type: 'bank', name: '', account: '', holder: '' }); }} className="btn-ghost">Batal</button>}
          </div>
        </form>

        <div className="space-y-3">
          {me.paymentAddresses.length === 0 ? (
            <div className="ticket p-6 text-center text-ink-soft">Belum ada alamat pembayaran.</div>
          ) : me.paymentAddresses.map((a) => {
            const Icon = icon[a.type];
            return (
              <div key={a.id} className="ticket p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-ink text-paper flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold">{a.name}</span>
                    <span className="stamp text-ink-soft">{a.type}</span>
                  </div>
                  <div className="font-mono text-xs text-ink-soft">{a.account} · a/n {a.holder}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(a)} className="btn-ghost !py-1.5 !px-3"><UserIcon className="w-4 h-4" /></button>
                  <button onClick={() => removeAddr(a.id)} className="btn-ghost !py-1.5 !px-3 !text-berry !border-berry"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
