import { useState } from 'react';
import { useStore, formatIDR } from '../../lib/store';
import { Check, X, Megaphone, Image as ImageIcon, Wallet, Banknote } from 'lucide-react';

type Tab = 'text' | 'banner' | 'withdraw' | 'deposit';

export default function Approvals() {
  const { db, update } = useStore();
  const [tab, setTab] = useState<Tab>('text');

  const pendText = db.textAds.filter(a => a.status === 'pending');
  const pendBan = db.bannerAds.filter(a => a.status === 'pending');
  const pendWd = db.withdraws.filter(w => w.status === 'pending');
  const pendDep = db.deposits.filter(d => d.status === 'pending');

  function decide(kind: Tab, id: string, approve: boolean) {
    update(d => {
      if (kind === 'text') {
        const a = d.textAds.find(x => x.id === id);
        if (a) {
          a.status = approve ? 'approved' : 'rejected';
          if (!approve) {
            const owner = d.users.find(u => u.id === a.ownerId);
            if (owner) owner.accountBalance += a.pricePaid; // refund
          }
        }
      } else if (kind === 'banner') {
        const a = d.bannerAds.find(x => x.id === id);
        if (a) {
          a.status = approve ? 'approved' : 'rejected';
          if (!approve) {
            const owner = d.users.find(u => u.id === a.ownerId);
            if (owner) owner.accountBalance += a.pricePaid;
          }
        }
      } else if (kind === 'withdraw') {
        const w = d.withdraws.find(x => x.id === id);
        if (w) {
          w.status = approve ? 'approved' : 'rejected';
          if (!approve) {
            const user = d.users.find(u => u.id === w.userId);
            if (user) user.accountBalance += w.amount; // refund
          }
        }
      } else if (kind === 'deposit') {
        const dep = d.deposits.find(x => x.id === id);
        if (dep) {
          dep.status = approve ? 'approved' : 'rejected';
          if (approve) {
            const user = d.users.find(u => u.id === dep.userId);
            if (user) user.rentBalance += dep.amount;
          }
        }
      }
      return d;
    });
  }

  const tabs: { k: Tab; l: string; n: number; icon: any }[] = [
    { k: 'text', l: 'Iklan Teks', n: pendText.length, icon: Megaphone },
    { k: 'banner', l: 'Iklan Banner', n: pendBan.length, icon: ImageIcon },
    { k: 'withdraw', l: 'Withdraw', n: pendWd.length, icon: Wallet },
    { k: 'deposit', l: 'Deposit', n: pendDep.length, icon: Banknote },
  ];

  function userOf(id: string) { return db.users.find(u => u.id === id); }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="stamp text-rust mb-3">Persetujuan</div>
      <h1 className="font-display text-4xl font-bold">Antrian Persetujuan</h1>

      <div className="flex flex-wrap gap-2 mt-6 border-b-2 border-ink pb-1">
        {tabs.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-4 py-2 font-semibold text-sm flex items-center gap-2 border-2 border-ink border-b-0 ${tab === t.k ? 'bg-ink text-paper' : 'bg-cream hover:bg-amber-brand hover:text-paper'}`}>
            <t.icon className="w-4 h-4" /> {t.l}
            {t.n > 0 && <span className="bg-amber-brand text-ink px-1.5 py-0.5 text-xs font-mono">{t.n}</span>}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'text' && (
          <ListWrap empty={pendText.length === 0}>
            {pendText.map(a => (
              <div key={a.id} className="ticket p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold">{a.title}</h3>
                    <p className="text-sm text-ink-soft mt-1">{a.description}</p>
                    <a href={a.url} target="_blank" rel="noreferrer" className="text-xs font-mono underline break-all">{a.url}</a>
                    <div className="mt-3 font-mono text-xs flex gap-4 flex-wrap">
                      <span>By: <strong>{userOf(a.ownerId)?.username}</strong></span>
                      <span>Klik: <strong>{a.clicksBought}</strong></span>
                      <span>Reward: <strong>{formatIDR(a.reward)}</strong></span>
                      <span>Harga: <strong>{formatIDR(a.pricePaid)}</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => decide('text', a.id, true)} className="btn-amber !py-2 !px-3"><Check className="w-4 h-4" /></button>
                    <button onClick={() => decide('text', a.id, false)} className="btn-ghost !py-2 !px-3 !text-berry !border-berry"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </ListWrap>
        )}

        {tab === 'banner' && (
          <ListWrap empty={pendBan.length === 0}>
            {pendBan.map(a => (
              <div key={a.id} className="ticket p-5">
                <div className="flex items-start gap-4">
                  <img src={a.imageUrl} className="w-32 h-20 object-cover border-2 border-ink" />
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold">{a.title}</h3>
                    <a href={a.url} target="_blank" rel="noreferrer" className="text-xs font-mono underline break-all">{a.url}</a>
                    <div className="mt-2 font-mono text-xs flex gap-4 flex-wrap">
                      <span>By: <strong>{userOf(a.ownerId)?.username}</strong></span>
                      <span>Klik: <strong>{a.clicksBought}</strong></span>
                      <span>Reward: <strong>{formatIDR(a.reward)}</strong></span>
                      <span>Harga: <strong>{formatIDR(a.pricePaid)}</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => decide('banner', a.id, true)} className="btn-amber !py-2 !px-3"><Check className="w-4 h-4" /></button>
                    <button onClick={() => decide('banner', a.id, false)} className="btn-ghost !py-2 !px-3 !text-berry !border-berry"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </ListWrap>
        )}

        {tab === 'withdraw' && (
          <ListWrap empty={pendWd.length === 0}>
            {pendWd.map(w => (
              <div key={w.id} className="ticket p-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-display text-xl font-bold">{formatIDR(w.amount)}</div>
                  <div className="font-mono text-sm mt-1">{userOf(w.userId)?.username} · {w.method.toUpperCase()}</div>
                  <div className="font-mono text-xs text-ink-soft mt-1">{w.destination}</div>
                  <div className="font-mono text-xs text-ink-soft">{new Date(w.createdAt).toLocaleString('id-ID')}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => decide('withdraw', w.id, true)} className="btn-amber !py-2 !px-3"><Check className="w-4 h-4" /></button>
                  <button onClick={() => decide('withdraw', w.id, false)} className="btn-ghost !py-2 !px-3 !text-berry !border-berry"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </ListWrap>
        )}

        {tab === 'deposit' && (
          <ListWrap empty={pendDep.length === 0}>
            {pendDep.map(dep => {
              const addr = db.settings.adminPaymentAddresses.find(a => a.id === dep.paymentTarget);
              return (
                <div key={dep.id} className="ticket p-5 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-display text-xl font-bold">{formatIDR(dep.amount)}</div>
                    <div className="font-mono text-sm mt-1">{userOf(dep.userId)?.username} · {dep.method.toUpperCase()}</div>
                    <div className="font-mono text-xs text-ink-soft mt-1">Ke: {addr ? `${addr.name} · ${addr.account}` : '-'}</div>
                    {dep.proofNote && <div className="font-mono text-xs mt-1">“{dep.proofNote}”</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => decide('deposit', dep.id, true)} className="btn-amber !py-2 !px-3"><Check className="w-4 h-4" /></button>
                    <button onClick={() => decide('deposit', dep.id, false)} className="btn-ghost !py-2 !px-3 !text-berry !border-berry"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </ListWrap>
        )}
      </div>
    </div>
  );
}

function ListWrap({ children, empty }: { children: React.ReactNode; empty: boolean }) {
  if (empty) return <div className="ticket p-8 text-center text-ink-soft">Tidak ada antrian.</div>;
  return <div className="space-y-3">{children}</div>;
}
