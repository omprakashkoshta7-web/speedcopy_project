import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/order.service';
import productService from '../services/product.service';

type CartUiItem = {
  id: string;
  name: string;
  image: string;
  designPreview?: string;
  designName?: string;
  qty: number;
  price: number;
  oldPrice?: number;
  desc: string;
  tag: string;
  flowType: string;
};

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const flowFilter = searchParams.get('flow') || '';
  const isGiftingFlow = flowFilter === 'gifting';
  const [items, setItems] = useState<CartUiItem[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void fetchCartData();
  }, [isAuthenticated, flowFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError('');
      const [cartResponse, suggestedResponse] = await Promise.all([
        orderService.getCart(),
        isGiftingFlow
          ? productService.getGiftingProducts({ limit: 4 })
          : productService.getShoppingProducts({ limit: 4 }),
      ]);

      const rawItems = cartResponse?.data?.items || cartResponse?.items || [];
      const filteredItems = flowFilter
        ? rawItems.filter((item: any) => item.flowType === flowFilter)
        : rawItems;

      setItems(
        filteredItems.map((item: any) => {
          const quantity = item.quantity || item.qty || 1;
          const unitPrice = item.unitPrice || item.unit_price || item.salePrice || item.sale_price || item.price || 0;
          const mrp = item.mrp || item.compareAtPrice || 0;
          const categoryLabel =
            typeof item.category === 'string'
              ? item.category
              : item.category?.name || item.flowType || 'Product';

          return {
            id: item._id || item.item_id || item.id,
            name: item.productName || item.name || 'Product',
            image:
              item.designPreview ||
              item.thumbnail ||
              item.image ||
              'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80',
            designPreview: item.designPreview || '',
            designName: item.designName || '',
            qty: quantity,
            price: unitPrice,
            oldPrice: mrp > unitPrice ? mrp : undefined,
            desc:
              item.designName ||
              item.variantSnapshot?.size_label ||
              item.variantSnapshot?.size ||
              item.sku ||
              categoryLabel,
            tag: categoryLabel,
            flowType: item.flowType || 'shopping',
          };
        })
      );

      const suggestedPayload = suggestedResponse?.data?.products || suggestedResponse?.products || [];
      setSuggested(suggestedPayload);
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
      setError(err.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (id: string, delta: number) => {
    const currentItem = items.find((item) => item.id === id);
    const newQty = Math.max(1, (currentItem?.qty || 1) + delta);
    try {
      await orderService.updateCartItem(id, newQty);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty: newQty } : item)));
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await orderService.removeCartItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), [items]);
  const taxes = 0;
  const total = subtotal + taxes;
  const pageTitle = isGiftingFlow ? 'Gifting Cart' : 'Shopping Cart';
  const emptyActionRoute = isGiftingFlow ? '/products?flow=gifting' : '/shopping';

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => void fetchCartData()} className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <button onClick={() => navigate(emptyActionRoute)} className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800">
            {isGiftingFlow ? 'Start Gifting' : 'Start Shopping'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-1.5 text-xs mb-6" style={{ color: '#9ca3af' }}>
          <button onClick={() => navigate('/')} className="hover:text-gray-600">Home</button>
          <span>/</span>
          <button onClick={() => navigate(emptyActionRoute)} className="hover:text-gray-600">{isGiftingFlow ? 'Gifting' : 'Shopping'}</button>
          <span>/</span>
          <span style={{ color: '#4b5563' }}>Cart</span>
        </div>

        <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: '28px' }}>{pageTitle}</h1>
        <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>You have {items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#f3f4f6' }}>
                  <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <p className="text-xs font-bold tracking-widest mb-1 uppercase" style={{ color: '#9ca3af' }}>{item.tag}</p>
                  <p className="font-semibold text-gray-900 mb-1" style={{ fontSize: '15px' }}>{item.name}</p>
                  <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>
                    {item.designPreview ? 'Design attached from editor' : item.desc}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => void updateQty(item.id, -1)} 
                        className="w-6 h-6 rounded flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 transition text-sm"
                        style={{ border: '1px solid #e5e7eb' }}
                      >
                        −
                      </button>
                      <span className="font-semibold text-gray-900 text-sm w-6 text-center">{item.qty}</span>
                      <button 
                        onClick={() => void updateQty(item.id, 1)} 
                        className="w-6 h-6 rounded flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 transition text-sm"
                        style={{ border: '1px solid #e5e7eb' }}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="flex sm:hidden flex-col items-end gap-0.5">
                      {item.oldPrice && <p className="line-through text-xs" style={{ color: '#9ca3af' }}>₹{item.oldPrice.toFixed(2)}</p>}
                      <p className="font-bold text-gray-900" style={{ fontSize: '15px' }}>₹{(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end gap-2 flex-shrink-0">
                  <button 
                    onClick={() => void removeItem(item.id)} 
                    className="hover:opacity-60 transition p-1"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" style={{ color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  {item.oldPrice && <p className="line-through text-xs" style={{ color: '#9ca3af' }}>₹{item.oldPrice.toFixed(2)}</p>}
                  <p className="font-bold text-gray-900" style={{ fontSize: '15px' }}>₹{(item.price * item.qty).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h2 className="font-bold text-gray-900 mb-5" style={{ fontSize: '16px' }}>Order Summary</h2>
              
              <div className="space-y-3 mb-5 pb-5" style={{ borderBottom: '1px solid #e5e7eb' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#9ca3af' }}>Subtotal</span>
                  <span className="text-sm font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#9ca3af' }}>Delivery</span>
                  <span className="text-sm font-bold" style={{ color: '#16a34a' }}>FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#9ca3af' }}>Taxes</span>
                  <span className="text-sm font-semibold text-gray-900">₹{taxes.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-5">
                <span className="font-bold text-gray-900 text-sm">Total</span>
                <div className="text-right">
                  <p className="font-bold text-gray-900" style={{ fontSize: '20px' }}>₹{total.toFixed(2)}</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>incl. taxes</p>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout', { state: { flow: flowFilter } })} 
                className="w-full py-3 text-white font-bold rounded-full hover:bg-gray-800 transition text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: '#111111' }}
              >
                Checkout
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Promo Code */}
            <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p className="text-xs font-bold tracking-widest mb-2 uppercase" style={{ color: '#9ca3af' }}>Promo Code</p>
              <div className="flex items-center gap-2">
                <input 
                  value={coupon} 
                  onChange={(e) => setCoupon(e.target.value)} 
                  placeholder="Enter code" 
                  className="flex-1 text-xs px-3 py-2 rounded-lg focus:outline-none bg-gray-50"
                  style={{ border: '1px solid #e5e7eb', color: '#374151' }}
                />
                <button 
                  className="text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  style={{ color: '#374151', backgroundColor: '#f3f4f6' }}
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-2xl" style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7' }}>
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-bold text-gray-900 text-xs">Free shipping on orders over ₹50</p>
                <p className="text-xs mt-1" style={{ color: '#4b5563' }}>Order within 3 hours for fast delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Products */}
        {suggested.length > 0 && (
          <div className="mt-10">
            <h3 className="font-bold text-gray-900 mb-4" style={{ fontSize: '18px' }}>You might also like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {suggested.slice(0, 4).map((item) => (
                <div
                  key={item._id || item.name}
                  onClick={() => navigate(`/product/${item._id}?flow=${isGiftingFlow ? 'gifting' : 'shopping'}`)}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition"
                  style={{ border: '1px solid #e5e7eb' }}
                >
                  <div style={{ height: '180px', backgroundColor: '#f3f4f6' }}>
                    <img 
                      src={item.thumbnail || item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80'} 
                      alt={item.name} 
                      loading="lazy" 
                      decoding="async" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="px-3 py-3">
                    <p className="font-semibold text-gray-900 mb-2 text-xs line-clamp-2">{item.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">₹{(item.sale_price || item.basePrice || item.price || item.mrp || 0).toFixed(2)}</span>
                      {item.mrp && item.mrp > (item.sale_price || item.basePrice || item.price || 0) && (
                        <span className="text-xs line-through" style={{ color: '#9ca3af' }}>₹{item.mrp.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
