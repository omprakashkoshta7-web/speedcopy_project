import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/order.service';
import financeService from '../services/finance.service';
import userService from '../services/user.service';
import { Edit2, Trash2, Save, X, Plus } from 'lucide-react';

type PaymentMethod = 'card' | 'upi' | 'wallet' | 'netbanking';

const servicePackages = {
  standard: {
    name: 'Standard',
    price: 9.00,
    oldPrice: 12.00,
    deliveryTime: '3 days',
    features: ['Standard paper quality', 'Pickup at counter']
  },
  express: {
    name: 'Express',
    price: 14.50,
    oldPrice: 18.00,
    deliveryTime: '24 hours',
    features: ['High priority queue', 'Pickup at counter']
  },
  premium: {
    name: 'Premium',
    price: 19.00,
    oldPrice: 24.00,
    deliveryTime: '12 hours',
    features: ['Premium paper quality', 'Priority processing', 'Pickup at counter']
  },
  instant: {
    name: 'Instant',
    price: 25.00,
    oldPrice: 30.00,
    deliveryTime: '4 hours',
    features: ['Immediate processing', 'Direct courier delivery']
  }
};

const PrintCheckoutPage: React.FC = () => {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [selectedUpi, setSelectedUpi] = useState('');
  const [wallet, setWallet] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [printConfig, setPrintConfig] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    name: '',
    phone: '',
    house: '',
    area: '',
    pincode: '',
    type: 'Home'
  });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  
  const packageId = searchParams.get('package') || 'express';
  const configId = searchParams.get('configId') || '';
  const selectedPackage = servicePackages[packageId as keyof typeof servicePackages] || servicePackages.express;
  const persistedBusinessPrintConfigId = /^[0-9a-fA-F]{24}$/.test(configId) ? configId : undefined;

  useEffect(() => {
    fetchCheckoutData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        const [walletRes, addressRes] = await Promise.all([
          financeService.getWallet(),
          userService.getAddresses()
        ]);

        setWallet(walletRes.data);
        const addressesData = addressRes?.data?.addresses || addressRes?.addresses || addressRes?.data || [];
        const parsedAddresses = Array.isArray(addressesData) ? addressesData : [];
        setAddresses(parsedAddresses);
        if (parsedAddresses.length > 0 && !selectedAddress) {
          setSelectedAddress(parsedAddresses[0]);
        }

        // Get print config from localStorage if configId exists
        if (configId) {
          const savedConfig = localStorage.getItem(`printConfig_${configId}`);
          if (savedConfig) {
            setPrintConfig(JSON.parse(savedConfig));
          } else {
            // Try to get from uploaded files and build config
            const uploadedFiles = localStorage.getItem('uploadedFiles');
            if (uploadedFiles) {
              const files = JSON.parse(uploadedFiles);
              const defaultConfig = {
                copies: 1,
                colorMode: 'B&W',
                pageSize: 'A4',
                printSide: 'one-sided',
                linearSheets: 0,
                semiLog: 0,
                uploadedFiles: files,
                totalPages: files.reduce((sum: number, file: any) => sum + (file.pages || 1), 0)
              };
              setPrintConfig(defaultConfig);
              // Save this config for future use
              localStorage.setItem(`printConfig_${configId}`, JSON.stringify(defaultConfig));
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch checkout data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (addr: any) => {
    setEditingId(addr._id);
    setEditForm({
      name: addr.fullName || addr.name || '',
      phone: addr.phone || '',
      house: addr.houseNo || addr.house || '',
      area: addr.area || '',
      pincode: addr.pincode || '',
      type: addr.label || 'Home'
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (id: string) => {
    try {
      setSavingId(id);
      const formattedAddress = {
        label: editForm.type,
        fullName: editForm.name.trim(),
        phone: editForm.phone.trim(),
        line1: `${editForm.house.trim()}, ${editForm.area.trim()}`,
        houseNo: editForm.house.trim(),
        area: editForm.area.trim(),
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: editForm.pincode.trim(),
        country: 'India',
      };

      await userService.updateAddress(id, formattedAddress);
      const updatedAddresses = addresses.map(a => a._id === id ? { ...a, ...formattedAddress } : a);
      setAddresses(updatedAddresses);
      if (selectedAddress?._id === id) {
        setSelectedAddress({ ...selectedAddress, ...formattedAddress });
      }
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error('Failed to update address:', err);
      alert('Failed to update address');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      setDeletingId(id);
      await userService.deleteAddress(id);
      const updatedAddresses = addresses.filter(a => a._id !== id);
      setAddresses(updatedAddresses);
      if (selectedAddress?._id === id) {
        setSelectedAddress(updatedAddresses.length > 0 ? updatedAddresses[0] : null);
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
      alert('Failed to delete address');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNew = async () => {
    if (!newAddressForm.name || !newAddressForm.phone || !newAddressForm.house || !newAddressForm.area || !newAddressForm.pincode) {
      alert('Please fill all fields');
      return;
    }

    try {
      setSavingId('new');
      const formattedAddress = {
        label: newAddressForm.type,
        fullName: newAddressForm.name.trim(),
        phone: newAddressForm.phone.trim(),
        line1: `${newAddressForm.house.trim()}, ${newAddressForm.area.trim()}`,
        houseNo: newAddressForm.house.trim(),
        area: newAddressForm.area.trim(),
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: newAddressForm.pincode.trim(),
        country: 'India',
      };

      await userService.addAddress(formattedAddress);
      await fetchCheckoutData();
      setShowAddForm(false);
      setNewAddressForm({
        name: '',
        phone: '',
        house: '',
        area: '',
        pincode: '',
        type: 'Home'
      });
    } catch (err) {
      console.error('Failed to add address:', err);
      alert('Failed to add address');
    } finally {
      setSavingId(null);
    }
  };

  const calculateTotal = () => {
    const basePrice = selectedPackage.price;
    const copies = printConfig?.copies || 1;
    const servicePackagePrice = basePrice * copies;
    const deliveryCharge = packageId === 'instant' ? 50 : 0;
    const discount = 0;
    
    // Calculate document printing cost from print config
    let documentPrintingCost = 0;
    if (printConfig) {
      const pricingConfig = {
        basePrice: {
          'B&W': { 'A4': 2, 'A3': 4 },
          'color': { 'A4': 5, 'A3': 8 },
          'Custom': { 'A4': 3, 'A3': 6 }
        },
        printSideMultiplier: {
          'one-sided': 1,
          'Two-sided': 1.5,
          '4 in 1 (2 front+2 Back)': 0.8
        },
        graphSheetPrice: 3,
        processingFee: 5
      };

      // Base printing cost
      if (printConfig.colorMode && printConfig.pageSize) {
        const baseRate = pricingConfig.basePrice[printConfig.colorMode as keyof typeof pricingConfig.basePrice]?.[printConfig.pageSize as 'A4' | 'A3'] || 0;
        const sideMultiplier = pricingConfig.printSideMultiplier[printConfig.printSide as keyof typeof pricingConfig.printSideMultiplier] || 1;
        
        // Use actual pages from uploaded files or default to 5 pages
        const totalPages = printConfig.totalPages || printConfig.uploadedFiles?.reduce((sum: number, file: any) => sum + (file.pages || 1), 0) || 5;
        documentPrintingCost += baseRate * totalPages * copies * sideMultiplier;
      }
      
      // Graph sheets cost
      const linearSheets = printConfig.linearSheets || 0;
      const semiLog = printConfig.semiLog || 0;
      documentPrintingCost += (linearSheets + semiLog) * pricingConfig.graphSheetPrice;
      
      // Processing fee
      documentPrintingCost += pricingConfig.processingFee;
    }
    
    // Add UPI processing fee if applicable
    let upiProcessingFee = 0;
    if (method === 'upi' && selectedUpi) {
      const upiApps = [
        { id: 'gpay', processingFee: 0 },
        { id: 'phonepe', processingFee: 0 },
        { id: 'paytm', processingFee: 2 },
        { id: 'bhim', processingFee: 0 }
      ];
      const selectedApp = upiApps.find(app => app.id === selectedUpi);
      upiProcessingFee = selectedApp?.processingFee || 0;
    }
    
    const total = servicePackagePrice + documentPrintingCost + deliveryCharge + upiProcessingFee - discount;

    return {
      servicePackagePrice,
      documentPrintingCost,
      deliveryCharge,
      discount,
      upiProcessingFee,
      total,
      perCopyPrice: basePrice,
      copies
    };
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);

      if (!selectedAddress) {
        alert('Please select a delivery address');
        setProcessing(false);
        return;
      }

      const pricing = calculateTotal();

      // Check wallet balance if payment method is wallet
      if (method === 'wallet') {
        const walletBalance = wallet?.balance || 0;
        if (walletBalance < pricing.total) {
          alert(`Insufficient wallet balance. You have ₹${walletBalance.toFixed(2)} but need ₹${pricing.total.toFixed(2)}`);
          setProcessing(false);
          return;
        }
      }

      if (isAuthenticated) {
        const orderData = {
          items: [{
            productId: printConfig?.productId || 'document-printing',
            productName: `Document Printing - ${selectedPackage.name}`,
            flowType: 'printing' as const,
            businessPrintConfigId: persistedBusinessPrintConfigId,
            quantity: pricing.copies,
            unitPrice: pricing.perCopyPrice,
            totalPrice: pricing.servicePackagePrice,
            customization: {
              printConfig: printConfig || {},
              servicePackage: {
                id: packageId,
                name: selectedPackage.name,
                deliveryTime: selectedPackage.deliveryTime
              }
            }
          }],
          shippingAddress: {
            fullName: selectedAddress.fullName || selectedAddress.label || 'Customer',
            phone: selectedAddress.phone || '',
            line1: selectedAddress.line1 || '',
            line2: selectedAddress.line2 || '',
            city: selectedAddress.city || 'Mumbai',
            state: selectedAddress.state || 'Maharashtra',
            pincode: selectedAddress.pincode || '',
          },
          subtotal: pricing.servicePackagePrice + pricing.documentPrintingCost,
          discount: pricing.discount,
          deliveryCharge: pricing.deliveryCharge,
          total: pricing.total,
          paymentMethod: method,
        };

        // Handle different payment methods
        if (method === 'wallet') {
          // Direct wallet payment
          const response = await orderService.createOrder(orderData);
          const createdOrderId = response.data?.id || response.data?._id || response.id || response._id;
          
          if (createdOrderId) {
            // Clear saved config
            if (configId) {
              localStorage.removeItem(`printConfig_${configId}`);
            }
            navigate(`/payment-success?orderId=${createdOrderId}`);
          } else {
            throw new Error('Order creation failed - no ID returned');
          }
        } else {
          // Razorpay payment for card, UPI, netbanking
          await handleRazorpayPayment(orderData, pricing.total);
        }
      } else {
        alert('Please login to place an order');
        navigate('/');
      }
    } catch (err: any) {
      console.error('Payment failed:', err);
      const errData = err?.response?.data;
      const detail = errData?.errors?.join(', ') || errData?.error?.message || errData?.message || err.message || 'Unknown error';
      alert(`Order creation failed: ${detail}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleRazorpayPayment = async (orderData: any, totalAmount: number) => {
    try {
      // Import payment service dynamically
      const paymentService = (await import('../services/payment.service')).default;
      
      // Create Razorpay order
      const paymentResponse = await paymentService.createPayment({
        orderId: `print_order_${Date.now()}`,
        amount: totalAmount,
        currency: 'INR'
      });

      // Determine payment method preferences for Razorpay
      const paymentMethods: any = {
        upi: method === 'upi',
        card: method === 'card',
        netbanking: method === 'netbanking',
        wallet: false, // Razorpay wallet, not our wallet
        emi: method === 'card',
        paylater: false
      };

      // Open Razorpay checkout
      const checkoutResult = await paymentService.openCheckout({
        keyId: paymentResponse.keyId,
        amount: paymentResponse.amount,
        currency: paymentResponse.currency,
        orderId: paymentResponse.razorpayOrderId,
        name: 'SpeedCopy - Document Printing',
        description: `${selectedPackage.name} Package - Document Printing`,
        ...paymentMethods
      });

      // Verify payment
      await paymentService.verifyPayment(checkoutResult, totalAmount);

      // Create order after successful payment
      const finalOrderData = {
        ...orderData,
        razorpayOrderId: checkoutResult.razorpayOrderId,
        razorpayPaymentId: checkoutResult.razorpayPaymentId,
        razorpaySignature: checkoutResult.razorpaySignature,
        paymentStatus: 'completed'
      };

      const response = await orderService.createOrder(finalOrderData);
      const createdOrderId = response.data?.id || response.data?._id || response.id || response._id;
      
      if (createdOrderId) {
        // Clear saved config
        if (configId) {
          localStorage.removeItem(`printConfig_${configId}`);
        }
        navigate(`/payment-success?orderId=${createdOrderId}&paymentId=${checkoutResult.razorpayPaymentId}`);
      } else {
        throw new Error('Order creation failed after payment - no ID returned');
      }

    } catch (error: any) {
      console.error('Razorpay payment failed:', error);
      if (error.message === 'Payment cancelled by user') {
        alert('Payment was cancelled. You can try again.');
      } else {
        alert(`Payment failed: ${error.message}`);
      }
      throw error;
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl h-96" />
          </div>
        </div>
      </div>
    );
  }

  const pricing = calculateTotal();

  return (
    <>
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left - Payment Methods & Address */}
          <div className="w-full lg:w-1/2">
            {/* Delivery Address Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900 mb-1" style={{ fontSize: '20px' }}>Delivery Address</h2>
                  <p className="text-sm" style={{ color: '#9ca3af' }}>Select where you'd like your prints delivered.</p>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-full hover:bg-gray-700 transition text-sm"
                  style={{ backgroundColor: '#111111' }}
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </div>
              
              {addresses.length > 0 || showAddForm ? (
                <div className="space-y-3 mb-4">
                  {/* Add New Address Form Card */}
                  {showAddForm && (
                    <div className="p-4 rounded-2xl" style={{ border: '2px solid #6366f1', backgroundColor: '#ffffff' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">New Address</h3>
                        <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-gray-100 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <select
                          value={newAddressForm.type}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, type: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Home">Home</option>
                          <option value="Office">Office</option>
                          <option value="Other">Other</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Full Name"
                          value={newAddressForm.name}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, name: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        <input
                          type="text"
                          placeholder="Phone Number"
                          value={newAddressForm.phone}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        <input
                          type="text"
                          placeholder="House No. / Flat No."
                          value={newAddressForm.house}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, house: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        <input
                          type="text"
                          placeholder="Area / Street"
                          value={newAddressForm.area}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, area: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        <input
                          type="text"
                          placeholder="Pincode"
                          value={newAddressForm.pincode}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        <button
                          onClick={handleAddNew}
                          disabled={savingId === 'new'}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {savingId === 'new' ? 'Saving...' : 'Save Address'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Existing Address Cards */}
                  {addresses.map((address, i) => (
                    <div
                      key={address._id || i}
                      className="p-4 rounded-2xl transition"
                      style={{
                        border: editingId === address._id ? '2px solid #6366f1' : (selectedAddress?._id === address._id ? '2px solid #111111' : '1.5px solid #e5e7eb'),
                        backgroundColor: editingId === address._id ? '#ffffff' : (selectedAddress?._id === address._id ? '#fafafa' : '#ffffff'),
                      }}
                    >
                      {editingId === address._id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900">Edit Address</h3>
                            <button onClick={handleCancelEdit} className="p-1 hover:bg-gray-100 rounded">
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <select
                            value={editForm.type}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>

                          <input
                            type="text"
                            placeholder="Full Name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />

                          <input
                            type="text"
                            placeholder="Phone Number"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />

                          <input
                            type="text"
                            placeholder="House No. / Flat No."
                            value={editForm.house}
                            onChange={(e) => setEditForm({ ...editForm, house: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />

                          <input
                            type="text"
                            placeholder="Area / Street"
                            value={editForm.area}
                            onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />

                          <input
                            type="text"
                            placeholder="Pincode"
                            value={editForm.pincode}
                            onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(address._id)}
                              disabled={savingId === address._id}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" />
                              {savingId === address._id ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <button
                          onClick={() => setSelectedAddress(address)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-gray-900">{address.label || address.fullName}</p>
                                {address.label && <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>{address.label}</span>}
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                {address.line1}
                                {address.line2 && <>, {address.line2}</>}
                                <br />
                                {address.city}, {address.state} {address.pincode}
                              </p>
                              <p className="text-xs text-gray-500">📞 {address.phone}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(address);
                                }}
                                className="p-2 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(address._id);
                                }}
                                disabled={deletingId === address._id}
                                className="p-2 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ border: selectedAddress?._id === address._id ? 'none' : '1.5px solid #d1d5db', backgroundColor: selectedAddress?._id === address._id ? '#111111' : 'transparent' }}>
                                {selectedAddress?._id === address._id && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-gray-300 mb-4">
                  <p className="text-gray-500 mb-3">No addresses found</p>
                  <button onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition">
                    Add Address
                  </button>
                </div>
              )}
            </div>

            <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: '24px' }}>Payment Method</h1>
            <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>Select how you'd like to pay for your order.</p>

            {/* Payment Methods */}
            <div className="space-y-3">
              {/* Credit/Debit Card */}
              <div className="rounded-2xl" style={{ border: method === 'card' ? '2px solid #111111' : '1.5px solid #e5e7eb', backgroundColor: method === 'card' ? '#fafafa' : '#ffffff' }}>
                <button onClick={() => setMethod('card')} className="w-full flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                      <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900" style={{ fontSize: '14px' }}>Credit / Debit Card</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>Visa, Mastercard, RuPay</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: method === 'card' ? '#111111' : 'transparent', border: method === 'card' ? 'none' : '1.5px solid #d1d5db' }}>
                    {method === 'card' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>

                {method === 'card' && (
                  <div className="px-5 pb-5">
                    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#16a34a' }}>
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Secure Razorpay Card Payment</p>
                        <p className="text-xs" style={{ color: '#15803d' }}>
                          • PCI DSS compliant secure payment processing<br/>
                          • 256-bit SSL encryption for card details<br/>
                          • Instant payment confirmation for printing orders
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* UPI - Enhanced with app options */}
              <div className="rounded-2xl" style={{ border: method === 'upi' ? '2px solid #111111' : '1.5px solid #e5e7eb', backgroundColor: method === 'upi' ? '#fafafa' : '#ffffff' }}>
                <button onClick={() => setMethod('upi')} className="w-full flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                      <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900" style={{ fontSize: '14px' }}>UPI Options</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>Pay directly from your bank account</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: method === 'upi' ? '#111111' : 'transparent', border: method === 'upi' ? 'none' : '1.5px solid #d1d5db' }}>
                    {method === 'upi' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>

                {method === 'upi' && (
                  <div className="px-5 pb-5">
                    {/* Popular UPI Apps */}
                    <div className="mb-5">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Choose UPI App</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { 
                            id: 'gpay', 
                            label: 'Google Pay', 
                            logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAFyk2Hu-hbJkgcF7nkVkuxTwwYZztsPc_wQ&s',
                            bgColor: '#4285F4',
                            textColor: '#ffffff',
                            processingFee: 0,
                            description: 'No processing fee'
                          },
                          { 
                            id: 'phonepe', 
                            label: 'PhonePe', 
                            logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo4x8kSTmPUq4PFzl4HNT0gObFuEhivHOFYg&s',
                            bgColor: '#5F259F',
                            textColor: '#ffffff',
                            processingFee: 0,
                            description: 'No processing fee'
                          },
                          { 
                            id: 'paytm', 
                            label: 'Paytm', 
                            logo: 'https://play-lh.googleusercontent.com/WDGsMRuVENnZPEpV4DEaXw12qtMY3em85xpmZqcXzeh0iT_eXFtAU9VUj-Z7xNQQd5DMqrkKSs9D0qbI1rlt',
                            bgColor: '#00BAF2',
                            textColor: '#ffffff',
                            processingFee: 2,
                            description: '₹2 processing fee'
                          },
                          { 
                            id: 'bhim', 
                            label: 'BHIM UPI', 
                            logo: 'https://play-lh.googleusercontent.com/B5cNBA15IxjCT-8UTXEWgiPcGkJ1C07iHKwm2Hbs8xR3PnJvZ0swTag3abdC_Fj5OfnP',
                            bgColor: '#FF6900',
                            textColor: '#ffffff',
                            processingFee: 0,
                            description: 'No processing fee'
                          }
                        ].map(app => (
                          <button 
                            key={app.id} 
                            onClick={() => setSelectedUpi(app.id)}
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 hover:scale-105"
                            style={{ 
                              border: selectedUpi === app.id ? '2px solid #111111' : '2px solid #e5e7eb', 
                              backgroundColor: selectedUpi === app.id ? '#f8fafc' : '#ffffff',
                              boxShadow: selectedUpi === app.id ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                          >
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: app.bgColor }}
                            >
                              <img 
                                src={app.logo} 
                                alt={app.label} 
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  // Fallback to text if image fails
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `<span style="color: ${app.textColor}; font-weight: bold; font-size: 12px;">${app.label.charAt(0)}</span>`;
                                  }
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                              {app.label}
                            </span>
                            <span className="text-xs text-center" style={{ 
                              color: app.processingFee > 0 ? '#ef4444' : '#16a34a',
                              fontWeight: '600'
                            }}>
                              {app.description}
                            </span>
                            {selectedUpi === app.id && (
                              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs font-semibold text-gray-400 px-2">OR ENTER UPI ID</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* UPI ID Input */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">UPI ID</label>
                      <div className="relative">
                        <input 
                          value={upiId} 
                          onChange={e => setUpiId(e.target.value)} 
                          placeholder="yourname@paytm / yourname@gpay"
                          className="w-full px-4 py-3 pr-20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          style={{ 
                            border: '2px solid #e5e7eb', 
                            backgroundColor: '#ffffff',
                            color: '#374151'
                          }}
                        />
                        <button 
                          className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold rounded-lg transition hover:bg-gray-100"
                          style={{ color: '#111111' }}
                        >
                          Verify
                        </button>
                      </div>
                      <p className="text-xs mt-2 flex items-center gap-1" style={{ color: '#9ca3af' }}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Your UPI ID is encrypted and secure
                      </p>
                    </div>

                    {/* Payment Info */}
                    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0ea5e9' }}>
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Quick & Secure Payment</p>
                        <p className="text-xs" style={{ color: '#0369a1' }}>
                          • Complete payment on your mobile app within 5 minutes<br/>
                          • No need to enter card details or OTP<br/>
                          • Instant payment confirmation for printing orders<br/>
                          • Powered by Razorpay for maximum security
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Net Banking */}
              <div className="rounded-2xl" style={{ border: method === 'netbanking' ? '2px solid #111111' : '1.5px solid #e5e7eb', backgroundColor: method === 'netbanking' ? '#fafafa' : '#ffffff' }}>
                <button onClick={() => setMethod('netbanking')} className="w-full flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                      <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900" style={{ fontSize: '14px' }}>Net Banking</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>All major banks supported</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: method === 'netbanking' ? '#111111' : 'transparent', border: method === 'netbanking' ? 'none' : '1.5px solid #d1d5db' }}>
                    {method === 'netbanking' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>

                {method === 'netbanking' && (
                  <div className="px-5 pb-5">
                    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: '#fef7ff', border: '1px solid #f3e8ff' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#9333ea' }}>
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Secure Net Banking via Razorpay</p>
                        <p className="text-xs" style={{ color: '#7c3aed' }}>
                          • Direct bank login - no card details needed<br/>
                          • Supports 50+ major Indian banks<br/>
                          • Perfect for document printing payments<br/>
                          • Bank-grade security protocols
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SpeedWallet */}
              <button onClick={() => setMethod('wallet')}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition text-left"
                style={{
                  border: method === 'wallet' ? '2px solid #111111' : '1.5px solid #e5e7eb',
                  backgroundColor: method === 'wallet' ? '#fafafa' : '#ffffff',
                }}>
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                    <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900" style={{ fontSize: '14px' }}>SpeedWallet</p>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>Available Balance: ₹{wallet?.balance || 0}</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: method === 'wallet' ? '#111111' : 'transparent', border: method === 'wallet' ? 'none' : '1.5px solid #d1d5db' }}>
                  {method === 'wallet' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="w-full lg:w-1/2 lg:flex-shrink-0">
            <div className="bg-white rounded-3xl p-6 mb-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <h2 className="font-bold text-gray-900 mb-5" style={{ fontSize: '17px' }}>Order Summary</h2>
              
              {/* Service Package Details */}
              <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{selectedPackage.name} Package</p>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>Ready in {selectedPackage.deliveryTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm line-through" style={{ color: '#9ca3af' }}>₹{selectedPackage.oldPrice.toFixed(2)}</p>
                    <p className="font-bold text-gray-900">₹{selectedPackage.price.toFixed(2)}/copy</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedPackage.features.map((feature, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Print Configuration */}
              {printConfig && (
                <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <p className="font-semibold text-gray-900 mb-2 text-sm">Print Configuration</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {printConfig.copies && <div><span style={{ color: '#9ca3af' }}>Copies:</span> <span className="font-semibold">{printConfig.copies}</span></div>}
                    {printConfig.colorMode && <div><span style={{ color: '#9ca3af' }}>Color:</span> <span className="font-semibold">{printConfig.colorMode}</span></div>}
                    {printConfig.pageSize && <div><span style={{ color: '#9ca3af' }}>Size:</span> <span className="font-semibold">{printConfig.pageSize}</span></div>}
                    {printConfig.printSide && <div><span style={{ color: '#9ca3af' }}>Sides:</span> <span className="font-semibold">{printConfig.printSide}</span></div>}
                    {printConfig.uploadedFiles && printConfig.uploadedFiles.length > 0 && (
                      <div className="col-span-2"><span style={{ color: '#9ca3af' }}>Files:</span> <span className="font-semibold">{printConfig.uploadedFiles.length} files ({printConfig.totalPages || printConfig.uploadedFiles.reduce((sum: number, file: any) => sum + (file.pages || 1), 0)} pages)</span></div>
                    )}
                    {(printConfig.linearSheets > 0 || printConfig.semiLog > 0) && (
                      <div className="col-span-2"><span style={{ color: '#9ca3af' }}>Graph Sheets:</span> <span className="font-semibold">{printConfig.linearSheets + printConfig.semiLog} sheets</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#9ca3af' }}>Document Printing Cost</span>
                  <span className="text-sm font-semibold text-gray-900">₹{pricing.documentPrintingCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#9ca3af' }}>Service Package ({pricing.copies} copies × ₹{pricing.perCopyPrice})</span>
                  <span className="text-sm font-semibold text-gray-900">₹{pricing.servicePackagePrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#9ca3af' }}>Delivery Fee</span>
                  <span className="text-sm font-semibold text-gray-900">₹{pricing.deliveryCharge.toFixed(2)}</span>
                </div>
                {pricing.upiProcessingFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#9ca3af' }}>UPI Processing Fee</span>
                    <span className="text-sm font-semibold text-gray-900">₹{pricing.upiProcessingFee.toFixed(2)}</span>
                  </div>
                )}
                {pricing.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#9ca3af' }}>🏷 Discount</span>
                    <span className="text-sm font-semibold" style={{ color: '#16a34a' }}>-₹{pricing.discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mb-5" style={{ borderTop: '1px solid #f3f4f6' }}>
                <span className="font-bold text-gray-900">Total Payable</span>
                <div className="text-right">
                  <span className="font-bold text-gray-900" style={{ fontSize: '20px' }}>₹{pricing.total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                className="w-full flex items-center justify-center gap-2 py-3.5 text-white font-bold rounded-full hover:bg-gray-700 transition disabled:opacity-50"
                style={{ backgroundColor: '#111111', fontSize: '14px' }}
                onClick={handlePayment}
                disabled={processing}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {processing ? 'Processing Payment...' : 
                  method === 'wallet' ? `Pay ₹${pricing.total.toFixed(2)} from Wallet` :
                  `Pay ₹${pricing.total.toFixed(2)} via Razorpay`
                }
              </button>
              <p className="text-center text-xs mt-3 font-bold tracking-widest" style={{ color: '#9ca3af' }}>
                {method === 'wallet' ? 'SPEEDCOPY WALLET' : 'POWERED BY RAZORPAY'}
              </p>
              <div className="flex items-center justify-center gap-3 mt-2">
                {method === 'wallet' ? (
                  ['INSTANT', 'SECURE', 'ENCRYPTED'].map(t => (
                    <span key={t} className="text-xs" style={{ color: '#9ca3af' }}>{t}</span>
                  ))
                ) : (
                  ['SSL SECURE', 'PCI COMPLIANT', '256-BIT'].map(t => (
                    <span key={t} className="text-xs" style={{ color: '#9ca3af' }}>{t}</span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Payment Processing Modal */}
    {processing && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2" style={{ fontSize: '18px' }}>Processing Payment</h3>
            <p className="text-sm" style={{ color: '#9ca3af' }}>Please wait while we process your payment...</p>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default PrintCheckoutPage;
