import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TreePine,
  MapPin,
  DollarSign,
  Weight,
  Calendar,
  Gavel,
  Eye,
  Filter,
  Search,
  Clock,
  TrendingUp,
  Users,
  X,
  Phone,
  Mail,
  User,
  Calendar as CalendarIcon,
  Award,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Import local images
import b1Image from '../../assets/images/bid/b1.jpg';
import b2Image from '../../assets/images/bid/b2.jpg';
import b3Image from '../../assets/images/bid/b3.jpg';
import { getSafeImageUrl, handleImageError, processImageUrls } from '../../utils/imageUtils';

// Tree Lot Card Component
const TreeLotCard = ({ lot, onBid, onViewDetails, formatCurrency, getDaysRemaining }) => {
  const daysRemaining = getDaysRemaining(lot.biddingEndDate);
  const isUrgent = daysRemaining <= 3;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getSafeImageUrl(lot.images[0])}
          alt={`Tree Lot ${lot.id}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => handleImageError(e, 0)}
        />

        {/* Lot ID Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
          #{lot.id}
        </div>

        {/* Right-side badges stack */}
        <div className="absolute top-3 right-3 flex flex-col items-end space-y-2">
          {/* Urgent Badge */}
          {isUrgent && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{daysRemaining} days left</span>
            </div>
          )}
          {/* Bid Count Badge */}
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800 flex items-center space-x-1 shadow-sm">
            <Users className="h-3 w-3" />
            <span>{lot.bidCount} bid{lot.bidCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{lot.farmerName}</h3>
          <div className="flex items-center text-gray-600 justify-between">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{lot.location}</span>
            {(lot.farmerPhone || lot.farmerEmail) && (
              <span className="text-xs text-gray-500">{lot.farmerPhone || lot.farmerEmail}</span>
            )}
          </div>
          {lot.hasMyBid && lot.myBrokerName && (
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 border border-primary-200">
                Bid by {lot.myBrokerName}
              </span>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TreePine className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Trees</p>
              <p className="text-sm font-semibold text-gray-900">{lot.numberOfTrees}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Weight className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Yield</p>
              <p className="text-sm font-semibold text-gray-900">{lot.approximateYield}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{lot.description}</p>

        {/* Pricing Section */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Minimum Price:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(lot.minimumPrice)}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Current Highest:</span>
            <span className="font-bold text-primary-600">{formatCurrency(lot.currentHighestBid)}</span>
          </div>
          {!lot.hasMyBid && (
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>{lot.bidCount} bid{lot.bidCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
            onClick={() => onViewDetails(lot.id)}
          >
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">View Details</span>
          </button>
          <button
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={() => onBid(lot.id)}
          >
            <Gavel className="h-4 w-4" />
            <span className="text-sm font-medium">Place Bid</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const BrowseTreeLots = () => {
  const navigate = useNavigate();
  const [treeLots, setTreeLots] = useState([]);
  const [filteredLots, setFilteredLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLotForDetails, setSelectedLotForDetails] = useState(null);
  const [selectedLotBids, setSelectedLotBids] = useState([]);
  const [myBidForSelectedLot, setMyBidForSelectedLot] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    location: '',
    minTrees: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    loadTreeLots();
  }, []);

  useEffect(() => {
    filterAndSortLots();
  }, [treeLots, searchTerm, filters]);

  const loadTreeLots = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tree-lots');
      if (!response.ok) throw new Error('Failed to load tree lots');
      const data = await response.json();
      // Map of lots from main list
      let lots = (data.data || []).map((lot) => ({
        id: lot.lotId || lot._id,
        location: lot.location,
        numberOfTrees: lot.numberOfTrees,
        approximateYield: lot.approximateYield,
        minimumPrice: lot.minimumPrice,
        description: lot.description || '',
        images: processImageUrls(lot.images),
        biddingEndDate: lot.biddingEndDate,
        createdAt: lot.createdAt,
        currentHighestBid: lot.currentHighestBid ?? lot.minimumPrice,
        bidCount: lot.bidCount ?? 0,
        farmerName: lot.farmerId?.name || 'Farmer',
        farmerEmail: lot.farmerId?.email || '',
        farmerPhone: lot.farmerId?.phone || '',
        hasMyBid: false,
        myBrokerName: ''
      }));

      // Enrich with broker's own bids to highlight cards
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (token) {
          const myBidsRes = await fetch('http://localhost:5000/api/bids/my-bids', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (myBidsRes.ok) {
            const myBidsJson = await myBidsRes.json();
            const myLotIds = new Set((myBidsJson.data || []).map((b) => b.lotId));
            const brokerName = user?.name || 'You';
            lots = lots.map((lot) => (
              myLotIds.has(lot.id)
                ? { ...lot, hasMyBid: true, myBrokerName: brokerName }
                : lot
            ));
          }
        }
      } catch (e) {
        // Non-fatal; proceed without enrichment
        console.warn('Unable to load my bids for highlighting:', e);
      }
      setTreeLots(lots);
      setLoading(false);
    } catch (error) {
      console.error('Error loading tree lots:', error);
      setLoading(false);
    }
  };

  const filterAndSortLots = () => {
    let filtered = [...treeLots];

    // Remove lots already bidded by the logged-in broker
    filtered = filtered.filter(lot => !lot.hasMyBid);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lot => 
        lot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filters
    if (filters.minPrice) {
      filtered = filtered.filter(lot => lot.minimumPrice >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(lot => lot.minimumPrice <= parseInt(filters.maxPrice));
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(lot => 
        lot.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Trees count filter
    if (filters.minTrees) {
      filtered = filtered.filter(lot => lot.numberOfTrees >= parseInt(filters.minTrees));
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'priceHigh':
        filtered.sort((a, b) => b.minimumPrice - a.minimumPrice);
        break;
      case 'priceLow':
        filtered.sort((a, b) => a.minimumPrice - b.minimumPrice);
        break;
      case 'trees':
        filtered.sort((a, b) => b.numberOfTrees - a.numberOfTrees);
        break;
      default:
        break;
    }

    setFilteredLots(filtered);
  };

  const handleBidClick = (lotId) => {
    const lot = treeLots.find(l => l.id === lotId);
    if (lot) {
      navigate(`/bid/${lotId}`, { state: { lot } });
    }
  };

  const handleViewDetails = async (lotId) => {
    const baseLot = treeLots.find(l => l.id === lotId);
    if (!baseLot) return;

    // Open modal immediately with base info for responsiveness
    setSelectedLotForDetails(baseLot);
    setIsDetailsModalOpen(true);
    setSelectedLotBids([]);
    setMyBidForSelectedLot(null);

    // Fetch detailed bids for this lot (public endpoint)
    try {
      const lotRes = await fetch(`http://localhost:5000/api/tree-lots/${lotId}`);
      if (lotRes.ok) {
        const lotJson = await lotRes.json();
        const detailed = lotJson?.data || {};
        // Merge refreshed values like currentHighestBid/bidCount and store bids
        setSelectedLotForDetails((prev) => ({
          ...prev,
          currentHighestBid: detailed.currentHighestBid ?? prev.currentHighestBid,
          bidCount: detailed.bidCount ?? prev.bidCount,
          description: detailed.description || prev.description,
        }));
        setSelectedLotBids(detailed.bids || []);
      }
    } catch (e) {
      console.warn('Failed to load lot details:', e);
    }

    // Try to fetch current broker's bid for this lot
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const myBidsRes = await fetch('http://localhost:5000/api/bids/my-bids?limit=100', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (myBidsRes.ok) {
          const myBidsJson = await myBidsRes.json();
          const mine = (myBidsJson.data || []).find((b) => (b.lotId === lotId));
          if (mine) setMyBidForSelectedLot(mine);
        }
      }
    } catch (e) {
      console.warn('Failed to load my bid for lot:', e);
    }
  };

  // bidder details toggle removed

  // This function is no longer needed as bidding is handled in BidPage
  // const handleSubmitBid = async (bidData) => {
  //   // Moved to BidPage component
  // };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-gray-600">Loading available tree lots...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <TreePine className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Available Tree Lots</h2>
            <p className="text-gray-600">Browse and bid on rubber tree lots posted by farmers across Kerala</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredLots.length} of {treeLots.length} available lots
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by location, farmer name, or lot ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Min Price</label>
            <input
              type="number"
              placeholder="₹ Min"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              className="w-full px-3 py-2 bg-white/90 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Max Price</label>
            <input
              type="number"
              placeholder="₹ Max"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              className="w-full px-3 py-2 bg-white/90 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="w-full px-3 py-2 bg-white/90 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Min Trees</label>
            <input
              type="number"
              placeholder="Trees"
              value={filters.minTrees}
              onChange={(e) => setFilters({...filters, minTrees: e.target.value})}
              className="w-full px-3 py-2 bg-white/90 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="w-full px-3 py-2 bg-white/90 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="trees">Most Trees</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Tree Lots Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filteredLots.map((lot, index) => (
          <motion.div
            key={lot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <TreeLotCard
              lot={lot}
              onBid={handleBidClick}
              onViewDetails={handleViewDetails}
              formatCurrency={formatCurrency}
              getDaysRemaining={getDaysRemaining}
            />
          </motion.div>
        ))}
      </motion.div>

      {filteredLots.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <TreePine className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tree lots found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </motion.div>
      )}


      {/* Tree Lot Details Modal */}
      {isDetailsModalOpen && selectedLotForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Modal Header */}
            <div className="relative">
              <div className="h-64 bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl overflow-hidden">
                <img
                  src={getSafeImageUrl(selectedLotForDetails.images[0])}
                  alt={`Tree Lot ${selectedLotForDetails.id}`}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, 0)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedLotForDetails(null);
                  }}
                  className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                <div className="absolute bottom-4 left-6 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                      #{selectedLotForDetails.id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getDaysRemaining(selectedLotForDetails.biddingEndDate) <= 3 
                        ? 'bg-red-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      {getDaysRemaining(selectedLotForDetails.biddingEndDate)} days left
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{selectedLotForDetails.farmerName}</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{selectedLotForDetails.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TreePine className="w-4 h-4" />
                      <span className="text-sm">{selectedLotForDetails.numberOfTrees} trees</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <TreePine className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">{selectedLotForDetails.numberOfTrees}</div>
                  <div className="text-sm text-green-600">Trees</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Weight className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{selectedLotForDetails.approximateYield}</div>
                  <div className="text-sm text-blue-600">Expected Yield</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">{formatCurrency(selectedLotForDetails.minimumPrice)}</div>
                  <div className="text-sm text-purple-600">Minimum Price</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-900">{selectedLotForDetails.bidCount}</div>
                  <div className="text-sm text-orange-600">Bids</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedLotForDetails.description || 'No description provided for this tree lot.'}
                </p>
              </div>

              {/* Farmer Information */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Farmer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-medium text-gray-900">{selectedLotForDetails.farmerName}</div>
                    </div>
                  </div>
                  {selectedLotForDetails.farmerPhone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Phone</div>
                        <div className="font-medium text-gray-900">{selectedLotForDetails.farmerPhone}</div>
                      </div>
                    </div>
                  )}
                  {selectedLotForDetails.farmerEmail && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium text-gray-900">{selectedLotForDetails.farmerEmail}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-medium text-gray-900">{selectedLotForDetails.location}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bidding Information */}
              <div className="bg-primary-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Gavel className="w-5 h-5 mr-2" />
                  Bidding Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Minimum Price</div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(selectedLotForDetails.minimumPrice)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Current Highest Bid</div>
                    <div className="text-2xl font-bold text-primary-600">{formatCurrency(selectedLotForDetails.currentHighestBid)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Bidding Ends</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date(selectedLotForDetails.biddingEndDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getDaysRemaining(selectedLotForDetails.biddingEndDate)} days remaining
                    </div>
                  </div>
                </div>
                {/* My Bid, if any */}
                {myBidForSelectedLot ? (
                  <div className="mt-6 bg-white rounded-xl p-4 border border-primary-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-semibold text-primary-700">Your Bid</span>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(myBidForSelectedLot.bidTime).toLocaleString()}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(myBidForSelectedLot.myBidAmount)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={"text-sm font-medium capitalize " + (myBidForSelectedLot.status === 'winning' ? 'text-green-700' : 'text-gray-700')}>{myBidForSelectedLot.status}</span>
                    </div>
                  </div>
                ) : null}

                {/* bidder details toggle removed */}
              </div>

              {/* Bids List */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Bids
                </h3>
                {selectedLotBids && selectedLotBids.length > 0 ? (
                  <div className="space-y-3">
                    {selectedLotBids.map((bid, idx) => {
                      return (
                        <div key={bid.id || idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-xs font-semibold">
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{bid.bidderName}</div>
                              <div className="text-xs text-gray-500">{new Date(bid.timestamp).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold ${bid.isWinning ? 'text-primary-700' : 'text-gray-900'}`}>{formatCurrency(bid.amount)}</div>
                            {bid.isWinning && (
                              <div className="text-xs text-primary-600">Highest</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No bids yet.</div>
                )}
              </div>

              {/* Tree Lot Features */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Tree Lot Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900">Mature rubber trees ready for tapping</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900">Well-maintained plantation</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900">Good soil quality and drainage</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900">Accessible location</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedLotForDetails(null);
                    // Navigate to bid page
                    navigate(`/bid/${selectedLotForDetails.id}`, { state: { lot: selectedLotForDetails } });
                  }}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Gavel className="w-5 h-5" />
                  <span>Place Bid</span>
                </button>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedLotForDetails(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Close</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BrowseTreeLots;
