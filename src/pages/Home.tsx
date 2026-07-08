import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Users, Star, MessageSquare } from 'lucide-react';
import { useScrollTop } from '../hooks';

export function Home() {
  useScrollTop();

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 lg:pt-48 lg:pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-6"
            >
              <Zap className="w-4 h-4" /> V2.0 Update Now Available
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8"
            >
              DOMINATE THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">BATTLEFIELD</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Premium FF panels and modifications. 100% undetected, secure, and constantly updated for the best gaming experience.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link
                to="/buy"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-[0_0_30px_rgba(249,115,22,0.3)]"
              >
                Feature Panel <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/support"
                className="px-8 py-4 bg-gray-900 border border-gray-700 hover:border-gray-600 hover:bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center transition-colors"
              >
                Join Community
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Why Choose <span className="text-orange-500">Us?</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              We believe we should use good things. We provide the highest quality and most secure mods in the market, ensuring that everyone should be safe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8 text-orange-500" />,
                title: '100% Undetected & Safe',
                desc: 'Everyone should be safe. Our advanced bypass systems ensure your gaming account remains completely protected from restrictions under our good policies.'
              },
              {
                icon: <Zap className="w-8 h-8 text-orange-500" />,
                title: 'Good Policies & Systems',
                desc: 'We should use good policies. We implement rigorous automated checks and customer-first safety protocols for instant verification.'
              },
              {
                icon: <Users className="w-8 h-8 text-orange-500" />,
                title: 'Premium Quality Mods',
                desc: 'We should use good things. Every single panel is carefully crafted, refined, and regularly updated with top-tier premium features.'
              },
              {
                icon: <Star className="w-8 h-8 text-orange-500" />,
                title: 'Elite Growth',
                desc: 'All secret YouTube growth tricks, premium resources, exclusive strategies, updated guides, and digital products to help creators grow their channels faster.'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-black border border-gray-800 p-8 rounded-2xl hover:border-orange-500/30 transition-colors"
              >
                <div className="w-16 h-16 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Customer <span className="text-orange-500">Reviews</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Alex M.', role: 'Pro Player', text: 'Best panel I have used. Completely safe and the features work exactly as described.' },
              { name: 'Sarah J.', role: 'Content Creator', text: 'Support is amazing. Helped me set it up within 5 minutes. Highly recommended!' },
              { name: 'David K.', role: 'Competitive', text: 'Been using for 3 months now. Zero bans. The aim assist is incredibly smooth.' }
            ].map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-black/50 backdrop-blur-sm border border-gray-800 p-8 rounded-2xl"
              >
                <div className="flex text-orange-500 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-gray-300 italic mb-6">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{review.name}</h4>
                    <span className="text-orange-500 text-xs font-medium">{review.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MessageSquare className="w-12 h-12 text-orange-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-6">Have Questions?</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Check out our support page for detailed guides, FAQs, and contact information.
          </p>
          <Link
            to="/support"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-700 hover:border-orange-500 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all"
          >
            Visit Support Center
          </Link>
        </div>
      </section>
    </div>
  );
}
