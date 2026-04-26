import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import productService from '../services/product.service';

const PrintTypeModal: React.FC<{ onClose: () => void; printTypes: any[] }> = ({ onClose, printTypes }) => {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'document':
        return (
          <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'book':
        return (
          <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'spiral':
        return (
          <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M9 3v18" />
          </svg>
        );
      case 'thesis':
      case 'graduation':
        return (
          <svg className="w-7 h-7 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: '#000000' }}
      onClick={onClose}
    >
      <div
        className="w-full"
        style={{ maxWidth: '540px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 2x2 Grid - no white wrapper, cards directly on black */}
        <div className="grid grid-cols-2 gap-3">
          {printTypes.map((pt: any) => (
            <button
              key={pt.id || pt.label}
              className="flex flex-col items-center justify-center py-10 px-6 rounded-3xl hover:bg-gray-50 transition text-center bg-white"
              style={{ border: '1.5px solid #e5e7eb' }}
              onClick={onClose}
            >
              {/* Icon circle */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ backgroundColor: '#f3f4f6' }}
              >
                {getIcon(pt.icon)}
              </div>
              <p className="font-bold text-gray-900 mb-1.5" style={{ fontSize: '17px' }}>{pt.name || pt.label}</p>
              <p className="text-sm text-center" style={{ color: '#9ca3af' }}>{pt.description || pt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const PrintingPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [printTypes, setPrintTypes] = useState<any[]>([]);

  const fetchPrintTypes = async () => {
    try {
      const response = await productService.getPrintingDocumentTypes();
      setPrintTypes(response.data || []);
    } catch (err) {
      console.error('Failed to fetch print types:', err);
      // Fallback to hardcoded data if API fails
      setPrintTypes([
        { label: 'Standard Printing', desc: 'Perfect for reports & essays', icon: 'document' },
        { label: 'Soft Binding', desc: 'Clean professional look', icon: 'book' },
        { label: 'Spiral Binding', desc: 'Durable & easy to flip', icon: 'spiral' },
        { label: 'Thesis Binding', desc: 'Official university standard', icon: 'thesis' },
      ]);
    }
  };

  useEffect(() => {
    fetchPrintTypes();
  }, []);

  return (
    <div style={{ backgroundColor: '#eaecf0', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="font-bold text-gray-900 leading-tight mb-3" style={{ fontSize: '42px' }}>
            What would you like to{' '}
            <span style={{ color: '#2bb5b8' }}>print</span>
            <br />today?
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '15px' }}>
            Select a category below to customize your high-quality prints.
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-2 gap-6 mb-10">

          {/* Document Printing */}
          <div
            className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition group"
            style={{ border: '1px solid #f3f4f6' }}
          >
            <div 
              className="relative" 
              style={{ height: '220px' }}
              onClick={() => setShowModal(true)}
            >
              <img
                src="https://images.unsplash.com/photo-1568667256549-094345857637?w=700&q=80"
                alt="Document Printing"
                decoding="async"
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#3b82f6' }}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              {/* Hover overlay with quick action buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                  className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Choose Type
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = '/print-checkout?package=express';
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Quick Print
                </button>
              </div>
            </div>
            <div className="p-4 bg-white">
              <h2 className="font-bold text-gray-900 mb-2" style={{ fontSize: '17px' }}>Document Printing</h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#6b7280' }}>
                Resumes, essays, flyers, and personal documents. Perfect for students and home offices.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-gray-400">Starting from</span>
                  <span className="font-bold text-gray-900 text-sm">₹5.00</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-gray-400">Razorpay Secure</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Razorpay Payment Security Section for Document Printing */}
        <div className="bg-white rounded-3xl p-8 text-center mb-10" style={{ border: '1px solid #e5e7eb' }}>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2">Secure Document Printing Payments</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-2xl mx-auto">
            Print your important documents with confidence using India's most trusted payment gateway. Fast, secure, and reliable.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center p-4 rounded-xl bg-blue-50">
              <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs font-semibold text-gray-700">Credit/Debit Cards</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-green-50">
              <svg className="w-8 h-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-semibold text-gray-700">UPI Payments</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-purple-50">
              <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <span className="text-xs font-semibold text-gray-700">Net Banking</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-orange-50">
              <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs font-semibold text-gray-700">Digital Wallets</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Fast Printing
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Secure Payment
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Delivery
            </div>
          </div>

          <button 
            onClick={() => setShowModal(true)} 
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full text-sm hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Start Printing Now
          </button>
        </div>
      </div>

      <Footer />

      {showModal && <PrintTypeModal onClose={() => setShowModal(false)} printTypes={printTypes} />}
    </div>
  );
};

export default PrintingPage;
