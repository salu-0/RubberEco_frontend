import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

const BrokerManagement = ({ darkMode = true }) => {
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
    <div className={`w-full p-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="mb-8">
        <h2 className={`flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-800'} text-2xl font-bold mb-2`}>
          <FaUserTie className="text-green-500 text-xl" />
          Broker Management
        </h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-base`}>
          Manage broker registrations, verifications, and profiles
        </p>
      </div>

      {/* Filters */}
      <div className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white'} backdrop-blur-sm rounded-2xl shadow-xl border p-6 mb-6 ${
        darkMode ? 'border-green-500/20' : 'border-gray-100'
      }`}>
        <div className="relative mb-5">
          <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search brokers by name, email, license, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4">
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
          Showing {filteredBrokers.length} of {brokers.length} brokers
        </p>
      </div>

      {/* Brokers List */}
      <div className="space-y-4">
        {filteredBrokers.map(broker => (
          <BrokerCard
            key={broker._id}
            broker={broker}
            darkMode={darkMode}
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
        <div className={`text-center py-12 ${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white'} backdrop-blur-sm rounded-2xl shadow-xl border ${
          darkMode ? 'border-green-500/20' : 'border-gray-100'
        }`}>
          <FaUserTie className={`mx-auto text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No brokers found</h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Try adjusting your search criteria or filters</p>
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
const BrokerCard = ({ broker, darkMode, onVerify, onViewDetails, getStatusInfo, formatDate }) => {
  const statusInfo = getStatusInfo(broker.brokerProfile.verificationStatus);

  return (
    <motion.div
      className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white'} backdrop-blur-sm rounded-2xl shadow-xl border p-6 ${
        darkMode ? 'border-green-500/20' : 'border-gray-100'
      }`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{broker.name}</h3>
          <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{broker.brokerProfile.companyName}</p>
          <div className="space-y-2">
            <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <FaEnvelope className="mr-2 text-green-500" /> {broker.email}
            </div>
            <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <FaPhone className="mr-2 text-green-500" /> {broker.phone}
            </div>
            <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <FaMapMarkerAlt className="mr-2 text-green-500" /> {broker.location}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div
            className="inline-flex px-3 py-1 rounded-full text-xs font-semibold mb-2"
            style={{
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.color
            }}
          >
            {statusInfo.text}
          </div>
          <div className={`flex items-center text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            <FaCalendarAlt className="mr-1" />
            <span>Registered: {formatDate(broker.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <FaIdCard className="mr-2 text-green-500" />
          <span>License: {broker.brokerProfile.licenseNumber}</span>
        </div>
        <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <FaBriefcase className="mr-2 text-green-500" />
          <span>Experience: {broker.brokerProfile.experience}</span>
        </div>
        <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <FaStar className="mr-2 text-yellow-500" />
          <span>Rating: {broker.brokerProfile.rating}/5 ({broker.brokerProfile.totalDeals} deals)</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {broker.brokerProfile.specialization.slice(0, 2).map(spec => (
          <span key={spec} className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
            {spec}
          </span>
        ))}
        {broker.brokerProfile.specialization.length > 2 && (
          <span className={`px-3 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
            +{broker.brokerProfile.specialization.length - 2} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <motion.button
          className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/30"
          onClick={onViewDetails}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaEye /> <span>View Details</span>
        </motion.button>

        {broker.brokerProfile.verificationStatus === 'pending' && (
          <div className="flex space-x-2">
            <motion.button
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              onClick={() => onVerify('verify')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCheck /> <span>Verify</span>
            </motion.button>
            <motion.button
              className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              onClick={() => onVerify('reject')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaTimes /> <span>Reject</span>
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
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
