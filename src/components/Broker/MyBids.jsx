import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gavel,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  TreePine,
  MapPin,
  DollarSign,
  User,
  Calendar,
  Filter,
  Search,
  Bell,
  MessageCircle,
  TrendingUp,
  Award
} from 'lucide-react';

// Import local images
import b1Image from '../../assets/images/bid/b1.jpg';
import b2Image from '../../assets/images/bid/b2.jpg';
import b3Image from '../../assets/images/bid/b3.jpg';
import { getSafeImageUrl, handleImageError } from '../../utils/imageUtils';
import toastService from '../../services/toastService';

const MyBids = () => {
  const [myBids, setMyBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadMyBids();
  }, []);

  // Refresh bids when component becomes visible (e.g., when switching tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadMyBids();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    filterAndSortBids();
  }, [myBids, searchTerm, statusFilter, sortBy]);

  const loadMyBids = async () => {
    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setMyBids([]);
        setLoading(false);
        return;
      }

      // Call real API
      const response = await fetch('http://localhost:5000/api/bids/my-bids', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch bids');
      }

      setMyBids(result.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading my bids:', error);
      setMyBids([]);
      setLoading(false);
    }
  };

  const filterAndSortBids = () => {
    let filtered = [...myBids];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bid => 
        bid.lotInfo.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.lotInfo.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.lotId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bid => bid.status === statusFilter);
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.bidTime) - new Date(b.bidTime));
        break;
      case 'amount':
        filtered.sort((a, b) => b.myBidAmount - a.myBidAmount);
        break;
      case 'ending':
        filtered.sort((a, b) => new Date(a.biddingEndDate) - new Date(b.biddingEndDate));
        break;
      default:
        break;
    }

    setFilteredBids(filtered);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'winning':
        return {
          icon: CheckCircle,
          color: '#48bb78',
          text: 'Winning',
          bgColor: '#f0fff4'
        };
      case 'outbid':
        return {
          icon: AlertTriangle,
          color: '#ed8936',
          text: 'Outbid',
          bgColor: '#fffaf0'
        };
      case 'active':
        return {
          icon: Clock,
          color: '#667eea',
          text: 'Active',
          bgColor: '#f7fafc'
        };
      case 'won':
        return {
          icon: CheckCircle,
          color: '#38a169',
          text: 'Won',
          bgColor: '#f0fff4'
        };
      case 'lost':
        return {
          icon: AlertTriangle,
          color: '#e53e3e',
          text: 'Lost',
          bgColor: '#fed7d7'
        };
      case 'expired':
        return {
          icon: Clock,
          color: '#a0aec0',
          text: 'Expired',
          bgColor: '#f7fafc'
        };
      default:
        return {
          icon: Clock,
          color: '#a0aec0',
          text: 'Unknown',
          bgColor: '#f7fafc'
        };
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₹0';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Invalid Date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    
    const today = new Date();
    const end = new Date(endDate);
    
    if (isNaN(end.getTime())) {
      return 0;
    }
    
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStatusCounts = () => {
    return {
      all: myBids.length,
      winning: myBids.filter(bid => bid.status === 'winning').length,
      outbid: myBids.filter(bid => bid.status === 'outbid').length,
      active: myBids.filter(bid => bid.status === 'active').length,
      won: myBids.filter(bid => bid.status === 'won').length,
      lost: myBids.filter(bid => bid.status === 'lost').length
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-gray-600">Loading your bids...</p>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <Gavel className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Bids</h2>
            <p className="text-gray-600">Track and monitor all your bidding activities</p>
          </div>
        </div>
        <button
          onClick={loadMyBids}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </div>
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 cursor-pointer hover:shadow-2xl transition-all duration-300"
          onClick={() => setStatusFilter('all')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Gavel className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
              <div className="text-sm text-gray-600">Total Bids</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 cursor-pointer hover:shadow-2xl transition-all duration-300"
          onClick={() => setStatusFilter('winning')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{statusCounts.winning}</div>
              <div className="text-sm text-gray-600">Winning</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 cursor-pointer hover:shadow-2xl transition-all duration-300"
          onClick={() => setStatusFilter('outbid')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{statusCounts.outbid}</div>
              <div className="text-sm text-gray-600">Outbid</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 cursor-pointer hover:shadow-2xl transition-all duration-300"
          onClick={() => setStatusFilter('won')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{statusCounts.won}</div>
              <div className="text-sm text-gray-600">Won</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by farmer, location, or lot ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="min-w-[150px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="winning">Winning</option>
                <option value="outbid">Outbid</option>
                <option value="active">Active</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div className="min-w-[150px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount">Highest Bid</option>
                <option value="ending">Ending Soon</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">Showing {filteredBids.length} of {myBids.length} bids</p>
      </div>

      {/* Bids List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBids.map((bid, index) => (
          <motion.div
            key={bid.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <BidCard
              bid={bid}
              getStatusInfo={getStatusInfo}
              formatCurrency={formatCurrency}
              formatDateTime={formatDateTime}
              getDaysRemaining={getDaysRemaining}
            />
          </motion.div>
        ))}
      </div>

      {filteredBids.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <Gavel className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bids found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </motion.div>
      )}
    </div>
  );
};

// Bid Card Component
const BidCard = ({ bid, getStatusInfo, formatCurrency, formatDateTime, getDaysRemaining }) => {
  const statusInfo = getStatusInfo(bid.status);
  const StatusIcon = statusInfo.icon;
  const daysRemaining = getDaysRemaining(bid.biddingEndDate);
  const isUrgent = daysRemaining <= 3 && (bid.status === 'winning' || bid.status === 'active');

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getSafeImageUrl(bid.lotInfo.image)}
          alt={`Lot ${bid.lotId}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => handleImageError(e, 0)}
        />

        {/* Lot ID Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
          #{bid.lotId}
        </div>

        {/* Urgent Badge */}
        {isUrgent && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{daysRemaining} days left</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute bottom-3 right-3">
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
            bid.status === 'winning' ? 'bg-green-100 text-green-800' :
            bid.status === 'outbid' ? 'bg-orange-100 text-orange-800' :
            bid.status === 'won' ? 'bg-blue-100 text-blue-800' :
            bid.status === 'lost' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            <StatusIcon className="h-3 w-3" />
            <span>{statusInfo.text}</span>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{bid.lotInfo.farmerName}</h3>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{bid.lotInfo.location}</span>
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
              <p className="text-sm font-semibold text-gray-900">{bid.lotInfo.numberOfTrees}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Yield</p>
              <p className="text-sm font-semibold text-gray-900">{bid.lotInfo.approximateYield}</p>
            </div>
          </div>
        </div>

        {/* Bid End Date */}
        <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Ends: {formatDateTime(bid.biddingEndDate)}</span>
        </div>

        {/* Pricing Section */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">My Bid:</span>
            <span className="font-bold text-primary-600">{formatCurrency(bid.myBidAmount)}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Current Highest:</span>
            <span className={`font-semibold ${
              (bid.myBidAmount || 0) >= (bid.currentHighestBid || 0) ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(bid.currentHighestBid)}
            </span>
          </div>
          <div className="flex items-center justify-center text-xs text-gray-500">
            <span>{bid.totalBids || 0} total bids</span>
            <span className="mx-2">•</span>
            <span>Placed: {formatDateTime(bid.bidTime)}</span>
          </div>
        </div>

        {/* Comment */}
        {bid.comment && (
          <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg mb-4">
            <MessageCircle className="h-4 w-4 text-blue-500 mt-0.5" />
            <p className="text-sm text-blue-800 italic">"{bid.comment}"</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">View Details</span>
          </button>

          {(bid.status === 'outbid' || bid.status === 'active') && (
            <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Gavel className="h-4 w-4" />
              <span className="text-sm font-medium">Place New Bid</span>
            </button>
          )}

          {bid.status === 'winning' && (
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  if (!token) return;
                  const res = await fetch(`http://localhost:5000/api/bids/${bid.lotId}/alerts`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  if (res.ok) {
                    toastService.success(`Reminder enabled. We'll email you 24 hours before Lot #${bid.lotId} bidding ends.`, { duration: 6000 });
                  } else {
                    toastService.error('Could not enable reminder. Please try again.');
                  }
                } catch (e) {
                  console.warn('Failed to set alert', e);
                  toastService.error('Could not enable reminder. Please try again.');
                }
              }}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">Set Alert</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBids;
