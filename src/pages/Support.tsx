import { motion } from 'motion/react';
import { MessageSquare, Mail, HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';
import { useScrollTop } from '../hooks';
import { useState } from 'react';

export function Support() {
  useScrollTop();
  const whatsappNumber = "9470851455";
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How long does it take to activate my panel?",
      a: "After you upload the payment screenshot, our team manually verifies the transaction. This process usually takes between 15 to 30 minutes. You will see the status update in your Order History."
    },
    {
      q: "Are these panels safe from bans?",
      a: "We use advanced bypass techniques to ensure maximum security. However, no external modification is 100% safe. We recommend playing smart and not using blatant features in high-tier ranked matches."
    },
    {
      q: "Do I need a rooted device?",
      a: "It depends on the panel you purchase. We offer solutions for both Rooted and Non-Rooted Android devices, as well as iOS devices. Please read the product description carefully before buying."
    },
    {
      q: "How do I update the panel?",
      a: "Most of our premium panels come with an auto-update feature. For others, we provide the updated APK links in our Telegram channel or you can download them directly from your active purchases."
    },
    {
      q: "Can I get a refund?",
      a: "Since these are digital goods, we generally do not offer refunds once the key is activated. If the key is not working due to a technical error on our side, please contact support for a replacement."
    }
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4"
          >
            Support <span className="text-orange-500">Center</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Need help? Our support team is available 24/7. Choose your preferred method of contact below.
          </motion.p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <motion.a
            href={`https://wa.me/91${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 border border-green-500/30 hover:border-green-500/60 rounded-3xl p-8 flex flex-col items-center text-center group transition-colors"
          >
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">WhatsApp Support</h3>
            <p className="text-gray-400 mb-6">Fastest response. Chat directly with our support team.</p>
            <span className="text-green-500 font-bold">+91 {whatsappNumber}</span>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
            <p className="text-gray-400 mb-6">For business inquiries and detailed technical support.</p>
            <span className="text-orange-500 font-bold">support@ffstore.com</span>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div>
          <div className="flex items-center gap-3 mb-8 justify-center">
            <HelpCircle className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition-colors hover:border-gray-700"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === idx ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-400 leading-relaxed border-t border-gray-800 pt-4">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/91${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-110 transition-transform z-50"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </a>
    </div>
  );
}
