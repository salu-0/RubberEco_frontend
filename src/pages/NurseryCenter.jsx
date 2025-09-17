import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toastService from '../services/toastService';

const NurseryCenter = () => {
  const { centerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [center, setCenter] = useState(null);
  const [centerVarieties, setCenterVarieties] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plantsLoading, setPlantsLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [rzLoaded, setRzLoaded] = useState(false);

  const [booking, setBooking] = useState({ variety: '', plantId: '', quantity: 100, advancePercent: 10 });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (rzLoaded) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRzLoaded(true);
    script.onerror = () => setRzLoaded(false);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [rzLoaded]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Prefer center data passed from navigation state to avoid 404 on non-existent endpoint
        const stateCenter = location.state && location.state.center ? location.state.center : null;
        if (stateCenter) {
          setCenter(stateCenter);
        } else {
          // Fallback: load all centers and pick by id
          const cRes = await fetch(`${API_BASE_URL}/nursery/centers`);
          const cData = await cRes.json().catch(() => ({}));
          const found = (cData.data || []).find(ct => ct._id === centerId);
          setCenter(found || null);
        }

        const [vRes, pRes] = await Promise.all([
          fetch(`${API_BASE_URL}/nursery/centers/${centerId}/varieties`),
          fetch(`${API_BASE_URL}/nursery/plants`)
        ]);
        const v = await vRes.json().catch(() => ({}));
        const p = await pRes.json().catch(() => ({}));
        setCenterVarieties(v?.data?.varieties || []);
        const centerPlants = (p.data || []).filter(pl => pl?.nurseryCenterId?._id === centerId);
        setPlants(centerPlants);
      } catch (e) {
        toastService.error('Failed to load nursery center');
      } finally {
        setLoading(false);
      }
    };
    if (centerId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId]);

  const selectedPlant = useMemo(() => {
    return plants.find(p => (p.variety === booking.variety || p.clone === booking.variety || p.name === booking.variety));
  }, [plants, booking.variety]);

  const placeBooking = async () => {
    if (!booking.variety || !center) return;
    const selPlant = selectedPlant;
    if (!selPlant) {
      toastService.warning('Selected variety is not available at this nursery center.');
      return;
    }
    const unitPrice = Number(selPlant?.unitPrice ?? selPlant?.price);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      toastService.warning('Selected plant has no price configured.');
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/nursery/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          plantId: selPlant._id,
          variety: booking.variety,
          quantity: booking.quantity,
          advancePercent: booking.advancePercent,
          nurseryCenterId: center._id
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Booking failed');

      const orderRes = await fetch(`${API_BASE_URL}/nursery/bookings/${data.data._id}/create-advance-order`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Failed to create payment order');

      if (!window.Razorpay) throw new Error('Payment SDK failed to load. Please try again.');

      const options = {
        key: orderData.data.key,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'RubberEco Nursery',
        description: `Advance for ${data.data.plantName}`,
        order_id: orderData.data.orderId,
        prefill: { name: data.data.farmerName, email: data.data.farmerEmail },
        notes: { bookingId: data.data._id },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/nursery/bookings/${data.data._id}/verify-advance`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) throw new Error(verifyData.message || 'Payment verification failed');
            toastService.success('Payment received. Your booking advance is confirmed and pending approval.', { duration: 6000 });
            setBooking({ plantId: '', variety: '', quantity: 100, advancePercent: 10 });
          } catch (err) {
            toastService.error(err.message || 'Payment verification failed');
          }
        },
        theme: { color: '#059669' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      toastService.error(e.message || 'Failed to process booking');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button className="mb-6 text-emerald-700 hover:text-emerald-800 font-medium" onClick={() => navigate(-1)}>
          ← Back to Nursery Centers
        </button>
        {loading ? (
          <div>Loading...</div>
        ) : !center ? (
          <div className="text-red-600">Center not found.</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
              <h1 className="text-3xl font-bold text-gray-900">{center.name}</h1>
              <p className="text-emerald-700 font-medium mt-1">{center.location}</p>
              <div className="mt-3 grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-emerald-200">
                  <div className="text-gray-700 font-semibold mb-1">Phone</div>
                  <div className="text-gray-900">{center.contact || '-'}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-emerald-200">
                  <div className="text-gray-700 font-semibold mb-1">Email</div>
                  <div className="text-gray-900">{center.email || '-'}</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4">
                <h4 className="text-xl font-bold text-white">Book Saplings</h4>
                <p className="text-emerald-100 text-sm mt-1">Select your preferred variety and quantity</p>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Choose Variety *</label>
                  <div className="relative">
                    <select
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white hover:border-gray-300"
                      value={booking.variety}
                      onChange={(e) => setBooking({ ...booking, variety: e.target.value, plantId: '' })}
                    >
                      <option value="">Select a variety</option>
                      {centerVarieties.map(v => (
                        <option key={v.id || v.name} value={v.name}>{v.name} {v.description ? `- ${v.description}` : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Quantity *</label>
                    <input
                      type="number"
                      min={(selectedPlant?.minOrderQty) || 1}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white hover:border-gray-300"
                      value={booking.quantity}
                      onChange={(e) => setBooking({ ...booking, quantity: parseInt(e.target.value || '0') })}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Advance Payment *</label>
                    <select
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white hover:border-gray-300"
                      value={booking.advancePercent}
                      onChange={(e) => setBooking({ ...booking, advancePercent: parseInt(e.target.value) })}
                    >
                      {[10,15,20,25,30].map(v => (
                        <option key={v} value={v}>{v}% {v===10?'- Minimum':v===20?'- Recommended':v===30?'- Higher':''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedPlant?.minOrderQty ? (
                  <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">Min order: {selectedPlant.minOrderQty} plants</div>
                ) : null}

                {booking.variety && booking.quantity > 0 && (
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                    <h5 className="text-sm font-semibold text-emerald-800 mb-3">Order Summary</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-emerald-600 font-medium">Variety:</span>
                        <p className="font-semibold text-emerald-800">{booking.variety}</p>
                      </div>
                      <div>
                        <span className="text-emerald-600 font-medium">Quantity:</span>
                        <p className="font-semibold text-emerald-800">{booking.quantity} plants</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm text-blue-700">Pay advance online, balance at pickup</div>
                </div>

                <button
                  disabled={placing || !booking.variety}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                  onClick={placeBooking}
                >
                  {placing ? 'Processing Booking...' : 'Book Saplings Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseryCenter;


