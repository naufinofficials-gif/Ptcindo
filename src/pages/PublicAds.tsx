import { Link } from 'react-router-dom';
import { useStore, formatIDR } from '../lib/store';
import { Lock, Eye } from 'lucide-react';

export default function PublicAds() {
  const { db } = useStore();
  const ads = db.textAds.filter(a => a.status === 'approved' && a.clicksRemaining > 0);
  const banners = db.bannerAds.filter(a => a.status === 'approved' && a.clicksRemaining > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
        <div>
          <div className="stamp text-amber-deep mb-3">Katalog Iklan</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">Iklan yang Sedang Tayang</h1>
          <p className="mt-2 text-ink-soft max-w-2xl">Login untuk melihat iklan selama 30 detik dan mendapatkan reward langsung ke akun Anda.</p>
        </div>
        <Link to="/login" className="btn-amber"><Lock className="w-4 h-4" /> Login untuk Klaim</Link>
      </div>

      {banners.length > 0 && (
        <>
          <h2 className="font-display text-2xl font-bold mt-8 mb-4">Banner Unggulan</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {banners.map(b => (
              <div key={b.id} className="ticket overflow-hidden">
                <img src={b.imageUrl} alt={b.title} className="w-full h-48 object-cover border-b-2 border-ink" />
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display text-xl font-bold">{b.title}</h3>
                    <span className="stamp text-forest">{formatIDR(b.reward)}</span>
                  </div>
                  <div className="mt-2 font-mono text-xs text-ink-soft">{b.clicksRemaining} slot tersisa</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="font-display text-2xl font-bold mb-4">Iklan Teks</h2>
      {ads.length === 0 ? (
        <div className="ticket p-8 text-center text-ink-soft">Belum ada iklan aktif saat ini.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map(a => (
            <div key={a.id} className="ticket p-5">
              <div className="flex justify-between items-start">
                <h3 className="font-display text-xl font-bold leading-tight">{a.title}</h3>
                <span className="stamp text-forest whitespace-nowrap">{formatIDR(a.reward)}</span>
              </div>
              <p className="mt-2 text-sm text-ink-soft line-clamp-2">{a.description}</p>
              <div className="divider-dashed my-4"></div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink-soft">{a.clicksRemaining} slot</span>
                <Link to="/login" className="inline-flex items-center gap-1 text-amber-deep hover:underline font-bold">
                  <Eye className="w-3.5 h-3.5" /> Klik disini
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
