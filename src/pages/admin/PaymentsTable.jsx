import React, { useEffect, useState } from 'react';

export default function PaymentsTable({ darkMode = true }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://rubbereco-backend.onrender.com/api/admin/payments', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success) {
          setPayments(data.data.payments || []);
        } else {
          setError(data.message || 'Failed to fetch payments');
        }
      } catch (err) {
        setError('Error fetching payments');
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  if (loading) return <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading payments...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!payments.length) return <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No payments found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <thead>
          <tr className={`${darkMode ? 'bg-gray-900/50 text-green-400' : 'bg-gray-100 text-gray-700'} text-sm uppercase tracking-wider`}>
            <th className="py-3 px-4 text-left font-semibold">Date</th>
            <th className="py-3 px-4 text-left font-semibold">Type</th>
            <th className="py-3 px-4 text-left font-semibold">Amount</th>
            <th className="py-3 px-4 text-left font-semibold">Status</th>
            <th className="py-3 px-4 text-left font-semibold">Method</th>
            <th className="py-3 px-4 text-left font-semibold">User</th>
            <th className="py-3 px-4 text-left font-semibold">Email</th>
            <th className="py-3 px-4 text-left font-semibold">Details</th>
          </tr>
        </thead>
        <tbody className={darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
          {payments.map((p) => (
            <tr key={p._id} className={`${darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-50 text-gray-900'} transition-colors duration-150 text-xs`}>
              <td className="py-3 px-4">{new Date(p.createdAt).toLocaleString()}</td>
              <td className="py-3 px-4 capitalize">{p.paymentType}</td>
              <td className="py-3 px-4 font-bold text-green-500">₹{p.amount?.toLocaleString()}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  p.paymentStatus === 'completed' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : p.paymentStatus === 'pending' 
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {p.paymentStatus}
                </span>
              </td>
              <td className="py-3 px-4 capitalize">{p.paymentMethod}</td>
              <td className="py-3 px-4">{p.farmerName || p.farmerId?.name || '-'}</td>
              <td className="py-3 px-4 text-gray-400">{p.farmerEmail || p.farmerId?.email || '-'}</td>
              <td className="py-3 px-4">
                {p.bookingId?.plantName && <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Plant: {p.bookingId.plantName}</div>}
                {p.nurseryCenterName && <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Nursery: {p.nurseryCenterName}</div>}
                {p.invoiceDetails?.invoiceNumber && <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Invoice: {p.invoiceDetails.invoiceNumber}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
