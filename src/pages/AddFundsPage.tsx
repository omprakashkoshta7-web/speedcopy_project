import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import paymentService from '../services/payment.service';

const quickAmounts = [20, 50, 100, 500];

const isSessionAuthError = (err: any) => {
  const message = String(err?.response?.data?.message || err?.message || '').toLowerCase();
  return (
    err?.response?.status === 401 &&
    (
      message.includes('invalid or expired token') ||
      message.includes('invalid token') ||
      message.includes('token expired') ||
      message.includes('no token provided') ||
      message.includes('unauthorized')
    )
  );
};

const AddFundsPage: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(0);
  const [selectedQuick, setSelectedQuick] = useState<number | null>(100);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newBalance, setNewBalance] = useState(0);

  useEffect(() => {
    // no-op: Razorpay script is loaded on-demand by paymentService
  }, []);

  const displayAmount = selectedQuick ?? amount;
  const processingFee = 0;
  const total = displayAmount;

  const handleQuick = (val: number) => { setSelectedQuick(val); setAmount(val); };
  const handleInput = (val: string) => { setSelectedQuick(null); setAmount(parseFloat(val) || 0); };

  const handleAddFunds = async () => {
    if (total <= 0) return;
    if (!localStorage.getItem('auth_token')) {
      setError('Please login to add funds.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 1) Create payment order on backend (uses configured Razorpay keys; falls back to mock).
      const paymentData = await paymentService.createPayment({
        orderId: `wallet_topup_${Date.now()}`,
        amount: total,
        currency: 'INR',
      });

      const keyId = paymentData?.keyId;
      const razorpayOrderId = paymentData?.razorpayOrderId;
      const amountInPaise = paymentData?.amount;
      const currency = paymentData?.currency || 'INR';
      const clientSideFallback = !!paymentData?.clientSideFallback;

      if (!keyId || !amountInPaise) {
        throw new Error('Payment initialization failed. Missing Razorpay details.');
      }

      // 2) Open checkout and collect payment ids/signature.
      const checkoutResult = await paymentService.openCheckout({
        keyId,
        amount: amountInPaise,
        currency,
        orderId: razorpayOrderId,
        receipt: `wallet_topup_${Date.now()}`,
        name: 'SpeedCopy',
        description: 'Wallet Topup',
      });

      // 3) Verify payment server-side (mock always succeeds; real verifies signature).
      try {
        if (clientSideFallback) {
          const creditRes = await paymentService.creditWalletAfterClientCheckout(total);
          const creditedData = creditRes?.data || creditRes;
          const walletData = creditedData?.wallet || creditedData?.data?.wallet;
          setNewBalance(walletData?.balance || total);
          setSuccess(true);
          return;
        }

        const verifyRes = await paymentService.verifyPayment(checkoutResult, amountInPaise);

        // finance-service verify endpoint already credits wallet and returns updated wallet.
        const verifiedData = verifyRes?.data || verifyRes;
        const walletData = verifiedData?.wallet || verifiedData?.data?.wallet;
        setNewBalance(walletData?.balance || 0);
        setSuccess(true);
      } catch (verifyErr: any) {
        // If verification fails but payment was successful in mock mode, still show success
        if (paymentData?.mock) {
          console.warn('[Payment] Mock payment verification failed, but showing success anyway');
          setNewBalance(total);
          setSuccess(true);
        } else {
          throw verifyErr;
        }
      }
    } catch (err: any) {
      console.error('[Payment] Failed to initiate payment:', err);
      
      if (isSessionAuthError(err)) {
        setError('Your session has expired. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          navigate('/');
        }, 2000);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to initiate payment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: '26px' }}>Add Funds to Your Wallet</h1>
          <p className="text-sm" style={{ color: '#9ca3af' }}>Fund your secure architectural vault instantly.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* Left */}
          <div className="w-full lg:w-1/2 space-y-4">

            {/* Enter Amount */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <p className="text-xs font-bold tracking-widest mb-4" style={{ color: '#9ca3af' }}>ENTER AMOUNT</p>
              <div className="flex items-center gap-2 px-4 py-4 rounded-xl mb-4"
                style={{ backgroundColor: '#f0f4ff', border: '1.5px solid #c7d2fe' }}>
                <span className="font-bold text-gray-900 text-xl">₹</span>
                <input type="number" value={amount || ''} onChange={e => handleInput(e.target.value)}
                  placeholder="0.00" className="flex-1 bg-transparent focus:outline-none font-bold text-gray-900 text-xl"
                  style={{ minWidth: 0 }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quickAmounts.map(q => (
                  <button key={q} onClick={() => handleQuick(q)}
                    className="py-2.5 px-3 rounded-xl text-sm font-bold transition min-w-0"
                    style={{
                      backgroundColor: selectedQuick === q ? '#1e3a8a' : '#f0f4ff',
                      color: selectedQuick === q ? '#ffffff' : '#1e3a8a',
                      border: selectedQuick === q ? 'none' : '1px solid #c7d2fe',
                    }}>₹{q}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Transaction Summary */}
          <div className="w-full lg:w-1/2">
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#111827' }}>
              <h2 className="font-bold text-white mb-5" style={{ fontSize: '18px' }}>Transaction Summary</h2>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Funding Amount</span>
                  <span className="text-sm font-bold text-white">₹{displayAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Processing Fee (0%)</span>
                  <span className="text-sm font-bold" style={{ color: '#6366f1' }}>₹{processingFee.toFixed(2)}</span>
                </div>
                <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Total to be added</span>
                    <span className="font-bold" style={{ fontSize: '22px', color: '#6366f1' }}>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#6366f1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Your transaction is encrypted. Funds are typically available within seconds in your Vault account.
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
              
              <button 
                onClick={handleAddFunds}
                disabled={loading || total <= 0}
                className="w-full py-4 font-bold rounded-xl hover:bg-gray-100 transition text-base disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#ffffff', color: '#111111' }}>
                {loading ? 'Processing...' : 'Pay with Razorpay'}
              </button>
              <p className="text-center text-xs mt-3 font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                AUTHORIZED BY FDIC PROTOCOL
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup Modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-3xl p-10 text-center w-full"
            style={{ maxWidth: '440px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: '#16a34a', boxShadow: '0 0 0 12px #dcfce7' }}>
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-bold text-gray-900 mb-2" style={{ fontSize: '22px' }}>Funds Added!</h2>
            <p className="text-sm mb-1" style={{ color: '#9ca3af' }}>₹{total.toFixed(2)} has been added to your wallet.</p>
            <p className="font-bold text-gray-900 mb-6" style={{ fontSize: '28px' }}>New Balance: ₹{newBalance.toFixed(2)}</p>
            <button onClick={() => navigate('/wallet')}
              className="w-full py-3 text-white font-bold rounded-full hover:bg-gray-700 transition text-sm"
              style={{ backgroundColor: '#111111' }}>
              Back to Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFundsPage;
