import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Download, Package, Clock, HardDrive, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function ProfileDownloads() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPurchases();
    }
  }, [user]);

  const fetchPurchases = async () => {
    setLoading(true);
    // Fetch digital purchases joined with digital products
    // Note: PostgREST doesn't support joins natively without a foreign key. We created a foreign key in migration.
    // So we can do: select('*, digital_products(*)')
    const { data, error } = await supabase
      .from('digital_purchases')
      .select(`
        id, purchased_at, amount,
        product:product_id (*)
      `)
      .eq('user_id', user!.id)
      .order('purchased_at', { ascending: false });

    if (data) {
      setPurchases(data);
    }
    setLoading(false);
  };

  const handleDownload = async (purchase: any) => {
    if (downloadingId) return;
    setDownloadingId(purchase.id);
    try {
      const filePath = purchase.product.file_path;
      if (!filePath) throw new Error("No file path found.");

      const { data, error } = await supabase.storage
        .from('digital-products')
        .createSignedUrl(filePath, 60 * 60); // 1 hour

      if (error) throw error;
      
      if (data?.signedUrl) {
        // Trigger download programmatically
        const a = document.createElement('a');
        a.href = data.signedUrl;
        a.download = purchase.product.file_name || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: any) {
      alert("Failed to download: " + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 text-center"
      >
        <span className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin inline-block"></span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6"
    >
      <h2 className="text-2xl font-bold text-white mb-6">My Downloads</h2>

      {purchases.length === 0 ? (
        <div className="text-center py-10 bg-black/30 rounded-2xl border border-gray-800">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Downloads Available</h3>
          <p className="text-gray-500 text-sm">Products you purchase will appear here for download.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map(purchase => (
            <div key={purchase.id} className="bg-black border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{purchase.product?.name || 'Unknown Product'}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(purchase.purchased_at).toLocaleDateString()}
                    </span>
                    {purchase.product?.file_size && (
                      <span className="flex items-center gap-1 text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                        <HardDrive className="w-3 h-3" /> {(purchase.product.file_size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDownload(purchase)}
                disabled={downloadingId === purchase.id || !purchase.product?.file_path}
                className="w-full md:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {downloadingId === purchase.id ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" /> Download
                  </>
                )}
              </button>
            </div>
          ))}
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-black/50 p-4 rounded-xl">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <p>Downloads are securely generated with signed URLs that expire after 1 hour.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
