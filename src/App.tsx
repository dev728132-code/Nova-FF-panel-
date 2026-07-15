/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { BuyPanels } from './pages/BuyPanels';
import { DigitalStore } from './pages/DigitalStore';
import { DigitalCheckout } from './pages/DigitalCheckout';
import { EliteGrowth } from './pages/EliteGrowth';
import { EliteGrowthCheckout } from './pages/EliteGrowthCheckout';
import { Checkout } from './pages/Checkout';
import { OrderHistory } from './pages/OrderHistory';
import { Profile } from './pages/Profile';
import { Support } from './pages/Support';
import { Auth } from './pages/Auth';
import { Admin } from './pages/Admin';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
        <main className="pb-20 md:pb-0">
          <Routes>
            <Route path="*" element={<Auth />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30 font-sans">
      <Navbar />
      <main className="pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/buy" element={<BuyPanels />} />
          <Route path="/digital-store" element={<DigitalStore />} />
          <Route path="/digital-store/checkout" element={<DigitalCheckout />} />
          <Route path="/elite-growth" element={<EliteGrowth />} />
          <Route path="/elite-growth/checkout" element={<EliteGrowthCheckout />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/support" element={<Support />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" toastOptions={{ style: { background: '#111827', color: '#fff', border: '1px solid #1f2937' } }} />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
