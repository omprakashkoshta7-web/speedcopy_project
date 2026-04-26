import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MarqueeBanner from '../components/MarqueeBanner';
import Footer from '../components/Footer';
import GetQuoteModal from '../components/GetQuoteModal';
import productService from '../services/product.service';

const GiftingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeOccasion, setActiveOccasion] = useState('');
  const [timer, setTimer] = useState({ h: 4, m: 32, s: 18 });
  const [referCode] = useState('SPEED-GIFT-2024');
  const [copied, setCopied] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductGrid, setShowProductGrid] = useState(false);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      // Simple countdown timer
      setTimer(t => {
        if (t.s > 0) return { ...t, s: t.s - 1 };
        if (t.m > 0) return { ...t, m: t.m - 1, s: 59 };
        if (t.h > 0) return { h: t.h - 1, m: 59, s: 59 };
        return t;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching gifting data...');
      
      const productsRes = await productService.getGiftingProducts({ limit: 12 });
      console.log('Gifting products response:', productsRes);
      
      const catsRes = await productService.getCategories('gifting');
      console.log('Categories response:', catsRes);
      
      const prods = productsRes?.data?.products || productsRes?.products || [];
      console.log('Extracted products:', prods);
      setProducts(prods);
      
      const cats = catsRes?.data || catsRes || [];
      console.log('Extracted categories:', cats);
      setCategories(cats);
      // Don't auto-select first category - show all by default
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  // Filter products by active category
  const filteredProducts = activeOccasion
    ? products.filter((p: any) => {
        const catName = p.category?.name || p.categoryName || '';
        const catId = p.category?._id || p.category?.id || p.category || '';
        const matchingCat = categories.find((c: any) => c.name === activeOccasion);
        return catName === activeOccasion || (matchingCat && (catId === matchingCat._id || catId === matchingCat.id));
      })
    : products;

  const topCategories = categories.slice(0, 6);
  const favoriteProducts = filteredProducts.slice(0, 4);

  return (
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <Navbar />
      <MarqueeBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: '380px' }}>
          <img src="https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1200&q=80" alt="Gifts" decoding="async" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.05) 100%)' }} />
          <div className="relative z-10 p-8 md:p-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span className="text-white text-xs font-bold tracking-widest uppercase">Rated #1 in Custom Gifts</span>
            </div>
            <h1 className="font-bold text-white leading-tight mb-2" style={{ fontSize: '32px' }}>Personalized Gifts for<br /><span style={{ color: '#f472b6' }}>Every Occasion</span></h1>
            <p className="text-white/80 text-sm mb-6 leading-relaxed">Create memories that last forever with our high-quality custom prints. From mugs to canvas, we make it special.</p>
            <button onClick={() => { setShowProductGrid(true); setActiveOccasion(''); }} className="flex items-center gap-2 px-6 py-3 bg-white font-bold rounded-full text-sm hover:bg-gray-100 transition" style={{ color: '#111' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Shop Gifts with Razorpay
            </button>
          </div>
        </div>

        {/* Product Grid View */}
        {showProductGrid && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  {activeOccasion ? `${activeOccasion} Gifts` : 'All Gifts'}
                </h2>
                <p className="text-xs" style={{ color: '#9ca3af' }}>
                  {filteredProducts.length} products available
                </p>
              </div>
              <button
                onClick={() => setShowProductGrid(false)}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Back to Home
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ border: '1px solid #f3f4f6' }}>
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product: any) => {
                  const handleAddToCart = async (e: React.MouseEvent) => {
                    e.stopPropagation();
                    try {
                      const orderService = (await import('../services/order.service')).default;
                      await orderService.addToCart({
                        productId: product._id || product.id,
                        productName: product.name,
                        quantity: 1,
                        unitPrice: product.sale_price || product.basePrice || product.mrp || product.price,
                        flowType: 'gifting'
                      });
                      alert('Added to cart successfully!');
                    } catch (error) {
                      console.error('Failed to add to cart:', error);
                      alert('Failed to add to cart. Please try again.');
                    }
                  };

                  const handleBuyNow = async (e: React.MouseEvent) => {
                    e.stopPropagation();
                    try {
                      const orderService = (await import('../services/order.service')).default;
                      await orderService.addToCart({
                        productId: product._id || product.id,
                        productName: product.name,
                        quantity: 1,
                        unitPrice: product.sale_price || product.basePrice || product.mrp || product.price,
                        flowType: 'gifting'
                      });
                      navigate('/checkout', { state: { flow: 'gifting' } });
                    } catch (error) {
                      console.error('Failed to add to cart:', error);
                      alert('Failed to add to cart. Please try again.');
                    }
                  };

                  return (
                    <div
                      key={product._id || product.id}
                      className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition group"
                      style={{ border: '1px solid #f3f4f6' }}
                    >
                      <div 
                        style={{ height: '220px', backgroundColor: '#f0f0f0' }}
                        onClick={() => navigate(`/gifting-product/${product._id || product.id}`)}
                      >
                        <img
                          src={product.images?.[0] || product.thumbnail || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80'}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Hover overlay with action buttons */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                          <button
                            onClick={handleAddToCart}
                            className="px-3 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-gray-100 transition flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                            </svg>
                            Add to Cart
                          </button>
                          <button
                            onClick={handleBuyNow}
                            className="px-3 py-2 bg-pink-600 text-white rounded-full text-xs font-bold hover:bg-pink-700 transition flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Gift Now
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="font-bold text-gray-900 text-sm mt-1.5 mb-1">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">₹{product.sale_price || product.basePrice || product.mrp || product.price}</span>
                          {product.mrp && product.mrp > (product.sale_price || product.basePrice) && (
                            <span className="text-xs line-through text-gray-400">₹{product.mrp}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-4 text-center py-12 text-gray-400 text-sm">No products available in this category.</div>
              )}
            </div>
          </div>
        )}

        {!showProductGrid && (
          <>
        {/* Shop by Occasion */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-lg">Shop by Category</h2>
            <button className="text-sm font-semibold hover:opacity-70" style={{ color: '#374151' }} onClick={() => navigate('/products?flow=gifting')}>View All</button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="h-9 w-24 rounded-full bg-gray-200 animate-pulse" />)
            ) : categories.length > 0 ? (
              <>
                <button
                  onClick={() => {
                    setActiveOccasion('');
                    navigate('/products?flow=gifting');
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition"
                  style={{ backgroundColor: activeOccasion === '' ? '#111' : '#fff', color: activeOccasion === '' ? '#fff' : '#374151', border: activeOccasion === '' ? 'none' : '1px solid #e5e7eb' }}>
                  All
                </button>
                {categories.map((cat: any) => (
                  <button
                    key={cat._id || cat.id}
                    onClick={() => {
                      setActiveOccasion(cat.name);
                      setShowProductGrid(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition"
                    style={{ backgroundColor: activeOccasion === cat.name ? '#111' : '#fff', color: activeOccasion === cat.name ? '#fff' : '#374151', border: activeOccasion === cat.name ? 'none' : '1px solid #e5e7eb' }}>
                    {cat.image && <img src={cat.image} alt={cat.name} className="w-4 h-4 rounded-full object-cover" />}
                    {cat.name}
                  </button>
                ))}
              </>
            ) : null}
          </div>
        </div>

        {/* Top Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Top Categories</h2>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Find the perfect custom gift for your loved ones.</p>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition" style={{ backgroundColor: '#f3f4f6' }}>
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition" style={{ backgroundColor: '#111' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ border: '1px solid #f3f4f6' }}>
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : topCategories.length > 0 ? (
              topCategories.map((category: any) => (
                <div
                  key={category._id || category.id}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition"
                  style={{ border: '1px solid #f3f4f6' }}
                  onClick={() => navigate(`/products?flow=gifting&category=${encodeURIComponent(category.name)}`)}
                >
                  <div className="relative" style={{ height: '220px', backgroundColor: '#f0f0f0' }}>
                    <img
                      src={category.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80'}
                      alt={category.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900 text-sm mb-1">{category.name}</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
                      {category.description || 'Explore personalized gifts in this category.'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-gray-400 text-sm">No categories available yet.</div>
            )}
          </div>
        </div>

        {/* Flash Sale Banner */}
        <div className="rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ backgroundColor: '#111111' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f59e0b' }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Flash Sale is Live</p>
              <p className="text-white/60 text-xs">Limited time offers on selected items</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {[['HRS', timer.h], ['MIN', timer.m], ['SEC', timer.s]].map(([l, v]) => (
              <div key={l as string} className="text-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-lg" style={{ backgroundColor: '#1f2937' }}>{pad(v as number)}</div>
                <p className="text-white/50 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white/60 text-xs">Save up to</p>
              <p className="text-white font-bold text-xl">30% OFF</p>
            </div>
            <button onClick={() => navigate('/products?flow=gifting')} className="px-5 py-2.5 bg-white font-bold rounded-full text-sm hover:bg-gray-100 transition flex items-center gap-2" style={{ color: '#111' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Shop Deals
            </button>
          </div>
        </div>

        {/* Trending Product */}
        <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start gap-8" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" style={{ color: '#f59e0b' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#9ca3af' }}>Trending Now</span>
            </div>
            <h2 className="font-bold text-gray-900 mb-3" style={{ fontSize: '24px' }}>Personalized Water Bottles</h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#6b7280' }}>Stay hydrated in style. Our eco-friendly stainless steel bottles are the hottest gift this season. Customize with names, logos, or patterns.</p>
            <div className="space-y-2 mb-6">
              {['Keeps drinks cold for 24 hours', 'High-quality laser engraving', 'Available in 12 matte colors'].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/products?flow=gifting')} className="px-6 py-3 text-white font-bold rounded-full hover:bg-gray-700 transition text-sm flex items-center gap-2" style={{ backgroundColor: '#111111' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Customize & Pay with Razorpay - ₹29.99
            </button>
          </div>
          <div className="flex-shrink-0 w-full md:w-64">
            <div className="rounded-2xl overflow-hidden" style={{ height: '240px' }}>
              <img src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80" alt="Water Bottle" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Corporate Gifting Banner */}
        <div className="relative rounded-3xl overflow-hidden text-center py-16 px-8" style={{ backgroundColor: '#111111', minHeight: '200px' }}>
          <img src="https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1200&q=70" alt="Corporate" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="text-white/70 text-xs font-bold tracking-widest uppercase">For Business</span>
            </div>
            <h2 className="font-bold text-white mb-3" style={{ fontSize: '28px' }}>Premium Corporate Gifting</h2>
            <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">Impress your clients and employees with high-end, custom-branded merchandise. Bulk pricing available.</p>
            <div className="flex items-center justify-center">
              <button onClick={() => setShowQuote(true)} className="px-6 py-3 bg-white font-bold rounded-full text-sm hover:bg-gray-100 transition" style={{ color: '#111' }}>Get a Quote</button>
            </div>
          </div>
        </div>

        {/* Customer Favorites */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">Customer Favorites</h2>
            <div className="flex gap-2">
              <button className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition" style={{ backgroundColor: '#f3f4f6' }}>
                <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#111' }}>
                <span className="text-xs font-bold">1</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ border: '1px solid #f3f4f6' }}>
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : favoriteProducts.length > 0 ? (
              favoriteProducts.map((product: any) => {
                const handleAddToCart = async (e: React.MouseEvent) => {
                  e.stopPropagation();
                  try {
                    const orderService = (await import('../services/order.service')).default;
                    await orderService.addToCart({
                      productId: product._id || product.id,
                      productName: product.name,
                      quantity: 1,
                      unitPrice: product.basePrice || product.mrp || product.price,
                      flowType: 'gifting'
                    });
                    alert('Added to cart successfully!');
                  } catch (error) {
                    console.error('Failed to add to cart:', error);
                    alert('Failed to add to cart. Please try again.');
                  }
                };

                const handleBuyNow = async (e: React.MouseEvent) => {
                  e.stopPropagation();
                  try {
                    const orderService = (await import('../services/order.service')).default;
                    await orderService.addToCart({
                      productId: product._id || product.id,
                      productName: product.name,
                      quantity: 1,
                      unitPrice: product.basePrice || product.mrp || product.price,
                      flowType: 'gifting'
                    });
                    navigate('/checkout', { state: { flow: 'gifting' } });
                  } catch (error) {
                    console.error('Failed to add to cart:', error);
                    alert('Failed to add to cart. Please try again.');
                  }
                };

                return (
                  <div key={product._id || product.id} className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition group" style={{ border: '1px solid #f3f4f6' }}>
                    <div 
                      style={{ height: '220px', backgroundColor: '#f0f0f0' }}
                      onClick={() => navigate(`/gifting-product/${product._id || product.id}`)}
                    >
                      <img src={product.images?.[0] || product.thumbnail || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80'} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      
                      {/* Hover overlay with action buttons */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                        <button
                          onClick={handleAddToCart}
                          className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-gray-100 transition flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                          </svg>
                          Add to Cart
                        </button>
                        <button
                          onClick={handleBuyNow}
                          className="px-4 py-2 bg-pink-600 text-white rounded-full text-xs font-bold hover:bg-pink-700 transition flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Gift Now
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-gray-900 text-sm mt-1.5 mb-1">{product.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-sm">₹{product.basePrice || product.mrp || product.price}</span>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                          </svg>
                          <span className="text-xs text-gray-400">Perfect Gift</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-4 text-center py-12 text-gray-400 text-sm">No products available yet.</div>
            )}
          </div>
        </div>

        {/* Razorpay Gifting Payment Security Section */}
        <div className="bg-white rounded-3xl p-8 text-center" style={{ border: '1px solid #e5e7eb' }}>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2">Secure Gift Payments with Razorpay</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-2xl mx-auto">
            Send love securely with India's most trusted payment gateway. Perfect gifts deserve perfect payment security.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center p-4 rounded-xl bg-pink-50">
              <svg className="w-8 h-8 text-pink-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs font-semibold text-gray-700">Cards</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-green-50">
              <svg className="w-8 h-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-semibold text-gray-700">UPI</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-purple-50">
              <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <span className="text-xs font-semibold text-gray-700">Banking</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-orange-50">
              <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs font-semibold text-gray-700">Wallets</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Gift with Love
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Secure Checkout
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Instant Delivery
            </div>
          </div>

          <button 
            onClick={() => navigate('/cart?flow=gifting')} 
            className="px-6 py-3 bg-pink-600 text-white font-bold rounded-full text-sm hover:bg-pink-700 transition flex items-center gap-2 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
            </svg>
            View Gift Cart
          </button>
        </div>

        {/* Bulk Order Banner */}
        <div className="rounded-2xl px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)' }}>
          <div>
            <h3 className="font-bold text-white mb-1" style={{ fontSize: '20px' }}>Want to give bulk order ?</h3>
            <p className="text-white/80 text-sm">Join over 10,000 businesses that trust SpeedCopy for their high-end printing needs.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => navigate('/business-printing')} className="px-5 py-2.5 text-white font-bold rounded-full hover:bg-gray-700 transition text-sm" style={{ backgroundColor: '#111111' }}>Get Started Now</button>
            <button onClick={() => navigate('/contact-sales')} className="px-5 py-2.5 font-semibold rounded-full hover:bg-white/20 transition text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>Contact Sales</button>
          </div>
        </div>

        {/* Rewards Banner */}
        <div className="rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start gap-8" style={{ backgroundColor: '#111111' }}>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
              <span className="text-white/70 text-xs font-bold tracking-widest uppercase">Rewards Program</span>
            </div>
            <h2 className="font-bold text-white mb-3" style={{ fontSize: '24px' }}>Share the Love, Earn Rewards</h2>
            <p className="text-white/70 text-sm mb-6 leading-relaxed">Invite your friends to SpeedCopy. They get ₹10 off their first order, and you get $10 credit for each successful referral.</p>
            <button onClick={() => navigate('/refer')} className="px-6 py-3 bg-white font-bold rounded-full text-sm hover:bg-gray-100 transition" style={{ color: '#111' }}>Start Referring</button>
          </div>
          <div className="flex-shrink-0 w-full md:w-64">
            <div className="rounded-2xl p-5" style={{ backgroundColor: '#1f2937' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-semibold text-sm">Your Balance</p>
                <p className="text-white/50 text-xs">Updated just now</p>
              </div>
              <p className="font-bold text-white mb-1" style={{ fontSize: '28px' }}>₹0.00</p>
              <p className="text-white/50 text-xs mb-4">Start sharing to grow your balance!</p>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ backgroundColor: '#374151' }}>
                <span className="text-white text-sm font-mono">{referCode}</span>
                <button onClick={() => { navigator.clipboard.writeText(referCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                  <svg className="w-4 h-4" style={{ color: copied ? '#16a34a' : '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        </>
        )}
      </div>
      <Footer />
      {showQuote && <GetQuoteModal onClose={() => setShowQuote(false)} />}
    </div>
  );
};

export default GiftingPage;


