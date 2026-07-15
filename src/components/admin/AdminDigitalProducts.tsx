import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DigitalProduct } from '../../types';
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload, File, Image as ImageIcon, CheckCircle, Package, X, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';
import * as tus from 'tus-js-client';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../../lib/supabase';

export function AdminDigitalProducts() {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<DigitalProduct>>({
    name: '',
    short_description: '',
    full_description: '',
    price: 0,
    category: '',
    status: 'active',
    badges: [],
    is_pinned: false,
    offer_enabled: false,
    discount_type: 'percentage',
    discount_value: 0
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('digital_products')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    setLoading(false);
  };

  const getLogoUrl = async (path: string | undefined) => {
    if (!path) return null;
    const { data } = await supabase.storage.from('product-logos').createSignedUrl(path, 3600);
    return data?.signedUrl || null;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDigitalFile(e.target.files[0]);
    }
  };

  
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.short_description || formData.price === undefined) {
      toast.error("Please fill required fields.");
      return;
    }

    try {
      let logo_path = formData.logo_path;
      if (logoFile) {
        setUploadingLogo(true);
        const ext = logoFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('product-logos')
          .upload(fileName, logoFile);
        
        if (uploadError) throw uploadError;
        logo_path = fileName;
        setUploadingLogo(false);
      }

      let file_path = formData.file_path;
      let file_name = formData.file_name;
      let file_size = formData.file_size;
      let file_type = formData.file_type;

      if (digitalFile) {
        setUploadingFile(true);
        const ext = digitalFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        
        await new Promise((resolve, reject) => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            const token = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
            
            const upload = new tus.Upload(digitalFile, {
              endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
              retryDelays: [0, 3000, 5000, 10000, 20000],
              headers: {
                authorization: `Bearer ${token}`,
                'x-upsert': 'true',
              },
              uploadDataDuringCreation: true,
              removeFingerprintOnSuccess: true,
              metadata: {
                bucketName: 'digital-products',
                objectName: fileName,
                contentType: digitalFile.type || 'application/octet-stream',
              },
              chunkSize: 6 * 1024 * 1024, // 6MB chunks
              onError: function (error) {
                console.error("Upload failed:", error);
                reject(error);
              },
              onProgress: function (bytesUploaded, bytesTotal) {
                const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
                setUploadProgress(percentage);
              },
              onSuccess: function () {
                console.log("Upload %s from %s", (upload.file as any).name, upload.url);
                resolve(true);
              },
            });

            upload.findPreviousUploads().then((previousUploads) => {
              if (previousUploads.length) {
                upload.resumeFromPreviousUpload(previousUploads[0]);
              } else {
                upload.start();
              }
            });
          });
        });
        
        file_path = fileName;
        file_name = digitalFile.name;
        file_size = digitalFile.size;
        file_type = digitalFile.type || ext || 'application/octet-stream';
        setUploadingFile(false);
      }

      // If pinning this product, unpin others
      if (formData.is_pinned) {
        await supabase.from('digital_products').update({ is_pinned: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      }

      const productData = {
        ...formData,
        logo_path,
        file_path,
        file_name,
        file_size,
        file_type,
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
        const { error } = await supabase.from('digital_products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('digital_products').insert([productData]);
        if (error) throw error;
      }

            closeModal();
      fetchProducts();
      toast.success(editingProduct ? 'Product updated successfully.' : 'Product uploaded successfully.');
    } catch (err: any) {
      toast.error("Error saving product: " + (err.message || 'Unknown error'));
      setUploadingLogo(false);
      setUploadingFile(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    toast.promise(
      (async () => {
        const { error } = await supabase.from('digital_products').delete().eq('id', id);
        if (error) throw error;
        await fetchProducts();
      })(),
      {
        loading: 'Deleting...',
        success: 'Product deleted',
        error: 'Failed to delete'
      }
    );
  };

  const toggleStatus = async (product: DigitalProduct) => {
    const newStatus = product.status === 'active' ? 'hidden' : 'active';
    await supabase.from('digital_products').update({ status: newStatus }).eq('id', product.id);
    fetchProducts();
  };

  const togglePin = async (product: DigitalProduct) => {
    const newPin = !product.is_pinned;
    if (newPin) {
      await supabase.from('digital_products').update({ is_pinned: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    }
    await supabase.from('digital_products').update({ is_pinned: newPin }).eq('id', product.id);
    fetchProducts();
  };

  const openModal = (product?: DigitalProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
      setLogoPreview(null); // Load async if needed
      if (product.logo_path) {
        getLogoUrl(product.logo_path).then(url => setLogoPreview(url));
      }
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        short_description: '',
        full_description: `✔ 99% Headshot
✔ 100% Safe
✔ Instant Access
✔ Lifetime Updates
✔ Do Not Use Main ID
✔ Premium Digital Product`,
        price: 0,
        category: '',
        status: 'active',
        badges: [],
        is_pinned: false,
        offer_enabled: false,
        discount_type: 'percentage',
        discount_value: 0
      });
      setLogoPreview(null);
    }
    setLogoFile(null);
    setDigitalFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const toggleBadge = (badge: string) => {
    const badges = formData.badges || [];
    if (badges.includes(badge)) {
      setFormData({ ...formData, badges: badges.filter(b => b !== badge) });
    } else {
      setFormData({ ...formData, badges: [...badges, badge] });
    }
  };

  const badgeOptions = ['Featured', 'Recommended', 'Best Seller', 'Trending', 'New Arrival'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-orange-500" /> Digital Products
        </h2>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <span className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin inline-block"></span>
        </div>
      ) : products.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 relative overflow-hidden group">
              {product.is_pinned && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                  PINNED
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                   {product.logo_path ? (
                     <LogoImage path={product.logo_path} />
                   ) : (
                     <PlaceholderThumbnail name={product.name} size="sm" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white truncate">{product.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{product.category || 'No Category'}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-bold text-white text-lg">₹{product.offer_enabled && product.discount_type === 'percentage' ? (product.price - (product.price * (product.discount_value || 0) / 100)).toFixed(2) : product.offer_enabled && product.discount_type === 'flat' ? (product.price - (product.discount_value || 0)).toFixed(2) : product.price}</span>
                    {product.offer_enabled && (
                      <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {product.status === 'active' ? (
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-xs font-semibold">Active</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700 rounded text-xs font-semibold">Hidden</span>
                )}
                {product.file_path && (
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded text-xs font-semibold flex items-center gap-1">
                    <HardDrive className="w-3 h-3" /> {(product.file_size || 0) > 1024 * 1024 ? `${((product.file_size || 0) / (1024 * 1024)).toFixed(2)} MB` : `${((product.file_size || 0) / 1024).toFixed(2)} KB`}
                  </span>
                )}
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2">
                <button
                  onClick={() => openModal(product)}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center justify-center"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleStatus(product)}
                  className={`p-2 rounded-lg transition-colors flex items-center justify-center ${product.status === 'active' ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
                  title={product.status === 'active' ? 'Hide' : 'Show'}
                >
                  {product.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => togglePin(product)}
                  className={`p-2 rounded-lg transition-colors flex items-center justify-center ${product.is_pinned ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
                  title="Pin"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors flex items-center justify-center"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-xl">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Digital Products</h3>
          <p className="text-gray-500 mb-6">Add your first digital product to start selling.</p>
          <button
            onClick={() => openModal()}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Product
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-fade-in">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900/95 backdrop-blur z-10 rounded-t-2xl">
              <h3 className="font-bold text-xl text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form id="productForm" onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                
                {/* Logo Upload Section */}
                <div className="bg-black/30 p-5 rounded-xl border border-gray-800">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-orange-500"/> Product Logo</h4>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gray-800 border-2 border-dashed border-gray-700 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {logoPreview ? (
                        <>
                          <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-xs font-bold text-white">Change</span>
                          </div>
                        </>
                      ) : (
                        <PlaceholderThumbnail name={formData.name || 'Digital Product'} size="sm" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-2">Upload a professional logo for this product. Replaces standard banner.</p>
                      {logoFile && <p className="text-sm font-semibold text-orange-500">Selected: {logoFile.name}</p>}
                    </div>
                  </div>
                </div>

                {/* Digital File Upload Section */}
                <div className="bg-black/30 p-5 rounded-xl border border-gray-800">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2"><HardDrive className="w-5 h-5 text-orange-500"/> Digital File</h4>
                  <div className="border-2 border-dashed border-gray-700 hover:border-orange-500/50 transition-colors rounded-xl p-6 relative flex flex-col items-center justify-center text-center group cursor-pointer bg-gray-900/50">
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Upload className="w-10 h-10 text-gray-500 mb-3 group-hover:text-orange-500 transition-colors" />
                    <h5 className="font-bold text-white mb-1">Upload Product File</h5>
                    <p className="text-xs text-gray-500">Supports ZIP, APK, PDF, MP4, EXE etc. (Max 5GB)</p>
                    
                    {digitalFile && (
                      <div className="mt-4 w-full bg-gray-800 rounded-lg p-3 flex items-center justify-between border border-gray-700">
                        <div className="flex items-center gap-3 truncate pr-4">
                          <File className="w-5 h-5 text-orange-500 shrink-0" />
                          <div className="text-left truncate">
                            <p className="text-sm font-semibold text-white truncate">{digitalFile.name}</p>
                            <p className="text-xs text-gray-400">{(digitalFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {uploadingFile && (
                      <div className="mt-4 w-full">
                        <div className="flex justify-between text-xs font-semibold text-orange-500 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      </div>
                    )}

                    {!digitalFile && formData.file_name && (
                      <div className="mt-4 w-full bg-gray-800 rounded-lg p-3 flex items-center justify-between border border-gray-700">
                        <div className="flex items-center gap-3 truncate pr-4">
                          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                          <div className="text-left truncate">
                            <p className="text-sm font-semibold text-white truncate">Current: {formData.file_name}</p>
                            <p className="text-xs text-gray-400">Upload new to replace</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Product Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="e.g. Premium App Template"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="e.g. Software, Templates"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Short Description <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.short_description}
                      onChange={e => setFormData({...formData, short_description: e.target.value})}
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="A quick summary of the product"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Full Description</label>
                    <textarea
                      rows={5}
                      value={formData.full_description || ''}
                      onChange={e => setFormData({...formData, full_description: e.target.value})}
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                      placeholder="Detailed features and information..."
                    />
                  </div>
                </div>

                {/* Pricing & Offers */}
                <div className="bg-black/30 p-5 rounded-xl border border-gray-800 space-y-6">
                  <h4 className="font-bold text-white flex items-center gap-2">Pricing & Offer</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Base Price (₹) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 rounded-xl border border-gray-800 w-full hover:border-orange-500/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.offer_enabled}
                          onChange={e => setFormData({...formData, offer_enabled: e.target.checked})}
                          className="w-5 h-5 rounded border-gray-700 text-orange-500 focus:ring-orange-500/20 bg-black"
                        />
                        <span className="font-semibold text-white">Enable Discount Offer</span>
                      </label>
                    </div>
                  </div>

                  {formData.offer_enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Discount Type</label>
                        <select
                          value={formData.discount_type}
                          onChange={e => setFormData({...formData, discount_type: e.target.value as 'percentage' | 'flat'})}
                          className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Discount Value</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.discount_value || ''}
                          onChange={e => setFormData({...formData, discount_value: parseFloat(e.target.value) || 0})}
                          className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
                        <span className="text-green-500 font-semibold text-sm">Final Selling Price:</span>
                        <span className="text-green-500 font-bold text-xl">
                          ₹{formData.discount_type === 'percentage' 
                            ? (formData.price! - (formData.price! * (formData.discount_value || 0) / 100)).toFixed(2)
                            : (formData.price! - (formData.discount_value || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status & Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Product Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'hidden'})}
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Pin to Top</label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-900 rounded-xl border border-gray-800 hover:border-orange-500/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.is_pinned}
                        onChange={e => setFormData({...formData, is_pinned: e.target.checked})}
                        className="w-5 h-5 rounded border-gray-700 text-orange-500 focus:ring-orange-500/20 bg-black"
                      />
                      <span className="font-semibold text-white">Pin Product</span>
                      <span className="text-xs text-gray-500 ml-auto">(Only 1 allowed)</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-300 mb-3">Product Badges</label>
                    <div className="flex flex-wrap gap-3">
                      {badgeOptions.map(badge => {
                        const isSelected = (formData.badges || []).includes(badge);
                        return (
                          <button
                            key={badge}
                            type="button"
                            onClick={() => toggleBadge(badge)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                              isSelected 
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white'
                            }`}
                          >
                            {badge}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            
            <div className="p-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur rounded-b-2xl flex gap-3 sticky bottom-0 mt-auto">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                form="productForm"
                type="submit"
                disabled={uploadingLogo || uploadingFile}
                className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {(uploadingLogo || uploadingFile) ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component to load logo async
function LogoImage({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.storage.from('product-logos').createSignedUrl(path, 3600).then(({ data }) => {
      if (data) setUrl(data.signedUrl);
    });
  }, [path]);

  if (!url) return <div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />;
  return <img src={url} alt="Logo" className="w-full h-full object-cover" />;
}


function PlaceholderThumbnail({ name, size = 'sm' }: { name: string, size?: 'sm' | 'lg' }) {
  const words = name.split(' ');
  const initials = words.slice(0, 2).map(w => w[0]).join('').toUpperCase().substring(0, 2);
  
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-950 flex flex-col items-center justify-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent opacity-40"></div>
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:4px_4px]"></div>

      {size === 'sm' ? (
        <span className="font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-100 to-gray-500 z-10 drop-shadow-lg">{initials}</span>
      ) : (
        <>
          <span className="font-black text-3xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-100 to-gray-500 z-10 drop-shadow-lg mb-1">{initials}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest z-10 px-2 text-center truncate w-full">{name}</span>
        </>
      )}
    </div>
  );
}
