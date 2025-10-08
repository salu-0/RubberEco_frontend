import React, { useEffect, useState } from 'react';
import toastService from '../../services/toastService';

const NurseryBookings = ({ darkMode }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Self-detect dark mode to match other admin sections if prop is not provided
  const computedDarkMode = typeof darkMode === 'boolean'
    ? darkMode
    : (typeof window !== 'undefined' && (
        localStorage.getItem('admin_theme') === 'dark' ||
        document.documentElement.classList.contains('dark') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ))
      ? true
      : false;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
    } catch {
      return `₹${amount || 0}`;
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/nursery/bookings`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to load bookings (${res.status})`);
      }
      const data = await res.json();
      setBookings(data.data || []);
    } catch (e) {
      console.error('Failed to load nursery bookings:', e);
      setError(e.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openDetails = (b) => {
    setSelected(b);
    setDetailsOpen(true);
  };
  const closeDetails = () => {
    setDetailsOpen(false);
    setSelected(null);
  };

  const decide = async (id, action) => {
    try {
      const res = await fetch(`${API_BASE_URL}/nursery/bookings/${id}/decision`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to update booking');
      }
      
      // Show success message
      if (action === 'approve') {
        toastService.success('Nursery booking approved successfully! The farmer will be notified via email.');
      } else if (action === 'reject') {
        toastService.warning('Nursery booking has been rejected.');
      }
      
      await load();
    } catch (e) {
      // Show specific error messages based on the error
      if (e.message === 'Insufficient stock') {
        toastService.error('Insufficient stock available. Please check the plant inventory before approving this booking.', {
          duration: 8000,
          action: {
            label: 'Refresh Inventory',
            onClick: () => load()
          }
        });
      } else if (e.message === 'Advance not paid yet') {
        toastService.warning('Cannot approve booking. The farmer has not completed the advance payment yet.', {
          duration: 7000
        });
      } else {
        toastService.error(e.message || 'Failed to update booking. Please try again.', {
          duration: 7000
        });
      }
    }
  };

  const renderStatusBadge = (status) => {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    if (status === 'approved') return <span className={`${base} ${computedDarkMode ? 'bg-green-900/40 text-green-300 border border-green-500/30' : 'bg-green-100 text-green-800'}`}>approved</span>;
    if (status === 'rejected') return <span className={`${base} ${computedDarkMode ? 'bg-red-900/40 text-red-300 border border-red-500/30' : 'bg-red-100 text-red-800'}`}>rejected</span>;
    return <span className={`${base} ${computedDarkMode ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-500/30' : 'bg-yellow-100 text-yellow-800'}`}>pending</span>;
  };

  return (
    <div className={computedDarkMode ? 'min-h-screen bg-gray-900' : 'min-h-screen bg-gradient-to-br from-primary-50 to-accent-50'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${computedDarkMode ? 'text-white' : 'bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent'}`}>Nursery Bookings</h1>
            <p className={computedDarkMode ? 'text-gray-400 mt-1' : 'text-gray-600 mt-1'}>Manage nursery advance reservations and approvals</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className={`${computedDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2`}
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className={`${computedDarkMode ? 'bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-green-500/20' : 'bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100'} p-6`}>
          {loading ? (
            <div className={computedDarkMode ? 'flex items-center justify-center py-16 text-gray-300' : 'flex items-center justify-center py-16 text-gray-500'}>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              {error && (
                <div className={`${computedDarkMode ? 'mb-4 p-4 rounded-xl border border-red-500/30 bg-red-900/30 text-red-200' : 'mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700'} text-sm`}>{error}</div>
              )}
              {bookings.length === 0 && !error ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-full max-w-lg text-center">
                    <div className={`mx-auto w-16 h-16 rounded-full ${computedDarkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                      <span className="text-2xl">🌱</span>
                    </div>
                    <h2 className={`${computedDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold mb-1`}>No bookings found</h2>
                    <p className={computedDarkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>Bookings will appear here as farmers reserve plants from the nursery.</p>
                  </div>
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className={`${computedDarkMode ? 'bg-gray-700/50 border-b border-green-500/20' : 'bg-gray-50'}`}>
                    <tr className={computedDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      <th className="px-4 py-3 text-left font-semibold">Farmer</th>
                      <th className="px-4 py-3 text-left font-semibold">Nursery Center</th>
                      <th className="px-4 py-3 text-left font-semibold">Plant</th>
                      <th className="px-4 py-3 text-left font-semibold">Qty</th>
                      <th className="px-4 py-3 text-left font-semibold">Total</th>
                      <th className="px-4 py-3 text-left font-semibold">Advance</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={computedDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-100'}>
                    {bookings.map(b => (
                      <tr key={b._id} className={computedDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className={`px-4 py-3 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{b.farmerName} <span className={computedDarkMode ? 'text-gray-400' : 'text-gray-500'}>({b.farmerEmail})</span></td>
                        <td className={`px-4 py-3 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {b.nurseryCenterName || (b.nurseryCenterId?.name) || 'N/A'}
                          {b.nurseryCenterId?.location && (
                            <span className={`${computedDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs block`}>
                              {b.nurseryCenterId.location}
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{b.plantName}</td>
                        <td className={`px-4 py-3 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{b.quantity}</td>
                        <td className={`px-4 py-3 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(b.amountTotal)}</td>
                        <td className={`px-4 py-3 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{b.advancePercent}% {b.payment?.advancePaid ? '✓' : '✗'}</td>
                        <td className="px-4 py-3 capitalize">{renderStatusBadge(b.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className={`${computedDarkMode ? 'px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors' : 'px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors'}`} onClick={() => openDetails(b)}>View</button>
                            <button className={`${computedDarkMode ? 'px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors' : 'px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors'}`} onClick={() => decide(b._id, 'approve')}>Approve</button>
                            <button className={`${computedDarkMode ? 'px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors' : 'px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors'}`} onClick={() => decide(b._id, 'reject')}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
        {detailsOpen && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeDetails} />
            <div className={`${computedDarkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'} relative w-full max-w-2xl rounded-2xl shadow-2xl`}> 
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Booking Details</h3>
                <button onClick={closeDetails} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div>
                  <div className="text-gray-500">Farmer</div>
                  <div className="font-semibold">{selected.farmerName}</div>
                  <div className="text-gray-600">{selected.farmerEmail}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-500">Nursery Center</div>
                    <div className="font-semibold">{selected.nurseryCenterName || selected?.nurseryCenterId?.name || 'N/A'}</div>
                    {selected?.nurseryCenterId?.location && (
                      <div className="text-gray-600">{selected.nurseryCenterId.location}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-gray-500">Plant</div>
                    <div className="font-semibold">{selected.plantName}</div>
                    <div className="text-gray-600">Qty: {selected.quantity}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-gray-500">Total</div>
                    <div className="font-semibold">{formatCurrency(selected.amountTotal)}</div>
                  </div>
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
                <div className="pt-2 text-xs text-gray-500">Created: {new Date(selected.createdAt).toLocaleString()}</div>
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
                  <button className={`${computedDarkMode ? 'px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200' : 'px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800'}`} onClick={closeDetails}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseryBookings;





