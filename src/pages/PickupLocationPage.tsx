import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import productService from '../services/product.service';

type DeliveryType = 'Pickup' | 'Delivery';
type Filter = 'All Centers' | 'Open Now' | 'Color Printing' | 'Binding Services' | '24/7 Access';
type PickupLocation = {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  reviews: number;
  status: 'open' | 'closed' | 'open247';
  statusLabel: string;
  amenities: string[];
  icon: string;
};

const filters: Filter[] = ['All Centers', 'Open Now', 'Color Printing', 'Binding Services', '24/7 Access'];

const statusColor: Record<string, string> = {
  open: '#16a34a',
  closed: '#6b7280',
  open247: '#16a34a',
};

const formatStoreAddress = (address: any) => {
  if (!address) return 'Address not available';

  if (typeof address === 'string') return address;

  const parts = [address.line1, address.line2, address.city, address.state, address.pincode]
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : 'Address not available';
};

const mapVendorStoreToLocation = (store: any): PickupLocation => {
  const distanceKm = typeof store?.distance === 'number' ? store.distance / 1000 : null;
  const supportedFlows = Array.isArray(store?.supportedFlows) ? store.supportedFlows : [];
  const amenities = ['wifi', 'parking'];

  if (supportedFlows.includes('printing')) {
    amenities.push('print');
  }

  return {
    id: String(store?._id || store?.id || Date.now()),
    name: store?.name || 'SpeedCopy Hub',
    address: formatStoreAddress(store?.address),
    distance: distanceKm !== null ? `${distanceKm.toFixed(1)} km` : 'Available',
    rating: 4.8,
    reviews: 0,
    status: store?.isActive === false || store?.isAvailable === false ? 'closed' : 'open',
    statusLabel: store?.isActive === false || store?.isAvailable === false ? 'CLOSED' : 'OPEN NOW',
    amenities,
    icon: 'store',
  };
};

const getStoresFromResponse = (response: any) => {
  const stores = response?.data?.stores || response?.stores || [];
  return Array.isArray(stores) ? stores : [];
};

const getCurrentPosition = () =>
  new Promise<{ lat: number; lng: number }>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      reject,
      { timeout: 7000, maximumAge: 60000, enableHighAccuracy: false }
    );
  });

const LocationIcon: React.FC<{ type: string }> = ({ type }) => {
  if (type === 'print') return (
    <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );
  if (type === 'grid') return (
    <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
  return (
    <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
};

const AmenityIcon: React.FC<{ type: string }> = ({ type }) => {
  if (type === 'wifi') return (
    <svg className="w-4 h-4" style={{ color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  );
  if (type === 'accessible') return (
    <svg className="w-4 h-4" style={{ color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
  if (type === 'parking') return (
    <span className="text-xs font-bold" style={{ color: '#9ca3af' }}>P</span>
  );
  return (
    <svg className="w-4 h-4" style={{ color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2" />
    </svg>
  );
};

const PickupLocationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('Pickup');
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<Filter>('All Centers');

  // Near Me popup state with enhanced functionality
  const [showNearMePopup, setShowNearMePopup] = useState(false);
  const [zipInput, setZipInput] = useState('');
  const [zipSearching, setZipSearching] = useState(false);
  const [zipError, setZipError] = useState('');
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);

  const configId = searchParams.get('configId') || '';
  const printType = searchParams.get('type') || '';

  const loadStores = async (params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    limit?: number;
    pincode?: string;
  }) => {
    const response = await productService.getNearbyVendorStores(params);
    return getStoresFromResponse(response).map(mapVendorStoreToLocation);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      
      // Try to get user location first
      let geoParams: { lat?: number; lng?: number } = {};
      try {
        const position = await getCurrentPosition();
        geoParams = { lat: position.lat, lng: position.lng };
      } catch {
        console.log('Location access denied or unavailable');
      }

      // Fetch stores - prioritize nearby if location available
      if (geoParams.lat && geoParams.lng) {
        const nearbyStores = await loadStores({
          ...geoParams,
          radius: 25, // Increased radius to find more shops
          limit: 50,
        });

        if (nearbyStores.length > 0) {
          setLocations(nearbyStores);
        } else {
          // If no nearby stores, get all available stores
          const allStores = await loadStores({ limit: 50 });
          setLocations(allStores);
        }
      } else {
        // No location access, get all available stores
        const allStores = await loadStores({ limit: 50 });
        setLocations(allStores);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCenter = (locationId: string) => {
    // Navigate directly to service package selection
    navigate(`/service-package?configId=${configId}&type=${printType}&locationId=${locationId}`);
  };

  const handleNearMeSearch = async () => {
    const zip = zipInput.trim();
    if (!zip || zip.length < 4) {
      setZipError('Please enter a valid zip/pin code');
      return;
    }
    try {
      setZipSearching(true);
      setZipError('');
      
      // Search by pincode using the vendor stores API
      const mappedStores = await loadStores({
        pincode: zip,
        radius: 50, // Larger radius for pincode search
        limit: 50
      });

      if (mappedStores.length > 0) {
        setLocations(mappedStores);
        setShowNearMePopup(false);
        setZipInput('');
      } else {
        setZipError('No shops found for this zip code. Try a different one.');
      }
    } catch (error) {
      console.error('Pincode search error:', error);
      setZipError('Failed to search. Please try again.');
    } finally {
      setZipSearching(false);
    }
  };

  const handleNearMeClick = async () => {
    // Always show popup for better user experience
    setShowNearMePopup(true);
    setZipError('');
    setZipInput('');
    setCurrentLocation(null);
    
    // Try to detect location in background
    try {
      setLocationDetecting(true);
      const position = await getCurrentPosition();
      setCurrentLocation({ lat: position.lat, lng: position.lng });
      setLocationDetecting(false);
    } catch (error) {
      console.error('Location detection error:', error);
      setLocationDetecting(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!currentLocation) return;
    
    try {
      setZipSearching(true);
      setZipError('');
      
      const mappedStores = await loadStores({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        radius: 10,
        limit: 50
      });

      if (mappedStores.length > 0) {
        setLocations(mappedStores);
        setShowNearMePopup(false);
      } else {
        setZipError('No shops found near your location. Try entering a pincode.');
      }
    } catch (error) {
      console.error('Location search error:', error);
      setZipError('Failed to search near your location. Please try entering a pincode.');
    } finally {
      setZipSearching(false);
    }
  };

  const filtered = locations.filter(l => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.address.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === 'All Centers' ||
      (activeFilter === 'Open Now' && l.status === 'open') ||
      (activeFilter === '24/7 Access' && l.status === 'open247');
      
    return matchSearch && matchFilter;
  });

  return (
    <>
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* Pickup / Delivery toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center bg-white rounded-full p-1 w-full max-w-sm" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
            {(['Pickup', 'Delivery'] as DeliveryType[]).map(type => (
              <button key={type} onClick={() => {
                setDeliveryType(type);
                if (type === 'Delivery') navigate(`/service-package?configId=${configId}&type=${printType}`);
              }}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold transition"
                style={{ backgroundColor: deliveryType === type ? '#111111' : 'transparent', color: deliveryType === type ? '#ffffff' : '#6b7280' }}>
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Select a Pickup Location</h1>
          <p className="text-sm mb-5" style={{ color: '#9ca3af' }}>Choose a convenient SpeedCopy Hub for your printing needs.</p>

          {/* Search + Near Me */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Enter city or zip code..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ border: '1px solid #e5e7eb', backgroundColor: '#fafafa', color: '#374151' }} />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-gray-50"
              onClick={handleNearMeClick}
              style={{ border: '1px solid #e5e7eb', color: '#374151', backgroundColor: '#fff' }}>
              <svg className="w-4 h-4" style={{ color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Near Me
            </button>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition"
                style={{
                  backgroundColor: activeFilter === f ? '#111111' : '#f3f4f6',
                  color: activeFilter === f ? '#ffffff' : '#374151',
                }}>
                {f}
              </button>
            ))}
          </div>

          {/* Location list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse bg-gray-100" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-gray-500 font-semibold mb-2">No shops available yet</p>
              <p className="text-sm text-gray-400 mb-4">
                Shops are added by our vendor partners. Click "Near Me" to search by location or pincode.
              </p>
              <button
                onClick={handleNearMeClick}
                className="px-6 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition"
              >
                Search for Shops
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((loc) => (
                <div key={loc.id} className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ border: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                    <LocationIcon type={loc.icon} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{loc.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{loc.address}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {/* Distance */}
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" style={{ color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="text-xs" style={{ color: '#9ca3af' }}>{loc.distance}</span>
                      </div>
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" style={{ color: '#f59e0b' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs font-semibold" style={{ color: '#374151' }}>{loc.rating}</span>
                        <span className="text-xs" style={{ color: '#9ca3af' }}>({loc.reviews})</span>
                      </div>
                      {/* Amenities */}
                      <div className="flex items-center gap-1.5">
                        {loc.amenities?.map((a: string) => <AmenityIcon key={a} type={a} />)}
                      </div>
                    </div>
                  </div>

                  {/* Status + Button */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs font-bold" style={{ color: statusColor[loc.status] }}>
                      {loc.status !== 'closed' ? '● ' : ''}{loc.statusLabel}
                    </span>
                    {loc.status !== 'closed' && (
                      <button onClick={() => handleSelectCenter(loc.id)}
                        className="flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-full hover:bg-gray-700 transition"
                        style={{ backgroundColor: '#111111' }}>
                        Select Center
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Enhanced Near Me Popup with Map Integration */}
    {showNearMePopup && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
                <svg className="w-6 h-6" style={{ color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Find Nearby Shops</h3>
                <p className="text-sm" style={{ color: '#9ca3af' }}>Choose your preferred method</p>
              </div>
            </div>
            <button onClick={() => setShowNearMePopup(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current Location Option */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
                  <svg className="w-5 h-5" style={{ color: '#3b82f6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Use Current Location</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>
                    {locationDetecting ? 'Detecting location...' : 
                     currentLocation ? 'Location detected' : 'Detect your GPS location'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleUseCurrentLocation}
                disabled={!currentLocation || zipSearching}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                style={{ 
                  backgroundColor: currentLocation ? '#3b82f6' : '#f3f4f6',
                  color: currentLocation ? '#ffffff' : '#9ca3af'
                }}
              >
                {zipSearching ? 'Searching...' : 'Use Location'}
              </button>
            </div>
            {locationDetecting && (
              <div className="flex items-center gap-2 mt-2 px-4">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-500">Getting your location...</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Pincode Input */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Enter Pincode</label>
            <div className="relative">
              <input
                type="text"
                value={zipInput}
                onChange={(e) => { setZipInput(e.target.value); setZipError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleNearMeSearch()}
                placeholder="e.g. 400001, 110001"
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none pr-12"
                style={{
                  border: zipError ? '2px solid #ef4444' : '2px solid #e5e7eb',
                  backgroundColor: '#fafafa',
                  color: '#111111',
                  fontSize: '16px',
                  fontWeight: '500',
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            {zipError && (
              <p className="text-sm mt-2 flex items-center gap-2" style={{ color: '#ef4444' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {zipError}
              </p>
            )}
          </div>

          <p className="text-xs mb-6" style={{ color: '#9ca3af' }}>
            We'll search for shops added by vendors in your area. If no shops are found, we'll show the nearest available options.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowNearMePopup(false)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleNearMeSearch}
              disabled={zipSearching || !zipInput.trim()}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#111111' }}
            >
              {zipSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Pincode
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default PickupLocationPage;
