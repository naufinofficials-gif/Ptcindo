import { useState } from 'react';
import { useStore, newId, formatIDR } from '../../lib/store';
import { Megaphone, Send, History } from 'lucide-react';

export default function PostTextAd() {
  const { db, currentUser, update } = useStore();
  const [form, setForm] = useState({ title: '', description: '', url: '', clicks: 50, reward: db.settings.defaultRewardPerClick });
  const [msg, setMsg] = useState('');
  const [useRent, setUseRent] = useState(false);

  if (!currentUser) return null;
  const me = currentUser;

  const totalPrice = form.clicks * form.reward + form.clicks * 50; // 50 admin fee per click
  const ads = db.textAds.filter(a => a.ownerId === me.id).sort((a, b) => b.createdAt - a.createdAt);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const bal = useRent ? me.rentBalance : me.accountBalance;
    if (totalPrice > bal) { setMsg('Saldo tidak cukup.'); return; }
    update(d => {
      const u = d.users.find(x => x.id === me.id)!;
      if (useRent) u.rentBalance -= totalPrice; else u.accountBalance -= totalPrice;
      d.textAds.push({
        id: newId('ad'),
        ownerId: me.id,
        title: form.title,
        description: form.description,
        url: form.url,
        pricePaid: totalPrice,
        clicksBought: form.clicks,
        clicksRemaining: form.clicks,
        reward: form.reward,
        status: 'pending',
        createdAt: Date.now(),
      });
      return d;
    });
    setForm({ title: '', description: '', url: '', clicks: 50, reward: db.settings.defaultRewardPerClick });
    setMsg('Iklan terkirim. Menunggu persetujuan admin.');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid lg:grid-cols-2 gap-8">
      <div>
        <div className="stamp text-rust mb-3">Pasang Iklan</div>
        <h1 className="font-display text-4xl font-bold">Iklan Teks</h1>
        <p className="mt-2 text-ink-soft">Buat iklan teks sederhana. Admin akan memverifikasi dalam 1x24 jam.</p>

        <form onSubmit={submit} className="ticket p-6 mt-6">
          {msg && <div className="mb-4 p-3 border-2 border-forest bg-forest/10 text-forest text-sm font-medium">{msg}</div>}
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Judul Iklan</span>
            <input className="input-field mt-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Deskripsi</span>
            <textarea className="input-field mt-1" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </label>
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">URL Tujuan</span>
            <input type="url" placeholder="https://..." className="input-field mt-1" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} required />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block mb-4">
              <span className="font-mono text-xs uppercase tracking-widest">Jumlah Klik</span>
              <input type="number" min={10} className="input-field mt-1" value={form.clicks} onChange={e => setForm({ ...form, clicks: parseInt(e.target.value) || 0 })} required />
            </label>
            <label className="block mb-4">
              <span className="font-mono text-xs uppercase tracking-widest">Reward/klik (Rp)</span>
              <input type="number" min={50} className="input-field mt-1" value={form.reward} onChange={e => setForm({ ...form, reward: parseInt(e.target.value) || 0 })} required />
            </label>
          </div>
          <label className="flex items-center gap-2 mb-4 text-sm">
            <input type="checkbox" checked={useRent} onChange={e => setUseRent(e.target.checked)} className="w-4 h-4 accent-amber-brand" />
            Gunakan Saldo Sewa ({formatIDR(me.rentBalance)})
          </label>
          <div className="ticket-amber p-4 mb-4 font-mono text-sm">
            <div className="flex justify-between"><span>Subtotal reward</span><span>{formatIDR(form.clicks * form.reward)}</span></div>
            <div className="flex justify-between"><span>Biaya platform</span><span>{formatIDR(form.clicks * 50)}</span></div>
            <div className="divider-dashed my-2"></div>
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatIDR(totalPrice)}</span></div>
          </div>
          <button type="submit" className="btn-amber w-full justify-center"><Send className="w-4 h-4" /> Kirim untuk Persetujuan</button>
        </form>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2"><History className="w-6 h-6" /> Iklan Saya</h2>
        {ads.length === 0 ? (
          <div className="ticket p-6 text-center text-ink-soft">Belum ada iklan.</div>
        ) : (
          <div className="space-y-3">
            {ads.map(a => (
              <div key={a.id} className="ticket p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4" />
                      <h3 className="font-display text-lg font-bold">{a.title}</h3>
                    </div>
                    <div className="text-sm text-ink-soft mt-1">{a.description}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <div className="divider-dashed my-3"></div>
                <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                  <div><div className="text-ink-soft uppercase">Harga</div><div className="font-bold">{formatIDR(a.pricePaid)}</div></div>
                  <div><div className="text-ink-soft uppercase">Sisa Klik</div><div className="font-bold">{a.clicksRemaining}/{a.clicksBought}</div></div>
                  <div><div className="text-ink-soft uppercase">Reward</div><div className="font-bold">{formatIDR(a.reward)}</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'text-amber-deep',
    approved: 'text-forest',
    rejected: 'text-berry',
    completed: 'text-ink-soft',
  };
  return <span className={`stamp ${styles[status]}`}>{status}</span>;
}
