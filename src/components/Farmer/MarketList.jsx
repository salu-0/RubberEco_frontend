import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  MapPin,
  Phone,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  Navigation,
  X,
  Search,
  Filter,
  Eye,
  Bookmark,
  BookmarkCheck,
  RefreshCw
} from 'lucide-react';

const MarketList = ({ isOpen, onClose }) => {
  const [markets, setMarkets] = useState([]);
  const [filteredMarkets, setFilteredMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [savedMarkets, setSavedMarkets] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      loadMarkets();
    }
  }, [isOpen]);

  useEffect(() => {
    filterMarkets();
  }, [markets, searchTerm, locationFilter]);

  const loadMarkets = async () => {
    try {
      // Mock data - replace with actual API call
      const mockMarkets = [
        {
          id: 'MKT001',
          name: 'Kottayam Rubber Market',
          location: 'Kottayam, Kerala',
          distance: '2.5 km',
          currentPrice: '₹185/kg',
          priceChange: '+5.2%',
          priceChangeType: 'increase',
          lastUpdated: '2 hours ago',
          openingHours: '6:00 AM - 6:00 PM',
          contactNumber: '+91 9876543210',
          rating: 4.8,
          reviews: 156,
          specialties: ['RSS1', 'RSS3', 'Latex'],
          facilities: ['Weighing', 'Quality Testing', 'Storage'],
          coordinates: { lat: 9.5915, lng: 76.5222 }
        },
        {
          id: 'MKT002',
          name: 'Ernakulam Commodity Exchange',
          location: 'Ernakulam, Kerala',
          distance: '45 km',
          currentPrice: '₹182/kg',
          priceChange: '-2.1%',
          priceChangeType: 'decrease',
          lastUpdated: '1 hour ago',
          openingHours: '7:00 AM - 7:00 PM',
          contactNumber: '+91 9876543211',
          rating: 4.6,
          reviews: 203,
          specialties: ['RSS1', 'RSS2', 'Crepe Rubber'],
          facilities: ['Weighing', 'Quality Testing', 'Storage', 'Transport'],
          coordinates: { lat: 9.9312, lng: 76.2673 }
        },
        {
          id: 'MKT003',
          name: 'Wayanad Farmers Market',
          location: 'Wayanad, Kerala',
          distance: '78 km',
          currentPrice: '₹180/kg',
          priceChange: '+1.8%',
          priceChangeType: 'increase',
          lastUpdated: '3 hours ago',
          openingHours: '5:30 AM - 5:30 PM',
          contactNumber: '+91 9876543212',
          rating: 4.4,
          reviews: 89,
          specialties: ['Organic Rubber', 'RSS3', 'Latex'],
          facilities: ['Weighing', 'Organic Certification', 'Storage'],
          coordinates: { lat: 11.6854, lng: 76.1320 }
        },
        {
          id: 'MKT004',
          name: 'Thiruvananthapuram Central Market',
          location: 'Thiruvananthapuram, Kerala',
          distance: '120 km',
          currentPrice: '₹188/kg',
          priceChange: '+3.7%',
          priceChangeType: 'increase',
          lastUpdated: '1 hour ago',
          openingHours: '6:30 AM - 6:30 PM',
          contactNumber: '+91 9876543213',
          rating: 4.9,
          reviews: 312,
          specialties: ['RSS1', 'RSS2', 'RSS3', 'Latex', 'Crepe'],
          facilities: ['Weighing', 'Quality Testing', 'Storage', 'Transport', 'Banking'],
          coordinates: { lat: 8.5241, lng: 76.9366 }
        }
      ];
      
      setMarkets(mockMarkets);
      setLoading(false);
    } catch (error) {
      console.error('Error loading markets:', error);
      setLoading(false);
    }
  };

  const filterMarkets = () => {
    let filtered = [...markets];

    if (searchTerm) {
      filtered = filtered.filter(market =>
        market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        market.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(market => 
        market.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Sort by distance by default
    filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    setFilteredMarkets(filtered);
  };

  const toggleSaveMarket = (marketId) => {
    setSavedMarkets(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(marketId)) {
        newSaved.delete(marketId);
      } else {
        newSaved.add(marketId);
      }
      return newSaved;
    });
  };

  const getPriceChangeColor = (changeType) => {
    return changeType === 'increase' ? 'text-green-600' : 'text-red-600';
  };

  const getPriceChangeIcon = (changeType) => {
    return changeType === 'increase' ? TrendingUp : TrendingDown;
  };

  const refreshMarkets = () => {
    setLoading(true);
    loadMarkets();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Local Market List</h2>
              <p className="text-orange-100">Find nearby rubber markets and current prices</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshMarkets}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search markets by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Locations</option>
                <option value="kottayam">Kottayam</option>
                <option value="ernakulam">Ernakulam</option>
                <option value="wayanad">Wayanad</option>
                <option value="thiruvananthapuram">Thiruvananthapuram</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">Loading markets...</p>
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No markets found</h3>
              <p className="text-gray-600">No markets match your current search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMarkets.map((market, index) => {
                const PriceIcon = getPriceChangeIcon(market.priceChangeType);
                return (
                  <motion.div
                    key={market.id}
                    className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {/* Market Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{market.name}</h3>
                          <button
                            onClick={() => toggleSaveMarket(market.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {savedMarkets.has(market.id) ? (
                              <BookmarkCheck className="h-4 w-4 text-orange-500" />
                            ) : (
                              <Bookmark className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {market.location}
                          </span>
                          <span className="flex items-center">
                            <Navigation className="h-4 w-4 mr-1" />
                            {market.distance}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{market.rating}</span>
                            <span className="text-xs text-gray-500">({market.reviews})</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">{market.currentPrice}</p>
                        <div className={`flex items-center justify-end space-x-1 ${getPriceChangeColor(market.priceChangeType)}`}>
                          <PriceIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{market.priceChange}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{market.lastUpdated}</p>
                      </div>
                    </div>

                    {/* Market Details */}
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Opening Hours</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {market.openingHours}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Contact</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {market.contactNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Rubber Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {market.specialties.map((specialty, index) => (
                          <span key={index} className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Facilities */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Facilities:</p>
                      <div className="flex flex-wrap gap-1">
                        {market.facilities.map((facility, index) => (
                          <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Market ID: {market.id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-medium">
                          <Eye className="h-4 w-4 inline mr-1" />
                          Details
                        </button>
                        <button className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
                          <Navigation className="h-4 w-4 inline mr-1" />
                          Directions
                        </button>
                        <button className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg text-sm font-medium">
                          <Phone className="h-4 w-4 inline mr-1" />
                          Call
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MarketList;
