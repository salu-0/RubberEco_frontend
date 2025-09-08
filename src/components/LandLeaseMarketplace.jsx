import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  TreePine,
  Ruler,
  Droplets,
  Star,
  Clock,
  CheckCircle,
  Users,
  Heart,
  MessageCircle,
  X,
  SlidersHorizontal
} from 'lucide-react';

const LandLeaseMarketplace = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLand, setSelectedLand] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    location: '',
    minArea: '',
    maxArea: '',
    minRate: '',
    maxRate: '',
    soilType: '',
    waterSource: '',
    leaseDuration: '',
    hasExistingTrees: '',
    sortBy: 'newest'
  });

  // Available land offerings - will be loaded from API
  const [availableLands, setAvailableLands] = useState([]);

  // Load available tenancy offerings on component mount
  useEffect(() => {
    loadAvailableOfferings();
  }, []);

  const loadAvailableOfferings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tenancy-offerings?status=available`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableLands(data.data || []);
      }
    } catch (error) {
      console.error('Error loading available offerings:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleFavorite = (landId) => {
    setAvailableLands(prev =>
      prev.map(land =>
        land.id === landId
          ? { ...land, isFavorited: !land.isFavorited }
          : land
      )
    );
  };

  const handleViewDetails = (land) => {
    setSelectedLand(land);
    // Increment view count
    setAvailableLands(prev =>
      prev.map(l =>
        l.id === land.id
          ? { ...l, views: l.views + 1 }
          : l
      )
    );
  };

  const handleContactOwner = (land) => {
    setSelectedLand(land);
    setShowContactModal(true);
    // Increment inquiry count
    setAvailableLands(prev =>
      prev.map(l =>
        l.id === land.id
          ? { ...l, inquiries: l.inquiries + 1 }
          : l
      )
    );
  };

  // Filter and search logic
  const filteredLands = availableLands.filter(land => {
    const matchesSearch = (land.landTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (land.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (land.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !filters.location || land.district.toLowerCase().includes(filters.location.toLowerCase());
    const matchesMinArea = !filters.minArea || parseFloat(land.totalArea) >= parseFloat(filters.minArea);
    const matchesMaxArea = !filters.maxArea || parseFloat(land.totalArea) <= parseFloat(filters.maxArea);
    const matchesMinRate = !filters.minRate || land.tenancyRate >= parseFloat(filters.minRate);
    const matchesMaxRate = !filters.maxRate || land.tenancyRate <= parseFloat(filters.maxRate);
    const matchesSoilType = !filters.soilType || land.soilType === filters.soilType;
    const matchesWaterSource = !filters.waterSource || land.waterSource === filters.waterSource;
    const matchesExistingTrees = !filters.hasExistingTrees || 
                                (filters.hasExistingTrees === 'yes' && land.existingTrees) ||
                                (filters.hasExistingTrees === 'no' && !land.existingTrees);

    return matchesSearch && matchesLocation && matchesMinArea && matchesMaxArea && 
           matchesMinRate && matchesMaxRate && matchesSoilType && matchesWaterSource && matchesExistingTrees;
  });

  // Sort logic
  const sortedLands = [...filteredLands].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.postedDate) - new Date(a.postedDate);
      case 'oldest':
        return new Date(a.postedDate) - new Date(b.postedDate);
      case 'price_low':
        return a.tenancyRate - b.tenancyRate;
      case 'price_high':
        return b.tenancyRate - a.tenancyRate;
      case 'area_small':
        return parseFloat(a.totalArea) - parseFloat(b.totalArea);
      case 'area_large':
        return parseFloat(b.totalArea) - parseFloat(a.totalArea);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Rubber Tapping Tenancy Marketplace</h2>
              <p className="text-purple-100">Browse and acquire agricultural lands for rubber tapping tenancy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by land title, location, or owner name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="area_small">Area: Small to Large</option>
              <option value="area_large">Area: Large to Small</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              className="mt-4 p-4 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="District"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Area (hectares)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minArea}
                    onChange={(e) => handleFilterChange('minArea', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Area (hectares)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={filters.maxArea}
                    onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                  <select
                    value={filters.soilType}
                    onChange={(e) => handleFilterChange('soilType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="">Any</option>
                    <option value="Red Laterite">Red Laterite</option>
                    <option value="Alluvial">Alluvial</option>
                    <option value="Black Cotton">Black Cotton</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Existing Trees</label>
                  <select
                    value={filters.hasExistingTrees}
                    onChange={(e) => handleFilterChange('hasExistingTrees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="">Any</option>
                    <option value="yes">With Trees</option>
                    <option value="no">Without Trees</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results */}
        <div className="p-6 max-h-[calc(90vh-300px)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Available Lands ({sortedLands.length})
            </h3>
          </div>

          {sortedLands.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Lands Found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {sortedLands.map((land) => (
                <motion.div
                  key={land.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {land.landTitle || `Land at ${land.location}`}
                        </h3>
                        {land.verified && (
                          <CheckCircle className="h-5 w-5 text-green-500" title="Verified Land" />
                        )}
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{land.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 flex items-center mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {land.location}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Owner: {land.ownerName}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleFavorite(land.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          land.isFavorited
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${land.isFavorited ? 'fill-current' : ''}`} />
                      </button>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">
                          ₹{land.tenancyRate.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {land.rateType.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Ruler className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Area: {land.totalArea}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Duration: {land.tenancyDuration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Water: {land.waterSource}</span>
                    </div>
                    {land.existingTrees && (
                      <div className="flex items-center space-x-2">
                        <TreePine className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">{land.numberOfTrees} trees</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{land.views} views</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{land.inquiries} inquiries</span>
                      </span>
                      <span>Posted: {new Date(land.postedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(land)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={() => handleContactOwner(land)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Contact Owner</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Contact Modal */}
      {showContactModal && selectedLand && (
        <ContactOwnerModal
          land={selectedLand}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </motion.div>
  );
};

// Contact Owner Modal Component
const ContactOwnerModal = ({ land, onClose }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    // TODO: Implement message sending functionality
    console.log('Sending message to:', land.ownerName, message);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Owner</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-900">
              {land.landTitle || `Land at ${land.location}`}
            </h4>
            <p className="text-sm text-gray-600">{land.location}</p>
            <p className="text-sm text-gray-600">Owner: {land.ownerName}</p>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <button
                onClick={() => window.open(`tel:${land.ownerPhone}`)}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Phone className="h-4 w-4" />
                <span>Call</span>
              </button>
              <button
                onClick={() => window.open(`mailto:${land.ownerEmail}`)}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send a Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Hi, I'm interested in leasing your land. Could we discuss the terms?"
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Message
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LandLeaseMarketplace;
