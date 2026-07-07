/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { BuyPanels } from './pages/BuyPanels';
import { Checkout } from './pages/Checkout';
import { OrderHistory } from './pages/OrderHistory';
import { Profile } from './pages/Profile';
import { Support } from './pages/Support';
import { Auth } from './pages/Auth';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/buy" element={<BuyPanels />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/history" element={<OrderHistory />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/support" element={<Support />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
