import { useState } from 'react';
import { useStore, newId, formatIDR } from '../../lib/store';
import { Image as ImageIcon, Send, History } from 'lucide-react';

export default function PostBannerAd() {
  const { db, currentUser, update } = useStore();
  const [form, setForm] = useState({ title: '', imageUrl: '', url: '', clicks: 100, reward: 200 });
  const [msg, setMsg] = useState('');
  const [useRent, setUseRent] = useState(false);

  if (!currentUser) return null;
  const me = currentUser;

  const totalPrice = form.clicks * form.reward + form.clicks * 100; // banner premium fee
  const banners = db.bannerAds.filter(a => a.ownerId === me.id).sort((a, b) => b.createdAt - a.createdAt);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const bal = useRent ? me.rentBalance : me.accountBalance;
    if (totalPrice > bal) { setMsg('Saldo tidak cukup.'); return; }
    update(d => {
      const u = d.users.find(x => x.id === me.id)!;
      if (useRent) u.rentBalance -= totalPrice; else u.accountBalance -= totalPrice;
      d.bannerAds.push({
        id: newId('ban'),
        ownerId: me.id,
        title: form.title,
        imageUrl: form.imageUrl,
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
    setForm({ title: '', imageUrl: '', url: '', clicks: 100, reward: 200 });
    setMsg('Banner terkirim. Menunggu persetujuan admin.');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid lg:grid-cols-2 gap-8">
      <div>
        <div className="stamp text-rust mb-3">Pasang Banner</div>
        <h1 className="font-display text-4xl font-bold">Iklan Banner</h1>
        <p className="mt-2 text-ink-soft">Banner bergambar tayang di posisi premium. Menunggu persetujuan admin.</p>

        <form onSubmit={submit} className="ticket p-6 mt-6">
          {msg && <div className="mb-4 p-3 border-2 border-forest bg-forest/10 text-forest text-sm font-medium">{msg}</div>}
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Judul Banner</span>
            <input className="input-field mt-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">URL Gambar Banner</span>
            <input type="url" placeholder="https://.../banner.jpg" className="input-field mt-1" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} required />
          </label>
          {form.imageUrl && (
            <div className="border-2 border-ink mb-4">
              <img src={form.imageUrl} alt="preview" className="w-full h-32 object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">URL Tujuan</span>
            <input type="url" className="input-field mt-1" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} required />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block mb-4">
              <span className="font-mono text-xs uppercase tracking-widest">Jumlah Klik</span>
              <input type="number" min={50} className="input-field mt-1" value={form.clicks} onChange={e => setForm({ ...form, clicks: parseInt(e.target.value) || 0 })} />
            </label>
            <label className="block mb-4">
              <span className="font-mono text-xs uppercase tracking-widest">Reward/klik</span>
              <input type="number" min={100} className="input-field mt-1" value={form.reward} onChange={e => setForm({ ...form, reward: parseInt(e.target.value) || 0 })} />
            </label>
          </div>
          <label className="flex items-center gap-2 mb-4 text-sm">
            <input type="checkbox" checked={useRent} onChange={e => setUseRent(e.target.checked)} className="w-4 h-4 accent-amber-brand" />
            Gunakan Saldo Sewa ({formatIDR(me.rentBalance)})
          </label>
          <div className="ticket-amber p-4 mb-4 font-mono text-sm">
            <div className="flex justify-between"><span>Subtotal reward</span><span>{formatIDR(form.clicks * form.reward)}</span></div>
            <div className="flex justify-between"><span>Biaya banner premium</span><span>{formatIDR(form.clicks * 100)}</span></div>
            <div className="divider-dashed my-2"></div>
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatIDR(totalPrice)}</span></div>
          </div>
          <button type="submit" className="btn-amber w-full justify-center"><Send className="w-4 h-4" /> Kirim untuk Persetujuan</button>
        </form>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2"><History className="w-6 h-6" /> Banner Saya</h2>
        {banners.length === 0 ? (
          <div className="ticket p-6 text-center text-ink-soft">Belum ada banner.</div>
        ) : (
          <div className="space-y-3">
            {banners.map(a => (
              <div key={a.id} className="ticket p-4">
                <div className="flex items-start gap-3">
                  <img src={a.imageUrl} alt={a.title} className="w-24 h-16 object-cover border-2 border-ink flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <h3 className="font-display text-lg font-bold">{a.title}</h3>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                    <div className="mt-1 font-mono text-xs text-ink-soft">
                      {formatIDR(a.pricePaid)} · {a.clicksRemaining}/{a.clicksBought} klik · {formatIDR(a.reward)}/klik
                    </div>
                  </div>
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
