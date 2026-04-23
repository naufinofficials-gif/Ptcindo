import { useState } from 'react';
import { useStore, newId, formatIDR } from '../../lib/store';
import type { PaymentAddress } from '../../lib/types';
import { Save, Plus, Trash2, Banknote, Wallet, Bitcoin, Settings2 } from 'lucide-react';

export default function AdminSettings() {
  const { db, update } = useStore();
  const [s, setS] = useState({
    minWithdraw: db.settings.minWithdraw,
    adsPerViewSession: db.settings.adsPerViewSession,
    defaultRewardPerClick: db.settings.defaultRewardPerClick,
  });
  const [addr, setAddr] = useState<Omit<PaymentAddress, 'id'>>({ type: 'bank', name: '', account: '', holder: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    update(d => {
      d.settings.minWithdraw = s.minWithdraw;
      d.settings.adsPerViewSession = s.adsPerViewSession;
      d.settings.defaultRewardPerClick = s.defaultRewardPerClick;
      return d;
    });
    setMsg('Pengaturan disimpan.');
  }

  function saveAddr(e: React.FormEvent) {
    e.preventDefault();
    update(d => {
      if (editId) {
        const a = d.settings.adminPaymentAddresses.find(x => x.id === editId);
        if (a) Object.assign(a, addr);
      } else {
        d.settings.adminPaymentAddresses.push({ id: newId('pay'), ...addr });
      }
      return d;
    });
    setAddr({ type: 'bank', name: '', account: '', holder: '' });
    setEditId(null);
    setMsg('Alamat admin disimpan.');
  }

  function removeAddr(id: string) {
    if (!confirm('Hapus alamat?')) return;
    update(d => {
      d.settings.adminPaymentAddresses = d.settings.adminPaymentAddresses.filter(a => a.id !== id);
      return d;
    });
  }

  const icon = { bank: Banknote, ewallet: Wallet, crypto: Bitcoin };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="stamp text-rust mb-3">Pengaturan</div>
      <h1 className="font-display text-4xl font-bold">Konfigurasi Platform</h1>
      {msg && <div className="ticket p-3 mt-4">{msg}</div>}

      <form onSubmit={saveSettings} className="ticket p-6 mt-6">
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><Settings2 className="w-5 h-5" /> Parameter Umum</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <label className="block"><span className="font-mono text-xs uppercase tracking-widest">Minimal Withdraw (Rp)</span>
            <input type="number" className="input-field mt-1" value={s.minWithdraw} onChange={e => setS({ ...s, minWithdraw: parseInt(e.target.value) || 0 })} /></label>
          <label className="block"><span className="font-mono text-xs uppercase tracking-widest">Jumlah Iklan per Sesi</span>
            <input type="number" className="input-field mt-1" value={s.adsPerViewSession} onChange={e => setS({ ...s, adsPerViewSession: parseInt(e.target.value) || 0 })} /></label>
          <label className="block"><span className="font-mono text-xs uppercase tracking-widest">Reward Default (Rp)</span>
            <input type="number" className="input-field mt-1" value={s.defaultRewardPerClick} onChange={e => setS({ ...s, defaultRewardPerClick: parseInt(e.target.value) || 0 })} /></label>
        </div>
        <div className="mt-4"><button type="submit" className="btn-amber"><Save className="w-4 h-4" /> Simpan Pengaturan</button></div>
        <div className="mt-3 font-mono text-xs text-ink-soft">Saat ini: Min WD {formatIDR(db.settings.minWithdraw)} · Reward default {formatIDR(db.settings.defaultRewardPerClick)} · Iklan/sesi {db.settings.adsPerViewSession}</div>
      </form>

      <h2 className="font-display text-2xl font-bold mt-10 mb-4">Alamat Pembayaran Admin</h2>
      <p className="text-ink-soft mb-4">Member akan transfer ke sini untuk deposit Saldo Sewa.</p>
      <div className="grid lg:grid-cols-[2fr_3fr] gap-6">
        <form onSubmit={saveAddr} className="ticket p-6">
          <h3 className="font-display text-lg font-bold mb-3">{editId ? 'Edit' : 'Tambah'} Alamat</h3>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Jenis</span>
            <select className="input-field mt-1" value={addr.type} onChange={e => setAddr({ ...addr, type: e.target.value as any })}>
              <option value="bank">Bank</option>
              <option value="ewallet">E-Wallet</option>
              <option value="crypto">Crypto</option>
            </select>
          </label>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Nama / Provider</span>
            <input className="input-field mt-1" value={addr.name} onChange={e => setAddr({ ...addr, name: e.target.value })} required /></label>
          <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Nomor / Alamat</span>
            <input className="input-field mt-1" value={addr.account} onChange={e => setAddr({ ...addr, account: e.target.value })} required /></label>
          <label className="block mb-4"><span className="font-mono text-xs uppercase tracking-widest">Atas Nama</span>
            <input className="input-field mt-1" value={addr.holder} onChange={e => setAddr({ ...addr, holder: e.target.value })} required /></label>
          <div className="flex gap-2">
            <button type="submit" className="btn-amber"><Plus className="w-4 h-4" /> {editId ? 'Simpan' : 'Tambah'}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setAddr({ type: 'bank', name: '', account: '', holder: '' }); }} className="btn-ghost">Batal</button>}
          </div>
        </form>

        <div className="space-y-3">
          {db.settings.adminPaymentAddresses.map(a => {
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
                  <button onClick={() => { setEditId(a.id); setAddr({ type: a.type, name: a.name, account: a.account, holder: a.holder }); }} className="btn-ghost !py-1.5 !px-3">Edit</button>
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
