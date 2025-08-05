import React, { useState, useEffect } from 'react';
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
  Users
} from 'lucide-react';
import BiddingModal from './BiddingModal';

// Import local images
import b1Image from '../../assets/images/bid/b1.jpg';
import b2Image from '../../assets/images/bid/b2.jpg';
import b3Image from '../../assets/images/bid/b3.jpg';

// Tree Lot Card Component
const TreeLotCard = ({ lot, onBid, onViewDetails, formatCurrency, getDaysRemaining }) => {
  const daysRemaining = getDaysRemaining(lot.biddingEndDate);
  const isUrgent = daysRemaining <= 3;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={lot.images[0]}
          alt={`Tree Lot ${lot.id}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = b1Image;
          }}
        />

        {/* Lot ID Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
          #{lot.id}
        </div>

        {/* Urgent Badge */}
        {isUrgent && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{daysRemaining} days left</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{lot.farmerName}</h3>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{lot.location}</span>
          </div>
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
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Users className="h-3 w-3" />
              <span>{lot.bidCount} bid{lot.bidCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
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
  const [treeLots, setTreeLots] = useState([]);
  const [filteredLots, setFilteredLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLot, setSelectedLot] = useState(null);
  const [isBiddingModalOpen, setIsBiddingModalOpen] = useState(false);
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
      // TODO: Replace with actual API call
      const mockData = [
        {
          id: 'RT001',
          farmerId: 'F001',
          farmerName: 'John Doe',
          location: 'Kottayam, Kerala',
          coordinates: { lat: 9.5916, lng: 76.5222 },
          numberOfTrees: 150,
          approximateYield: '2.5 tons',
          minimumPrice: 75000,
          currentHighestBid: 78000,
          bidCount: 3,
          images: [
            b1Image,
            b1Image
          ],
          description: 'Mature rubber trees, 15-20 years old, excellent tapping condition',
          biddingEndDate: '2024-02-15',
          status: 'active',
          createdAt: '2024-01-20'
        },
        {
          id: 'RT002',
          farmerId: 'F002',
          farmerName: 'Maria Sebastian',
          location: 'Idukki, Kerala',
          coordinates: { lat: 9.8312, lng: 76.9447 },
          numberOfTrees: 200,
          approximateYield: '3.2 tons',
          minimumPrice: 95000,
          currentHighestBid: 95000,
          bidCount: 1,
          images: [
            b2Image
          ],
          description: 'Premium quality rubber plantation with high yield potential',
          biddingEndDate: '2024-02-18',
          status: 'active',
          createdAt: '2024-01-22'
        },
        {
          id: 'RT003',
          farmerId: 'F003',
          farmerName: 'Ravi Kumar',
          location: 'Wayanad, Kerala',
          coordinates: { lat: 11.6854, lng: 76.1320 },
          numberOfTrees: 100,
          approximateYield: '1.8 tons',
          minimumPrice: 55000,
          currentHighestBid: 62000,
          bidCount: 5,
          images: [
            b3Image,
            b3Image,
            b3Image
          ],
          description: 'Well-maintained trees in prime location with easy access',
          biddingEndDate: '2024-02-12',
          status: 'active',
          createdAt: '2024-01-18'
        }
      ];
      
      setTreeLots(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading tree lots:', error);
      setLoading(false);
    }
  };

  const filterAndSortLots = () => {
    let filtered = [...treeLots];

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
      setSelectedLot(lot);
      setIsBiddingModalOpen(true);
    }
  };

  const handleViewDetails = (lotId) => {
    // TODO: Open lot details modal
    console.log('View details for lot:', lotId);
  };

  const handleSubmitBid = async (bidData) => {
    try {
      // TODO: Replace with actual API call
      console.log('Submitting bid:', bidData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the lot with new highest bid (mock update)
      setTreeLots(prevLots =>
        prevLots.map(lot =>
          lot.id === bidData.lotId
            ? {
                ...lot,
                currentHighestBid: bidData.amount,
                bidCount: lot.bidCount + 1
              }
            : lot
        )
      );

      // Show success message
      alert('Bid submitted successfully!');

    } catch (error) {
      console.error('Error submitting bid:', error);
      throw error;
    }
  };

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

      {/* Bidding Modal */}
      <BiddingModal
        isOpen={isBiddingModalOpen}
        onClose={() => {
          setIsBiddingModalOpen(false);
          setSelectedLot(null);
        }}
        lot={selectedLot}
        onSubmitBid={handleSubmitBid}
      />
    </div>
  );
};

export default BrowseTreeLots;
