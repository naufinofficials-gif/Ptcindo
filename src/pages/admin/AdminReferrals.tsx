import { useState } from 'react';
import { useStore, newId, formatIDR } from '../../lib/store';
import { Check, X, Save, Users, Plus, Trash2 } from 'lucide-react';

export default function AdminReferrals() {
  const { db, update } = useStore();
  const [price, setPrice] = useState(db.settings.referralPrice);
  const [msg, setMsg] = useState('');

  const pending = db.referralPurchases.filter(r => r.status === 'pending');
  const approved = db.referralPurchases.filter(r => r.status === 'approved');

  function savePrice(e: React.FormEvent) {
    e.preventDefault();
    update(d => { d.settings.referralPrice = price; return d; });
    setMsg('Harga referral diperbarui.');
  }

  function decide(id: string, ok: boolean) {
    update(d => {
      const p = d.referralPurchases.find(x => x.id === id);
      if (!p) return d;
      p.status = ok ? 'approved' : 'rejected';
      if (ok) {
        // create synthetic referral users owned by buyer
        const buyer = d.users.find(u => u.id === p.buyerId);
        if (buyer) {
          for (let i = 0; i < p.count; i++) {
            const rid = newId('ref-user');
            d.users.push({
              id: rid,
              username: 'ref_' + rid.slice(-6),
              email: rid + '@ref.klikcuan.id',
              password: 'referral',
              role: 'member',
              fullName: 'Referral Bot #' + rid.slice(-4),
              accountBalance: 0, rentBalance: 0,
              referrals: [], referralPurchasesLast24h: [],
              adClicksLog: {}, banned: false, createdAt: Date.now(), paymentAddresses: [],
            });
            buyer.referrals.push(rid);
          }
        }
      } else {
        // refund
        const buyer = d.users.find(u => u.id === p.buyerId);
        if (buyer) buyer.accountBalance += p.totalPrice;
      }
      return d;
    });
  }

  function sellManually() {
    const buyerUsername = prompt('Username member untuk dijual referral:');
    if (!buyerUsername) return;
    const count = parseInt(prompt('Jumlah referral?') || '0', 10);
    if (!count || count <= 0) return;
    update(d => {
      const buyer = d.users.find(u => u.username === buyerUsername && u.role === 'member');
      if (!buyer) { alert('Member tidak ditemukan.'); return d; }
      for (let i = 0; i < count; i++) {
        const rid = newId('ref-user');
        d.users.push({
          id: rid, username: 'ref_' + rid.slice(-6), email: rid + '@ref.klikcuan.id', password: 'referral',
          role: 'member', fullName: 'Referral #' + rid.slice(-4), accountBalance: 0, rentBalance: 0,
          referrals: [], referralPurchasesLast24h: [], adClicksLog: {}, banned: false, createdAt: Date.now(), paymentAddresses: [],
        });
        buyer.referrals.push(rid);
      }
      return d;
    });
    setMsg(`${count} referral dijual ke ${buyerUsername}.`);
  }

  function removeRef(userId: string, refId: string) {
    if (!confirm('Hapus referral ini?')) return;
    update(d => {
      const u = d.users.find(x => x.id === userId);
      if (u) u.referrals = u.referrals.filter(r => r !== refId);
      return d;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="stamp text-rust mb-3">Referral</div>
      <h1 className="font-display text-4xl font-bold">Manajemen Referral</h1>
      {msg && <div className="ticket p-3 mt-4">{msg}</div>}

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <form onSubmit={savePrice} className="ticket p-6">
          <h2 className="font-display text-xl font-bold mb-3">Harga Referral</h2>
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Harga per Referral (Rp)</span>
            <input type="number" className="input-field mt-1" value={price} onChange={e => setPrice(parseInt(e.target.value) || 0)} />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-amber"><Save className="w-4 h-4" /> Simpan Harga</button>
            <button type="button" onClick={sellManually} className="btn-primary"><Plus className="w-4 h-4" /> Jual Manual</button>
          </div>
        </form>

        <div className="ticket p-6">
          <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2"><Users className="w-5 h-5" /> Permintaan Pembelian</h2>
          {pending.length === 0 ? (
            <div className="text-center text-ink-soft py-6">Tidak ada pending.</div>
          ) : (
            <div className="space-y-2">
              {pending.map(p => {
                const buyer = db.users.find(u => u.id === p.buyerId);
                return (
                  <div key={p.id} className="border-2 border-ink p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold">{buyer?.username}</div>
                      <div className="text-sm">{p.count} referral · {formatIDR(p.totalPrice)}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => decide(p.id, true)} className="btn-amber !py-1.5 !px-2"><Check className="w-4 h-4" /></button>
                      <button onClick={() => decide(p.id, false)} className="btn-ghost !py-1.5 !px-2 !text-berry !border-berry"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <h2 className="font-display text-2xl font-bold mt-10 mb-4">Referral per Member</h2>
      <div className="space-y-3">
        {db.users.filter(u => u.role === 'member' && u.referrals.length > 0).map(u => (
          <div key={u.id} className="ticket p-4">
            <div className="font-display font-bold">{u.username} — {u.referrals.length} referral</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {u.referrals.map(rid => (
                <span key={rid} className="font-mono text-xs border-2 border-ink px-2 py-1 flex items-center gap-1">
                  {rid.slice(-8)}
                  <button onClick={() => removeRef(u.id, rid)} className="text-berry hover:text-ink"><Trash2 className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="ticket p-4">
          <div className="font-mono text-xs uppercase tracking-widest text-ink-soft">Riwayat disetujui: {approved.length}</div>
        </div>
      </div>
    </div>
  );
}
