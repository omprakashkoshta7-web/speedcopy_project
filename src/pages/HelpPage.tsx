import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ticketService from '../services/ticket.service';

type TabType = 'FAQs' | 'My Tickets';

const categories = [
  {
    icon: (
      <svg className="w-6 h-6" style={{ color: '#374151' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zM13 8h4l3 3v5h-7V8z" />
      </svg>
    ),
    title: 'Order Tracking',
    desc: 'Check your order status, track shipments, and manage delivery preferences in real-time.',
    route: '/faq/order-tracking',
  },
  {
    icon: (
      <svg className="w-6 h-6" style={{ color: '#374151' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Payments & Refunds',
    desc: 'Manage your billing information, view invoices, or request a refund for eligible orders.',
    route: '/faq/payments',
  },
  {
    icon: (
      <svg className="w-6 h-6" style={{ color: '#374151' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Technical Support',
    desc: 'Experiencing issues with our editor? Get help with design tools, file uploads, and formatting.',
    route: '/faq/technical-support',
  },
];

const tabs: TabType[] = ['FAQs', 'My Tickets'];

const HelpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('FAQs');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'My Tickets') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getMyTickets();
      setTickets(response.data || response.tickets || []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Hero Banner */}
        <div
          className="rounded-2xl sm:rounded-3xl px-4 sm:px-8 py-8 sm:py-16 text-center mb-6"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)' }}
        >
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 rounded-full mb-4 sm:mb-5"
            style={{ border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-white text-xs font-bold tracking-widest uppercase">SPEEDCOPY HELP CENTER</p>
          </div>
          <h1 className="font-bold text-white mb-3 sm:mb-4 text-2xl sm:text-4xl lg:text-5xl">How can we help you?</h1>
          <p className="text-white/80 text-sm sm:text-base max-w-lg mx-auto leading-relaxed px-2">
            Search our knowledge base or browse categories below to find answers to your questions.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6 bg-white rounded-2xl px-4 sm:px-6 py-1" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="py-3 sm:py-4 text-xs sm:text-sm font-semibold transition relative"
              style={{ color: activeTab === tab ? '#111111' : '#9ca3af' }}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: '#111111' }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'FAQs' && (
          <>
            {/* Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {categories.map(cat => (
                <div 
                  key={cat.title} 
                  onClick={() => navigate(cat.route)}
                  className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition" 
                  style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#f3f4f6' }}>
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2" style={{ fontSize: '15px' }}>{cat.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>{cat.desc}</p>
                </div>
              ))}
            </div>

            {/* Immediate Help Banner */}
            <div className="rounded-2xl px-4 sm:px-7 py-6 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#111111' }}>
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3c-1.1 0-2 .9-2 2v14l4-4h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-white text-base sm:text-lg">Need Immediate Help?</p>
                  <p className="text-white text-xs sm:text-sm mt-1" style={{ opacity: 0.9 }}>Our support champions are available 24/7. Connect via live chat for a quick resolution to any of your queries.</p>
                </div>
              </div>
              <button onClick={() => navigate('/support/ticket')}
                className="w-full sm:w-auto flex-shrink-0 px-6 sm:px-7 py-3 sm:py-3.5 font-bold rounded-xl hover:bg-gray-700 transition text-sm"
                style={{ backgroundColor: '#111111', color: '#fff', minHeight: '44px' }}>
                Raise a Ticket
              </button>
            </div>
          </>
        )}

        {activeTab === 'My Tickets' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-5 gap-2">
              <h2 className="font-bold text-gray-900 text-sm sm:text-base">My Support Tickets</h2>
              <button onClick={() => navigate('/support/ticket')}
                className="px-3 sm:px-4 py-2 text-white font-bold rounded-full text-xs hover:bg-gray-700 transition whitespace-nowrap"
                style={{ backgroundColor: '#111111', minHeight: '44px' }}>
                + New Ticket
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No support tickets yet</p>
              </div>
            ) : (
              <>
                <div className="hidden xl:block">
                  <div className="grid px-3 pb-3 mb-1" style={{ gridTemplateColumns: '1fr 2.5fr 1.2fr 1.2fr 0.6fr', borderBottom: '1px solid #f3f4f6' }}>
                    {['TICKET ID', 'SUBJECT', 'STATUS', 'LAST UPDATE', 'ACTION'].map((h, i) => (
                      <p key={h} className={`text-xs font-bold tracking-widest ${i === 4 ? 'text-right' : ''}`} style={{ color: '#9ca3af' }}>{h}</p>
                    ))}
                  </div>
                  {tickets.map((t, idx) => (
                    <div key={t.id} className="grid items-center px-3 py-4 rounded-xl hover:bg-gray-50 transition"
                      style={{ gridTemplateColumns: '1fr 2.5fr 1.2fr 1.2fr 0.6fr', borderBottom: idx < tickets.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                      <p className="font-bold text-gray-800" style={{ fontSize: '13px' }}>{t.id}</p>
                      <p className="text-sm text-gray-700">{t.subject}</p>
                      <div><span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: t.statusBg, color: t.statusColor }}>{t.status}</span></div>
                      <p className="text-sm" style={{ color: '#9ca3af' }}>{t.date}</p>
                      <div className="text-right">
                        <button onClick={() => navigate('/support/ticket')} className="text-sm font-bold hover:opacity-60 transition" style={{ color: '#374151' }}>View</button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Mobile Cards */}
                <div className="xl:hidden space-y-3">
                  {tickets.map((t) => (
                    <div key={t.id} className="border rounded-xl p-4" style={{ borderColor: '#f3f4f6' }}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-800 text-sm mb-1">{t.id}</p>
                          <p className="text-sm text-gray-700">{t.subject}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{ backgroundColor: t.statusBg, color: t.statusColor }}>{t.status}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                        <p className="text-xs" style={{ color: '#9ca3af' }}>{t.date}</p>
                        <button onClick={() => navigate('/support/ticket')} className="text-sm font-bold hover:opacity-60 transition" style={{ color: '#374151', minHeight: '44px', padding: '8px 16px' }}>View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Recent Support Tickets - only on FAQs tab */}
        {activeTab === 'FAQs' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-5 gap-2">
              <h2 className="font-bold text-gray-900 text-sm sm:text-base">Recent Support Tickets</h2>
              <button onClick={() => setActiveTab('My Tickets')} className="text-xs sm:text-sm font-semibold hover:opacity-70 transition whitespace-nowrap" style={{ color: '#6366f1' }}>View All History</button>
            </div>
            {/* Desktop Table */}
            <div className="hidden xl:block">
              <div className="grid px-3 pb-3 mb-1" style={{ gridTemplateColumns: '1fr 2.5fr 1.2fr 1.2fr 0.6fr', borderBottom: '1px solid #f3f4f6' }}>
                {['TICKET ID', 'SUBJECT', 'STATUS', 'LAST UPDATE', 'ACTION'].map((h, i) => (
                  <p key={h} className={`text-xs font-bold tracking-widest ${i === 4 ? 'text-right' : ''}`} style={{ color: '#9ca3af' }}>{h}</p>
                ))}
              </div>
              {tickets.map((t, idx) => (
                <div key={t.id} className="grid items-center px-3 py-4 rounded-xl hover:bg-gray-50 transition"
                  style={{ gridTemplateColumns: '1fr 2.5fr 1.2fr 1.2fr 0.6fr', borderBottom: idx < tickets.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <p className="font-bold text-gray-800" style={{ fontSize: '13px' }}>{t.id}</p>
                  <p className="text-sm text-gray-700">{t.subject}</p>
                  <div><span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: t.statusBg, color: t.statusColor }}>{t.status}</span></div>
                  <p className="text-sm" style={{ color: '#9ca3af' }}>{t.date}</p>
                  <div className="text-right">
                    <button className="text-sm font-bold hover:opacity-60 transition" style={{ color: '#374151' }}>View</button>
                  </div>
                </div>
              ))}
            </div>
            {/* Mobile Cards */}
            <div className="xl:hidden space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="border rounded-xl p-4" style={{ borderColor: '#f3f4f6' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800 text-sm mb-1">{t.id}</p>
                      <p className="text-sm text-gray-700">{t.subject}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{ backgroundColor: t.statusBg, color: t.statusColor }}>{t.status}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>{t.date}</p>
                    <button className="text-sm font-bold hover:opacity-60 transition" style={{ color: '#374151', minHeight: '44px', padding: '8px 16px' }}>View</button>
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

export default HelpPage;




