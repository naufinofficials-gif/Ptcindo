import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useStore, formatIDR } from '../lib/store';
import { LogOut, Menu, X, Ticket, Wallet } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  const { currentUser, logout } = useStore();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const publicLinks = [
    { to: '/', label: 'Beranda' },
    { to: '/ads', label: 'Lihat Iklan' },
    { to: '/register', label: 'Daftar' },
    { to: '/login', label: 'Login' },
  ];

  const memberLinks = [
    { to: '/member', label: 'Dashboard' },
    { to: '/member/ads', label: 'Lihat Iklan' },
    { to: '/member/post-ad', label: 'Pasang Iklan' },
    { to: '/member/banner', label: 'Pasang Banner' },
    { to: '/member/referrals', label: 'Referral' },
    { to: '/member/rent', label: 'Saldo Sewa' },
    { to: '/member/withdraw', label: 'Withdraw' },
    { to: '/member/profile', label: 'Profil' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/approvals', label: 'Persetujuan' },
    { to: '/admin/ads', label: 'Kelola Iklan' },
    { to: '/admin/users', label: 'Member' },
    { to: '/admin/referrals', label: 'Referral' },
    { to: '/admin/settings', label: 'Pengaturan' },
    { to: '/admin/profile', label: 'Profil' },
  ];

  const links = !currentUser
    ? publicLinks
    : currentUser.role === 'admin'
    ? adminLinks
    : memberLinks;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* Marquee */}
      <div className="bg-ink text-paper py-2 overflow-hidden border-b-2 border-ink">
        <div className="marquee-track flex whitespace-nowrap gap-12 font-mono text-xs tracking-widest uppercase">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-12">
              <span>✦ Klik iklan, dapatkan cuan</span>
              <span>✦ Withdraw cepat — Bank, E-Wallet, Crypto</span>
              <span>✦ Pasang iklan murah</span>
              <span>✦ Jaringan referral aktif</span>
              <span>✦ Transparan &amp; aman sejak 2024</span>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="border-b-2 border-ink bg-paper sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link to={currentUser ? (currentUser.role === 'admin' ? '/admin' : '/member') : '/'} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-brand border-2 border-ink flex items-center justify-center" style={{ boxShadow: '3px 3px 0 #1a1410' }}>
              <Ticket className="w-6 h-6 text-ink" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-2xl font-bold leading-none">KlikCuan</div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">Paid to Click · ID</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/' || l.to === '/member' || l.to === '/admin'}
                className={({ isActive }) =>
                  `px-3 py-2 font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-ink text-paper'
                      : 'text-ink hover:bg-amber-brand hover:text-paper'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="hidden md:flex items-center gap-2 text-sm font-mono border-2 border-ink px-3 py-1.5 bg-cream">
                  <Wallet className="w-4 h-4" />
                  <span className="font-bold">{formatIDR(currentUser.accountBalance)}</span>
                </div>
                <button
                  onClick={() => { logout(); nav('/'); }}
                  className="btn-ghost !py-1.5 !px-3 text-sm"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </>
            ) : null}
            <button className="lg:hidden btn-ghost !py-1.5 !px-2" onClick={() => setOpen(v => !v)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t-2 border-ink bg-paper">
            <div className="flex flex-col">
              {links.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-6 py-3 font-medium text-sm border-b border-ink/10 ${
                      isActive ? 'bg-ink text-paper' : 'hover:bg-cream'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t-2 border-ink bg-ink text-paper mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="font-display text-2xl font-bold">KlikCuan</div>
            <p className="text-sm text-paper/70 mt-2 leading-relaxed">
              Platform Paid-to-Click asli Indonesia. Klik iklan, hasilkan penghasilan, bayar promosi produk Anda.
            </p>
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-amber-brand">Navigasi</div>
            <ul className="mt-3 space-y-1 text-sm">
              <li><Link to="/" className="hover:text-amber-brand">Beranda</Link></li>
              <li><Link to="/ads" className="hover:text-amber-brand">Lihat Iklan</Link></li>
              <li><Link to="/register" className="hover:text-amber-brand">Daftar</Link></li>
              <li><Link to="/login" className="hover:text-amber-brand">Login</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-amber-brand">Kontak</div>
            <p className="mt-3 text-sm text-paper/70">naufinofficials@gmail.com<br/>Jl. Setiabudi Psr III Kel. Medan Selayang Kota Medan</p>
            <div className="mt-3 font-mono text-[10px] text-paper/50">© {new Date().getFullYear()} KlikCuan · Semua hak dilindungi</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
