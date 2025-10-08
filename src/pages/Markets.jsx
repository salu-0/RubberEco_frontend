import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Globe,
  Calendar,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Target,
  MapPin,
  Clock,
  Search,
  Navigation,
  Star,
  X,
  Phone,
  Route,
  Building2,
  Bookmark,
  Share2,
  Award
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import GoogleMapsSetup from '../components/GoogleMapsSetup';
import { useNavigationGuard } from '../hooks/useNavigationGuard';

// Market images - using public folder for better compatibility
const marketImages = {
  m1: '/images/markets/m1.png',
  m2: '/images/markets/m2.png',
  m3: '/images/markets/m3.png',
  m4: '/images/markets/m4.png',
  m5: '/images/markets/m5.png',
  m6: '/images/markets/m6.png',
  m7: '/images/markets/m7.png'
};

// Market Finder Component
const MarketFinder = ({ onMarketClick }) => {
  const { t } = useLanguage();
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50); // km

  // Sample market data - includes real Kottayam and Manimala businesses
  const sampleMarkets = [
    {
      id: 1,
      name: 'Changanacherry Cooperative Rubber Marketing Society Ltd No K364',
      address: 'Mercy Hospital Rd, Changanacherry',
      distance: '0.8 km',
      rating: 5.0,
      price: '₹192/kg',
      type: 'Cooperative Society',
      phone: '095398 28195',
      hours: '10:00 AM - 6:00 PM (Closed now)',
      coordinates: { lat: 9.4420, lng: 76.5482 },
      features: ['Cooperative Rates', 'Quality Assurance', 'Member Benefits'],
      status: 'Closed',
      opensAt: '10:00 AM Tue',
      image: marketImages.m1
    },
    {
      id: 2,
      name: 'Manimalayar Rubbers Pvt. Ltd.',
      address: 'Manimalayar Buildings, Kottayam - Kumily Rd',
      distance: '1.1 km',
      rating: 4.0,
      price: '₹189/kg',
      type: 'Agricultural Service',
      phone: '0481 257 3870',
      hours: '9:00 AM - 6:00 PM (Closed now)',
      coordinates: { lat: 9.4380, lng: 76.5520 },
      features: ['RPS Promoted', 'Rubber Board Certified', 'Agricultural Service'],
      status: 'Closed',
      opensAt: '9:00 AM Tue',
      image: marketImages.m2
    },
    {
      id: 3,
      name: 'A.M. Rubber Industries',
      address: 'Malakunnam P.O, Changanacherry, Kottayam',
      distance: '1.2 km',
      rating: 4.9,
      price: '₹187/kg',
      type: 'Rubber Products Supplier',
      phone: '09206 05020',
      hours: 'Open 24 hours',
      coordinates: { lat: 9.4981, lng: 76.5442 },
      features: ['24/7 Service', 'Delivery Available', 'Quality Products'],
      status: 'Open',
      image: marketImages.m3
    },
    {
      id: 4,
      name: 'Manimalayar Rubbers',
      address: 'JM3J+7JC, Oravackal Koorali road',
      distance: '1.5 km',
      rating: 0,
      price: '₹185/kg',
      type: 'Rubber Products Supplier',
      phone: 'No phone listed',
      hours: 'Hours not available',
      coordinates: { lat: 9.4530, lng: 76.5310 },
      features: ['Local Business', 'Rubber Products'],
      status: 'Permanently closed',
      image: marketImages.m4
    },
    {
      id: 5,
      name: 'Rubber Board Market Promotion Department',
      address: 'HHG9+V4R, Kottayam',
      distance: '8.1 km',
      rating: 5.0,
      price: '₹190/kg',
      type: 'Government Office',
      phone: '+91 481 2563123',
      hours: '8:30 AM - 5:00 PM (Closed now)',
      coordinates: { lat: 9.5915, lng: 76.5222 },
      features: ['Government Rates', 'Quality Assurance', 'Fair Pricing'],
      status: 'Closed',
      opensAt: '8:30 AM Tue',
      image: marketImages.m5
    },
    {
      id: 6,
      name: 'Online Rubber Trading',
      address: 'Kottayam, Kerala',
      distance: '9.5 km',
      rating: 5.0,
      price: '₹185/kg',
      type: 'Wholesaler',
      phone: '095390 71101',
      hours: '9:00 AM - 6:00 PM (Closed now)',
      coordinates: { lat: 9.5916, lng: 76.5200 },
      features: ['Online Trading', 'Wholesale Rates', 'Bulk Orders'],
      status: 'Closed',
      opensAt: '9:00 AM Tue',
      image: marketImages.m6
    },
    {
      id: 7,
      name: 'Kottayam Rubber Marketing Co-Operative Society',
      address: 'HGQV+2FX, Kottayam',
      distance: '12.2 km',
      rating: 4.0,
      price: '₹183/kg',
      type: 'Cooperative Society',
      phone: '+91 481 2563456',
      hours: '8:00 AM - 5:00 PM (Temporarily closed)',
      coordinates: { lat: 9.5880, lng: 76.5180 },
      features: ['Member Benefits', 'Cooperative Rates', 'Local Support'],
      status: 'Temporarily closed',
      image: marketImages.m7
    },
    {
      id: 8,
      name: 'Kerala Rubber Board Market',
      address: 'Rubber Board Junction, Kottayam',
      distance: '10.8 km',
      rating: 4.6,
      price: '₹189/kg',
      type: 'Government Authorized',
      phone: '+91 481 2563789',
      hours: '6:00 AM - 6:00 PM',
      coordinates: { lat: 9.5920, lng: 76.5240 },
      features: ['Quality Testing', 'Fair Pricing', 'Immediate Payment'],
      status: 'Open',
      image: marketImages.m1
    },
    {
      id: 9,
      name: 'Malabar Rubber Trading Co.',
      address: 'Thrissur, Kerala 680001',
      distance: '65.7 km',
      rating: 4.2,
      price: '₹182/kg',
      type: 'Private Dealer',
      phone: '+91 487 2334567',
      hours: '7:00 AM - 7:00 PM',
      coordinates: { lat: 10.5276, lng: 76.2144 },
      features: ['Bulk Purchase', 'Transport Service', 'Storage Facility'],
      status: 'Open',
      image: marketImages.m2
    }
  ];

  // Initialize markets state with sample data
  const [markets, setMarkets] = useState(sampleMarkets);

  // Initialize component with default data
  useEffect(() => {
    console.log('🚀 MarketFinder component initialized with', sampleMarkets.length, 'markets');
    // Markets are already initialized in useState, but ensure they're set
    if (markets.length === 0) {
      setMarkets(sampleMarkets);
    }
  }, []);

  // Load Google Maps script with better error handling
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setMapLoaded(true);
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        console.warn('Google Maps API key not configured. Using fallback map.');
        setMapLoaded(false);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Check if the API loaded successfully
        if (window.google && window.google.maps) {
          console.log('✅ Google Maps loaded successfully');
          setMapLoaded(true);
        } else {
          console.error('❌ Google Maps API failed to initialize');
          setMapLoaded(false);
        }
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google Maps script');
        setMapLoaded(false);
      };

      // Add error listener for API key issues
      window.gm_authFailure = () => {
        console.error('❌ Google Maps API authentication failed - Invalid API key');
        setMapLoaded(false);
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const handleLocationSearch = async () => {
    if (!location.trim()) {
      // If no location entered, show all markets
      setMarkets(sampleMarkets);
      return;
    }

    setLoading(true);
    console.log('🔍 Searching for location:', location);

    // Simulate API call delay
    setTimeout(() => {
      const searchTerm = location.toLowerCase().trim();
      let filteredMarkets = [];

      // Enhanced location search with better matching
      if (searchTerm.includes('manimala') || searchTerm.includes('manimalayar')) {
        // Show Manimala-specific markets first
        filteredMarkets = sampleMarkets.filter(market =>
          market.address.toLowerCase().includes('changanacherry') ||
          market.address.toLowerCase().includes('manimalayar') ||
          market.name.toLowerCase().includes('manimalayar') ||
          market.address.toLowerCase().includes('oravackal')
        );
        console.log('📍 Found Manimala markets:', filteredMarkets.length);
      } else if (searchTerm.includes('kottayam')) {
        // Show Kottayam-specific markets first
        filteredMarkets = sampleMarkets.filter(market =>
          market.address.toLowerCase().includes('kottayam')
        );
        console.log('📍 Found Kottayam markets:', filteredMarkets.length);
      } else if (searchTerm.includes('changanacherry')) {
        // Show Changanacherry-specific markets
        filteredMarkets = sampleMarkets.filter(market =>
          market.address.toLowerCase().includes('changanacherry') ||
          market.address.toLowerCase().includes('manimalayar')
        );
        console.log('📍 Found Changanacherry markets:', filteredMarkets.length);
      } else if (searchTerm.includes('thrissur')) {
        filteredMarkets = sampleMarkets.filter(market =>
          market.address.toLowerCase().includes('thrissur')
        );
        console.log('📍 Found Thrissur markets:', filteredMarkets.length);
      } else if (searchTerm.includes('kerala')) {
        // Show all Kerala markets
        filteredMarkets = sampleMarkets;
        console.log('📍 Showing all Kerala markets:', filteredMarkets.length);
      } else {
        // Enhanced general search - look in address, name, and type
        filteredMarkets = sampleMarkets.filter(market =>
          market.address.toLowerCase().includes(searchTerm) ||
          market.name.toLowerCase().includes(searchTerm) ||
          market.type.toLowerCase().includes(searchTerm)
        );
        console.log('📍 General search results:', filteredMarkets.length);
      }

      // Always show results - if no matches found, show message but keep some markets
      if (filteredMarkets.length === 0) {
        console.log('⚠️ No markets found for:', location, '- showing all markets');
        filteredMarkets = sampleMarkets;
      }

      setMarkets(filteredMarkets);
      setLoading(false);
    }, 1000);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log('❌ Geolocation not supported');
      setLocation('Kerala, India (Geolocation not supported)');
      setMarkets(sampleMarkets);
      return;
    }

    setLoading(true);
    console.log('📍 Getting current location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('✅ Location obtained:', { latitude, longitude });

        // In real app, reverse geocode to get address
        // For now, determine closest area based on coordinates
        let locationName = 'Current Location';

        // Simple distance check to determine area (Kottayam region)
        if (Math.abs(latitude - 9.5915) < 0.1 && Math.abs(longitude - 76.5222) < 0.1) {
          locationName = 'Current Location (Kottayam area)';
        } else {
          locationName = 'Current Location (Kerala, India)';
        }

        setLocation(locationName);
        setMarkets(sampleMarkets);
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Location access unavailable';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        console.log(`📍 ${errorMessage}. Using default location.`);
        setLocation('Kerala, India (Default location)');
        setMarkets(sampleMarkets);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  };

  // Enhanced filter and sort markets
  const getFilteredAndSortedMarkets = () => {
    let filteredMarkets = markets;

    // Filter by search query
    if (searchQuery.trim()) {
      filteredMarkets = filteredMarkets.filter(market =>
        market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filteredMarkets = filteredMarkets.filter(market =>
        market.type.toLowerCase().includes(filterType.toLowerCase())
      );
    }

    // Filter by distance (nearby only)
    if (showNearbyOnly) {
      filteredMarkets = filteredMarkets.filter(market => {
        const distance = parseFloat(market.distance.replace(/[^\d.]/g, ''));
        return distance <= maxDistance;
      });
    }

    // Apply sort
    return filteredMarkets.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(a.price.replace('₹', '').replace('/kg', '')) -
                 parseFloat(b.price.replace('₹', '').replace('/kg', ''));
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'distance':
        default:
          return parseFloat(a.distance) - parseFloat(b.distance);
      }
    });
  };

  const filteredAndSortedMarkets = getFilteredAndSortedMarkets();

  return (
    <section id="markets" className="py-20 bg-gradient-to-br from-green-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('findLocalMarkets')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('findLocalMarketsSub')}
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location (e.g., Kottayam, Thrissur, Changanacherry, Manimala)"
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGetCurrentLocation}
                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
                disabled={loading}
              >
                <Navigation className="h-5 w-5" />
                <span>Use Current Location</span>
              </button>
              <button
                onClick={handleLocationSearch}
                disabled={loading || !location.trim()}
                className="px-8 py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
                <span>{loading ? 'Searching...' : 'Find Markets'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        {markets.length > 0 && (
          <div className="space-y-6">
            {/* Header with Controls */}
            <motion.div
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-gray-900">
                Markets Near You ({filteredAndSortedMarkets.length} found)
              </h3>

              {/* Enhanced Search and Filter Controls */}
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search markets by name, location, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Types</option>
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                    <option value="cooperative">Cooperative</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="distance">Sort by Distance</option>
                    <option value="price">Sort by Price</option>
                    <option value="rating">Sort by Rating</option>
                    <option value="name">Sort by Name</option>
                  </select>

                  {/* Nearby Filter Toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="nearbyOnly"
                      checked={showNearbyOnly}
                      onChange={(e) => setShowNearbyOnly(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="nearbyOnly" className="text-sm text-gray-700">
                      Nearby only
                    </label>
                  </div>

                  {/* Distance Slider */}
                  {showNearbyOnly && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Within:</span>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={maxDistance}
                        onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600">{maxDistance}km</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Main Content Area - Map and Markets */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Markets List - Compact Row Layout */}
              <motion.div
                className="xl:col-span-2 space-y-4"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >

              {filteredAndSortedMarkets.map((market, index) => (
                <motion.div
                  key={market.id}
                  className={`bg-white rounded-xl shadow-md hover:shadow-lg p-4 cursor-pointer transition-all duration-300 border-2 ${
                    selectedMarket?.id === market.id ? 'border-primary-500' : 'border-transparent'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => onMarketClick(market)}
                >
                  <div className="flex gap-4">
                    {/* Market Image - Smaller */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={market.image}
                        alt={market.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center hidden">
                        <Building2 className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="absolute top-1 right-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          market.status === 'Open' ? 'bg-green-100 text-green-800' :
                          market.status === 'Closed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {market.status || 'Open'}
                        </span>
                      </div>
                    </div>

                    {/* Market Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-gray-900 truncate">{market.name}</h4>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{market.address}</span>
                          </p>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="text-xl font-bold text-primary-600">{market.price}</div>
                          <div className="text-xs text-gray-500">{market.distance}</div>
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                            <span className="text-xs font-medium text-gray-900">{market.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          market.type === 'Government Authorized' || market.type === 'Government Office' ? 'bg-green-100 text-green-800' :
                          market.type === 'Cooperative Society' ? 'bg-blue-100 text-blue-800' :
                          market.type === 'Rubber Products Supplier' ? 'bg-purple-100 text-purple-800' :
                          market.type === 'Agricultural Service' ? 'bg-emerald-100 text-emerald-800' :
                          market.type === 'Wholesaler' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {market.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {market.phone}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span className={market.status === 'Open' ? 'text-green-600 font-medium' : 'text-red-600'}>
                            {market.hours}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://maps.google.com/maps?daddr=${market.coordinates.lat},${market.coordinates.lng}`, '_blank');
                          }}
                          className="flex-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs font-medium flex items-center justify-center space-x-1"
                        >
                          <Route className="h-3 w-3" />
                          <span>Directions</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${market.phone}`, '_self');
                          }}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium flex items-center space-x-1"
                        >
                          <Phone className="h-3 w-3" />
                          <span>Call</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

              {/* Map Section */}
              <motion.div
                className="xl:col-span-1 xl:sticky xl:top-8"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Market Locations</h3>
                    <p className="text-sm text-gray-600">Click on markers to view details</p>
                  </div>

                  <div className="h-80 xl:h-96 bg-gray-100 relative">
                  {(() => {
                    const hasApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY &&
                                     import.meta.env.VITE_GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';

                    if (mapLoaded && hasApiKey && window.google && window.google.maps) {
                      return <GoogleMapComponent markets={filteredAndSortedMarkets} selectedMarket={selectedMarket} />;
                    } else if (hasApiKey && !mapLoaded) {
                      return (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading interactive map...</p>
                            <p className="text-xs text-gray-500 mt-2">This may take a few moments</p>
                          </div>
                        </div>
                      );
                    } else {
                      return <FallbackMapComponent markets={filteredAndSortedMarkets} selectedMarket={selectedMarket} />;
                    }
                  })()}
                </div>

                {selectedMarket && (
                  <div className="p-6 bg-primary-50 border-t border-primary-200">
                    <h4 className="font-bold text-primary-900 mb-2">{selectedMarket.name}</h4>
                    <p className="text-primary-700 text-sm mb-3">{selectedMarket.address}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary-600">{selectedMarket.price}</span>
                      <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* No Results */}
        {markets.length === 0 && location && !loading && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No markets found</h3>
            <p className="text-gray-600">Try searching for a different location or use your current location.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

// Enhanced Fallback Map Component (when Google Maps is not available)
const FallbackMapComponent = ({ markets, selectedMarket }) => {
  const [selectedFallbackMarket, setSelectedFallbackMarket] = useState(selectedMarket);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-900">Market Locations</h3>
          </div>
          <span className="text-sm text-gray-500">{markets.length} markets found</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Interactive Map Unavailable</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Google Maps requires a valid API key. Showing market list with location details.
                </p>
              </div>
            </div>
          </div>

          {/* Market List */}
          <div className="space-y-4">
            {markets.map((market) => (
              <div
                key={market.id}
                className={`bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  selectedFallbackMarket?.id === market.id
                    ? 'border-primary-500 shadow-lg'
                    : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedFallbackMarket(market)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{market.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{market.address}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{market.distance}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{market.status}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600 mb-1">{market.price}</p>
                      <div className="flex items-center justify-end">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{market.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Market Type Badge */}
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                      {market.type}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://maps.google.com/maps?daddr=${market.coordinates.lat},${market.coordinates.lng}`, '_blank');
                        }}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors"
                      >
                        Directions
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${market.phone}`, '_self');
                        }}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Call
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedFallbackMarket?.id === market.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600"><strong>Hours:</strong> {market.hours}</p>
                          <p className="text-gray-600"><strong>Phone:</strong> {market.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-600"><strong>Features:</strong></p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {market.features?.map((feature, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Setup Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Enable Interactive Map</h4>
              <button
                onClick={() => setShowSetupGuide(true)}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
              >
                Setup Guide
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Get real-time directions, user location detection, and enhanced market discovery with Google Maps integration.
            </p>
          </div>
        </div>
      </div>

      {/* Setup Guide Modal */}
      {showSetupGuide && (
        <GoogleMapsSetup onClose={() => setShowSetupGuide(false)} />
      )}
    </div>
  );
};

// Enhanced Google Map Component with Advanced Features
const GoogleMapComponent = ({ markets, selectedMarket }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Get user's current location with better error handling
  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser. Using default location.');
        setUserLocation({ lat: 9.5915, lng: 76.5222 });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('✅ User location detected:', userPos);
          setUserLocation(userPos);
        },
        (error) => {
          let errorMessage = 'Location access unavailable';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          console.log(`📍 ${errorMessage}. Using Kottayam as default location.`);
          // Fallback to Kottayam center
          setUserLocation({ lat: 9.5915, lng: 76.5222 });
        },
        {
          enableHighAccuracy: false, // Less accurate but faster
          timeout: 5000, // Shorter timeout
          maximumAge: 600000 // 10 minutes cache
        }
      );
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (!window.google || !markets.length || !userLocation) return;

    // Enhanced map styling with better visibility
    const mapStyles = [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#c9c9c9' }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#f0f0f0' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ];

    const map = new window.google.maps.Map(document.getElementById('market-map'), {
      zoom: 10,
      center: userLocation,
      styles: mapStyles,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_CENTER,
      }
    });

    setMapInstance(map);

    // Initialize directions service and renderer
    const dirService = new window.google.maps.DirectionsService();
    const dirRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#10B981',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });
    dirRenderer.setMap(map);
    setDirectionsService(dirService);
    setDirectionsRenderer(dirRenderer);

    // Create bounds to fit all markers
    const bounds = new window.google.maps.LatLngBounds();
    const newMarkers = [];

    // Add user location marker
    if (userLocation) {
      bounds.extend(userLocation);
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#3B82F6" stroke="white" stroke-width="4"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });
      newMarkers.push(userMarker);
    }

    // Helper function to calculate distance between two points
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Create custom marker based on market type
    const getMarkerColor = (type) => {
      switch (type) {
        case 'Government Authorized':
        case 'Government Office': return '#10B981'; // Green
        case 'Cooperative Society': return '#3B82F6'; // Blue
        case 'Rubber Products Supplier': return '#8B5CF6'; // Purple
        case 'Agricultural Service': return '#059669'; // Emerald
        case 'Wholesaler': return '#F59E0B'; // Orange
        case 'Private Dealer': return '#EF4444'; // Red
        default: return '#6B7280'; // Gray
      }
    };

    // Function to show directions
    const showDirectionsToMarket = (market) => {
      if (!directionsService || !userLocation) return;

      directionsService.route({
        origin: userLocation,
        destination: market.coordinates,
        travelMode: window.google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          setShowDirections(true);
        }
      });
    };

    markets.forEach((market) => {
      // Add to bounds
      bounds.extend(market.coordinates);

      // Calculate real-time distance from user location
      const distanceFromUser = userLocation ?
        calculateDistance(userLocation.lat, userLocation.lng, market.coordinates.lat, market.coordinates.lng) : 0;

      const marker = new window.google.maps.Marker({
        position: market.coordinates,
        map: map,
        title: market.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="22" cy="22" r="20" fill="${getMarkerColor(market.type)}" stroke="white" stroke-width="4"/>
              <circle cx="22" cy="22" r="16" fill="white" fill-opacity="0.2"/>
              <text x="22" y="27" text-anchor="middle" fill="white" font-size="14" font-weight="bold">₹</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(44, 44),
          anchor: new window.google.maps.Point(22, 44)
        },
        animation: window.google.maps.Animation.DROP
      });

      newMarkers.push(marker);

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 320px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold; line-height: 1.3;">${market.name}</h3>
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; line-height: 1.4;">${market.address}</p>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 8px; background: #f9fafb; border-radius: 6px;">
              <span style="font-size: 20px; font-weight: bold; color: ${getMarkerColor(market.type)};">${market.price}</span>
              <div style="display: flex; align-items: center;">
                <span style="color: #f59e0b; margin-right: 4px;">★</span>
                <span style="color: #374151; font-weight: 500;">${market.rating}</span>
              </div>
            </div>

            <div style="margin-bottom: 10px;">
              <span style="display: inline-block; padding: 2px 8px; background: ${getMarkerColor(market.type)}20; color: ${getMarkerColor(market.type)}; border-radius: 12px; font-size: 11px; font-weight: 500;">${market.type}</span>
              <span style="display: inline-block; padding: 2px 8px; background: #e5e7eb; color: #374151; border-radius: 12px; font-size: 11px; font-weight: 500; margin-left: 4px;">${distanceFromUser.toFixed(1)} km away</span>
            </div>

            <div style="margin-bottom: 10px; padding: 6px; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #3b82f6;">
              <p style="margin: 0; font-size: 12px; color: #1e40af;"><strong>Hours:</strong> ${market.hours}</p>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #1e40af;"><strong>Phone:</strong> ${market.phone}</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; margin-top: 10px;">
              <button onclick="showDirectionsToMarket_${market.id}()"
                      style="padding: 6px 8px; background: ${getMarkerColor(market.type)}; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 500; cursor: pointer;">
                Route
              </button>
              <button onclick="window.open('https://maps.google.com/maps?daddr=${market.coordinates.lat},${market.coordinates.lng}', '_blank')"
                      style="padding: 6px 8px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 500; cursor: pointer;">
                Navigate
              </button>
              <button onclick="window.open('tel:${market.phone}', '_self')"
                      style="padding: 6px 8px; background: #6b7280; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 500; cursor: pointer;">
                Call
              </button>
            </div>
          </div>
        `
      });

      // Add global function for directions
      window[`showDirectionsToMarket_${market.id}`] = () => showDirectionsToMarket(market);

      marker.addListener('click', () => {
        // Close any open info windows
        markers.forEach(m => {
          if (m.infoWindow) m.infoWindow.close();
        });

        infoWindow.open(map, marker);
        map.setCenter(market.coordinates);
        map.setZoom(14);

        // Clear any existing directions
        if (directionsRenderer) {
          directionsRenderer.setDirections({routes: []});
        }
      });

      // Enhanced hover effects
      marker.addListener('mouseover', () => {
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 750);
      });

      // Store info window reference
      marker.infoWindow = infoWindow;

      if (selectedMarket && selectedMarket.id === market.id) {
        infoWindow.open(map, marker);
        map.setCenter(market.coordinates);
        map.setZoom(14);
      }
    });

    setMarkers(newMarkers);

    // Fit map to show all markers including user location
    if (markets.length > 0) {
      map.fitBounds(bounds);
      // Set maximum zoom level
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }

    // Add map click listener to clear directions
    map.addListener('click', () => {
      if (directionsRenderer && showDirections) {
        directionsRenderer.setDirections({routes: []});
        setShowDirections(false);
      }
    });

  }, [markets, selectedMarket, userLocation]);

  return (
    <div className="relative w-full h-full">
      <div id="market-map" className="w-full h-full" />

      {/* Map Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => {
            if (mapInstance && userLocation) {
              mapInstance.setCenter(userLocation);
              mapInstance.setZoom(12);
            }
          }}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          title="Center on my location"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>My Location</span>
        </button>

        {showDirections && (
          <button
            onClick={() => {
              if (directionsRenderer) {
                directionsRenderer.setDirections({routes: []});
                setShowDirections(false);
              }
            }}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Clear Route</span>
          </button>
        )}
      </div>

      {/* Location Status */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${userLocation ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-700">
            {userLocation ? 'Location detected' : 'Location unavailable'}
          </span>
        </div>
      </div>
    </div>
  );
};

const Markets = () => {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [modalMarket, setModalMarket] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Initialize navigation guard
  const { getUserData } = useNavigationGuard({
    preventBackToLogin: true,
    preventBackToHome: false
  });

  // Check if admin, staff, or broker user is trying to access markets page
  useEffect(() => {
    const { user, isLoggedIn } = getUserData();
    if (isLoggedIn && user?.role === 'admin') {
      console.log('🚫 Admin user detected on markets page, redirecting to dashboard');
      navigate('/admin-dashboard', { replace: true });
    } else if (isLoggedIn && user?.role === 'staff' && user?.useStaffDashboard) {
      console.log('🚫 Staff user detected on markets page, redirecting to staff dashboard');
      navigate('/staff-dashboard', { replace: true });
    } else if (isLoggedIn && user?.role === 'broker') {
      console.log('🚫 Broker user detected on markets page, redirecting to broker dashboard');
      navigate('/broker-dashboard', { replace: true });
    }
  }, [navigate, getUserData]);

  // Generate dynamic price data based on selected timeframe
  const generatePriceData = (timeframe) => {
    const basePrice = 185;
    const dataPoints = {
      '1D': 24, // 24 hours
      '1W': 7,  // 7 days
      '1M': 30, // 30 days
      '3M': 90, // 90 days
      '6M': 180, // 180 days
      '1Y': 365  // 365 days
    };

    const points = dataPoints[timeframe] || 30;
    const data = [];

    for (let i = 0; i < points; i++) {
      const date = new Date();
      let label = '';

      if (timeframe === '1D') {
        date.setHours(date.getHours() - (points - 1 - i));
        label = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (timeframe === '1W') {
        date.setDate(date.getDate() - (points - 1 - i));
        label = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        date.setDate(date.getDate() - (points - 1 - i));
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      // Generate realistic price fluctuations
      const volatility = 0.02; // 2% volatility
      const trend = Math.sin(i / points * Math.PI * 2) * 0.01; // Slight trend
      const randomChange = (Math.random() - 0.5) * volatility;
      const price = basePrice * (1 + trend + randomChange);

      data.push({
        time: label,
        price: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 1000) + 500,
        date: date.toISOString()
      });
    }

    return data;
  };

  const priceData = generatePriceData(selectedTimeframe);

  // Handle timeframe change with loading animation
  const handleTimeframeChange = (timeframe) => {
    setChartLoading(true);
    setTimeout(() => {
      setSelectedTimeframe(timeframe);
      setChartLoading(false);
    }, 300); // Small delay to show loading state
  };

  // Calculate price change
  const calculatePriceChange = () => {
    if (priceData.length < 2) return { change: 0, percentage: 0 };

    const currentPrice = priceData[priceData.length - 1].price;
    const previousPrice = priceData[priceData.length - 2].price;
    const change = currentPrice - previousPrice;
    const percentage = ((change / previousPrice) * 100);

    return { change: change.toFixed(2), percentage: percentage.toFixed(2) };
  };

  const priceChange = calculatePriceChange();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">
              ₹{payload[0].value}/kg
            </p>
            <p className="text-xs text-gray-500">
              Volume: {data.volume} MT
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Modal handlers
  const handleMarketClick = (market) => {
    setModalMarket(market);
    setShowMarketModal(true);
  };

  const closeModal = () => {
    setShowMarketModal(false);
    setModalMarket(null);
  };

  const marketData = [
    {
      market: "Singapore Exchange",
      price: "$1,845",
      change: "+2.3%",
      trend: "up",
      volume: "12,450 MT",
      location: "Singapore"
    },
    {
      market: "Tokyo Commodity Exchange",
      price: "$1,832",
      change: "-0.8%",
      trend: "down",
      volume: "8,920 MT",
      location: "Japan"
    },
    {
      market: "Shanghai Futures Exchange",
      price: "$1,856",
      change: "+1.7%",
      trend: "up",
      volume: "15,680 MT",
      location: "China"
    },
    {
      market: "Kuala Lumpur Exchange",
      price: "$1,840",
      change: "+0.5%",
      trend: "up",
      volume: "9,340 MT",
      location: "Malaysia"
    }
  ];

  const priceAlerts = [
    {
      type: "Target Reached",
      message: "RSS3 price reached your target of $1,850/MT",
      time: "2 hours ago",
      icon: <Target className="h-5 w-5 text-green-500" />
    },
    {
      type: "Market Update",
      message: "Strong demand from automotive sector driving prices up",
      time: "4 hours ago",
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />
    },
    {
      type: "Weather Alert",
      message: "Heavy rainfall expected in major producing regions",
      time: "6 hours ago",
      icon: <AlertCircle className="h-5 w-5 text-orange-500" />
    }
  ];

  const marketInsights = [
    {
      title: "Global Demand Outlook",
      description: "Automotive industry recovery driving increased rubber demand",
      trend: "+5.2%",
      period: "Q3 2024"
    },
    {
      title: "Supply Chain Analysis",
      description: "Southeast Asian production levels stabilizing after weather disruptions",
      trend: "+2.1%",
      period: "This Month"
    },
    {
      title: "Price Forecast",
      description: "Technical analysis suggests continued upward momentum",
      trend: "+3.8%",
      period: "Next 30 Days"
    }
  ];

  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y'];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      


      {/* Market Finder */}
      <MarketFinder onMarketClick={handleMarketClick} />

      {/* Market Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('market.globalMarkets')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('market.globalMarketsSub')}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            {marketData.map((market, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{market.location}</span>
                  </div>
                  {market.trend === 'up' ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{market.market}</h3>
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">{market.price}</span>
                  <span className={`text-sm font-medium ${
                    market.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {market.change}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Volume: {market.volume}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Price Chart Placeholder */}
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-bold text-gray-900">{t('market.priceChart')}</h3>
                <button
                  onClick={() => handleTimeframeChange(selectedTimeframe)} // Trigger refresh
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Refresh data"
                  disabled={chartLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${chartLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 mr-2">Timeframe:</span>
                <div className="flex space-x-1">
                  {timeframes.map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => handleTimeframeChange(timeframe)}
                      disabled={chartLoading}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                        selectedTimeframe === timeframe
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-80 relative">
              {chartLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Updating chart...</p>
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#10B981"
                    strokeWidth={3}
                    fill="url(#priceGradient)"
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: 'white' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Price Statistics */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                <div className="text-sm text-primary-600 mb-1 font-medium">{t('market.currentPrice')}</div>
                <div className="text-xl font-bold text-primary-900">₹{priceData[priceData.length - 1]?.price}/kg</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="text-sm text-gray-600 mb-1 font-medium">{t('market.change')}</div>
                <div className={`text-xl font-bold flex items-center justify-center ${
                  parseFloat(priceChange.percentage) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {parseFloat(priceChange.percentage) >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {priceChange.percentage}%
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="text-sm text-green-600 mb-1 font-medium">{t('market.high')} ({selectedTimeframe})</div>
                <div className="text-xl font-bold text-green-900">₹{Math.max(...priceData.map(d => d.price)).toFixed(2)}</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                <div className="text-sm text-red-600 mb-1 font-medium">{t('market.low')} ({selectedTimeframe})</div>
                <div className="text-xl font-bold text-red-900">₹{Math.min(...priceData.map(d => d.price)).toFixed(2)}</div>
              </div>
            </div>

            {/* Market Insights */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">{t('market.marketInsight')}</h4>
                  <p className="text-sm text-blue-700">
                    {parseFloat(priceChange.percentage) >= 0
                      ? t('market.insightUp').replace('%{percent}', priceChange.percentage)
                      : t('market.insightDown').replace('%{percent}', Math.abs(priceChange.percentage))
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Market Insights */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Insights */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('market.insights')}</h2>
              <div className="space-y-6">
                {marketInsights.map((insight, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      <span className="text-green-600 font-medium">{insight.trend}</span>
                    </div>
                    <p className="text-gray-600 mb-2">{insight.description}</p>
                    <span className="text-sm text-gray-500">{insight.period}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Price Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('market.priceAlerts')}</h2>
              <div className="space-y-4">
                {priceAlerts.map((alert, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-start space-x-3">
                      {alert.icon}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{alert.type}</h4>
                          <span className="text-sm text-gray-500">{alert.time}</span>
                        </div>
                        <p className="text-gray-600">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link to="/register">
                  <button className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                    {t('market.setCustomAlerts')}
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* Market Details Modal */}
      {showMarketModal && modalMarket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header with Image */}
            <div className="relative h-48 rounded-t-2xl overflow-hidden bg-gradient-to-r from-primary-500 to-primary-600">
              <img
                src={modalMarket.image}
                alt={modalMarket.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <div className="absolute bottom-4 left-6 text-white">
                <h2 className="text-2xl font-bold mb-1">{modalMarket.name}</h2>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(modalMarket.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm">{modalMarket.rating}</span>
                  </div>
                  <span className="text-sm opacity-80">•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    modalMarket.type === 'Government Authorized' || modalMarket.type === 'Government Office' ? 'bg-green-100 text-green-800' :
                    modalMarket.type === 'Cooperative Society' ? 'bg-blue-100 text-blue-800' :
                    modalMarket.type === 'Rubber Products Supplier' ? 'bg-purple-100 text-purple-800' :
                    modalMarket.type === 'Agricultural Service' ? 'bg-emerald-100 text-emerald-800' :
                    modalMarket.type === 'Wholesaler' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {modalMarket.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Overview Tab */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-8">
                  <button className="pb-2 border-b-2 border-primary-500 text-primary-600 font-medium">
                    Overview
                  </button>
                  <button className="pb-2 text-gray-500 hover:text-gray-700">
                    Reviews
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                <button
                  onClick={() => {
                    window.open(`https://maps.google.com/maps?daddr=${modalMarket.coordinates.lat},${modalMarket.coordinates.lng}`, '_blank');
                  }}
                  className="flex flex-col items-center p-3 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors"
                >
                  <Navigation className="w-6 h-6 text-primary-600 mb-1" />
                  <span className="text-xs font-medium text-primary-600">Directions</span>
                </button>
                <button className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Bookmark className="w-6 h-6 text-gray-600 mb-1" />
                  <span className="text-xs font-medium text-gray-600">Save</span>
                </button>
                <button className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <MapPin className="w-6 h-6 text-gray-600 mb-1" />
                  <span className="text-xs font-medium text-gray-600">Nearby</span>
                </button>
                <button
                  onClick={() => {
                    if (modalMarket.phone && modalMarket.phone !== 'No phone listed') {
                      window.open(`tel:${modalMarket.phone}`, '_self');
                    }
                  }}
                  className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Phone className="w-6 h-6 text-gray-600 mb-1" />
                  <span className="text-xs font-medium text-gray-600">Call</span>
                </button>
                <button className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Share2 className="w-6 h-6 text-gray-600 mb-1" />
                  <span className="text-xs font-medium text-gray-600">Share</span>
                </button>
              </div>

              {/* Details */}
              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-900 font-medium">{modalMarket.address}</p>
                    <p className="text-sm text-gray-500">{modalMarket.distance} away</p>
                  </div>
                </div>

                {/* Phone */}
                {modalMarket.phone && modalMarket.phone !== 'No phone listed' && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <p className="text-gray-900">{modalMarket.phone}</p>
                  </div>
                )}

                {/* Hours */}
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className={`font-medium ${
                      modalMarket.status === 'Open' ? 'text-green-600' :
                      modalMarket.status === 'Closed' ? 'text-red-600' :
                      modalMarket.status === 'Temporarily closed' ? 'text-orange-600' :
                      'text-gray-600'
                    }`}>
                      {modalMarket.status}
                    </p>
                    <p className="text-sm text-gray-500">{modalMarket.hours}</p>
                    {modalMarket.opensAt && (
                      <p className="text-sm text-gray-500">Opens {modalMarket.opensAt}</p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900 font-medium">Current Rate</p>
                    <p className="text-2xl font-bold text-primary-600">{modalMarket.price}</p>
                  </div>
                </div>

                {/* Features */}
                {modalMarket.features && modalMarket.features.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-gray-900 font-medium mb-2">Features</p>
                      <div className="flex flex-wrap gap-2">
                        {modalMarket.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Call to Action */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      window.open(`https://maps.google.com/maps?daddr=${modalMarket.coordinates.lat},${modalMarket.coordinates.lng}`, '_blank');
                    }}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Navigation className="w-5 h-5" />
                    <span>Get Directions</span>
                  </button>
                  {modalMarket.phone && modalMarket.phone !== 'No phone listed' && (
                    <button
                      onClick={() => {
                        window.open(`tel:${modalMarket.phone}`, '_self');
                      }}
                      className="flex-1 border border-primary-600 text-primary-600 hover:bg-primary-50 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Call Now</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2024 RubberEco. All rights reserved. Empowering sustainable rubber farming.
            </p>
          </div>
        </div>
      </footer>

      {/* Google Maps Setup Guide Modal */}
      {showSetupGuide && (
        <GoogleMapsSetup onClose={() => setShowSetupGuide(false)} />
      )}
    </div>
  );
};

export default Markets;
