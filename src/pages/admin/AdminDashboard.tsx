import { Link } from 'react-router-dom';
import { useStore, formatIDR } from '../../lib/store';
import { CheckSquare, Users, Megaphone, Settings, DollarSign, ArrowRight, Image as ImageIcon, Wallet } from 'lucide-react';

export default function AdminDashboard() {
  const { db, currentUser } = useStore();
  if (!currentUser) return null;

  const pendTextAds = db.textAds.filter(a => a.status === 'pending').length;
  const pendBanners = db.bannerAds.filter(a => a.status === 'pending').length;
  const pendWd = db.withdraws.filter(w => w.status === 'pending').length;
  const pendDep = db.deposits.filter(d => d.status === 'pending').length;
  const pendRef = db.referralPurchases.filter(r => r.status === 'pending').length;
  const totalMembers = db.users.filter(u => u.role === 'member').length;
  const bannedMembers = db.users.filter(u => u.banned).length;
  const totalBalance = db.users.filter(u => u.role === 'member').reduce((s, u) => s + u.accountBalance + u.rentBalance, 0);

  const stats = [
    { label: 'Iklan teks pending', v: pendTextAds, icon: Megaphone, to: '/admin/approvals' },
    { label: 'Banner pending', v: pendBanners, icon: ImageIcon, to: '/admin/approvals' },
    { label: 'Withdraw pending', v: pendWd, icon: Wallet, to: '/admin/approvals' },
    { label: 'Deposit pending', v: pendDep, icon: DollarSign, to: '/admin/approvals' },
    { label: 'Pembelian referral', v: pendRef, icon: Users, to: '/admin/referrals' },
    { label: 'Total member', v: totalMembers, icon: Users, to: '/admin/users' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="stamp text-rust mb-3">Ruang Admin</div>
      <h1 className="font-display text-4xl md:text-5xl font-bold">Panel Administrator</h1>
      <p className="mt-2 text-ink-soft">Selamat datang, {currentUser.fullName}.</p>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="ticket-dark p-6">
          <div className="font-mono text-xs uppercase tracking-widest text-amber-brand">Total Dana Member</div>
          <div className="font-display text-4xl font-bold mt-2">{formatIDR(totalBalance)}</div>
          <div className="mt-2 text-sm text-paper/70">Account + Saldo Sewa</div>
        </div>
        <div className="ticket-amber p-6">
          <div className="font-mono text-xs uppercase tracking-widest">Status Platform</div>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <div>Member aktif: <span className="font-bold">{totalMembers - bannedMembers}</span></div>
            <div>Diblokir: <span className="font-bold">{bannedMembers}</span></div>
            <div>Total pending: <span className="font-bold">{pendTextAds + pendBanners + pendWd + pendDep + pendRef}</span></div>
            <div>Referral/member: <span className="font-bold">{formatIDR(db.settings.referralPrice)}</span></div>
          </div>
        </div>
      </div>

      <h2 className="font-display text-2xl font-bold mt-10 mb-4">Butuh Perhatian</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <Link key={i} to={s.to} className="ticket p-5 flex items-center gap-4 hover:bg-cream">
            <div className="w-12 h-12 bg-amber-brand text-ink flex items-center justify-center" style={{ boxShadow: '3px 3px 0 #1a1410' }}>
              <s.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">{s.label}</div>
              <div className="font-display text-3xl font-bold">{s.v}</div>
            </div>
            <ArrowRight className="w-5 h-5" />
          </Link>
        ))}
      </div>

      <h2 className="font-display text-2xl font-bold mt-10 mb-4">Menu Admin</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: '/admin/approvals', t: 'Persetujuan', d: 'Iklan, withdraw, deposit', icon: CheckSquare },
          { to: '/admin/ads', t: 'Kelola Iklan', d: 'Edit, tambah & hapus iklan', icon: Megaphone },
          { to: '/admin/users', t: 'Kelola Member', d: 'Ban, hapus, atur akun', icon: Users },
          { to: '/admin/referrals', t: 'Jual Referral', d: 'Harga & persetujuan', icon: Users },
          { to: '/admin/settings', t: 'Pengaturan', d: 'Min. WD, reward, pembayaran', icon: Settings },
          { to: '/admin/profile', t: 'Profil Admin', d: 'Profil & kata sandi', icon: Users },
        ].map((a, i) => (
          <Link key={i} to={a.to} className="ticket p-5 hover:bg-cream">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-ink text-paper flex items-center justify-center"><a.icon className="w-5 h-5" /></div>
              <div className="flex-1">
                <div className="font-display text-lg font-bold">{a.t}</div>
                <div className="text-sm text-ink-soft">{a.d}</div>
              </div>
              <ArrowRight className="w-4 h-4 mt-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
