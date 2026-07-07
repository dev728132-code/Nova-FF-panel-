import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, Shield, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Only check if user is logged in
    if (!user) return;
    
    let mounted = true;
    const fetchPending = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'Pending');
      
      if (mounted && count !== null) {
        setPendingCount(count);
      }
    };
    
    fetchPending();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPending, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Buy Panels', path: '/buy' },
    { name: 'Order History', path: '/history' },
    { name: 'Support', path: '/support' },
    { name: 'Admin', path: '/admin', badge: pendingCount > 0 ? pendingCount : null },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-orange-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
              <Crosshair className="w-6 h-6 text-white" />
              <div className="absolute inset-0 bg-white/20 blur-md rounded-lg -z-10"></div>
            </div>
            <span className="font-sans font-bold text-xl tracking-tight text-white hidden sm:block">
              FF<span className="text-orange-500">STORE</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-8">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-orange-400 bg-orange-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                  {link.badge && (
                    <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link
              to={user ? "/profile" : "/auth"}
              className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
                user 
                  ? 'bg-orange-500/20 border-orange-500 text-orange-500' 
                  : 'bg-gray-800 border-gray-700 hover:border-orange-500 text-gray-300'
              }`}
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
              >
                {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-b border-orange-500/20 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center justify-between ${
                    isActive(link.path)
                      ? 'text-orange-400 bg-orange-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {link.name}
                  {link.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
