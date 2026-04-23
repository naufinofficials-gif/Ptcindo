import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Database, User, PaymentAddress, TextAd, BannerAd } from './types';

const STORAGE_KEY = 'klikcuan_db_v1';

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function seed(): Database {
  const adminId = 'admin-' + uid();
  const userId = 'user-' + uid();
  return {
    users: [
      {
        id: adminId,
        username: 'admin',
        email: 'admin@klikcuan.id',
        password: 'admin123',
        role: 'admin',
        fullName: 'Administrator',
        accountBalance: 0,
        rentBalance: 0,
        referrals: [],
        referralPurchasesLast24h: [],
        adClicksLog: {},
        banned: false,
        createdAt: Date.now(),
        paymentAddresses: [],
      },
      {
        id: userId,
        username: 'demo',
        email: 'demo@klikcuan.id',
        password: 'demo123',
        role: 'member',
        fullName: 'Demo Member',
        accountBalance: 25000,
        rentBalance: 10000,
        referrals: [],
        referralPurchasesLast24h: [],
        adClicksLog: {},
        banned: false,
        createdAt: Date.now(),
        paymentAddresses: [],
      },
    ],
    textAds: [
      {
          id: 'ad-' + uid(),
          ownerId: adminId,
          title: 'Toko Kopi Nusantara',
          description: 'Kopi arabika premium, pengiriman seluruh Indonesia. Diskon 20% hari ini.',
          url: 'https://example.com/kopi',
          pricePaid: 50000,
          clicksBought: 100,
          clicksRemaining: 92,
          reward: 150,
          status: 'approved',
          createdAt: Date.now() - 86400000,
      },
      {
          id: 'ad-' + uid(),
          ownerId: adminId,
          title: 'Kursus Online Digital Marketing',
          description: 'Pelajari SEO, ads, dan social media dari praktisi. Sertifikat resmi.',
          url: 'https://example.com/kursus',
          pricePaid: 30000,
          clicksBought: 60,
          clicksRemaining: 55,
          reward: 120,
          status: 'approved',
          createdAt: Date.now() - 43200000,
      },
      {
          id: 'ad-' + uid(),
          ownerId: adminId,
          title: 'Dompet Digital KiloPay',
          description: 'Top-up, transfer, dan bayar tagihan dengan bonus cashback.',
          url: 'https://example.com/kilopay',
          pricePaid: 40000,
          clicksBought: 80,
          clicksRemaining: 78,
          reward: 130,
          status: 'approved',
          createdAt: Date.now() - 7200000,
      },
    ],
    bannerAds: [
      {
          id: 'ban-' + uid(),
          ownerId: adminId,
          title: 'Promo Liburan Bali',
          imageUrl: 'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1200',
          url: 'https://example.com/bali',
          pricePaid: 120000,
          clicksBought: 200,
          clicksRemaining: 180,
          reward: 200,
          status: 'approved',
          createdAt: Date.now() - 21600000,
      },
    ],
    deposits: [],
    withdraws: [],
    referralPurchases: [],
    settings: {
      minWithdraw: 50000,
      referralPrice: 2500,
      adsPerViewSession: 10,
      defaultRewardPerClick: 100,
      adminPaymentAddresses: [
        { id: 'pay-1', type: 'bank', name: 'BCA', account: '1234567890', holder: 'PT KlikCuan Digital' },
        { id: 'pay-2', type: 'ewallet', name: 'DANA', account: '081234567890', holder: 'KlikCuan Admin' },
        { id: 'pay-3', type: 'crypto', name: 'USDT (TRC20)', account: 'TXYZ...abc123', holder: 'KlikCuan Treasury' },
      ],
    },
    currentUserId: null,
  };
}

function load(): Database {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
  } catch {
    const s = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    return s;
  }
}

function save(db: Database) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

interface Ctx {
  db: Database;
  currentUser: User | null;
  update: (fn: (db: Database) => Database) => void;
  login: (username: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  register: (data: { username: string; email: string; password: string; fullName: string }) => { ok: boolean; error?: string };
  resetAll: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(() => load());

  useEffect(() => { save(db); }, [db]);

  const currentUser = db.currentUserId ? db.users.find(u => u.id === db.currentUserId) ?? null : null;

  function update(fn: (db: Database) => Database) {
    setDb(prev => fn(structuredClone(prev)));
  }

  function login(username: string, password: string) {
    const u = db.users.find(x => (x.username === username || x.email === username) && x.password === password);
    if (!u) return { ok: false, error: 'Username atau kata sandi salah.' };
    if (u.banned) return { ok: false, error: 'Akun Anda diblokir oleh administrator.' };
    update(d => { d.currentUserId = u.id; return d; });
    return { ok: true };
  }

  function logout() {
    update(d => { d.currentUserId = null; return d; });
  }

  function register(data: { username: string; email: string; password: string; fullName: string }) {
    if (db.users.some(u => u.username === data.username)) return { ok: false, error: 'Username sudah digunakan.' };
    if (db.users.some(u => u.email === data.email)) return { ok: false, error: 'Email sudah terdaftar.' };
    const id = 'user-' + uid();
    update(d => {
      d.users.push({
        id,
        username: data.username,
        email: data.email,
        password: data.password,
        role: 'member',
        fullName: data.fullName,
        accountBalance: 0,
        rentBalance: 0,
        referrals: [],
        referralPurchasesLast24h: [],
        adClicksLog: {},
        banned: false,
        createdAt: Date.now(),
        paymentAddresses: [],
      });
      d.currentUserId = id;
      return d;
    });
    return { ok: true };
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    setDb(load());
  }

  return (
    <StoreCtx.Provider value={{ db, currentUser, update, login, logout, register, resetAll }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}

export function newId(prefix = 'id') {
  return prefix + '-' + uid();
}

export function formatIDR(n: number) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return s + ' dtk lalu';
  if (s < 3600) return Math.floor(s / 60) + ' mnt lalu';
  if (s < 86400) return Math.floor(s / 3600) + ' jam lalu';
  return Math.floor(s / 86400) + ' hari lalu';
}

export function canClickAd(user: User, adId: string): { can: boolean; waitMs: number } {
  const last = user.adClicksLog[adId];
  if (!last) return { can: true, waitMs: 0 };
  const elapsed = Date.now() - last;
  const twentyFourH = 24 * 3600 * 1000;
  if (elapsed >= twentyFourH) return { can: true, waitMs: 0 };
  return { can: false, waitMs: twentyFourH - elapsed };
}

export function referralsInLast24h(user: User): number {
  const cutoff = Date.now() - 24 * 3600 * 1000;
  return user.referralPurchasesLast24h.filter(r => r.at >= cutoff).reduce((s, r) => s + r.count, 0);
}

export function msToHMS(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}j ${m}m ${sec}d`;
}

export type { PaymentAddress, TextAd, BannerAd, User };
