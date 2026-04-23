import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './lib/store';
import { Layout } from './components/Layout';
import type { ReactNode } from 'react';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicAds from './pages/PublicAds';

import MemberDashboard from './pages/member/MemberDashboard';
import MemberAds from './pages/member/MemberAds';
import PostTextAd from './pages/member/PostTextAd';
import PostBannerAd from './pages/member/PostBannerAd';
import Referrals from './pages/member/Referrals';
import RentBalance from './pages/member/RentBalance';
import Withdraw from './pages/member/Withdraw';
import Profile from './pages/member/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import Approvals from './pages/admin/Approvals';
import AdminAds from './pages/admin/AdminAds';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReferrals from './pages/admin/AdminReferrals';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';

function Protected({ children, role }: { children: ReactNode; role: 'member' | 'admin' }) {
  const { currentUser } = useStore();
  const loc = useLocation();
  if (!currentUser) return <Navigate to={`/login`} state={{ from: loc.pathname }} replace />;
  if (role === 'admin' && currentUser.role !== 'admin') return <Navigate to="/member" replace />;
  if (role === 'member' && currentUser.role !== 'member') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function AppInner() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ads" element={<PublicAds />} />

        <Route path="/member" element={<Protected role="member"><MemberDashboard /></Protected>} />
        <Route path="/member/ads" element={<Protected role="member"><MemberAds /></Protected>} />
        <Route path="/member/post-ad" element={<Protected role="member"><PostTextAd /></Protected>} />
        <Route path="/member/banner" element={<Protected role="member"><PostBannerAd /></Protected>} />
        <Route path="/member/referrals" element={<Protected role="member"><Referrals /></Protected>} />
        <Route path="/member/rent" element={<Protected role="member"><RentBalance /></Protected>} />
        <Route path="/member/withdraw" element={<Protected role="member"><Withdraw /></Protected>} />
        <Route path="/member/profile" element={<Protected role="member"><Profile /></Protected>} />

        <Route path="/admin" element={<Protected role="admin"><AdminDashboard /></Protected>} />
        <Route path="/admin/approvals" element={<Protected role="admin"><Approvals /></Protected>} />
        <Route path="/admin/ads" element={<Protected role="admin"><AdminAds /></Protected>} />
        <Route path="/admin/users" element={<Protected role="admin"><AdminUsers /></Protected>} />
        <Route path="/admin/referrals" element={<Protected role="admin"><AdminReferrals /></Protected>} />
        <Route path="/admin/settings" element={<Protected role="admin"><AdminSettings /></Protected>} />
        <Route path="/admin/profile" element={<Protected role="admin"><AdminProfile /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
