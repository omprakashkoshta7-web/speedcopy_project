import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notification.service';

type TabType = 'All' | 'Orders' | 'Rewards' | 'System';

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchNotifications();
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      const notificationsData = response.data?.notifications || response.notifications || [];
      setNotifications(notificationsData);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      // Fallback to local update
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id.toString());
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    } catch (err) {
      console.error('Failed to mark as read:', err);
      // Fallback to local update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600">You need to be logged in to view notifications</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabs: TabType[] = ['All', 'Orders', 'Rewards', 'System'];
  const filtered = activeTab === 'All' ? notifications : notifications.filter(n => n.tab === activeTab);
  const hasUnread = notifications.some(n => n.unread);

  return (
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 px-1">
          <h1 className="font-bold text-gray-900" style={{ fontSize: '26px' }}>Notifications</h1>
          {hasUnread && (
            <button 
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition" 
              style={{ color: '#374151' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark all as read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5 px-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition"
              style={{
                backgroundColor: activeTab === tab ? '#111111' : '#ffffff',
                color: activeTab === tab ? '#ffffff' : '#374151',
                border: activeTab === tab ? 'none' : '1px solid #e5e7eb',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            filtered.map(n => (
              <div
                key={n.id}
                onClick={() => n.unread && handleMarkAsRead(n.id)}
                className="flex items-start gap-4 px-6 py-5 rounded-2xl cursor-pointer hover:shadow-md transition"
                style={{
                  backgroundColor: n.unread ? '#f3f4f6' : '#ffffff',
                  border: '1px solid #f3f4f6',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: n.iconBg }}
                >
                  {n.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-bold text-gray-900" style={{ fontSize: '14px' }}>{n.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{n.time}</span>
                      {n.unread && (
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#111111' }} />
                      )}
                    </div>
                  </div>
                  <p className="mt-1 leading-relaxed" style={{ fontSize: '13px', color: '#6b7280' }}>{n.desc}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
