import { useState } from 'react';
import { useStore, formatIDR, canClickAd, msToHMS } from '../../lib/store';
import AdViewer from '../../components/AdViewer';
import { Eye, Clock, Check } from 'lucide-react';

type ActiveAd = { id: string; title: string; description?: string; imageUrl?: string; url: string; reward: number; kind: 'text' | 'banner' };

export default function MemberAds() {
  const { db, currentUser, update } = useStore();
  const [active, setActive] = useState<ActiveAd | null>(null);
  const [message, setMessage] = useState('');

  if (!currentUser) return null;
  const me = currentUser;

  const limit = db.settings.adsPerViewSession;
  const approvedText = db.textAds.filter(a => a.status === 'approved' && a.clicksRemaining > 0).slice(0, limit);
  const approvedBanner = db.bannerAds.filter(a => a.status === 'approved' && a.clicksRemaining > 0).slice(0, limit);

  function claim(a: ActiveAd) {
    update(d => {
      const u = d.users.find(x => x.id === me.id)!;
      u.accountBalance += a.reward;
      u.adClicksLog[a.id] = Date.now();
      if (a.kind === 'text') {
        const ad = d.textAds.find(x => x.id === a.id);
        if (ad) {
          ad.clicksRemaining = Math.max(0, ad.clicksRemaining - 1);
          if (ad.clicksRemaining === 0) ad.status = 'completed';
        }
      } else {
        const ad = d.bannerAds.find(x => x.id === a.id);
        if (ad) {
          ad.clicksRemaining = Math.max(0, ad.clicksRemaining - 1);
          if (ad.clicksRemaining === 0) ad.status = 'completed';
        }
      }
      return d;
    });
    setActive(null);
    setMessage(`+ ${formatIDR(a.reward)} masuk ke Account Balance Anda!`);
    setTimeout(() => setMessage(''), 4000);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="mb-6">
        <div className="stamp text-amber-deep mb-2">Lihat Iklan</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold">Daftar Iklan Hari Ini</h1>
        <p className="mt-2 text-ink-soft">Iklan ditampilkan 30 detik. Anda dapat mengklik kembali iklan yang sama setelah 24 jam.</p>
      </div>

      {message && (
        <div className="ticket-amber p-4 mb-6 flex items-center gap-3">
          <Check className="w-5 h-5 text-forest" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {approvedBanner.length > 0 && (
        <>
          <h2 className="font-display text-2xl font-bold mt-4 mb-4">Banner</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {approvedBanner.map(b => {
              const { can, waitMs } = canClickAd(currentUser, b.id);
              return (
                <div key={b.id} className="ticket overflow-hidden flex flex-col">
                  <img src={b.imageUrl} alt={b.title} className="w-full h-44 object-cover border-b-2 border-ink" />
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <h3 className="font-display text-xl font-bold">{b.title}</h3>
                      <span className="stamp text-forest">{formatIDR(b.reward)}</span>
                    </div>
                    <div className="mt-2 font-mono text-xs text-ink-soft">{b.clicksRemaining} slot</div>
                    <div className="mt-auto pt-4">
                      {can ? (
                        <button onClick={() => setActive({ id: b.id, title: b.title, imageUrl: b.imageUrl, url: b.url, reward: b.reward, kind: 'banner' })} className="btn-amber w-full justify-center">
                          <Eye className="w-4 h-4" /> Klik &amp; Tonton 30 dtk
                        </button>
                      ) : (
                        <div className="btn-primary w-full justify-center !bg-ink-soft" style={{ cursor: 'not-allowed' }}>
                          <Clock className="w-4 h-4" /> Tunggu {msToHMS(waitMs)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <h2 className="font-display text-2xl font-bold mb-4">Iklan Teks</h2>
      {approvedText.length === 0 ? (
        <div className="ticket p-8 text-center text-ink-soft">Belum ada iklan aktif.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedText.map(a => {
            const { can, waitMs } = canClickAd(currentUser, a.id);
            return (
              <div key={a.id} className="ticket p-5 flex flex-col">
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-xl font-bold leading-tight">{a.title}</h3>
                  <span className="stamp text-forest whitespace-nowrap">{formatIDR(a.reward)}</span>
                </div>
                <p className="mt-2 text-sm text-ink-soft line-clamp-3 flex-1">{a.description}</p>
                <div className="divider-dashed my-3"></div>
                <div className="mt-auto">
                  {can ? (
                    <button onClick={() => setActive({ id: a.id, title: a.title, description: a.description, url: a.url, reward: a.reward, kind: 'text' })} className="btn-primary w-full justify-center">
                      <Eye className="w-4 h-4" /> Klik &amp; Tonton
                    </button>
                  ) : (
                    <div className="btn-ghost w-full justify-center opacity-60" style={{ cursor: 'not-allowed' }}>
                      <Clock className="w-4 h-4" /> {msToHMS(waitMs)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {active && (
        <AdViewer
          title={active.title}
          description={active.description}
          imageUrl={active.imageUrl}
          url={active.url}
          reward={active.reward}
          onComplete={() => claim(active)}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
