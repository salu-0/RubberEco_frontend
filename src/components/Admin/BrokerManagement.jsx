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
import './BrokerManagement.css';

const BrokerManagement = ({ darkMode = true, onBrokerStatusChange }) => {
  const [brokers, setBrokers] = useState([]);
  const [filteredBrokers, setFilteredBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'

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
      const response = await fetch('https://rubbereco-backend.onrender.com/api/users/role/broker', {
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
          console.log('📊 Raw broker data from API:', data.users);
          // Transform Register collection data to match component structure
          const transformedBrokers = data.users.map(user => ({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || 'Not provided',
            location: user.location || 'Not specified',
            createdAt: user.created_at || user.createdAt,
            bio: user.bio || 'No bio provided',
            dob: user.dob || null,
            isVerified: user.isVerified,
            brokerProfile: {
              licenseNumber: user.brokerDetails?.licenseNumber || 'Pending',
              experience: user.brokerProfile?.experience || 'Not specified',
              specialization: ['Rubber Trading'], // Default specialization
              companyName: user.brokerDetails?.companyName || user.brokerProfile?.companyName || 'Not specified',
              companyAddress: 'Not provided',
              education: 'Not specified',
              previousWork: 'Not specified',
              verificationStatus: user.brokerProfile?.verificationStatus || (user.isVerified ? 'approved' : 'pending'),
              rating: user.brokerDetails?.rating || 0,
              totalDeals: user.brokerDetails?.successfulDeals || 0,
              successfulDeals: user.brokerDetails?.successfulDeals || 0,
              // Check OCR status from brokerProfile first, then from verification field
              ocrValidationStatus: user.brokerProfile?.ocrValidationStatus || 
                                 (user.verification?.idOcr?.status === 'passed' ? 'passed' : 
                                  user.verification?.idOcr?.status === 'failed' ? 'failed' : 
                                  user.verification?.idOcr?.status === 'under_review' ? 'failed' : 
                                  user.verification?.idOcr?.status === 'error' ? 'failed' : 'not_checked'),
              ocrValidationReason: user.brokerProfile?.ocrValidationReason || 
                                 user.verification?.idOcr?.notes || ''
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
                  verificationStatus: action === 'verify' ? 'approved' : 'rejected',
                  verificationDate: new Date().toISOString()
                }
              }
            : broker
        )
      );

      // Call the callback to refresh the notification count
      if (onBrokerStatusChange) {
        onBrokerStatusChange();
      }

      alert(`Broker ${action === 'verify' ? 'verified' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating broker status:', error);
      alert('Error updating broker status');
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return { color: '#48bb78', bgColor: '#f0fff4', text: 'Verified' };
      case 'rejected':
        return { color: '#e53e3e', bgColor: '#fed7d7', text: 'Rejected' };
      case 'pending':
        return { color: '#ed8936', bgColor: '#fffaf0', text: 'Pending' };
      case 'under_review':
        return { color: '#9f7aea', bgColor: '#faf5ff', text: 'Under Review' };
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

  // If viewing details, show the details section
  if (viewMode === 'details' && selectedBroker) {
    return (
      <div className={`w-full p-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <BrokerDetailsSection 
          broker={selectedBroker}
          onBack={() => {
            setViewMode('list');
            setSelectedBroker(null);
          }}
          onVerify={(action) => {
            handleVerifyBroker(selectedBroker._id, action);
            setViewMode('list');
            setSelectedBroker(null);
          }}
          getStatusInfo={getStatusInfo}
          formatDate={formatDate}
          darkMode={darkMode}
        />
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
              setViewMode('details');
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
            {/* OCR Status Badge - styled like staff requests */}
            {broker.brokerProfile.ocrValidationStatus === 'passed' && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50 ml-1"
                title="OCR verification passed - Admin approval still required"
              >
                OCR: passed ✓
              </span>
            )}
            {broker.brokerProfile.ocrValidationStatus === 'failed' && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50 ml-1 cursor-help"
                title={`OCR Failed: ${broker.brokerProfile.ocrValidationReason || 'Unknown error'}. Click 'View Details' to see full OCR analysis.`}
              >
                OCR: failed{broker.brokerProfile.ocrValidationReason ? ` - ${broker.brokerProfile.ocrValidationReason}` : ''}
              </span>
            )}
            {broker.brokerProfile.ocrValidationStatus === 'not_checked' && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/50 ml-1"
                title="OCR: not checked"
              >
                OCR: not checked
              </span>
            )}
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

        {(broker.brokerProfile.verificationStatus === 'pending' || 
          broker.brokerProfile.verificationStatus === 'under_review') && (
          <div className="flex space-x-2">
            <motion.button
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              onClick={() => onVerify('verify')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCheck /> <span>Accept</span>
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

// Broker Details Section Component
const BrokerDetailsSection = ({ broker, onBack, onVerify, getStatusInfo, formatDate, darkMode }) => {
  const statusInfo = getStatusInfo(broker.brokerProfile?.verificationStatus || 'pending');

  // Helper function to display data or show "Not provided"
  const displayValue = (value, fallback = "Not provided") => {
    if (!value || value === 'Not specified' || value === 'Not provided' || value.trim() === '') {
      return <span className="text-gray-400 italic">{fallback}</span>;
    }
    return <span className="text-gray-800">{value}</span>;
  };

  // Helper function to check if value exists
  const hasValue = (value) => {
    return value && value !== 'Not specified' && value !== 'Not provided' && value.trim() !== '';
  };

  // Helper function to render OCR failure details
  const renderOCRFailureDetails = () => {
    if (broker.brokerProfile?.ocrValidationStatus !== 'failed') return null;

    const ocrData = broker.verification?.idOcr || {};
    const extracted = ocrData.extracted || {};
    const matched = ocrData.matched || {};
    
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="text-sm font-semibold text-red-800 mb-3">OCR Verification Failure Details</h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-red-700">Reason:</span>
            <span className="ml-2 text-red-600">{broker.brokerProfile?.ocrValidationReason || 'Unknown error'}</span>
          </div>
          
          {ocrData.confidence && (
            <div>
              <span className="font-medium text-red-700">OCR Confidence:</span>
              <span className="ml-2 text-red-600">{Math.round(ocrData.confidence)}%</span>
            </div>
          )}
          
          <div className="mt-3">
            <span className="font-medium text-red-700">Name Verification:</span>
            <div className="ml-4 mt-1">
              <div className="text-red-600">
                <span className="font-medium">Provided:</span> {broker.name}
              </div>
              <div className="text-red-600">
                <span className="font-medium">Extracted:</span> {extracted.name || 'Not found'}
              </div>
              <div className="text-red-600">
                <span className="font-medium">Match:</span> 
                <span className={`ml-1 font-semibold ${matched.name ? 'text-green-600' : 'text-red-600'}`}>
                  {matched.name ? '✓ Yes' : '✗ No'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <span className="font-medium text-red-700">Date of Birth Verification:</span>
            <div className="ml-4 mt-1">
              <div className="text-red-600">
                <span className="font-medium">Provided:</span> {broker.dob || 'Not provided during registration'}
              </div>
              <div className="text-red-600">
                <span className="font-medium">Extracted:</span> {extracted.dob || 'Not found'}
              </div>
              <div className="text-red-600">
                <span className="font-medium">Match:</span> 
                <span className={`ml-1 font-semibold ${matched.dob ? 'text-green-600' : 'text-red-600'}`}>
                  {matched.dob ? '✓ Yes' : '✗ No'}
                </span>
              </div>
            </div>
          </div>
          
          {ocrData.rawText && (
            <div className="mt-3">
              <span className="font-medium text-red-700">Raw OCR Text:</span>
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700 max-h-32 overflow-y-auto">
                {ocrData.rawText}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="broker-details-section">
      {/* OCR Status Badge */}
      <div className="mb-4">
        {broker.brokerProfile?.ocrValidationStatus === 'passed' && (
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">OCR: passed ✓</span>
            <span className="text-xs text-gray-600 italic">Admin approval still required</span>
          </div>
        )}
        {broker.brokerProfile?.ocrValidationStatus === 'failed' && (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold mr-2" title={broker.brokerProfile.ocrValidationReason || undefined}>
            OCR: failed{broker.brokerProfile.ocrValidationReason ? ` - ${broker.brokerProfile.ocrValidationReason}` : ''}
          </span>
        )}
        {broker.brokerProfile?.ocrValidationStatus === 'not_checked' && (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold mr-2">OCR: not checked</span>
        )}
      </div>
      {/* Header */}
      <div className="details-header">
        <div className="header-left">
          <button 
            onClick={onBack}
            className="back-button"
          >
            <FaTimes className="mr-2" />
            Back to List
          </button>
          <h2>
            <FaUserTie className="mr-2" />
            Broker Details
          </h2>
        </div>
        <div className="header-right">
          {(broker.brokerProfile?.verificationStatus === 'pending' || 
            broker.brokerProfile?.verificationStatus === 'under_review') && (
            <div className="action-buttons">
              <button 
                className="btn-verify"
                onClick={() => onVerify('verify')}
              >
                <FaCheck /> Accept Broker
              </button>
              <button 
                className="btn-reject"
                onClick={() => onVerify('reject')}
              >
                <FaTimes /> Reject Application
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="details-content">
        <div className="two-column-layout">
          {/* Left Column */}
          <div className="column">
            {/* Personal Information Section */}
            <div className="profile-section">
              <h3><FaUserTie className="mr-2" />Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label><FaIdCard className="mr-2" />Full Name:</label>
                  {displayValue(broker.name, "Name not provided")}
                </div>
                <div className="info-item">
                  <label><FaEnvelope className="mr-2" />Email:</label>
                  {displayValue(broker.email, "Email not provided")}
                </div>
                <div className="info-item">
                  <label><FaPhone className="mr-2" />Phone:</label>
                  {displayValue(broker.phone, "Phone not provided")}
                </div>
                <div className="info-item">
                  <label><FaMapMarkerAlt className="mr-2" />Location:</label>
                  {displayValue(broker.location, "Location not provided")}
                </div>
              </div>
            </div>

            {/* Verification Status Section */}
            <div className="profile-section">
              <h3><FaCheck className="mr-2" />Verification Status</h3>
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
                  {broker.brokerProfile?.verificationDate && (
                    <p>Verified: {formatDate(broker.brokerProfile.verificationDate)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="column">
            {/* Professional Information Section */}
            <div className="profile-section">
              <h3><FaBriefcase className="mr-2" />Professional Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label><FaBuilding className="mr-2" />Company:</label>
                  {displayValue(broker.brokerProfile?.companyName, "Company name not provided")}
                </div>
                <div className="info-item">
                  <label><FaCalendarAlt className="mr-2" />Experience:</label>
                  {displayValue(broker.brokerProfile?.experience, "Experience not specified")}
                </div>
                <div className="info-item">
                  <label><FaIdCard className="mr-2" />License Number:</label>
                  {displayValue(broker.brokerProfile?.licenseNumber, "License number not provided")}
                </div>
                <div className="info-item">
                  <label><FaStar className="mr-2" />Specialization:</label>
                  {broker.brokerProfile?.specialization && broker.brokerProfile.specialization.length > 0 ? (
                    <div className="specializations-list">
                      {broker.brokerProfile.specialization
                        .filter(spec => hasValue(spec))
                        .slice(0, 3)
                        .map(spec => (
                          <span key={spec} className="specialization-tag">{spec}</span>
                        ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No specializations specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* OCR Failure Details */}
      {renderOCRFailureDetails()}
    </div>
  );
};

export default BrokerManagement;
