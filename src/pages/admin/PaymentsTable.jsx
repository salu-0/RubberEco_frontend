import React, { useEffect, useState } from 'react';

export default function PaymentsTable() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/admin/payments', {
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

  if (loading) return <div className="p-8 text-center text-gray-400">Loading payments...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!payments.length) return <div className="p-8 text-center text-gray-400">No payments found.</div>;

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm">
            <th className="py-2 px-3">Date</th>
            <th className="py-2 px-3">Type</th>
            <th className="py-2 px-3">Amount</th>
            <th className="py-2 px-3">Status</th>
            <th className="py-2 px-3">Method</th>
            <th className="py-2 px-3">User</th>
            <th className="py-2 px-3">Email</th>
            <th className="py-2 px-3">Details</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p._id} className="border-b hover:bg-gray-50 text-xs">
              <td className="py-2 px-3">{new Date(p.createdAt).toLocaleString()}</td>
              <td className="py-2 px-3">{p.paymentType}</td>
              <td className="py-2 px-3 font-semibold">₹{p.amount?.toLocaleString()}</td>
              <td className="py-2 px-3">
                <span className={`px-2 py-1 rounded text-xs ${p.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : p.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.paymentStatus}</span>
              </td>
              <td className="py-2 px-3">{p.paymentMethod}</td>
              <td className="py-2 px-3">{p.farmerName || p.farmerId?.name || '-'}</td>
              <td className="py-2 px-3">{p.farmerEmail || p.farmerId?.email || '-'}</td>
              <td className="py-2 px-3">
                {p.bookingId?.plantName && <div>Plant: {p.bookingId.plantName}</div>}
                {p.nurseryCenterName && <div>Nursery: {p.nurseryCenterName}</div>}
                {p.invoiceDetails?.invoiceNumber && <div>Invoice: {p.invoiceDetails.invoiceNumber}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
