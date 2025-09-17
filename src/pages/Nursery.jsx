import React, { useEffect, useState } from 'react';
import toastService from '../services/toastService';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

// Eagerly import all nursery images from assets and build a lookup by base filename
// Place images in `src/assets/images/nursey/` with filenames matching a slug of the nursery name
// Example: "GreenGrow Rubber Nursery" -> "greengrow-rubber-nursery.jpg"
const nurseryImages = import.meta.glob('../assets/images/nursey/*.{png,jpg,jpeg,webp,avif}', { eager: true, import: 'default', query: '?url' });

const imageLookup = Object.entries(nurseryImages).reduce((acc, [path, url]) => {
  const base = path.split('/').pop() || '';
  const name = base.replace(/\.(png|jpe?g|webp|avif)$/i, '');
  acc[name.toLowerCase()] = url;
  return acc;
}, {});

// Ordered list of all image URLs to allow sequential fallback assignment
const imageList = Object.values(nurseryImages);

const slugify = (value) =>
  (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Try multiple strategies to find the best-matching image for a center name
const resolveCenterImage = (centerName) => {
  const full = slugify(centerName);
  const simplified = slugify(centerName.replace(/\b(rubber|nursery|plants?)\b/gi, ''));
  const firstTwo = slugify(centerName.split(/\s+/).slice(0, 2).join(' '));
  const compact = (centerName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  const keys = Object.keys(imageLookup);

  // Exact key match first
  if (imageLookup[full]) return imageLookup[full];
  if (imageLookup[simplified]) return imageLookup[simplified];
  if (imageLookup[firstTwo]) return imageLookup[firstTwo];

  // Fuzzy: any key that contains compact tokens
  const fuzzy = keys.find(k => k.replace(/[^a-z0-9]/g, '').includes(compact));
  if (fuzzy) return imageLookup[fuzzy];

  // Fallback: startsWith on simplified
  const starts = keys.find(k => k.startsWith(simplified) || k.startsWith(full));
  if (starts) return imageLookup[starts];

  return undefined;
};

const Nursery = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [plants, setPlants] = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(false);
  const [varieties, setVarieties] = useState([]);
  const [centerVarieties, setCenterVarieties] = useState([]);
  const [booking, setBooking] = useState({ plantId: '', variety: '', quantity: 100, advancePercent: 10 });
  const [placing, setPlacing] = useState(false);
  const [rzLoaded, setRzLoaded] = useState(false);
  

  useEffect(() => {
    const load = async () => {
      try {
        // Load centers and varieties in parallel
        const [cRes, vRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/nursery/centers`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/nursery/varieties`)
        ]);
        
        const cData = await cRes.json();
        const vData = await vRes.json();
        
        setCenters(cData.data || []);
        setVarieties(vData.data || []);
      } catch (e) {
        setError('Failed to load nursery centers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load Razorpay checkout script once
  useEffect(() => {
    if (rzLoaded) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRzLoaded(true);
    script.onerror = () => setRzLoaded(false);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [rzLoaded]);

  const openCenter = async (center) => {
    navigate(`/nursery/${center._id}`, { state: { center } });
  };

  const placeBooking = async () => {
    if (!booking.variety || !selectedCenter) return;
    
    // Find the plant for the selected variety and nursery center
    const selPlant = plants.find(p => 
      p.nurseryCenterId?._id === selectedCenter._id && 
      (p.variety === booking.variety || p.clone === booking.variety || p.name === booking.variety)
    );
    
    if (!selPlant) {
      toastService.warning('Selected variety is not available at this nursery center.');
      return;
    }
    
    const unitPrice = Number(selPlant?.unitPrice ?? selPlant?.price);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      toastService.warning('Selected plant has no price configured. Please choose another variety or contact support.');
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/nursery/bookings`, {
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
          nurseryCenterId: selectedCenter._id
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Booking failed');

      // Create Razorpay order for advance amount
      const orderRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/nursery/bookings/${data.data._id}/create-advance-order`, {
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
        prefill: {
          name: data.data.farmerName,
          email: data.data.farmerEmail
        },
        notes: {
          bookingId: data.data._id
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/nursery/bookings/${data.data._id}/verify-advance`, {
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
            setBooking({ plantId: '', quantity: 100, advancePercent: 10 });
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
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight animate-in fade-in-0 slide-in-from-top-4 duration-1000">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-green-700 to-green-500">Rubber</span>
            <span className="text-gray-900">&nbsp;Nursery</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 animate-in fade-in-0 slide-in-from-top-4 duration-1000 delay-200">
            Discover nearby centers, varieties and booking info
          </p>
          <div className="mt-6 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-in slide-in-from-left-4 duration-1000 delay-300"></div>
          </div>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {centers.map((c, idx) => {
              const imgSrc = resolveCenterImage(c.name);
              const fallbackSrc = imageList.length > 0 ? imageList[idx % imageList.length] : undefined;
              return (
                <div 
                  key={c._id} 
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-105 border border-gray-100"
                  onClick={() => openCenter(c)}
                >
                  {/* Image Container with Overlay */}
                  <div className="relative overflow-hidden">
                    {imgSrc || fallbackSrc ? (
                      <img 
                        src={imgSrc || fallbackSrc} 
                        alt={c.name} 
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-gray-400 text-sm">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🌱</div>
                          <div>Nursery Image</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Hover Badge */}
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      View Details
                    </div>
                    
                    {/* Variety Count Badge */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                      2 Varieties Available
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-6">
                    {/* Nursery Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                      {c.name}
                    </h3>
                    
                    {/* Location */}
                    <div className="flex items-center mb-3">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-600 font-medium">{c.location}</span>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="font-medium">{c.contact}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{c.email}</span>
                      </div>
                    </div>
                    
                    {/* Specialty */}
                    {c.specialty && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start">
                          <svg className="w-4 h-4 text-emerald-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <div className="text-sm font-semibold text-emerald-800 mb-1">Specialty</div>
                            <div className="text-sm text-emerald-700">{c.specialty}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Click to view varieties
                      </div>
                      <div className="bg-emerald-500 text-white p-2 rounded-full group-hover:bg-emerald-600 transition-colors duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
          
          </>
        )}
      </div>

      {/* Booking moved to full page at /nursery/:centerId */}
    </div>
  );
};

export default Nursery;


