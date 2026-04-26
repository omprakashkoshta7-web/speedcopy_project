import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import userService from '../services/user.service';
import { Edit2, Trash2, Save, X, Plus } from 'lucide-react';

const AddressPage: React.FC = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchAddresses();
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await userService.getAddresses();
      const addressesData = response.data?.addresses || response.addresses || response.data || [];
      setAddresses(Array.isArray(addressesData) ? addressesData : []);
    } catch (err: any) {
      console.error('Failed to fetch addresses:', err);
      setAddresses([]);
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
      setAddresses(addresses.map(a => a._id === id ? { ...a, ...formattedAddress } : a));
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
      setAddresses(addresses.filter(a => a._id !== id));
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
      await fetchAddresses();
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

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to manage addresses</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-8 px-1 gap-4">
          <div>
            <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: '28px' }}>Saved Addresses</h1>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Manage your shipping and billing locations for faster checkout.</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-5 py-3 text-white font-bold rounded-full hover:bg-gray-700 transition"
            style={{ backgroundColor: '#111111', fontSize: '14px' }}
          >
            <Plus className="w-4 h-4" />
            Add New Address
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Add New Address Form Card */}
          {showAddForm && (
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '2px solid #111111' }}>
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />

                <input
                  type="text"
                  placeholder="Phone Number"
                  value={newAddressForm.phone}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />

                <input
                  type="text"
                  placeholder="House No. / Flat No."
                  value={newAddressForm.house}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, house: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />

                <input
                  type="text"
                  placeholder="Area / Street"
                  value={newAddressForm.area}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, area: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />

                <input
                  type="text"
                  placeholder="Pincode"
                  value={newAddressForm.pincode}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />

                <button
                  onClick={handleAddNew}
                  disabled={savingId === 'new'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingId === 'new' ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </div>
          )}

          {/* Existing Address Cards */}
          {addresses.map((addr: any) => (
            <div key={addr._id} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: editingId === addr._id ? '2px solid #111111' : '1px solid #f3f4f6' }}>
              {editingId === addr._id ? (
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />

                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />

                  <input
                    type="text"
                    placeholder="House No. / Flat No."
                    value={editForm.house}
                    onChange={(e) => setEditForm({ ...editForm, house: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />

                  <input
                    type="text"
                    placeholder="Area / Street"
                    value={editForm.area}
                    onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />

                  <input
                    type="text"
                    placeholder="Pincode"
                    value={editForm.pincode}
                    onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(addr._id)}
                      disabled={savingId === addr._id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {savingId === addr._id ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                      <svg className="w-5 h-5" style={{ color: '#6366f1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900" style={{ fontSize: '15px' }}>{addr.fullName || addr.name}</p>
                      {addr.label && <p className="text-xs" style={{ color: '#9ca3af' }}>{addr.label}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(addr)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(addr._id)}
                        disabled={deletingId === addr._id}
                        className="p-2 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="text-sm" style={{ color: '#6b7280', lineHeight: '1.7' }}>
                      {addr.line1 || `${addr.houseNo || addr.house}, ${addr.area}`}
                    </p>
                    {addr.line2 && <p className="text-sm" style={{ color: '#6b7280', lineHeight: '1.7' }}>{addr.line2}</p>}
                    <p className="text-sm" style={{ color: '#6b7280', lineHeight: '1.7' }}>
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #f3f4f6' }}>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" style={{ color: '#6366f1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-xs font-medium" style={{ color: '#6b7280' }}>{addr.phone}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddressPage;
