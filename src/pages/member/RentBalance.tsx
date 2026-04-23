import { useState } from 'react';
import { useStore, newId, formatIDR } from '../../lib/store';
import { ArrowRightLeft, Banknote, Wallet, Bitcoin, Send, CheckCircle2 } from 'lucide-react';

export default function RentBalance() {
  const { db, currentUser, update } = useStore();
  const [depAmt, setDepAmt] = useState(50000);
  const [method, setMethod] = useState<'bank' | 'ewallet' | 'crypto'>('bank');
  const [target, setTarget] = useState('');
  const [note, setNote] = useState('');
  const [xferAmt, setXferAmt] = useState(10000);
  const [msg, setMsg] = useState('');

  if (!currentUser) return null;
  const me = currentUser;

  const addrs = db.settings.adminPaymentAddresses.filter(a => a.type === method);
  const myDeposits = db.deposits.filter(d => d.userId === me.id).sort((a, b) => b.createdAt - a.createdAt);

  function submitDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (depAmt <= 0) { setMsg('Jumlah tidak valid.'); return; }
    if (!target) { setMsg('Pilih tujuan pembayaran admin.'); return; }
    update(d => {
      d.deposits.push({
        id: newId('dep'),
        userId: me.id,
        amount: depAmt,
        method,
        paymentTarget: target,
        proofNote: note,
        status: 'pending',
        createdAt: Date.now(),
      });
      return d;
    });
    setMsg('Permintaan deposit dikirim. Menunggu persetujuan admin.');
    setNote('');
  }

  function transferNow(e: React.FormEvent) {
    e.preventDefault();
    if (xferAmt <= 0) { setMsg('Jumlah tidak valid.'); return; }
    if (xferAmt > me.accountBalance) { setMsg('Account Balance tidak cukup.'); return; }
    update(d => {
      const u = d.users.find(x => x.id === me.id)!;
      u.accountBalance -= xferAmt;
      u.rentBalance += xferAmt;
      return d;
    });
    setMsg(`Berhasil transfer ${formatIDR(xferAmt)} dari Account Balance ke Saldo Sewa.`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="stamp text-rust mb-3">Saldo Sewa</div>
      <h1 className="font-display text-4xl font-bold">Kelola Saldo Sewa</h1>
      <p className="mt-2 text-ink-soft">Saldo sewa dapat digunakan untuk memasang iklan teks, iklan banner, dan membeli referral.</p>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="ticket-amber p-6">
          <div className="font-mono text-xs uppercase tracking-widest">Saldo Sewa Aktif</div>
          <div className="font-display text-5xl font-bold mt-2">{formatIDR(me.rentBalance)}</div>
        </div>
        <div className="ticket-dark p-6">
          <div className="font-mono text-xs uppercase tracking-widest text-amber-brand">Account Balance</div>
          <div className="font-display text-5xl font-bold mt-2">{formatIDR(me.accountBalance)}</div>
        </div>
      </div>

      {msg && <div className="ticket p-4 mt-6 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-forest" /><span>{msg}</span></div>}

      <div className="grid lg:grid-cols-2 gap-8 mt-6">
        <form onSubmit={transferNow} className="ticket p-6">
          <h2 className="font-display text-2xl font-bold mb-3 flex items-center gap-2"><ArrowRightLeft className="w-6 h-6" /> Transfer dari Account Balance</h2>
          <p className="text-sm text-ink-soft mb-4">Langsung terverifikasi tanpa persetujuan admin.</p>
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Jumlah (Rp)</span>
            <input type="number" min={1000} className="input-field mt-1" value={xferAmt} onChange={e => setXferAmt(parseInt(e.target.value) || 0)} />
          </label>
          <button type="submit" className="btn-primary w-full justify-center"><ArrowRightLeft className="w-4 h-4" /> Transfer Sekarang</button>
        </form>

        <form onSubmit={submitDeposit} className="ticket p-6">
          <h2 className="font-display text-2xl font-bold mb-3">Deposit Manual ke Saldo Sewa</h2>
          <p className="text-sm text-ink-soft mb-4">Tanpa minimum. Menunggu persetujuan admin setelah pembayaran.</p>
          <label className="block mb-3">
            <span className="font-mono text-xs uppercase tracking-widest">Jumlah (Rp)</span>
            <input type="number" min={1} className="input-field mt-1" value={depAmt} onChange={e => setDepAmt(parseInt(e.target.value) || 0)} />
          </label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { v: 'bank', l: 'Bank', icon: Banknote },
              { v: 'ewallet', l: 'E-Wallet', icon: Wallet },
              { v: 'crypto', l: 'Crypto', icon: Bitcoin },
            ].map(m => (
              <button type="button" key={m.v}
                onClick={() => { setMethod(m.v as any); setTarget(''); }}
                className={`p-2 border-2 border-ink text-xs font-mono uppercase tracking-widest transition-all ${method === m.v ? 'bg-ink text-paper' : 'bg-cream hover:bg-amber-brand'}`}>
                <m.icon className="w-4 h-4 mx-auto mb-1" />{m.l}
              </button>
            ))}
          </div>
          <label className="block mb-3">
            <span className="font-mono text-xs uppercase tracking-widest">Tujuan Pembayaran Admin</span>
            <select className="input-field mt-1" value={target} onChange={e => setTarget(e.target.value)} required>
              <option value="">— Pilih —</option>
              {addrs.map(a => (
                <option key={a.id} value={a.id}>{a.name} · {a.account} ({a.holder})</option>
              ))}
            </select>
          </label>
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest">Catatan / Bukti Transfer</span>
            <textarea className="input-field mt-1" rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Nomor referensi transfer..." />
          </label>
          <button type="submit" className="btn-amber w-full justify-center"><Send className="w-4 h-4" /> Kirim untuk Persetujuan</button>
        </form>
      </div>

      <h2 className="font-display text-2xl font-bold mt-10 mb-4">Riwayat Deposit</h2>
      {myDeposits.length === 0 ? (
        <div className="ticket p-6 text-center text-ink-soft">Belum ada riwayat deposit.</div>
      ) : (
        <div className="ticket overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink text-paper font-mono text-xs uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Metode</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {myDeposits.map(d => (
                <tr key={d.id} className="border-t border-ink/10">
                  <td className="px-4 py-3 font-mono text-xs">{new Date(d.createdAt).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 uppercase font-mono text-xs">{d.method}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatIDR(d.amount)}</td>
                  <td className="px-4 py-3 text-center"><span className={`stamp ${d.status === 'approved' ? 'text-forest' : d.status === 'rejected' ? 'text-berry' : 'text-amber-deep'}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
