export type Role = 'member' | 'admin';

export interface PaymentAddress {
  id: string;
  type: 'bank' | 'ewallet' | 'crypto';
  name: string; // Bank name / E-wallet provider / Crypto network
  account: string; // account number / address
  holder: string; // account holder
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  fullName: string;
  accountBalance: number;
  rentBalance: number;
  referrals: string[]; // user ids of referrals owned
  referralPurchasesLast24h: { at: number; count: number }[];
  adClicksLog: Record<string, number>; // adId -> timestamp ms
  banned: boolean;
  createdAt: number;
  paymentAddresses: PaymentAddress[];
}

export interface TextAd {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  url: string;
  pricePaid: number;
  clicksBought: number;
  clicksRemaining: number;
  reward: number; // reward per click for viewer
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: number;
}

export interface BannerAd {
  id: string;
  ownerId: string;
  title: string;
  imageUrl: string;
  url: string;
  pricePaid: number;
  clicksBought: number;
  clicksRemaining: number;
  reward: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: number;
}

export interface DepositRequest {
  id: string;
  userId: string;
  amount: number;
  method: 'bank' | 'ewallet' | 'crypto';
  paymentTarget: string; // which admin address
  proofNote: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  amount: number;
  method: 'bank' | 'ewallet' | 'crypto';
  destination: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface ReferralPurchase {
  id: string;
  buyerId: string;
  count: number;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface Settings {
  minWithdraw: number;
  referralPrice: number;
  adsPerViewSession: number;
  defaultRewardPerClick: number;
  adminPaymentAddresses: PaymentAddress[];
}

export interface Database {
  users: User[];
  textAds: TextAd[];
  bannerAds: BannerAd[];
  deposits: DepositRequest[];
  withdraws: WithdrawRequest[];
  referralPurchases: ReferralPurchase[];
  settings: Settings;
  currentUserId: string | null;
}
