import React, { useState, useEffect } from 'react';
import { 
  FaHistory, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaGavel,
  FaTree,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaDownload,
  FaEye,
  FaSortAmountDown,
  FaSortAmountUp,
  FaPhone,
  FaEnvelope,
  FaWhatsapp
} from 'react-icons/fa';
import './BidHistory.css';

// Import local images
import b1Image from '../../assets/images/bid/b1.jpg';
import { getSafeImageUrl, handleImageError } from '../../utils/imageUtils';
import b2Image from '../../assets/images/bid/b2.jpg';
import b3Image from '../../assets/images/bid/b3.jpg';

const BidHistory = () => {
  const [bidHistory, setBidHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    minAmount: '',
    maxAmount: '',
    sortBy: 'newest'
  });
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);

  useEffect(() => {
    loadBidHistory();
  }, []);

  useEffect(() => {
    filterAndSortHistory();
  }, [bidHistory, searchTerm, filters]);

  const loadBidHistory = async () => {
    try {
      // TODO: Replace with actual API call to fetch real bid history
      // For now, setting empty array - no mock data
      const history = [];


      setBidHistory(history);
      setLoading(false);
    } catch (error) {
      console.error('Error loading bid history:', error);
      setLoading(false);
    }
  };

  const filterAndSortHistory = () => {
    let filtered = [...bidHistory];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bid => 
        bid.lotInfo.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.lotInfo.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.lotId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(bid => bid.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(bid => new Date(bid.bidTime) >= filterDate);
    }

    // Amount filters
    if (filters.minAmount) {
      filtered = filtered.filter(bid => bid.bidAmount >= parseInt(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(bid => bid.bidAmount <= parseInt(filters.maxAmount));
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.bidTime) - new Date(b.bidTime));
        break;
      case 'amountHigh':
        filtered.sort((a, b) => b.bidAmount - a.bidAmount);
        break;
      case 'amountLow':
        filtered.sort((a, b) => a.bidAmount - b.bidAmount);
        break;
      default:
        break;
    }

    setFilteredHistory(filtered);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'won':
        return { 
          icon: FaCheckCircle, 
          color: '#48bb78', 
          text: 'Won', 
          bgColor: '#f0fff4' 
        };
      case 'lost':
        return { 
          icon: FaTimesCircle, 
          color: '#e53e3e', 
          text: 'Lost', 
          bgColor: '#fed7d7' 
        };
      case 'rejected':
        return { 
          icon: FaTimesCircle, 
          color: '#ed8936', 
          text: 'Rejected', 
          bgColor: '#fffaf0' 
        };
      case 'expired':
        return { 
          icon: FaClock, 
          color: '#a0aec0', 
          text: 'Expired', 
          bgColor: '#f7fafc' 
        };
      default:
        return { 
          icon: FaClock, 
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

  const getStatusCounts = () => {
    return {
      all: bidHistory.length,
      won: bidHistory.filter(bid => bid.status === 'won').length,
      lost: bidHistory.filter(bid => bid.status === 'lost').length,
      rejected: bidHistory.filter(bid => bid.status === 'rejected').length,
      expired: bidHistory.filter(bid => bid.status === 'expired').length
    };
  };

  const exportHistory = () => {
    // TODO: Implement export functionality
    console.log('Exporting bid history...');
  };

  const openContactModal = (bid) => {
    setSelectedBid(bid);
    setShowContactModal(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading bid history...</p>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="bid-history">
      <div className="history-header">
        <div className="header-content">
          <h2>
            <FaHistory className="section-icon" />
            Bid History
          </h2>
          <p className="section-description">
            Complete record of all your bidding activities and results
          </p>
        </div>
        <button className="export-btn" onClick={exportHistory}>
          <FaDownload />
          Export History
        </button>
      </div>

      {/* Status Summary */}
      <div className="status-summary">
        <div className="status-card" onClick={() => setFilters({...filters, status: 'all'})}>
          <div className="status-count">{statusCounts.all}</div>
          <div className="status-label">Total Bids</div>
        </div>
        <div className="status-card won" onClick={() => setFilters({...filters, status: 'won'})}>
          <div className="status-count">{statusCounts.won}</div>
          <div className="status-label">Won</div>
        </div>
        <div className="status-card lost" onClick={() => setFilters({...filters, status: 'lost'})}>
          <div className="status-count">{statusCounts.lost}</div>
          <div className="status-label">Lost</div>
        </div>
        <div className="status-card rejected" onClick={() => setFilters({...filters, status: 'rejected'})}>
          <div className="status-count">{statusCounts.rejected}</div>
          <div className="status-label">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by farmer, location, or lot ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
              <option value="all">All Status</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Date Range</label>
            <select value={filters.dateRange} onChange={(e) => setFilters({...filters, dateRange: e.target.value})}>
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Min Amount</label>
            <input
              type="number"
              placeholder="₹ Min"
              value={filters.minAmount}
              onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
            />
          </div>
          
          <div className="filter-group">
            <label>Max Amount</label>
            <input
              type="number"
              placeholder="₹ Max"
              value={filters.maxAmount}
              onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
            />
          </div>
          
          <div className="filter-group">
            <label>Sort By</label>
            <select value={filters.sortBy} onChange={(e) => setFilters({...filters, sortBy: e.target.value})}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amountHigh">Amount: High to Low</option>
              <option value="amountLow">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>Showing {filteredHistory.length} of {bidHistory.length} bids</p>
      </div>

      {/* History List */}
      <div className="history-list">
        {filteredHistory.map(bid => (
          <HistoryCard 
            key={bid.id} 
            bid={bid} 
            getStatusInfo={getStatusInfo}
            formatCurrency={formatCurrency}
            formatDateTime={formatDateTime}
            openContactModal={openContactModal}
          />
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="no-results">
          <FaHistory className="no-results-icon" />
          <h3>No bid history found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Contact Farmer Modal */}
      {showContactModal && selectedBid && (
        <div className="contact-modal-overlay">
          <div className="contact-modal">
            <div className="contact-modal-header">
              <h3>Contact Farmer</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedBid(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="farmer-details">
              <h4>{selectedBid.lotInfo.farmerName}</h4>
              <p>📧 {selectedBid.lotInfo.farmerEmail || 'No email provided'}</p>
              <p>📞 {selectedBid.lotInfo.farmerPhone || 'No phone provided'}</p>
            </div>

            <div className="contact-options">
              {selectedBid.lotInfo.farmerPhone && (
                <a
                  href={`tel:${selectedBid.lotInfo.farmerPhone}`}
                  className="contact-btn call-btn"
                >
                  <FaPhone /> Call Farmer
                </a>
              )}

              {selectedBid.lotInfo.farmerEmail && (
                <a
                  href={`mailto:${selectedBid.lotInfo.farmerEmail}?subject=Regarding your lot ${selectedBid.lotId}&body=Dear ${selectedBid.lotInfo.farmerName},%0D%0A%0D%0ARegarding your lot ${selectedBid.lotId} at ${selectedBid.lotInfo.location}.%0D%0A%0D%0ABest regards,%0D%0ARubberEco Team`}
                  className="contact-btn email-btn"
                >
                  <FaEnvelope /> Send Email
                </a>
              )}

              {selectedBid.lotInfo.farmerPhone && (
                <button
                  onClick={() => {
                    const message = `Hello ${selectedBid.lotInfo.farmerName}, regarding your lot ${selectedBid.lotId} at ${selectedBid.lotInfo.location}. We will get back to you soon.`;
                    const whatsappUrl = `https://wa.me/${selectedBid.lotInfo.farmerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="contact-btn whatsapp-btn"
                >
                  <FaWhatsapp /> WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// History Card Component
const HistoryCard = ({ bid, getStatusInfo, formatCurrency, formatDateTime, openContactModal }) => {
  const statusInfo = getStatusInfo(bid.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="history-card">
      <div className="history-image">
        <img src={getSafeImageUrl(bid.lotInfo.image)} alt={`Lot ${bid.lotId}`} onError={(e) => handleImageError(e, 0)} />
        <div className="lot-badge">#{bid.lotId}</div>
      </div>

      <div className="history-content">
        <div className="history-header">
          <div className="lot-info">
            <h3>{bid.lotInfo.farmerName}</h3>
            <div className="location">
              <FaMapMarkerAlt />
              <span>{bid.lotInfo.location}</span>
            </div>
          </div>
          
          <div className="status-badge" style={{ 
            backgroundColor: statusInfo.bgColor, 
            color: statusInfo.color 
          }}>
            <StatusIcon />
            <span>{statusInfo.text}</span>
          </div>
        </div>

        <div className="lot-details">
          <div className="detail-item">
            <FaTree />
            <span>{bid.lotInfo.numberOfTrees} Trees</span>
          </div>
          <div className="detail-item">
            <span>{bid.lotInfo.approximateYield}</span>
          </div>
          <div className="detail-item">
            <FaCalendarAlt />
            <span>Bid: {formatDateTime(bid.bidTime)}</span>
          </div>
          {bid.resultDate && (
            <div className="detail-item">
              <span>Result: {formatDateTime(bid.resultDate)}</span>
            </div>
          )}
        </div>

        <div className="bid-details">
          <div className="bid-amounts">
            <div className="amount-item">
              <span className="label">My Bid:</span>
              <span className="my-bid">{formatCurrency(bid.bidAmount)}</span>
            </div>
            {bid.finalAmount && (
              <div className="amount-item">
                <span className="label">Final Amount:</span>
                <span className="final-amount">{formatCurrency(bid.finalAmount)}</span>
              </div>
            )}
            {bid.winnerBid && bid.status === 'lost' && (
              <div className="amount-item">
                <span className="label">Winning Bid:</span>
                <span className="winner-bid">{formatCurrency(bid.winnerBid)}</span>
              </div>
            )}
          </div>

          <div className="bid-stats">
            <span>{bid.totalBids} total bids</span>
            {bid.myRank && (
              <>
                <span>•</span>
                <span>Ranked #{bid.myRank}</span>
              </>
            )}
          </div>
        </div>

        {bid.comment && (
          <div className="bid-comment">
            <span>"{bid.comment}"</span>
          </div>
        )}

        <div className="history-actions">
          <button className="btn-view">
            <FaEye /> View Details
          </button>
          {bid.status === 'won' && (
            <button 
              className="btn-contact"
              onClick={() => openContactModal(bid)}
            >
              <FaUser /> Contact Farmer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidHistory;
