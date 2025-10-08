import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';
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

  const [booking, setBooking] = useState({ variety: '', plantId: '', quantity: 100, advancePercent: 10, paymentMode: 'advance', shipmentRequired: false, shippingFee: 0 });
  const [centerCoords, setCenterCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [distanceKm, setDistanceKm] = useState(0);
  const [shippingEstimate, setShippingEstimate] = useState(0);
  const [geoLoading, setGeoLoading] = useState(false);
  const [receiptPromptOpen, setReceiptPromptOpen] = useState(false);
  const [pendingReceiptBookingId, setPendingReceiptBookingId] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Kerala district centroids (approximate) used as fallback when geocoding fails
  const keralaDistrictCentroids = useMemo(() => ({
    'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
    'kollam': { lat: 8.8932, lng: 76.6141 },
    'pathanamthitta': { lat: 9.2648, lng: 76.7870 },
    'alappuzha': { lat: 9.4981, lng: 76.3388 },
    'alleppey': { lat: 9.4981, lng: 76.3388 }, // common alt name
    'kottayam': { lat: 9.5916, lng: 76.5222 },
    'idukki': { lat: 9.8490, lng: 76.9685 },
    'ernakulam': { lat: 10.0480, lng: 76.3636 }, // district approx
    'kochi': { lat: 9.9312, lng: 76.2673 }, // major city within district
    'thrissur': { lat: 10.5276, lng: 76.2144 },
    'palakkad': { lat: 10.7867, lng: 76.6548 },
    'malappuram': { lat: 11.0730, lng: 76.0743 },
    'kozhikode': { lat: 11.2588, lng: 75.7804 },
    'calicut': { lat: 11.2588, lng: 75.7804 }, // alt name
    'wayanad': { lat: 11.6854, lng: 76.1310 },
    'kalpetta': { lat: 11.6106, lng: 76.0835 },
    'kannur': { lat: 11.8745, lng: 75.3704 },
    'kasaragod': { lat: 12.4996, lng: 74.9854 }
  }), []);

  const geocodeAddress = async (address) => {
    if (!address) return null;
    // Call backend proxy to avoid CORS
    try {
      const res = await fetch(`${API_BASE_URL}/nursery/geocode?query=${encodeURIComponent(address)}`);
      const data = await res.json().catch(() => ({}));
      if (data.success && data.data && Number.isFinite(data.data.lat) && Number.isFinite(data.data.lng)) {
        return { lat: data.data.lat, lng: data.data.lng };
      }
    } catch (_) {}
    // Fallback: if pure district or well-known Kerala place, use centroid
    try {
      const normalized = String(address).toLowerCase().trim();
      const key = normalized
        .replace(/,\s*india$/, '')
        .replace(/,\s*kerala$/, '')
        .replace(/,\s*kerala,\s*india$/, '')
        .split(',')[0]
        .trim();
      if (keralaDistrictCentroids[key]) {
        return keralaDistrictCentroids[key];
      }
    } catch (_) {}
    return null;
  };

  const geocodeWithFallbacks = async (candidates) => {
    for (const cand of candidates) {
      const coords = await geocodeAddress(cand);
      if (coords) return coords;
    }
    return null;
  };

  const haversineKm = (a, b) => {
    if (!a || !b) return 0;
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDlat = Math.sin(dLat / 2);
    const sinDlon = Math.sin(dLon / 2);
    const aVal = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon;
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return R * c;
  };

  const computeEstimate = (km) => {
    const baseFee = 150; // ₹
    const perKm = 12; // ₹ per km
    const estimate = Math.max(0, Math.round(baseFee + perKm * km));
    return estimate;
  };

  const refreshShippingEstimate = (coords = { center: centerCoords, drop: dropoffCoords }) => {
    if (!coords.center || !coords.drop) {
      setDistanceKm(0);
      setShippingEstimate(0);
      if (booking.shipmentRequired) setBooking({ ...booking, shippingFee: 0 });
      return;
    }
    const km = haversineKm(coords.center, coords.drop);
    const estimate = computeEstimate(km);
    setDistanceKm(km);
    setShippingEstimate(estimate);
    if (booking.shipmentRequired) setBooking({ ...booking, shippingFee: estimate });
  };

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
        // Resolve center coordinates: prefer stored lat/lng, then geocode fallbacks
        try {
          const c = (stateCenter || found) || {};
          if (Number.isFinite(c.lat) && Number.isFinite(c.lng)) {
            setCenterCoords({ lat: c.lat, lng: c.lng });
          } else {
            const name = (c.name || '').trim();
            const loc = (c.location || '').trim();
            const candidates = [
              `${name} ${loc}`.trim(),
              loc,
              loc ? `${loc}, India` : '',
              loc ? `${loc}, Kerala` : '',
              loc ? `${loc}, Kerala, India` : '',
              name && loc ? `${name}, ${loc}, Kerala, India` : '',
            ].filter(Boolean);
            const coords = await geocodeWithFallbacks(candidates);
            if (coords) setCenterCoords(coords);
            else toastService.warning('Could not locate nursery center on map. Shipping estimate may be unavailable.');
          }
        } catch (_) {}
      } catch (e) {
        toastService.error('Failed to load nursery center');
      } finally {
        setLoading(false);
      }
    };
    if (centerId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId]);

  const refreshPlants = async () => {
    try {
      setPlantsLoading(true);
      const pRes = await fetch(`${API_BASE_URL}/nursery/plants`);
      const p = await pRes.json().catch(() => ({}));
      const centerPlants = (p.data || []).filter(pl => pl?.nurseryCenterId?._id === centerId);
      setPlants(centerPlants);
    } catch (_) {
      // ignore
    } finally {
      setPlantsLoading(false);
    }
  };

  const selectedPlant = useMemo(() => {
    return plants.find(p => (p.variety === booking.variety || p.clone === booking.variety || p.name === booking.variety));
  }, [plants, booking.variety]);

  // When dropoff changes, recompute
  useEffect(() => {
    refreshShippingEstimate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerCoords, dropoffCoords, booking.shipmentRequired]);

  const useMyLocation = async () => {
    if (!('geolocation' in navigator)) {
      toastService.warning('Geolocation not available in your browser');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDropoffCoords(coords);
        refreshShippingEstimate({ center: centerCoords, drop: coords });
        toastService.info('Using your current location for shipment estimation');
      } catch (err) {
        toastService.error('Failed to use current location');
      } finally {
        setGeoLoading(false);
      }
    }, () => {
      toastService.error('Location permission denied');
      setGeoLoading(false);
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const geocodeDropoffAddress = async () => {
    if (!dropoffAddress) return;
    try {
      setGeoLoading(true);
      // Try entered address with multiple fallbacks to improve hit-rate
      let coords = await geocodeWithFallbacks([
        dropoffAddress,
        `${dropoffAddress}, Kerala`,
        `${dropoffAddress}, Kerala, India`,
        `${dropoffAddress}, India`
      ]);
      // As a final fallback, try district centroid if the user typed a known district/city name
      if (!coords) {
        const normalized = dropoffAddress.toLowerCase().trim();
        const key = normalized.split(',')[0];
        if (keralaDistrictCentroids[key]) {
          coords = keralaDistrictCentroids[key];
        }
      }
      if (!coords) {
        toastService.error('Could not locate the transport address');
        return;
      }
      setDropoffCoords(coords);
      refreshShippingEstimate({ center: centerCoords, drop: coords });
      if (!centerCoords) toastService.warning('Center location unavailable; distance will be 0 until center is resolved.');
    } catch (err) {
      toastService.error('Failed to geocode address');
    } finally {
      setGeoLoading(false);
    }
  };

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
          advancePercent: booking.paymentMode === 'full' ? 100 : booking.advancePercent,
          nurseryCenterId: center._id,
          shipmentRequired: booking.shipmentRequired,
          shippingFee: booking.shipmentRequired ? Number(shippingEstimate || booking.shippingFee || 0) : 0,
          shippingAddressText: dropoffAddress || ''
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Booking failed');

      // Create order based on payment mode
      const orderEndpoint = booking.paymentMode === 'full'
        ? `${API_BASE_URL}/nursery/bookings/${data.data._id}/create-full-order`
        : `${API_BASE_URL}/nursery/bookings/${data.data._id}/create-advance-order`;
      const orderInit = {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      };
      if (booking.paymentMode === 'full') {
        orderInit.headers['Content-Type'] = 'application/json';
        // Use estimated shipping fee if shipment is required
        const fee = booking.shipmentRequired ? Number(shippingEstimate || booking.shippingFee || 0) : 0;
        orderInit.body = JSON.stringify({ shippingFee: fee });
      }
      const orderRes = await fetch(orderEndpoint, orderInit);
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Failed to create payment order');

      if (!window.Razorpay) throw new Error('Payment SDK failed to load. Please try again.');

      const options = {
        key: orderData.data.key,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'RubberEco Nursery',
        description: booking.paymentMode === 'full' ? `Full payment for ${data.data.plantName}` : `Advance for ${data.data.plantName}`,
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
            const successMsg = booking.paymentMode === 'full'
              ? 'Payment received. Your purchase has been recorded.'
              : 'Payment received. Your booking advance is confirmed and pending approval.';
            toastService.success(successMsg, { duration: 6000 });

            // Refresh plants to reflect updated stock
            await refreshPlants();
            
            // Queue professional modal for receipt download
            setPendingReceiptBookingId(String(data.data._id));
            setReceiptPromptOpen(true);
            setBooking({ plantId: '', variety: '', quantity: 100, advancePercent: 10, paymentMode: 'advance', shipmentRequired: false, shippingFee: 0 });
            setDropoffAddress('');
            setDropoffCoords(null);
            setDistanceKm(0);
            setShippingEstimate(0);
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
                {/* Payment mode */}
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="text-emerald-600 focus:ring-emerald-500"
                      checked={booking.paymentMode === 'advance'}
                      onChange={() => setBooking({ ...booking, paymentMode: 'advance' })}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-800">Book with Advance</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="text-emerald-600 focus:ring-emerald-500"
                      checked={booking.paymentMode === 'full'}
                      onChange={() => setBooking({ ...booking, paymentMode: 'full' })}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-800">Buy Now (Pay Full)</span>
                  </label>
                </div>
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
                  {selectedPlant && (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        (selectedPlant.stockAvailable || 0) === 0
                          ? 'bg-red-100 text-red-800'
                          : (selectedPlant.stockAvailable || 0) < 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        Stock: {selectedPlant.stockAvailable || 0}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Unit Price: ₹{Number(selectedPlant.unitPrice || 0).toLocaleString('en-IN')}
                      </span>
                      {selectedPlant.minOrderQty ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          Min Order: {selectedPlant.minOrderQty}
                        </span>
                      ) : null}
                    </div>
                  )}
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
                      disabled={booking.paymentMode === 'full'}
                    >
                      {[10,15,20,25,30].map(v => (
                        <option key={v} value={v}>{v}% {v===10?'- Minimum':v===20?'- Recommended':v===30?'- Higher':''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Shipping option */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <input
                      id="shipRequired"
                      type="checkbox"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      checked={booking.shipmentRequired}
                      onChange={(e) => setBooking({ ...booking, shipmentRequired: e.target.checked })}
                    />
                    <label htmlFor="shipRequired" className="ml-2 text-sm text-gray-800">Shipment required</label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Shipping Fee</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        className="w-full border-2 border-gray-200 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                        value={booking.shipmentRequired ? (shippingEstimate || booking.shippingFee) : 0}
                        onChange={(e) => setBooking({ ...booking, shippingFee: Number(e.target.value || 0) })}
                        disabled={!booking.shipmentRequired}
                      />
                    </div>
                  </div>
                </div>

                {booking.shipmentRequired && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">Transport (Drop-off) Location</label>
                      <input
                        type="text"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-gray-300"
                        value={dropoffAddress}
                        onChange={(e) => setDropoffAddress(e.target.value)}
                        placeholder="Enter delivery/pickup address"
                        onBlur={geocodeDropoffAddress}
                        disabled={geoLoading}
                      />
                      <button
                        type="button"
                        onClick={geocodeDropoffAddress}
                        className="mt-2 inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                        disabled={geoLoading || !dropoffAddress}
                      >
                        {geoLoading ? 'Locating…' : 'Estimate from Address'}
                      </button>
                      <button
                        type="button"
                        onClick={useMyLocation}
                        className="mt-2 ml-3 inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                        disabled={geoLoading}
                      >
                        {geoLoading ? 'Detecting…' : 'Use My Location'}
                      </button>
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="text-sm text-amber-800 font-semibold">Estimated Shipping</div>
                        <div className="mt-1 text-sm text-amber-800">Distance: {distanceKm ? `${distanceKm.toFixed(1)} km` : '-'}
                        </div>
                        <div className="mt-1 text-lg font-bold text-amber-900">₹{Number(shippingEstimate || 0).toLocaleString('en-IN')}</div>
                        <div className="mt-1 text-[11px] text-amber-700">Estimate = ₹150 base + ₹12/km</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPlant?.minOrderQty ? (
                  <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">Min order: {selectedPlant.minOrderQty} plants</div>
                ) : null}

                {selectedPlant && booking.variety && booking.quantity > 0 && (
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                    <h5 className="text-sm font-semibold text-emerald-800 mb-3">Order Summary</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-emerald-600 font-medium">Variety:</span>
                        <p className="font-semibold text-emerald-800">{booking.variety}</p>
                      </div>
                      <div>
                        <span className="text-emerald-600 font-medium">Quantity:</span>
                        <p className="font-semibold text-emerald-800">{booking.quantity} plants</p>
                      </div>
                      <div>
                        <span className="text-emerald-600 font-medium">Unit Price:</span>
                        <p className="font-semibold text-emerald-800">₹{Number(selectedPlant?.unitPrice || 0).toLocaleString('en-IN')}</p>
                      </div>
                      {booking.shipmentRequired && (
                        <div>
                          <span className="text-emerald-600 font-medium">Shipping Fee:</span>
                          <p className="font-semibold text-emerald-800">₹{Number(shippingEstimate || booking.shippingFee || 0).toLocaleString('en-IN')}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-emerald-600 font-medium">Totals:</span>
                        <p className="font-semibold text-emerald-800">
                          {(() => {
                            const unit = Number(selectedPlant?.unitPrice || 0);
                            const qty = Number(booking.quantity || 0);
                            const subtotal = unit * qty;
                            const shippingFee = booking.shipmentRequired ? Number(shippingEstimate || booking.shippingFee || 0) : 0;
                            const total = subtotal + shippingFee;
                            
                            if (booking.paymentMode === 'full') {
                              return `Total ₹${total.toLocaleString('en-IN')}${shippingFee > 0 ? ` (includes ₹${shippingFee.toLocaleString('en-IN')} shipping)` : ''}`;
                            } else {
                              const advPct = Number(booking.advancePercent || 10);
                              const adv = Math.round((subtotal * advPct) / 100);
                              const bal = subtotal - adv;
                              return `Total ₹${subtotal.toLocaleString('en-IN')} • Advance ₹${adv.toLocaleString('en-IN')} • Balance ₹${bal.toLocaleString('en-IN')}${shippingFee > 0 ? ` • Shipping ₹${shippingFee.toLocaleString('en-IN')}` : ''}`;
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`rounded-lg p-3 border ${booking.paymentMode === 'full' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className={`text-sm ${booking.paymentMode === 'full' ? 'text-amber-800' : 'text-blue-700'}`}>
                    {booking.paymentMode === 'full' ? 'Pay full amount now (shipping fee added if selected).' : 'Pay advance online, balance at pickup.'}
                  </div>
                </div>

                {selectedPlant && booking.quantity > (selectedPlant.stockAvailable || 0) && (
                  <div className="flex items-center text-xs text-red-700 bg-red-50 px-3 py-2 rounded-lg">Requested quantity exceeds available stock.</div>
                )}

                <button
                  disabled={placing || !booking.variety || (selectedPlant && (booking.quantity < (selectedPlant.minOrderQty || 1) || booking.quantity > (selectedPlant.stockAvailable || 0)))}
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
      <ConfirmDialog
        open={receiptPromptOpen}
        title="Payment successful"
        message="Would you like to download your receipt now?"
        confirmText="Download"
        cancelText="Later"
        onCancel={() => setReceiptPromptOpen(false)}
        onConfirm={async () => {
          setReceiptPromptOpen(false);
          if (!pendingReceiptBookingId) return;
          try {
            const token = localStorage.getItem('token') || '';
            const resp = await fetch(`${API_BASE_URL}/nursery/bookings/${pendingReceiptBookingId}/receipt`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) throw new Error('Failed to download receipt');
            const blob = await resp.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nursery-receipt-${pendingReceiptBookingId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toastService.success('Receipt downloaded successfully!', { duration: 3000 });
          } catch (e) {
            toastService.error('Failed to download receipt. You can download it later from Payment Status.');
          }
          setPendingReceiptBookingId('');
        }}
      />
    </div>
  );
};

export default NurseryCenter;


