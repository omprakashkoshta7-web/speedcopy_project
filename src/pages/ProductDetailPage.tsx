import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import productService from '../services/product.service';
import orderService from '../services/order.service';

type ProductVariant = {
  id?: string;
  index?: number;
  size?: string;
  size_label?: string;
  paper_type?: string;
  cover_color?: string;
  cover_color_name?: string;
  stock?: number;
  additional_price?: number;
};

type ProductSpecs = {
  paper_weight?: string;
  page_count?: string;
  cover_material?: string;
  binding?: string;
  extras?: string;
  features?: string[];
};

type ProductCategory = {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
};

type ProductRecord = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  flowType?: 'shopping' | 'gifting' | 'printing' | string;
  images?: string[];
  thumbnail?: string;
  image?: string;
  category?: ProductCategory | string;
  subcategory?: { name?: string } | string;
  basePrice?: number;
  discountedPrice?: number;
  mrp?: number;
  sale_price?: number;
  badge?: string | null;
  brand?: string;
  sku?: string;
  stock?: number;
  in_stock?: boolean;
  free_shipping?: boolean;
  designMode?: 'premium' | 'normal' | 'both' | string;
  highlights?: string[];
  variants?: ProductVariant[];
  specs?: ProductSpecs;
  customization?: {
    requires_design?: boolean;
    premium_design_available?: boolean;
    start_design_available?: boolean;
    design_mode?: 'premium' | 'normal' | 'both' | string | null;
    canvas?: { width?: number; height?: number; unit?: string } | null;
  };
  gift_options?: {
    canvas?: { width?: number; height?: number; unit?: string } | null;
  };
};

const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const requestedFlow = searchParams.get('flow') || '';
  const requestedCategory = searchParams.get('category') || '';

  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [cartError, setCartError] = useState('');

  useEffect(() => {
    if (!id) return;
    void fetchProduct();
  }, [id, requestedFlow]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const response = requestedFlow === 'gifting'
        ? await productService.getGiftingProductById(id!)
        : requestedFlow === 'shopping'
          ? await productService.getShoppingProductById(id!)
          : await productService.getProductById(id!);
      const payload = response?.data || response;
      setProduct(payload || null);
      setActiveImg(0);
      setSelectedVariantIndex(0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const normalizedImages = useMemo(() => {
    const vals = [
      ...(Array.isArray(product?.images) ? product!.images : []),
      product?.thumbnail,
      product?.image,
    ].filter(Boolean) as string[];
    return vals.length ? Array.from(new Set(vals)) : [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=900&q=80',
    ];
  }, [product]);

  const variants = useMemo(() => (Array.isArray(product?.variants) ? product!.variants : []), [product]);
  const selectedVariant = variants[selectedVariantIndex] || null;

  const sizeOptions = useMemo(() =>
    Array.from(new Map(
      variants.filter(v => v.size || v.size_label).map((v, i) => [
        `${v.size || ''}-${v.size_label || ''}`,
        { index: i, value: v.size || v.size_label || `opt-${i}`, label: v.size || v.size_label || `Option ${i + 1}`, sub: v.size_label && v.size_label !== v.size ? v.size_label : '' },
      ])
    ).values()), [variants]);

  const paperTypeOptions = useMemo(() =>
    Array.from(new Map(
      variants.filter(v => v.paper_type).map((v, i) => [v.paper_type as string, { index: i, value: v.paper_type as string, label: v.paper_type as string }])
    ).values()), [variants]);

  const coverColorOptions = useMemo(() =>
    Array.from(new Map(
      variants.filter(v => v.cover_color || v.cover_color_name).map((v, i) => [
        `${v.cover_color || ''}-${v.cover_color_name || ''}`,
        { index: i, value: v.cover_color || `color-${i}`, label: v.cover_color_name || v.cover_color || `Color ${i + 1}`, swatch: v.cover_color || '#111' },
      ])
    ).values()), [variants]);

  const updateVariant = (matchers: Partial<ProductVariant>) => {
    const idx = variants.findIndex(v =>
      Object.entries(matchers).every(([k, val]) => !val || v[k as keyof ProductVariant] === val)
    );
    if (idx >= 0) setSelectedVariantIndex(idx);
  };

  const salePrice = product?.sale_price ?? product?.discountedPrice ?? product?.basePrice ?? 0;
  const mrp = product?.mrp ?? product?.basePrice ?? salePrice;
  const discountPct = mrp > salePrice ? Math.round(((mrp - salePrice) / mrp) * 100) : 0;
  const unitPrice = salePrice + (selectedVariant?.additional_price || 0);
  const flowType = requestedFlow || product?.flowType || 'shopping';
  const categoryName = requestedCategory || (typeof product?.category === 'string' ? product.category : product?.category?.name) || 'Products';
  const productName = product?.name || 'Product';
  const description = product?.description?.trim() || 'Premium quality product crafted with care.';
  const supportsPremiumDesign =
    flowType === 'gifting' && Boolean(product?.customization?.premium_design_available);
  const supportsBlankDesign =
    flowType === 'gifting' && Boolean(product?.customization?.start_design_available);
  const highlights = (product?.highlights || []).filter(Boolean);
  const featureCards = highlights.slice(0, 2);
  const specEntries = [
    ['Paper Weight', product?.specs?.paper_weight],
    ['Page Count', product?.specs?.page_count],
    ['Cover Material', product?.specs?.cover_material],
    ['Binding', product?.specs?.binding],
    ['Extras', product?.specs?.extras],
    ['Brand', product?.brand],
    ['SKU', product?.sku],
  ].filter(([, v]) => v) as [string, string][];

  const getBackRoute = () => {
    if (flowType === 'gifting') return `/products?flow=gifting${requestedCategory ? `&category=${encodeURIComponent(requestedCategory)}` : ''}`;
    if (flowType === 'shopping') return '/shopping';
    if (searchParams.get('type') === 'business') return '/business-printing';
    return '/printing';
  };

  const goToDesignEditor = (designMode: 'premium' | 'normal') => {
    const currentProductId = (product?._id || product?.id || id || '').toString();
    if (!currentProductId) return;

    const params = new URLSearchParams({
      productId: currentProductId,
      flow: flowType,
      designMode,
    });

    if (requestedCategory) {
      params.set('category', requestedCategory);
    }

    navigate(`/design-editor?${params.toString()}`);
  };

  const addToCart = async (redirectTo?: string) => {
    if (!isAuthenticated) { navigate('/'); return; }
    if (!product?._id && !id) return;
    try {
      setCartLoading(true);
      setCartError('');
      await orderService.addToCart({
        productId: (product?._id || product?.id || id) as string,
        productName,
        flowType,
        quantity: qty,
        variantId: selectedVariant?.id || String(selectedVariant?.index ?? selectedVariantIndex),
        thumbnail: normalizedImages[0],
        unitPrice,
        totalPrice: unitPrice * qty,
      });
      if (redirectTo) {
        navigate(redirectTo, { state: { flow: flowType } });
      } else {
        setCartAdded(true);
        setTimeout(() => setCartAdded(false), 2500);
      }
    } catch (err: any) {
      setCartError(err?.response?.data?.message || 'Failed to add to cart.');
      setTimeout(() => setCartError(''), 3000);
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="animate-pulse grid lg:grid-cols-2 gap-12">
            <div>
              <div className="bg-gray-200 rounded-2xl" style={{ height: '480px' }} />
              <div className="flex gap-3 mt-4">
                {[1,2,3].map(i => <div key={i} className="w-16 h-16 bg-gray-200 rounded-xl" />)}
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-6" />
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-200 rounded-xl" />)}
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mt-4" />
              <div className="flex gap-2">
                {[1,2,3].map(i => <div key={i} className="h-8 w-20 bg-gray-200 rounded-full" />)}
              </div>
              <div className="h-12 bg-gray-200 rounded-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
          <button onClick={() => navigate(getBackRoute())} className="px-6 py-3 bg-black text-white rounded-full font-bold">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs mb-8" style={{ color: '#9ca3af' }}>
          <button onClick={() => navigate('/')} className="hover:text-gray-600 transition">Home</button>
          <span>/</span>
          <button onClick={() => navigate(getBackRoute())} className="hover:text-gray-600 transition capitalize">{flowType}</button>
          <span>/</span>
          <span className="font-semibold" style={{ color: '#374151' }}>{categoryName}</span>
        </div>

        {/* ── Top section: image + product info ── */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 mb-14">

          {/* LEFT — main image + thumbnails */}
          <div>
            {/* Main image */}
            <div
              className="rounded-2xl overflow-hidden flex items-center justify-center bg-white"
              style={{ height: '460px', border: '1px solid #e5e7eb' }}
            >
              <img
                src={normalizedImages[Math.min(activeImg, normalizedImages.length - 1)]}
                alt={productName}
                className="w-full h-full object-contain p-6"
              />
            </div>

            {/* Thumbnails */}
            {normalizedImages.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                {normalizedImages.map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    onClick={() => setActiveImg(i)}
                    className="flex-shrink-0 rounded-xl overflow-hidden bg-white transition"
                    style={{
                      width: '72px',
                      height: '72px',
                      border: activeImg === i ? '2px solid #111111' : '1.5px solid #e5e7eb',
                    }}
                  >
                    <img src={img} alt={`${productName} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — product info */}
          <div className="pt-2">
            {/* Name */}
            <h1 className="font-semibold text-gray-900 mb-3 leading-tight" style={{ fontSize: '28px' }}>
              {productName}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-bold text-gray-900" style={{ fontSize: '26px' }}>₹{unitPrice.toFixed(2)}</span>
              {mrp > unitPrice && (
                <span className="line-through text-sm" style={{ color: '#9ca3af' }}>₹{mrp.toFixed(2)}</span>
              )}
              {discountPct > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                  SAVE {discountPct}%
                </span>
              )}
            </div>

            {/* Size selector */}
            {sizeOptions.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#6b7280' }}>Select Size</p>
                  <button className="text-xs" style={{ color: '#6b7280' }}>Size Guide</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {sizeOptions.map(opt => {
                    const active = selectedVariantIndex === opt.index;
                    return (
                      <button
                        key={`${opt.value}-${opt.index}`}
                        onClick={() => setSelectedVariantIndex(opt.index)}
                        className="py-3 px-2 rounded-xl text-center transition bg-white"
                        style={{ border: active ? '2px solid #111111' : '1.5px solid #e5e7eb' }}
                      >
                        <div className="text-sm font-semibold text-gray-800">{opt.label}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>{opt.sub || 'Standard'}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Paper type */}
            {paperTypeOptions.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#6b7280' }}>Paper Type</p>
                <div className="flex flex-wrap gap-2">
                  {paperTypeOptions.map(opt => {
                    const active = selectedVariant?.paper_type === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => updateVariant({ paper_type: opt.value, size: selectedVariant?.size, cover_color: selectedVariant?.cover_color })}
                        className="px-4 py-1.5 rounded-full text-sm font-medium transition"
                        style={{
                          backgroundColor: active ? '#111111' : '#ffffff',
                          color: active ? '#ffffff' : '#374151',
                          border: active ? '1.5px solid #111111' : '1.5px solid #e5e7eb',
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cover color */}
            {coverColorOptions.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#6b7280' }}>
                  Cover Color:{' '}
                  <span className="normal-case font-bold text-gray-800">
                    {(selectedVariant?.cover_color_name || selectedVariant?.cover_color || coverColorOptions[0]?.label || '').toUpperCase()}
                  </span>
                </p>
                <div className="flex items-center gap-3">
                  {coverColorOptions.map(opt => {
                    const active = selectedVariant?.cover_color === opt.value;
                    return (
                      <button
                        key={`${opt.value}-${opt.index}`}
                        onClick={() => updateVariant({ cover_color: opt.value, size: selectedVariant?.size, paper_type: selectedVariant?.paper_type })}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition"
                        style={{ border: active ? '2.5px solid #111111' : '2px solid transparent', padding: '2px' }}
                      >
                        <span className="block w-full h-full rounded-full" style={{ backgroundColor: opt.swatch }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Qty + action buttons */}
            <div className="flex items-center gap-3 mb-4">
              {/* Qty stepper */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-full" style={{ border: '1.5px solid #e5e7eb' }}>
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-5 h-5 flex items-center justify-center font-bold text-gray-500 hover:text-gray-900 transition"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-bold text-gray-900">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-5 h-5 flex items-center justify-center font-bold text-gray-500 hover:text-gray-900 transition"
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={() => addToCart()}
                disabled={cartLoading}
                className="px-6 py-2.5 rounded-full text-sm font-semibold transition disabled:opacity-60 flex items-center gap-2"
                style={{ border: '1.5px solid #d1d5db', backgroundColor: '#ffffff', color: '#111111' }}
              >
                {cartLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Adding...
                  </>
                ) : cartAdded ? '✓ Added!' : 'Add to cart'}
              </button>

              {/* Continue to Pay */}
              <button
                onClick={() => addToCart('/checkout')}
                disabled={cartLoading}
                className="flex-1 px-6 py-2.5 rounded-full text-sm font-semibold bg-black text-white hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                Continue to Pay
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {(supportsPremiumDesign || supportsBlankDesign) && (
              <div className="mb-5 rounded-2xl bg-white p-4" style={{ border: '1px solid #e5e7eb' }}>
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#6b7280' }}>
                  Design Options
                </p>
                <div className="flex flex-wrap gap-3">
                  {supportsPremiumDesign && (
                    <button
                      onClick={() => goToDesignEditor('premium')}
                      className="rounded-full px-5 py-2.5 text-sm font-semibold transition"
                      style={{ backgroundColor: '#111111', color: '#ffffff' }}
                    >
                      Explore Premium Templates
                    </button>
                  )}
                  {supportsBlankDesign && (
                    <button
                      onClick={() => goToDesignEditor('normal')}
                      className="rounded-full px-5 py-2.5 text-sm font-semibold transition"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#111111',
                        border: '1.5px solid #d1d5db',
                      }}
                    >
                      Start Blank Design
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Cart feedback */}
            {cartAdded && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Added to cart!{' '}
                <button onClick={() => navigate('/cart?flow=shopping')} className="underline hover:opacity-70">View Cart</button>
              </div>
            )}
            {cartError && (
              <p className="text-xs text-red-600 mb-3">{cartError}</p>
            )}

            {/* Stock + shipping badges */}
            <div className="flex items-center gap-5 text-xs" style={{ color: '#6b7280' }}>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {product?.in_stock === false ? 'Currently unavailable' : 'In stock, ready to ship'}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                {product?.free_shipping ? 'Free shipping over ₹50' : 'Standard shipping'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Bottom section: description + specs ── */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-8">

          {/* Description */}
          <div>
            {/* Tab */}
            <div className="mb-5">
              <span className="text-sm font-semibold pb-2 inline-block" style={{ color: '#7c3aed', borderBottom: '2px solid #7c3aed' }}>
                Description
              </span>
            </div>

            <p className="text-sm leading-7 text-gray-600 mb-6">{description}</p>

            {/* Feature cards */}
            {featureCards.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-3">
                {featureCards.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl" style={{ border: '1px solid #f3f4f6' }}>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {i === 0 ? (
                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 mb-0.5">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Technical Specs */}
          {specEntries.length > 0 && (
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e5e7eb', alignSelf: 'start' }}>
              <h3 className="font-bold text-gray-900 mb-4" style={{ fontSize: '15px' }}>Technical Specs</h3>
              <div>
                {specEntries.map(([label, value], i) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-3 text-sm"
                    style={{ borderBottom: i < specEntries.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                  >
                    <span style={{ color: '#9ca3af' }}>{label}</span>
                    <span className="font-semibold text-gray-800 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;
