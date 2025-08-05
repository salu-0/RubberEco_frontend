import React, { useState, useEffect } from 'react';
import { 
  FaUserTie, 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaIdCard,
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaStar,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import './BrokerManagement.css';

const BrokerManagement = () => {
  const [brokers, setBrokers] = useState([]);
  const [filteredBrokers, setFilteredBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadBrokers();
  }, []);

  useEffect(() => {
    filterBrokers();
  }, [brokers, searchTerm, statusFilter]);

  const loadBrokers = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching real brokers from Register collection...');

      // Get auth token
      const getAuthToken = () => {
        return localStorage.getItem('token') || 'dummy-token-for-testing';
      };

      // Fetch brokers from Register collection
      const response = await fetch('http://localhost:5000/api/users/role/broker', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Broker data received:', data);

        if (data.success && data.users) {
          // Transform Register collection data to match component structure
          const transformedBrokers = data.users.map(user => ({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || 'Not provided',
            location: user.location || 'Not specified',
            createdAt: user.created_at || user.createdAt,
            bio: user.bio || 'No bio provided',
            isVerified: user.isVerified,
            brokerProfile: {
              licenseNumber: user.brokerDetails?.licenseNumber || 'Pending',
              experience: 'Not specified',
              specialization: ['Rubber Trading'], // Default specialization
              companyName: user.brokerDetails?.companyName || 'Not specified',
              companyAddress: 'Not provided',
              education: 'Not specified',
              previousWork: 'Not specified',
              verificationStatus: user.isVerified ? 'verified' : 'pending',
              rating: user.brokerDetails?.rating || 0,
              totalDeals: user.brokerDetails?.successfulDeals || 0,
              successfulDeals: user.brokerDetails?.successfulDeals || 0
            }
          }));

          console.log('📊 Transformed brokers:', transformedBrokers);
          setBrokers(transformedBrokers);
        } else {
          console.warn('⚠️ No brokers found in Register collection');
          setBrokers([]);
        }
      } else {
        console.error('❌ Failed to fetch brokers:', response.status);
        setBrokers([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading brokers:', error);
      setBrokers([]);
      setLoading(false);
    }
  };

  const filterBrokers = () => {
    let filtered = [...brokers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(broker => 
        broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        broker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        broker.brokerProfile.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        broker.brokerProfile.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(broker => broker.brokerProfile.verificationStatus === statusFilter);
    }

    setFilteredBrokers(filtered);
  };

  const handleVerifyBroker = async (brokerId, action) => {
    try {
      // TODO: Replace with actual API call
      console.log(`${action} broker:`, brokerId);
      
      setBrokers(prev => 
        prev.map(broker => 
          broker._id === brokerId 
            ? {
                ...broker,
                brokerProfile: {
                  ...broker.brokerProfile,
                  verificationStatus: action === 'verify' ? 'verified' : 'rejected',
                  verificationDate: new Date().toISOString()
                }
              }
            : broker
        )
      );

      alert(`Broker ${action === 'verify' ? 'verified' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating broker status:', error);
      alert('Error updating broker status');
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'verified':
        return { color: '#48bb78', bgColor: '#f0fff4', text: 'Verified' };
      case 'rejected':
        return { color: '#e53e3e', bgColor: '#fed7d7', text: 'Rejected' };
      case 'pending':
        return { color: '#ed8936', bgColor: '#fffaf0', text: 'Pending' };
      default:
        return { color: '#a0aec0', bgColor: '#f7fafc', text: 'Unknown' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading brokers...</p>
      </div>
    );
  }

  return (
    <div className="broker-management">
      <div className="management-header">
        <h2>
          <FaUserTie className="section-icon" />
          Broker Management
        </h2>
        <p className="section-description">
          Manage broker registrations, verifications, and profiles
        </p>
      </div>

      {/* Filters */}
      <div className="management-filters">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search brokers by name, email, license, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>Showing {filteredBrokers.length} of {brokers.length} brokers</p>
      </div>

      {/* Brokers List */}
      <div className="brokers-list">
        {filteredBrokers.map(broker => (
          <BrokerCard 
            key={broker._id} 
            broker={broker}
            onVerify={(action) => handleVerifyBroker(broker._id, action)}
            onViewDetails={() => {
              setSelectedBroker(broker);
              setShowDetails(true);
            }}
            getStatusInfo={getStatusInfo}
            formatDate={formatDate}
          />
        ))}
      </div>

      {filteredBrokers.length === 0 && (
        <div className="no-results">
          <FaUserTie className="no-results-icon" />
          <h3>No brokers found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Broker Details Modal */}
      {showDetails && selectedBroker && (
        <BrokerDetailsModal 
          broker={selectedBroker}
          onClose={() => {
            setShowDetails(false);
            setSelectedBroker(null);
          }}
          onVerify={(action) => {
            handleVerifyBroker(selectedBroker._id, action);
            setShowDetails(false);
            setSelectedBroker(null);
          }}
          getStatusInfo={getStatusInfo}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// Broker Card Component
const BrokerCard = ({ broker, onVerify, onViewDetails, getStatusInfo, formatDate }) => {
  const statusInfo = getStatusInfo(broker.brokerProfile.verificationStatus);

  return (
    <div className="broker-card">
      <div className="broker-header">
        <div className="broker-info">
          <h3>{broker.name}</h3>
          <p className="company-name">{broker.brokerProfile.companyName}</p>
          <div className="contact-info">
            <span><FaEnvelope /> {broker.email}</span>
            <span><FaPhone /> {broker.phone}</span>
            <span><FaMapMarkerAlt /> {broker.location}</span>
          </div>
        </div>
        
        <div className="broker-status">
          <div 
            className="status-badge"
            style={{ 
              backgroundColor: statusInfo.bgColor, 
              color: statusInfo.color 
            }}
          >
            {statusInfo.text}
          </div>
          <div className="registration-date">
            <FaCalendarAlt />
            <span>Registered: {formatDate(broker.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="broker-details">
        <div className="detail-item">
          <FaIdCard />
          <span>License: {broker.brokerProfile.licenseNumber}</span>
        </div>
        <div className="detail-item">
          <FaBriefcase />
          <span>Experience: {broker.brokerProfile.experience}</span>
        </div>
        <div className="detail-item">
          <FaStar />
          <span>Rating: {broker.brokerProfile.rating}/5 ({broker.brokerProfile.totalDeals} deals)</span>
        </div>
      </div>

      <div className="specializations">
        {broker.brokerProfile.specialization.slice(0, 2).map(spec => (
          <span key={spec} className="specialization-tag">{spec}</span>
        ))}
        {broker.brokerProfile.specialization.length > 2 && (
          <span className="more-specs">+{broker.brokerProfile.specialization.length - 2} more</span>
        )}
      </div>

      <div className="broker-actions">
        <button className="btn-view" onClick={onViewDetails}>
          <FaEye /> View Details
        </button>
        
        {broker.brokerProfile.verificationStatus === 'pending' && (
          <>
            <button 
              className="btn-verify"
              onClick={() => onVerify('verify')}
            >
              <FaCheck /> Verify
            </button>
            <button 
              className="btn-reject"
              onClick={() => onVerify('reject')}
            >
              <FaTimes /> Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Broker Details Modal Component
const BrokerDetailsModal = ({ broker, onClose, onVerify, getStatusInfo, formatDate }) => {
  const statusInfo = getStatusInfo(broker.brokerProfile.verificationStatus);

  return (
    <div className="modal-overlay">
      <div className="broker-details-modal">
        <div className="modal-header">
          <h2>Broker Details</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          <div className="broker-profile">
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{broker.name}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{broker.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{broker.phone}</span>
                </div>
                <div className="info-item">
                  <label>Location:</label>
                  <span>{broker.location}</span>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Professional Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>License Number:</label>
                  <span>{broker.brokerProfile.licenseNumber}</span>
                </div>
                <div className="info-item">
                  <label>Experience:</label>
                  <span>{broker.brokerProfile.experience}</span>
                </div>
                <div className="info-item">
                  <label>Company:</label>
                  <span>{broker.brokerProfile.companyName}</span>
                </div>
                <div className="info-item">
                  <label>Company Address:</label>
                  <span>{broker.brokerProfile.companyAddress}</span>
                </div>
                <div className="info-item">
                  <label>Education:</label>
                  <span>{broker.brokerProfile.education}</span>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Specializations</h3>
              <div className="specializations-list">
                {broker.brokerProfile.specialization.map(spec => (
                  <span key={spec} className="specialization-tag">{spec}</span>
                ))}
              </div>
            </div>

            <div className="profile-section">
              <h3>Professional Bio</h3>
              <p className="bio-text">{broker.bio}</p>
            </div>

            <div className="profile-section">
              <h3>Previous Work Experience</h3>
              <p className="work-text">{broker.brokerProfile.previousWork}</p>
            </div>

            <div className="profile-section">
              <h3>Verification Status</h3>
              <div className="status-info">
                <div 
                  className="status-badge large"
                  style={{ 
                    backgroundColor: statusInfo.bgColor, 
                    color: statusInfo.color 
                  }}
                >
                  {statusInfo.text}
                </div>
                <div className="status-details">
                  <p>Registered: {formatDate(broker.createdAt)}</p>
                  {broker.brokerProfile.verificationDate && (
                    <p>Verified: {formatDate(broker.brokerProfile.verificationDate)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
          
          {broker.brokerProfile.verificationStatus === 'pending' && (
            <>
              <button 
                className="btn-verify"
                onClick={() => onVerify('verify')}
              >
                <FaCheck /> Verify Broker
              </button>
              <button 
                className="btn-reject"
                onClick={() => onVerify('reject')}
              >
                <FaTimes /> Reject Application
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerManagement;
