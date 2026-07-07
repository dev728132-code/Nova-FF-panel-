import { Link } from 'react-router-dom';
import { Crosshair, Shield, Zap, Mail, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black/95 border-t border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          <div className="col-span-1 md:col-span-1">
             <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <Crosshair className="w-5 h-5 text-white" />
              </div>
              <span className="font-sans font-bold text-lg tracking-tight text-white">
                FF<span className="text-orange-500">STORE</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The ultimate destination for premium FF panels and mods. Elevate your gaming experience with our secure and reliable tools.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide text-sm uppercase">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/buy" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">Buy Panels</Link></li>
              <li><Link to="/history" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">Order History</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">Support Center</Link></li>
              <li><Link to="/profile" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">My Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide text-sm uppercase">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Refund Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide text-sm uppercase">Support</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-orange-500" /> support@ffstore.com
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Zap className="w-4 h-4 text-orange-500" /> 24/7 Fast Response
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Shield className="w-4 h-4 text-orange-500" /> Secure Payments
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} FF Store. All rights reserved. Not affiliated with any official game developers.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-gray-400 text-xs font-medium">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
