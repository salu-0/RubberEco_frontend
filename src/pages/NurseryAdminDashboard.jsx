import React, { useState, useEffect } from 'react';
import toastService from '../services/toastService';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  CubeIcon, 
  CurrencyDollarIcon, 
  TruckIcon,
  CreditCardIcon,
  UserGroupIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const NurseryAdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalPlants: 0,
    totalStock: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0
  });
  const [plants, setPlants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('nurseryAdminToken');
    const storedUser = localStorage.getItem('nurseryAdminUser');
    
    if (!token) {
      navigate('/nursery-admin/login');
      return;
    }
    
    // Use stored user data first, then fetch from API for updated data
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('✅ Using stored nursery admin user data:', userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
    
    fetchUserProfile();
    fetchDashboardStats();
    fetchPlants();
    fetchBookings();
    fetchShipments();
    fetchPayments();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('nurseryAdminToken');
      const response = await fetch(`${API_BASE_URL}/nursery-admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        // Update localStorage with fresh data
        localStorage.setItem('nurseryAdminUser', JSON.stringify(data.data));
        console.log('✅ Updated nursery admin user data from API:', data.data);
      } else {
        console.warn('⚠️ Failed to fetch profile from API, using stored data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      console.warn('⚠️ Using stored user data due to API error');
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('nurseryAdminToken');
      const response = await fetch(`${API_BASE_URL}/nursery-admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem('nurseryAdminToken');
      console.log('🌱 Fetching plants with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`${API_BASE_URL}/nursery-admin/plants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🌱 Plants API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🌱 Plants data received:', data);
        setPlants(data.data);
      } else {
        const errorData = await response.json();
        console.error('🌱 Plants API error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('nurseryAdminToken');
      const response = await fetch(`${API_BASE_URL}/nursery-admin/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchShipments = async () => {
    try {
      const token = localStorage.getItem('nurseryAdminToken');
      const response = await fetch(`${API_BASE_URL}/nursery-admin/shipments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setShipments(data.data.shipments);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('nurseryAdminToken');
      const response = await fetch(`${API_BASE_URL}/nursery-admin/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleLogout = () => {
    // Clear all nursery admin authentication data
    localStorage.removeItem('nurseryAdminToken');
    localStorage.removeItem('nurseryAdminUser');
    // Also clear any regular user tokens to ensure clean logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const updatePlant = async (plantId, updateData) => {
    try {
      const token = localStorage.getItem('nurseryAdminToken');
      const response = await fetch(`${API_BASE_URL}/nursery-admin/plants/${plantId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        // Update local UI immediately with the new values (optimistic),
        // and also refresh in the background to keep things consistent
        const result = await response.json().catch(() => null);
        if (result && result.data && result.data._id) {
          const updated = result.data;
          setPlants(prev => prev.map(p => p._id === updated._id ? { ...p, ...updated } : p));
        } else {
          // If backend didn't return the updated doc, fall back to merging updateData
          setPlants(prev => prev.map(p => p._id === plantId ? { ...p, ...updateData } : p));
        }
        // Background refresh to ensure any server-side computed fields are in sync
        fetchPlants();
        toastService.success('Plant updated successfully');
        return true;
      }
      const errorBody = await response.json().catch(() => ({}));
      toastService.error(errorBody.message || 'Failed to update plant');
      return false;
    } catch (error) {
      console.error('Error updating plant:', error);
      toastService.error('Network error while updating plant');
      return false;
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('nurseryAdminToken');
      const response = await fetch(`${API_BASE_URL}/nursery-admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        fetchBookings(); // Refresh bookings list
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <CubeIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nursery Admin Dashboard</h1>
                <p className="text-sm text-gray-500">{user?.nurseryCenterName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name || 'Admin'}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
              { id: 'plants', name: 'Plant Management', icon: CubeIcon },
              { id: 'bookings', name: 'Bookings', icon: UserGroupIcon },
              { id: 'shipments', name: 'Shipments', icon: TruckIcon },
              { id: 'payments', name: 'Payments', icon: CreditCardIcon },
              { id: 'settings', name: 'Settings', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <CubeIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Plants</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalPlants}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Stock</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalStock}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
              </div>
              <div className="p-6">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{booking.farmerName}</p>
                      <p className="text-sm text-gray-500">{booking.plantName} - Qty: {booking.quantity}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">₹{booking.amountTotal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Plants Tab */}
        {activeTab === 'plants' && (
          <PlantManagement 
            plants={plants} 
            onUpdatePlant={updatePlant}
            onRefresh={fetchPlants}
          />
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <BookingManagement 
            bookings={bookings} 
            onUpdateStatus={updateBookingStatus}
            onRefresh={fetchBookings}
          />
        )}

        {/* Shipments Tab */}
        {activeTab === 'shipments' && (
          <ShipmentManagement 
            shipments={shipments} 
            bookings={bookings}
            onRefresh={fetchShipments}
          />
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <PaymentManagement 
            payments={payments} 
            onRefresh={fetchPayments}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Settings user={user} onUpdateProfile={fetchUserProfile} />
        )}
      </div>
    </div>
  );
};

// Plant Management Component
const PlantManagement = ({ plants, onUpdatePlant, onRefresh }) => {
  const [editingPlant, setEditingPlant] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  console.log('🌱 PlantManagement received plants:', plants);

  const handleEdit = (plant) => {
    setEditingPlant(plant._id);
    setEditForm({
      stockAvailable: plant.stockAvailable,
      unitPrice: plant.unitPrice,
      name: plant.name,
      description: plant.description,
      features: plant.features
    });
  };

  const handleSave = async (plantId) => {
    if (saving) return;
    // Defensive check: ensure this plant is part of current list
    if (!plants || !plants.some(p => p._id === plantId)) {
      toastService.error('This plant is not available in your current list. Refresh and try again.');
      return;
    }
    setSaving(true);
    const payload = {
      ...editForm,
      // Ensure numeric fields are numbers
      stockAvailable: editForm.stockAvailable !== undefined && editForm.stockAvailable !== ''
        ? Number(editForm.stockAvailable)
        : undefined,
      unitPrice: editForm.unitPrice !== undefined && editForm.unitPrice !== ''
        ? Number(editForm.unitPrice)
        : undefined
    };
    const success = await onUpdatePlant(plantId, payload);
    if (success) {
      setEditingPlant(null);
      setEditForm({});
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditingPlant(null);
    setEditForm({});
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Plant Management</h3>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 shadow-sm"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-gradient-to-b from-white to-gray-50">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-emerald-50 to-teal-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Plant</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {plants.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <CubeIcon className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No plants found</p>
                    <p className="text-sm">Plants will appear here once they are added to your nursery center.</p>
                  </div>
                </td>
              </tr>
            ) : (
              plants.map((plant, idx) => (
              <tr
                key={plant._id}
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} hover:bg-emerald-50/70 transition-colors`}
              >
                <td className="px-6 py-4 whitespace-nowrap align-top">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {editingPlant === plant._id ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        plant.name
                      )}
                    </div>
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">{plant.variety}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-top">
                  {editingPlant === plant._id ? (
                    <div className="w-28">
                      <input
                        type="number"
                        inputMode="numeric"
                        step="1"
                        min="0"
                        value={editForm.stockAvailable ?? ''}
                        onChange={(e) => setEditForm({...editForm, stockAvailable: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">{plant.stockAvailable}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-top">
                  {editingPlant === plant._id ? (
                    <div className="w-36 flex items-stretch">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={editForm.unitPrice ?? ''}
                        onChange={(e) => setEditForm({...editForm, unitPrice: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">₹{plant.unitPrice}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingPlant === plant._id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(plant._id)}
                        disabled={saving}
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-white text-xs font-medium ${saving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} shadow-sm`}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-gray-700 text-xs font-medium bg-gray-100 hover:bg-gray-200 shadow-sm ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(plant)}
                      className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 shadow-sm hover:shadow md:transition md:duration-200 ring-1 ring-orange-400/60 hover:ring-orange-500"
                    >
                      ✎ Edit
                    </button>
                  )}
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Booking Management Component
const BookingManagement = ({ bookings, onUpdateStatus, onRefresh }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    const success = await onUpdateStatus(bookingId, newStatus);
    if (success) {
      // Status updated successfully
    }
  };

  const openDetails = (b) => {
    setSelected(b);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelected(null);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Booking Management</h3>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{booking.farmerName}</div>
                    <div className="text-sm text-gray-500">{booking.farmerEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.plantName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">₹{booking.amountTotal}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => openDetails(booking)}
                      className="px-3 py-1.5 rounded-md text-white text-xs font-medium bg-blue-600 hover:bg-blue-700"
                    >
                      View
                    </button>
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'approved')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {booking.status === 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detailsOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeDetails} />
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
              <button onClick={closeDetails} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500">Farmer</div>
                  <div className="font-semibold">{selected.farmerName}</div>
                  <div className="text-gray-600">{selected.farmerEmail}</div>
                </div>
                <div>
                  <div className="text-gray-500">Nursery Center</div>
                  <div className="font-semibold">{selected.nurseryCenterName || selected?.nurseryCenterId?.name || 'N/A'}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-500">Plant</div>
                  <div className="font-semibold">{selected.plantName}</div>
                </div>
                <div>
                  <div className="text-gray-500">Quantity</div>
                  <div className="font-semibold">{selected.quantity}</div>
                </div>
                <div>
                  <div className="text-gray-500">Total</div>
                  <div className="font-semibold">₹{selected.amountTotal}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500">Advance</div>
                  <div className="font-semibold">{selected.advancePercent}% {selected?.payment?.advancePaid ? 'Paid' : 'Unpaid'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Status</div>
                  <div className="font-semibold capitalize">{selected.status}</div>
                </div>
              </div>
              {selected?.payment?.advancePaymentId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-500">Payment ID</div>
                    <div className="font-mono text-xs">{selected.payment.advancePaymentId}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Order ID</div>
                    <div className="font-mono text-xs">{selected.payment.advanceOrderId || '-'}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium" onClick={closeDetails}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Shipment Management Component
const ShipmentManagement = ({ shipments, bookings, onRefresh }) => {
  const updateShipmentStatus = async (shipmentId, status) => {
    try {
      const token = localStorage.getItem('nurseryAdminToken');
      const response = await fetch(`${API_BASE_URL}/nursery-admin/shipments/${shipmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        onRefresh();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating shipment status:', error);
      return false;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Shipment Management</h3>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shipments.map((shipment) => (
              <tr key={shipment._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {shipment.shipmentDetails?.trackingNumber || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Fee: ₹{shipment.shipmentDetails?.shippingCost ?? 0}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{shipment.farmerName}</div>
                    <div className="text-sm text-gray-500">{shipment.farmerEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{shipment.plantDetails?.plantName}</div>
                  <div className="text-sm text-gray-500">Qty: {shipment.plantDetails?.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {(() => {
                      // Try to infer route from booking notes or address city
                      const src = (bookings?.find(b => String(b._id) === String(shipment.bookingId))?.nurseryCenterName) || 'Origin';
                      const dest = shipment.shippingAddress?.city || shipment.shippingAddress?.district || '-';
                      return `${src} → ${dest}`;
                    })()}
                  </div>
                  {shipment.shippingAddress?.city && (
                    <div className="text-xs text-gray-500">To: {shipment.shippingAddress.city}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{shipment.shipmentDetails?.carrier}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    shipment.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                    shipment.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    shipment.status === 'in_transit' ? 'bg-purple-100 text-purple-800' :
                    shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {shipment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {shipment.status === 'preparing' && (
                    <button
                      onClick={() => updateShipmentStatus(shipment._id, 'shipped')}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Mark Shipped
                    </button>
                  )}
                  {shipment.status === 'shipped' && (
                    <button
                      onClick={() => updateShipmentStatus(shipment._id, 'in_transit')}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      In Transit
                    </button>
                  )}
                  {shipment.status === 'in_transit' && (
                    <button
                      onClick={() => updateShipmentStatus(shipment._id, 'delivered')}
                      className="text-green-600 hover:text-green-900"
                    >
                      Mark Delivered
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Payment Management Component
const PaymentManagement = ({ payments, onRefresh }) => {
  const updatePaymentStatus = async (paymentId, status) => {
    try {
      const token = localStorage.getItem('nurseryAdminToken');
      const response = await fetch(`${API_BASE_URL}/nursery-admin/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        onRefresh();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Payment Management</h3>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {payment.gatewayDetails?.transactionId || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{payment.farmerName}</div>
                    <div className="text-sm text-gray-500">{payment.farmerEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">₹{payment.amount}</div>
                  <div className="text-sm text-gray-500">{payment.paymentType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{payment.paymentMethod}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    payment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    payment.paymentStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                    payment.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                    payment.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {payment.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {payment.paymentStatus === 'pending' && (
                    <button
                      onClick={() => updatePaymentStatus(payment._id, 'processing')}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Process
                    </button>
                  )}
                  {payment.paymentStatus === 'processing' && (
                    <button
                      onClick={() => updatePaymentStatus(payment._id, 'completed')}
                      className="text-green-600 hover:text-green-900"
                    >
                      Complete
                    </button>
                  )}
                  {payment.paymentStatus === 'completed' && (
                    <span className="text-green-600">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Settings Component
const Settings = ({ user, onUpdateProfile }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || ''
  });

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('nurseryAdminToken');
      const response = await fetch(`${API_BASE_URL}/nursery-admin/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setEditMode(false);
        onUpdateProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Settings</h3>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            {editMode ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            {editMode ? (
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{user?.phone}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            {editMode ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{user?.location}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Nursery Center</label>
            <p className="mt-1 text-sm text-gray-900">{user?.nurseryCenterName}</p>
          </div>
          
          {editMode && (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseryAdminDashboard;
