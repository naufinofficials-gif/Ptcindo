import { useState } from 'react';
import { useStore, newId, formatIDR, referralsInLast24h } from '../../lib/store';
import { Users, ShoppingCart, Trash2, Send } from 'lucide-react';

export default function Referrals() {
  const { db, currentUser, update } = useStore();
  const [qty, setQty] = useState(1);
  const [useRent, setUseRent] = useState(true);
  const [msg, setMsg] = useState('');

  if (!currentUser) return null;
  const me = currentUser;

  const refToday = referralsInLast24h(me);
  const maxNow = Math.max(0, 5 - refToday);
  const total = qty * db.settings.referralPrice;
  const myRefs = me.referrals
    .map(rid => db.users.find(u => u.id === rid))
    .filter(Boolean) as typeof db.users;

  const pending = db.referralPurchases.filter(p => p.buyerId === me.id && p.status === 'pending');

  function buy(e: React.FormEvent) {
    e.preventDefault();
    if (qty <= 0 || qty > maxNow) { setMsg(`Maksimal pembelian ${maxNow} referral dalam 24 jam.`); return; }
    const bal = useRent ? me.rentBalance : me.accountBalance;
    if (total > bal) { setMsg('Saldo tidak cukup.'); return; }

    update(d => {
      const u = d.users.find(x => x.id === me.id)!;
      if (useRent) u.rentBalance -= total; else u.accountBalance -= total;
      u.referralPurchasesLast24h.push({ at: Date.now(), count: qty });
      d.referralPurchases.push({
        id: newId('ref'),
        buyerId: me.id,
        count: qty,
        totalPrice: total,
        status: 'pending',
        createdAt: Date.now(),
      });
      return d;
    });
    setMsg(`Permintaan pembelian ${qty} referral dikirim. Menunggu persetujuan admin.`);
    setQty(1);
  }

  function removeRef(id: string) {
    if (!confirm('Hapus referral ini?')) return;
    update(d => {
      const u = d.users.find(x => x.id === me.id)!;
      u.referrals = u.referrals.filter(r => r !== id);
      return d;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="stamp text-rust mb-3">Referral</div>
      <h1 className="font-display text-4xl font-bold">Kelola Referral</h1>
      <p className="mt-2 text-ink-soft">Beli referral untuk tambahan pendapatan pasif. Maksimal 5 pembelian dalam 24 jam.</p>

      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        <form onSubmit={buy} className="ticket p-6">
          <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2"><ShoppingCart className="w-6 h-6" /> Beli Referral</h2>
          {msg && <div className="mb-4 p-3 border-2 border-amber-deep bg-amber-deep/10 text-amber-deep text-sm font-medium">{msg}</div>}
          <div className="ticket-amber p-4 mb-4 font-mono text-sm">
            <div className="flex justify-between"><span>Harga per referral</span><span className="font-bold">{formatIDR(db.settings.referralPrice)}</span></div>
            <div className="flex justify-between"><span>Pembelian hari ini</span><span className="font-bold">{refToday}/5</span></div>
            <div className="flex justify-between"><span>Sisa slot</span><span className="font-bold">{maxNow}</span></div>
          </div>
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Jumlah</span>
            <input type="number" min={1} max={maxNow} className="input-field mt-1" value={qty} onChange={e => setQty(parseInt(e.target.value) || 0)} />
          </label>
          <label className="flex items-center gap-2 mb-4 text-sm">
            <input type="checkbox" checked={useRent} onChange={e => setUseRent(e.target.checked)} className="w-4 h-4 accent-amber-brand" />
            Gunakan Saldo Sewa ({formatIDR(me.rentBalance)})
          </label>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-sm">Total pembayaran</span>
            <span className="font-display text-2xl font-bold">{formatIDR(total)}</span>
          </div>
          <button type="submit" disabled={maxNow === 0} className="btn-amber w-full justify-center"><Send className="w-4 h-4" /> {maxNow === 0 ? 'Limit 24 Jam Tercapai' : 'Beli Referral'}</button>
        </form>

        <div>
          <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2"><Users className="w-6 h-6" /> Referral Saya ({myRefs.length})</h2>
          {pending.length > 0 && (
            <div className="ticket-amber p-4 mb-4">
              <div className="font-mono text-xs uppercase tracking-widest mb-1">Permintaan Pending</div>
              {pending.map(p => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span>{p.count} referral</span><span className="font-bold">{formatIDR(p.totalPrice)}</span>
                </div>
              ))}
            </div>
          )}
          {myRefs.length === 0 ? (
            <div className="ticket p-6 text-center text-ink-soft">Belum punya referral.</div>
          ) : (
            <div className="space-y-2">
              {myRefs.map(r => (
                <div key={r.id} className="ticket p-4 flex items-center justify-between">
                  <div>
                    <div className="font-display font-bold">{r.username}</div>
                    <div className="font-mono text-xs text-ink-soft">{r.email}</div>
                  </div>
                  <button onClick={() => removeRef(r.id)} className="btn-ghost !py-1.5 !px-3 !text-berry !border-berry">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
