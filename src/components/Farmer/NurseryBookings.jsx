import React, { useEffect, useState } from 'react';

const NurseryBookings = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const load = async () => {
      if (!isOpen) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_BASE_URL}/nursery/bookings/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data?.success) setBookings(data.data || []);
        else setBookings([]);
      } catch (_) {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen]);

  if (!isOpen) return null;

  const downloadReceipt = async (id) => {
    try {
      const token = localStorage.getItem('token') || '';
      const resp = await fetch(`${API_BASE_URL}/nursery/bookings/${id}/receipt`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to download receipt');
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nursery-receipt-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">My Nursery Bookings</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-auto">
          {loading ? (
            <div>Loading…</div>
          ) : bookings.length === 0 ? (
            <div className="text-sm text-gray-600">No bookings yet.</div>
          ) : (
            <div className="space-y-4">
              {bookings.map(b => (
                <div key={b._id} className="border border-gray-200 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Plant</div>
                      <div className="font-semibold text-gray-900">{b.plantName}</div>
                      <div className="text-gray-600">Qty: {b.quantity}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Amounts</div>
                      <div className="text-gray-900">Total ₹{Number(b.amountTotal||0).toLocaleString('en-IN')}</div>
                      <div className="text-gray-700">Advance ₹{Number(b.amountAdvance||0).toLocaleString('en-IN')} ({b.advancePercent}%)</div>
                      <div className="text-gray-700">Balance ₹{Number(b.amountBalance||0).toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Status</div>
                      <div className="font-semibold text-gray-900">{b.status}</div>
                      <div className="text-gray-700">Advance Paid: {b?.payment?.advancePaid ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-3 justify-end">
                    {b?.payment?.advancePaid && (
                      <button
                        className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => downloadReceipt(b._id)}
                      >
                        Download Receipt
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
  );
};

export default NurseryBookings;


