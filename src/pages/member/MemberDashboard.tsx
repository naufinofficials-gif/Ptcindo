import { Link } from 'react-router-dom';
import { useStore, formatIDR, referralsInLast24h } from '../../lib/store';
import { Eye, Megaphone, Users, Wallet, ArrowRight, Image as ImageIcon, Banknote } from 'lucide-react';

export default function MemberDashboard() {
  const { db, currentUser } = useStore();
  if (!currentUser) return null;

  const myAds = db.textAds.filter(a => a.ownerId === currentUser.id);
  const myBanners = db.bannerAds.filter(a => a.ownerId === currentUser.id);
  const pendingWd = db.withdraws.filter(w => w.userId === currentUser.id && w.status === 'pending').length;
  const pendingDep = db.deposits.filter(d => d.userId === currentUser.id && d.status === 'pending').length;
  const refToday = referralsInLast24h(currentUser);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
        <div>
          <div className="stamp text-amber-deep mb-2">Ruang Member</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">Halo, {currentUser.fullName.split(' ')[0]}.</h1>
          <p className="mt-2 text-ink-soft">Ringkasan akun dan akses cepat ke semua fitur.</p>
        </div>
        <Link to="/member/ads" className="btn-amber"><Eye className="w-4 h-4" /> Mulai Lihat Iklan</Link>
      </div>

      {/* Balance cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="ticket-dark p-6">
          <div className="font-mono text-xs uppercase tracking-widest text-amber-brand">Account Balance</div>
          <div className="font-display text-4xl font-bold mt-2">{formatIDR(currentUser.accountBalance)}</div>
          <div className="mt-4 flex gap-2">
            <Link to="/member/withdraw" className="text-sm underline text-paper/80 hover:text-amber-brand">Withdraw</Link>
            <span className="text-paper/40">·</span>
            <Link to="/member/rent" className="text-sm underline text-paper/80 hover:text-amber-brand">Transfer ke Saldo Sewa</Link>
          </div>
        </div>
        <div className="ticket-amber p-6">
          <div className="font-mono text-xs uppercase tracking-widest">Saldo Sewa</div>
          <div className="font-display text-4xl font-bold mt-2">{formatIDR(currentUser.rentBalance)}</div>
          <div className="mt-4 flex gap-2 text-sm">
            <Link to="/member/rent" className="underline hover:text-amber-deep">Deposit</Link>
            <span>·</span>
            <Link to="/member/referrals" className="underline hover:text-amber-deep">Beli Referral</Link>
          </div>
        </div>
        <div className="ticket p-6">
          <div className="font-mono text-xs uppercase tracking-widest text-ink-soft">Referral Saya</div>
          <div className="font-display text-4xl font-bold mt-2">{currentUser.referrals.length}</div>
          <div className="mt-4 text-sm text-ink-soft">Pembelian 24 jam: <span className="font-bold text-ink">{refToday}/5</span></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Iklan Saya', v: myAds.length, icon: Megaphone },
          { label: 'Banner Saya', v: myBanners.length, icon: ImageIcon },
          { label: 'WD Pending', v: pendingWd, icon: Wallet },
          { label: 'Deposit Pending', v: pendingDep, icon: Banknote },
        ].map((s, i) => (
          <div key={i} className="ticket p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-ink text-paper flex items-center justify-center"><s.icon className="w-5 h-5" /></div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">{s.label}</div>
              <div className="font-display text-2xl font-bold">{s.v}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="font-display text-2xl font-bold mb-4">Aksi Cepat</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: '/member/ads', t: 'Lihat Iklan', d: 'Klik iklan dan dapatkan reward', icon: Eye },
          { to: '/member/post-ad', t: 'Pasang Iklan Teks', d: 'Promosikan produk Anda', icon: Megaphone },
          { to: '/member/banner', t: 'Pasang Banner', d: 'Iklan bergambar lebih menarik', icon: ImageIcon },
          { to: '/member/referrals', t: 'Kelola Referral', d: 'Beli atau hapus referral', icon: Users },
          { to: '/member/rent', t: 'Saldo Sewa', d: 'Deposit & transfer', icon: Banknote },
          { to: '/member/withdraw', t: 'Withdraw', d: 'Tarik ke Bank/E-Wallet/Crypto', icon: Wallet },
        ].map((a, i) => (
          <Link key={i} to={a.to} className="ticket p-5 flex items-start gap-4 hover:bg-cream transition-colors">
            <div className="w-10 h-10 bg-amber-brand text-ink flex items-center justify-center flex-shrink-0" style={{ boxShadow: '3px 3px 0 #1a1410' }}>
              <a.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-display text-lg font-bold">{a.t}</div>
              <div className="text-sm text-ink-soft">{a.d}</div>
            </div>
            <ArrowRight className="w-5 h-5 flex-shrink-0 mt-2" />
          </Link>
        ))}
      </div>
    </div>
  );
}
