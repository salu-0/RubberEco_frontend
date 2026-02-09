import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaGavel,
  FaArrowLeft,
  FaDollarSign,
  FaTree,
  FaMapMarkerAlt,
  FaWeight,
  FaCalendarAlt,
  FaUser,
  FaComments,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import './BidPage.css';
import { numericValidator } from '../utils/validation';
import toastService from '../services/toastService';

const BidPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lot, setLot] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidComment, setBidComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [bidHistory, setBidHistory] = useState([]);
  const [hasBidders, setHasBidders] = useState(false);
  const [publicBids, setPublicBids] = useState([]); // bids from public lot endpoint

  useEffect(() => {
    // Get lot data from location state or fetch from API
    if (location.state?.lot) {
      setLot(location.state.lot);
      // Set minimum bid amount
      const minBid = Math.max(location.state.lot.currentHighestBid + 1000, location.state.lot.minimumPrice);
      setBidAmount(minBid.toString());
    } else {
      // If no lot data, redirect back to broker dashboard
      navigate('/broker-dashboard');
    }
  }, [location.state, navigate]);

  // Load bid history once lot is available
  useEffect(() => {
    if (lot) {
      loadBidHistory();
      loadLotBidSummary();
    }
  }, [lot]);

  const loadBidHistory = async () => {
    if (!lot) return;

    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setBidHistory([]);
        return;
      }

      // Call real API to get bid history for this lot
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/bids/history?lotId=${lot.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch bid history');
      }

      // Transform the data to match the expected format
      const transformedHistory = (result.data || []).map(bid => ({
        id: bid.id,
        bidderName: bid.bidderName || 'Anonymous Bidder',
        amount: bid.amount,
        timestamp: bid.bidTime || bid.createdAt,
        isWinning: bid.isWinning || false
      }));

      setBidHistory(transformedHistory);
    } catch (error) {
      console.error('Error loading bid history:', error);
      setBidHistory([]);
    }
  };

  // Fetch public lot details to know if any bidders exist (any broker)
  const loadLotBidSummary = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE_URL}/tree-lots/${lot.id}`);
      if (!res.ok) return setHasBidders(false);
      const json = await res.json();
      const bidsArr = json?.data?.bids || [];
      const bidCount = json?.data?.bidCount || bidsArr.length;
      setHasBidders(bidCount > 0);
      setPublicBids(bidsArr);
    } catch (e) {
      console.warn('Failed to load lot bid summary:', e);
      setHasBidders(false);
      setPublicBids([]);
    }
  };

  const validateBid = () => {
    const newErrors = {};
    const amountErr = numericValidator(bidAmount, { allowEmpty: false, min: Math.max(lot.minimumPrice, lot.currentHighestBid + 1000) });
    if (amountErr) {
      newErrors.bidAmount = amountErr === 'This field is required' ? 'Please enter a valid bid amount' : amountErr;
    }

    if (bidComment && bidComment.length > 500) {
      newErrors.bidComment = 'Comment must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();

    if (!validateBid()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const bidData = {
        lotId: lot.id,
        amount: parseFloat(bidAmount),
        comment: bidComment.trim()
      };

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Call real API
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bidData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit bid');
      }

      // Show professional success message with bid details
      toastService.success(`🎉 Bid submitted successfully! Your bid of ${formatCurrency(bidData.amount)} for lot #${lot.id} has been placed and is now active.`, {
        duration: 8000,
        persistent: false
      });

      // Navigate back to broker dashboard after a short delay
      setTimeout(() => {
        navigate('/broker-dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error submitting bid:', error);
      setErrors({ submit: 'Failed to submit bid. Please try again.' });

      // Show professional error message
      toastService.error('❌ Failed to submit bid. Please check your connection and try again.', {
        duration: 7000
      });
    } finally {
      setIsSubmitting(false);
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!lot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lot details...</p>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(lot.biddingEndDate);
  const isUrgent = daysRemaining <= 3;
  const minBidAmount = Math.max(lot.currentHighestBid + 1000, lot.minimumPrice);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 mb-8 ring-1 ring-black/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/broker-dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
              >
                <FaArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <FaGavel className="h-8 w-8 text-primary-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Place Your Bid
              </h1>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lot Information */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Lot Details Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ring-1 ring-black/5">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="lot-image-container">
                  <img src={lot.images[0]} alt={`Lot ${lot.id}`} className="lot-image" />
                  <div className="lot-badge">#{lot.id}</div>
                  {isUrgent && (
                    <div className="urgent-indicator">
                      <FaExclamationTriangle />
                      {daysRemaining} days left
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{lot.farmerName}</h2>
                  <div className="space-y-3">
                    <div className="detail-row">
                      <FaMapMarkerAlt className="text-primary-600" />
                      <span className="text-gray-700">{lot.location}</span>
                    </div>
                    <div className="detail-row">
                      <FaTree className="text-primary-600" />
                      <span className="text-gray-700">{lot.numberOfTrees} Trees</span>
                    </div>
                    <div className="detail-row">
                      <FaWeight className="text-primary-600" />
                      <span className="text-gray-700">{lot.approximateYield}</span>
                    </div>
                    <div className="detail-row">
                      <FaCalendarAlt className="text-primary-600" />
                      <span className="text-gray-700">Ends: {formatDateTime(lot.biddingEndDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ring-1 ring-black/5">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pricing Information</h3>
              <div className="space-y-4">
                <div className="price-item">
                  <span className="text-gray-600">Minimum Price:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(lot.minimumPrice)}</span>
                </div>
                <div className="price-item current">
                  <span className="text-gray-600">Current Highest:</span>
                  <span className="font-semibold text-primary-600">{formatCurrency(lot.currentHighestBid)}</span>
                </div>
                <div className="price-item minimum">
                  <span className="text-gray-600">Your Minimum Bid:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(minBidAmount)}</span>
                </div>
              </div>
            </div>

            {/* Bidding Form */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ring-1 ring-black/5">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Submit Your Bid</h3>
              <form onSubmit={handleSubmitBid} className="space-y-6">
                <div className="form-group">
                  <label htmlFor="bidAmount" className="form-label">
                    <FaDollarSign />
                    Bid Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="bidAmount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={minBidAmount}
                    step="1000"
                    placeholder={`Minimum: ₹${minBidAmount.toLocaleString()}`}
                    className={`form-input ${errors.bidAmount ? 'error' : ''}`}
                  />
                  {errors.bidAmount && (
                    <span className="error-message">{errors.bidAmount}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="bidComment" className="form-label">
                    <FaComments />
                    Comment (Optional)
                  </label>
                  <textarea
                    id="bidComment"
                    value={bidComment}
                    onChange={(e) => setBidComment(e.target.value)}
                    placeholder="Add a comment or message for the farmer..."
                    rows="4"
                    maxLength="500"
                    className={`form-textarea ${errors.bidComment ? 'error' : ''}`}
                  />
                  <div className="character-count">
                    {bidComment.length}/500 characters
                  </div>
                  {errors.bidComment && (
                    <span className="error-message">{errors.bidComment}</span>
                  )}
                </div>

                {errors.submit && (
                  <div className="submit-error">
                    <FaExclamationTriangle />
                    {errors.submit}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => navigate('/broker-dashboard')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaGavel />
                        Place Bid
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Bidders Status Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ring-1 ring-black/5 sticky top-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser />
                Bidders Status
              </h4>
              {(hasBidders || bidHistory.length > 0) ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
                    <FaCheckCircle className="shrink-0" />
                    <div>
                      <p className="font-medium">Bidders exist for this tree lot</p>
                      {publicBids.length > 0 && (
                        <p className="text-sm text-green-800">{publicBids.length} bid(s) placed so far.</p>
                      )}
                    </div>
                  </div>

                  {publicBids.length > 0 && (
                    <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
                      {publicBids.slice(0, 5).map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-2 text-gray-800">
                            <FaUser className="text-gray-500" />
                            <span className="font-medium">{b.bidderName || 'Bidder'}</span>
                          </div>
                          <div className="text-primary-700 font-semibold">{formatCurrency(b.amount)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <FaExclamationTriangle className="shrink-0 text-amber-500" />
                  <div>
                    <p className="font-medium">No bidders yet</p>
                    <p className="text-sm">Be the first to place a bid.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BidPage;
