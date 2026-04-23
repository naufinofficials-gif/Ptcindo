import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Megaphone, Users, Wallet, Shield, Zap, Star } from 'lucide-react';
import { useStore, formatIDR } from '../lib/store';

export default function Home() {
  const { db } = useStore();
  const liveAds = db.textAds.filter(a => a.status === 'approved' && a.clicksRemaining > 0).length;
  const liveBanners = db.bannerAds.filter(a => a.status === 'approved' && a.clicksRemaining > 0).length;
  const totalMembers = db.users.filter(u => u.role === 'member').length;

  return (
    <div>
      {/* HERO */}
      <section className="hero-pattern border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid md:grid-cols-5 gap-10 items-center">
          <div className="md:col-span-3">
            <div className="stamp text-rust mb-6">Edisi · {new Date().getFullYear()}</div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] tracking-tight">
              Klik Iklan.<br/>
              <span className="italic text-amber-deep">Panen</span> Cuan.<br/>
              Tiap Hari.
            </h1>
            <p className="mt-6 text-lg text-ink-soft max-w-xl leading-relaxed">
              KlikCuan adalah jaringan <strong>Paid-to-Click</strong> milik anak negeri. Lihat iklan 30 detik, kumpulkan saldo, tarik ke bank, e-wallet, atau kripto.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-amber">
                Mulai Hasilkan Cuan <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/ads" className="btn-primary">
                <Eye className="w-5 h-5" /> Lihat Iklan Sekarang
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 items-center font-mono text-xs uppercase tracking-widest text-ink-soft">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-brand fill-amber-brand" /> 4.9/5 rating</div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-forest" /> Terverifikasi</div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-rust" /> Withdraw cepat</div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="ticket-amber p-6 relative">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-mono text-[10px] tracking-widest uppercase">Tiket Pendapatan</div>
                  <div className="font-display text-3xl font-bold mt-1">No. 08812</div>
                </div>
                <div className="stamp text-forest">Aktif</div>
              </div>
              <div className="divider-dashed my-5"></div>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between"><span>Iklan aktif</span><span className="font-bold">{liveAds}</span></div>
                <div className="flex justify-between"><span>Banner aktif</span><span className="font-bold">{liveBanners}</span></div>
                <div className="flex justify-between"><span>Total member</span><span className="font-bold">{totalMembers.toLocaleString('id-ID')}+</span></div>
                <div className="flex justify-between"><span>Reward/klik</span><span className="font-bold">{formatIDR(db.settings.defaultRewardPerClick)}</span></div>
                <div className="flex justify-between"><span>Min. withdraw</span><span className="font-bold">{formatIDR(db.settings.minWithdraw)}</span></div>
              </div>
              <div className="divider-dashed my-5"></div>
              <div className="text-center font-display italic text-ink-soft">“Cuan itu bukan mimpi, cukup 3 klik sehari.”</div>
              <div className="absolute -left-3 top-1/2 w-6 h-6 bg-paper rounded-full border-2 border-ink"></div>
              <div className="absolute -right-3 top-1/2 w-6 h-6 bg-paper rounded-full border-2 border-ink"></div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b-2 border-ink bg-cream">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="flex items-baseline justify-between mb-10 flex-wrap gap-2">
            <h2 className="font-display text-4xl md:text-5xl font-bold">Tiga langkah, selesai.</h2>
            <span className="font-mono text-xs uppercase tracking-widest text-ink-soft">— panduan singkat</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', t: 'Daftar gratis', d: 'Bikin akun dalam hitungan detik. Verifikasi email langsung aktif.' },
              { n: '02', t: 'Lihat iklan', d: 'Tonton iklan 30 detik. Dapatkan reward langsung ke Account Balance.' },
              { n: '03', t: 'Withdraw', d: 'Tarik saldo ke Bank, E-Wallet (DANA/OVO/GoPay) atau USDT crypto.' },
            ].map(s => (
              <div key={s.n} className="ticket p-6">
                <div className="font-mono text-5xl font-bold text-amber-brand">{s.n}</div>
                <h3 className="font-display text-2xl font-bold mt-3">{s.t}</h3>
                <p className="mt-2 text-ink-soft leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-10">Semua yang Anda butuhkan.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Eye, t: 'Iklan Berkualitas', d: 'Iklan diverifikasi admin sebelum tayang.' },
              { icon: Megaphone, t: 'Pasang Iklan', d: 'Iklan teks & banner dengan harga fleksibel.' },
              { icon: Users, t: 'Sistem Referral', d: 'Beli atau rekrut referral untuk pendapatan pasif.' },
              { icon: Wallet, t: 'Multi Channel', d: 'Bank, E-Wallet, dan Cryptocurrency.' },
            ].map((f, i) => (
              <div key={i} className="ticket p-6">
                <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-bold">{f.t}</h3>
                <p className="mt-1 text-sm text-ink-soft">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-paper">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Siap dapat cuan pertama?</h2>
            <p className="mt-3 text-paper/70 text-lg">Daftar gratis, tanpa biaya tersembunyi. Upgrade kapan saja.</p>
          </div>
          <div className="flex flex-wrap gap-4 md:justify-end">
            <Link to="/register" className="btn-amber">Daftar Sekarang</Link>
            <Link to="/login" className="btn-ghost !text-paper !border-paper hover:!bg-paper hover:!text-ink">Login</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
