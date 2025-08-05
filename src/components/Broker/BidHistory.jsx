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
  FaSortAmountUp
} from 'react-icons/fa';
import './BidHistory.css';

// Import local images
import b1Image from '../../assets/images/bid/b1.jpg';
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

  useEffect(() => {
    loadBidHistory();
  }, []);

  useEffect(() => {
    filterAndSortHistory();
  }, [bidHistory, searchTerm, filters]);

  const loadBidHistory = async () => {
    try {
      // TODO: Replace with actual API call
      const mockHistory = [
        {
          id: 'BH001',
          lotId: 'RT001',
          lotInfo: {
            farmerName: 'John Doe',
            location: 'Kottayam, Kerala',
            numberOfTrees: 150,
            approximateYield: '2.5 tons',
            image: b1Image
          },
          bidAmount: 78000,
          finalAmount: 82000,
          minimumPrice: 75000,
          status: 'lost', // won, lost, rejected, expired
          bidTime: '2024-01-25 14:30:00',
          biddingEndDate: '2024-02-15',
          resultDate: '2024-02-15 18:00:00',
          totalBids: 8,
          myRank: 2,
          comment: 'Interested in long-term partnership',
          winnerBid: 82000
        },
        {
          id: 'BH002',
          lotId: 'RT003',
          lotInfo: {
            farmerName: 'Ravi Kumar',
            location: 'Wayanad, Kerala',
            numberOfTrees: 100,
            approximateYield: '1.8 tons',
            image: b2Image
          },
          bidAmount: 62000,
          finalAmount: 62000,
          minimumPrice: 55000,
          status: 'won',
          bidTime: '2024-01-24 16:45:00',
          biddingEndDate: '2024-02-12',
          resultDate: '2024-02-12 18:00:00',
          totalBids: 5,
          myRank: 1,
          comment: 'Good location with easy access',
          winnerBid: 62000
        },
        {
          id: 'BH003',
          lotId: 'RT005',
          lotInfo: {
            farmerName: 'Maria Sebastian',
            location: 'Idukki, Kerala',
            numberOfTrees: 200,
            approximateYield: '3.2 tons',
            image: b3Image
          },
          bidAmount: 85000,
          finalAmount: null,
          minimumPrice: 90000,
          status: 'rejected',
          bidTime: '2024-01-23 11:20:00',
          biddingEndDate: '2024-02-18',
          resultDate: '2024-01-23 12:00:00',
          totalBids: 1,
          myRank: null,
          comment: 'Below minimum price',
          winnerBid: null
        },
        {
          id: 'BH004',
          lotId: 'RT004',
          lotInfo: {
            farmerName: 'Suresh Nair',
            location: 'Kollam, Kerala',
            numberOfTrees: 80,
            approximateYield: '1.5 tons',
            image: b1Image
          },
          bidAmount: 45000,
          finalAmount: 45000,
          minimumPrice: 40000,
          status: 'won',
          bidTime: '2024-01-20 09:15:00',
          biddingEndDate: '2024-01-30',
          resultDate: '2024-01-30 18:00:00',
          totalBids: 3,
          myRank: 1,
          comment: 'Perfect for small scale operations',
          winnerBid: 45000
        },
        {
          id: 'BH005',
          lotId: 'RT006',
          lotInfo: {
            farmerName: 'Priya Menon',
            location: 'Thrissur, Kerala',
            numberOfTrees: 120,
            approximateYield: '2.0 tons',
            image: b2Image
          },
          bidAmount: 65000,
          finalAmount: null,
          minimumPrice: 60000,
          status: 'expired',
          bidTime: '2024-01-18 15:30:00',
          biddingEndDate: '2024-01-25',
          resultDate: '2024-01-25 18:00:00',
          totalBids: 2,
          myRank: null,
          comment: 'Interested but bidding expired',
          winnerBid: null
        }
      ];
      
      setBidHistory(mockHistory);
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
    </div>
  );
};

// History Card Component
const HistoryCard = ({ bid, getStatusInfo, formatCurrency, formatDateTime }) => {
  const statusInfo = getStatusInfo(bid.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="history-card">
      <div className="history-image">
        <img src={bid.lotInfo.image} alt={`Lot ${bid.lotId}`} />
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
            <button className="btn-contact">
              <FaUser /> Contact Farmer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidHistory;
