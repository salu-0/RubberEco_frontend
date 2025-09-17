import React, { useState, useEffect } from 'react';
import { 
  FaGavel, 
  FaTimes, 
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
import './BiddingModal.css';
import { numericValidator, maxLength } from '../../utils/validation';

const BiddingModal = ({ isOpen, onClose, lot, onSubmitBid }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [bidComment, setBidComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [bidHistory, setBidHistory] = useState([]);

  useEffect(() => {
    if (isOpen && lot) {
      loadBidHistory();
      // Set minimum bid amount
      const minBid = Math.max(lot.currentHighestBid + 1000, lot.minimumPrice);
      setBidAmount(minBid.toString());
    }
  }, [isOpen, lot]);

  const loadBidHistory = async () => {
    try {
      // TODO: Replace with actual API call
      const mockHistory = [
        {
          id: 1,
          bidderName: 'Anonymous Bidder',
          amount: lot?.currentHighestBid || 0,
          timestamp: '2024-01-25 14:30:00',
          isWinning: true
        },
        {
          id: 2,
          bidderName: 'Anonymous Bidder',
          amount: (lot?.currentHighestBid || 0) - 2000,
          timestamp: '2024-01-25 12:15:00',
          isWinning: false
        },
        {
          id: 3,
          bidderName: 'Anonymous Bidder',
          amount: (lot?.currentHighestBid || 0) - 5000,
          timestamp: '2024-01-25 10:45:00',
          isWinning: false
        }
      ];
      setBidHistory(mockHistory);
    } catch (error) {
      console.error('Error loading bid history:', error);
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
        comment: bidComment.trim(),
        timestamp: new Date().toISOString()
      };

      await onSubmitBid(bidData);
      
      // Reset form
      setBidAmount('');
      setBidComment('');
      setErrors({});
      
      // Close modal after successful bid
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting bid:', error);
      setErrors({ submit: 'Failed to submit bid. Please try again.' });
    } finally {
      setIsSubmitting(false);
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

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  if (!isOpen || !lot) return null;

  const daysRemaining = getDaysRemaining(lot.biddingEndDate);
  const isUrgent = daysRemaining <= 3;
  const minBidAmount = Math.max(lot.currentHighestBid + 1000, lot.minimumPrice);

  return (
    <div className="bidding-modal-overlay">
      <div className="bidding-modal">
        <div className="modal-header">
          <h2>
            <FaGavel className="modal-icon" />
            Place Your Bid
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          {/* Lot Information */}
          <div className="lot-info-section">
            <div className="lot-summary">
              <div className="lot-image">
                <img src={lot.images[0]} alt={`Lot ${lot.id}`} />
                <div className="lot-badge">#{lot.id}</div>
                {isUrgent && (
                  <div className="urgent-indicator">
                    <FaExclamationTriangle />
                    {daysRemaining} days left
                  </div>
                )}
              </div>
              
              <div className="lot-details">
                <h3>{lot.farmerName}</h3>
                <div className="detail-row">
                  <FaMapMarkerAlt />
                  <span>{lot.location}</span>
                </div>
                <div className="detail-row">
                  <FaTree />
                  <span>{lot.numberOfTrees} Trees</span>
                </div>
                <div className="detail-row">
                  <FaWeight />
                  <span>{lot.approximateYield}</span>
                </div>
                <div className="detail-row">
                  <FaCalendarAlt />
                  <span>Ends: {formatDateTime(lot.biddingEndDate)}</span>
                </div>
              </div>
            </div>

            <div className="pricing-summary">
              <div className="price-item">
                <span className="label">Minimum Price:</span>
                <span className="value">{formatCurrency(lot.minimumPrice)}</span>
              </div>
              <div className="price-item current">
                <span className="label">Current Highest:</span>
                <span className="value">{formatCurrency(lot.currentHighestBid)}</span>
              </div>
              <div className="price-item minimum">
                <span className="label">Your Minimum Bid:</span>
                <span className="value">{formatCurrency(minBidAmount)}</span>
              </div>
            </div>
          </div>

          {/* Bidding Form */}
          <div className="bidding-form-section">
            <form onSubmit={handleSubmitBid}>
              <div className="form-group">
                <label htmlFor="bidAmount">
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
                  className={errors.bidAmount ? 'error' : ''}
                />
                {errors.bidAmount && (
                  <span className="error-message">{errors.bidAmount}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="bidComment">
                  <FaComments />
                  Comment (Optional)
                </label>
                <textarea
                  id="bidComment"
                  value={bidComment}
                  onChange={(e) => setBidComment(e.target.value)}
                  placeholder="Add a comment or message for the farmer..."
                  rows="3"
                  maxLength="500"
                  className={errors.bidComment ? 'error' : ''}
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
                  onClick={onClose}
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

          {/* Bid History */}
          <div className="bid-history-section">
            <h4>Recent Bidding Activity</h4>
            <div className="bid-history-list">
              {bidHistory.map((bid, index) => (
                <div key={bid.id} className={`bid-item ${bid.isWinning ? 'winning' : ''}`}>
                  <div className="bid-info">
                    <div className="bidder-info">
                      <FaUser className="bidder-icon" />
                      <span className="bidder-name">{bid.bidderName}</span>
                      {bid.isWinning && (
                        <span className="winning-badge">
                          <FaCheckCircle />
                          Winning
                        </span>
                      )}
                    </div>
                    <div className="bid-amount">{formatCurrency(bid.amount)}</div>
                  </div>
                  <div className="bid-time">{formatDateTime(bid.timestamp)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingModal;
