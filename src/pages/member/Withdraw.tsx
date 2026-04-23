import { useState } from 'react';
import { useStore, newId, formatIDR } from '../../lib/store';
import { Banknote, Wallet, Bitcoin, Send } from 'lucide-react';

export default function Withdraw() {
  const { db, currentUser, update } = useStore();
  const [amt, setAmt] = useState(db.settings.minWithdraw);
  const [addrId, setAddrId] = useState('');
  const [msg, setMsg] = useState('');

  if (!currentUser) return null;
  const me = currentUser;

  const myAddrs = me.paymentAddresses;
  const myWd = db.withdraws.filter(w => w.userId === me.id).sort((a, b) => b.createdAt - a.createdAt);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (amt < db.settings.minWithdraw) { setMsg(`Minimal withdraw ${formatIDR(db.settings.minWithdraw)}.`); return; }
    if (amt > me.accountBalance) { setMsg('Saldo tidak cukup.'); return; }
    const addr = myAddrs.find(a => a.id === addrId);
    if (!addr) { setMsg('Pilih alamat tujuan.'); return; }
    update(d => {
      const u = d.users.find(x => x.id === me.id)!;
      u.accountBalance -= amt;
      d.withdraws.push({
        id: newId('wd'),
        userId: me.id,
        amount: amt,
        method: addr.type,
        destination: `${addr.name} · ${addr.account} (${addr.holder})`,
        status: 'pending',
        createdAt: Date.now(),
      });
      return d;
    });
    setMsg('Permintaan withdraw dikirim. Menunggu persetujuan admin.');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="stamp text-rust mb-3">Withdraw</div>
      <h1 className="font-display text-4xl font-bold">Tarik Saldo</h1>
      <p className="mt-2 text-ink-soft">Minimal penarikan <strong>{formatIDR(db.settings.minWithdraw)}</strong>. Dari Account Balance Anda.</p>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="ticket-dark p-5 col-span-1">
          <div className="font-mono text-xs uppercase tracking-widest text-amber-brand">Account Balance</div>
          <div className="font-display text-3xl font-bold mt-1">{formatIDR(me.accountBalance)}</div>
        </div>
        <form onSubmit={submit} className="ticket p-6 col-span-2">
          {msg && <div className="mb-4 p-3 border-2 border-amber-deep bg-amber-deep/10 text-amber-deep text-sm font-medium">{msg}</div>}
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Jumlah (Rp)</span>
            <input type="number" min={db.settings.minWithdraw} className="input-field mt-1" value={amt} onChange={e => setAmt(parseInt(e.target.value) || 0)} />
          </label>
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Tujuan (Alamat Anda)</span>
            {myAddrs.length === 0 ? (
              <div className="input-field mt-1 text-ink-soft">Belum ada alamat. Tambahkan di halaman <a href="/member/profile" className="underline font-bold">Profil</a>.</div>
            ) : (
              <select className="input-field mt-1" value={addrId} onChange={e => setAddrId(e.target.value)} required>
                <option value="">— Pilih —</option>
                {myAddrs.map(a => (
                  <option key={a.id} value={a.id}>[{a.type.toUpperCase()}] {a.name} · {a.account} ({a.holder})</option>
                ))}
              </select>
            )}
          </label>
          <button type="submit" className="btn-amber w-full justify-center" disabled={myAddrs.length === 0}>
            <Send className="w-4 h-4" /> Kirim Permintaan Withdraw
          </button>
        </form>
      </div>

      <h2 className="font-display text-2xl font-bold mt-10 mb-4">Riwayat Withdraw</h2>
      {myWd.length === 0 ? (
        <div className="ticket p-6 text-center text-ink-soft">Belum ada riwayat.</div>
      ) : (
        <div className="ticket overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink text-paper font-mono text-xs uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Metode</th>
                <th className="px-4 py-3 text-left">Tujuan</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {myWd.map(w => (
                <tr key={w.id} className="border-t border-ink/10">
                  <td className="px-4 py-3 font-mono text-xs">{new Date(w.createdAt).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 uppercase font-mono text-xs flex items-center gap-1">
                    {w.method === 'bank' && <Banknote className="w-3.5 h-3.5" />}
                    {w.method === 'ewallet' && <Wallet className="w-3.5 h-3.5" />}
                    {w.method === 'crypto' && <Bitcoin className="w-3.5 h-3.5" />}
                    {w.method}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{w.destination}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatIDR(w.amount)}</td>
                  <td className="px-4 py-3 text-center"><span className={`stamp ${w.status === 'approved' ? 'text-forest' : w.status === 'rejected' ? 'text-berry' : 'text-amber-deep'}`}>{w.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
