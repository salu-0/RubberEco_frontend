import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Eye,
  Send,
  Filter,
  Search,
  Truck,
  Star,
  TreePine,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import EnhancedStaffNegotiationModal from './EnhancedStaffNegotiationModal';
import toastService from '../../services/toastService';

const AvailableServiceRequests = ({ darkMode = false }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [appliedRequests, setAppliedRequests] = useState(new Set()); // Track applied requests
  const [validApplications, setValidApplications] = useState([]); // Store valid applications
  const [filters, setFilters] = useState({
    location: '',
    urgency: 'all',
    maxDistance: 50
  });
  const [applicationForm, setApplicationForm] = useState({
    availability: {
      startDate: '',
      endDate: '',
      preferredTimeSlots: [],
      daysAvailable: []
    },
    experience: {
      yearsOfExperience: '',
      relevantExperience: '',
      specializations: [],
      certifications: []
    },
    location: {
      currentLocation: '',
      distanceFromFarm: '',
      transportationMode: 'own_vehicle',
      willingToTravel: true
    },
    proposedRate: {
      rateType: 'per_day',
      amount: '',
      includesEquipment: false,
      includesTransport: false
    },
    coverLetter: '',
    suitabilityReasons: []
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Function to check for farmer responses and show notifications
  const checkForFarmerResponses = useCallback(async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${backendUrl}/api/service-applications/my-applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const applications = result.data || [];
        
        // Check for applications with farmer responses
        applications.forEach(app => {
          if (app.status === 'negotiating' && app.negotiation?.currentProposal) {
            const currentProposal = app.negotiation.currentProposal;
            
            // Check if farmer has responded (proposedBy is 'farmer' and it's recent)
            if (currentProposal.proposedBy === 'farmer') {
              const proposalTime = new Date(currentProposal.proposedAt);
              const now = new Date();
              const timeDiff = now - proposalTime;
              
              // Show notification if proposal is less than 5 minutes old (to avoid spam)
              if (timeDiff < 5 * 60 * 1000) {
                const requestId = app.applicationId;
                const farmerName = app.tappingRequestId?.farmerName || 'Farmer';
                
                // Check if we've already shown this notification
                const notificationKey = `farmer_response_${app._id}_${currentProposal.proposedAt}`;
                if (!localStorage.getItem(notificationKey)) {
                  toastService.farmerResponded(requestId, farmerName, 'responded');
                  localStorage.setItem(notificationKey, 'true');
                  
                  // Clean up old notification keys (older than 1 hour)
                  const oneHourAgo = now - (60 * 60 * 1000);
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('farmer_response_') && localStorage.getItem(key)) {
                      const keyTime = parseInt(key.split('_').pop());
                      if (keyTime < oneHourAgo) {
                        localStorage.removeItem(key);
                      }
                    }
                  });
                }
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error checking for farmer responses:', error);
    }
  }, []);

  useEffect(() => {
    console.log('🔍 useEffect triggered - loading requests and applications');
    loadAvailableRequests();
    loadUserApplications();
    // Removed cleanupCorruptedApplications() to prevent unnecessary re-renders
    // This function will be called separately when needed
  }, []); // Empty dependency array to prevent excessive re-renders

  // Run cleanup only once when component mounts
  useEffect(() => {
    cleanupCorruptedApplications();
  }, []); // Empty dependency array - runs only once

  // Removed fallback mock data - now we'll see real data or empty state

  // Check for farmer responses periodically
  useEffect(() => {
    // Check immediately
    checkForFarmerResponses();
    
    // Then check every 30 seconds
    const interval = setInterval(checkForFarmerResponses, 30000);
    
    return () => clearInterval(interval);
  }, [checkForFarmerResponses]);

  // Debug: Log when appliedRequests state changes - REMOVED TO PREVENT SPAM
  // useEffect(() => {
  //   console.log('🔄 appliedRequests state changed:', Array.from(appliedRequests));
  // }, [appliedRequests]);

  const loadUserApplications = useCallback(async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${backendUrl}/api/service-applications/my-applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔍 Raw applications response:', result);
        console.log('🔍 Applications data structure:', result.data);
        
        // Extract request IDs from user's applications
        // Handle both populated object and direct ID
        console.log('🔍 Processing applications...');
        result.data?.forEach((app, index) => {
          console.log(`🔍 Application ${index + 1}:`, {
            id: app._id,
            tappingRequestId: app.tappingRequestId,
            tappingRequestIdType: typeof app.tappingRequestId,
            hasTappingRequestId: !!app.tappingRequestId
          });
        });
        
        // Filter out invalid applications and create a clean list
        const validApplications = result.data?.filter(app => {
          if (!app.tappingRequestId) {
            console.log('⚠️ Filtering out application missing tappingRequestId:', app);
            return false;
          }
          
          if (!app._id) {
            console.log('⚠️ Filtering out application missing _id:', app);
            return false;
          }
          
          return true;
        }) || [];
        
        const appliedRequestIds = validApplications.map(app => {
          if (typeof app.tappingRequestId === 'object' && app.tappingRequestId._id) {
            return app.tappingRequestId._id;
          }
          
          // If it's a direct ID (string), return it
          if (typeof app.tappingRequestId === 'string') {
            return app.tappingRequestId;
          }
          
          console.log('⚠️ Unexpected tappingRequestId format:', app.tappingRequestId, 'for app:', app);
          return null;
        }).filter(id => id !== null) || [];
        
        // Store valid applications for use in the component
        setValidApplications(validApplications);
        
        setAppliedRequests(new Set(appliedRequestIds));
        console.log(`✅ Loaded ${appliedRequestIds.length} user applications`);
        
        // Log any invalid applications for debugging
        const invalidApplications = result.data?.filter(app => !app.tappingRequestId || !app._id) || [];
        if (invalidApplications.length > 0) {
          console.warn('⚠️ Found invalid applications that were filtered out:', invalidApplications);
        }
      } else {
        console.error('❌ Could not load user applications');
      }
    } catch (error) {
      console.error('❌ Error loading user applications:', error);
    }
  }, []);

  

  // Function to clean up corrupted applications
  const cleanupCorruptedApplications = useCallback(async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Get all applications again to check for corrupted ones
      const response = await fetch(`${backendUrl}/api/service-applications/my-applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const corruptedApplications = result.data?.filter(app => !app.tappingRequestId || !app._id) || [];
        
        if (corruptedApplications.length > 0) {
          console.warn('🧹 Found corrupted applications to clean up:', corruptedApplications);
          
          // For now, just log them. In production, you might want to delete them
          // or mark them as invalid in the database
          corruptedApplications.forEach(app => {
            console.warn('🧹 Corrupted application:', {
              id: app._id,
              missingTappingRequestId: !app.tappingRequestId,
              missingId: !app._id,
              data: app
            });
          });
          
          // Optionally, you can add a button to clean up corrupted applications
          if (corruptedApplications.length > 0) {
            console.warn(`🧹 Found ${corruptedApplications.length} corrupted applications. Consider cleaning them up.`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking for corrupted applications:', error);
    }
  }, []);

  const loadAvailableRequests = useCallback(async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const queryParams = new URLSearchParams({
        location: filters.location,
        maxDistance: filters.maxDistance
      });

      const url = `${backendUrl}/api/service-applications/available-requests?${queryParams}`;
      console.log('🔍 Loading requests from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 API Response:', result);
        const apiData = result.data || [];
        setRequests(apiData);
        console.log(`✅ Loaded ${apiData.length} available requests from API`);
        
        // If API returns empty data, show message instead of mock data
        if (apiData.length === 0) {
          console.log('🔍 API returned empty data - no real requests in database');
          setRequests([]);
        }
      } else {
        console.error('Failed to load requests - Status:', response.status);
        setRequests([]);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filters.location, filters.maxDistance]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const handleApply = useCallback(async (requestParam = null) => {
    const request = requestParam || selectedRequest;
    if (!request) return;
    
    // Check if already applied
    if (appliedRequests.has(request._id)) {
      showNotification('You have already applied for this request', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/service-applications/apply/${request.requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        // Direct apply: no form, minimal body; backend fills defaults
        body: JSON.stringify({ coverLetter: 'Interested in this request.' })
      });

      if (response.ok) {
        await response.json();
        // Add to applied requests set
        setAppliedRequests(prev => new Set([...prev, request._id]));
        showNotification('Applied successfully!', 'success');
        setShowApplicationModal(false);
        setShowDetailsModal(false);
        // Reload both available requests and user applications to update the UI
        loadAvailableRequests();
        loadUserApplications();
      } else {
        let errorMsg = 'Failed to apply';
        try { 
          const err = await response.json(); 
          errorMsg = err.message || errorMsg; 
          
          // If the error is "already applied", add to applied requests set
          if (err.message && err.message.includes('already applied')) {
            setAppliedRequests(prev => new Set([...prev, request._id]));
          }
        } catch {}
        showNotification(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error applying:', error);
      showNotification('Error applying', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedRequest, appliedRequests, loadAvailableRequests, loadUserApplications]);

  const getUrgencyColor = useCallback((urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'normal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const hasApplied = useCallback((requestId) => {
    return appliedRequests.has(requestId);
  }, [appliedRequests]);

  // Memoize callback functions to prevent unnecessary re-renders of NegotiationModal
  const handleCloseNegotiationModal = useCallback(() => {
    setShowNegotiationModal(false);
  }, []);

  const handleUpdateNegotiation = useCallback(() => {
    loadUserApplications();
    loadAvailableRequests();
  }, [loadUserApplications, loadAvailableRequests]);

  const openNegotiation = useCallback(async (request) => {
    try {
      console.log('🔍 Opening negotiation for request:', request._id);
      console.log('🔍 Current validApplications:', validApplications);
      
      // Use the already loaded valid applications instead of making another API call
      const existingApplication = validApplications.find(app => {
        const appRequestId = typeof app.tappingRequestId === 'object' && app.tappingRequestId._id 
          ? app.tappingRequestId._id 
          : app.tappingRequestId;
        console.log('🔍 Comparing:', appRequestId, '===', request._id, '=', appRequestId === request._id);
        return appRequestId === request._id;
      });
      
      if (existingApplication) {
        console.log('✅ Found existing application:', existingApplication);
        // Verify the application is valid before opening negotiation
        if (!existingApplication._id || !existingApplication.tappingRequestId) {
          showNotification('Invalid application data. Please try again.', 'error');
          return;
        }
        
        // Use existing application - open negotiation directly
        setSelectedApplication(existingApplication);
        setShowNegotiationModal(true);
      } else {
        console.log('❌ No existing application found for request:', request._id);
        // If no existing application found, show error instead of trying to create one
        showNotification('No application found. Please apply first.', 'error');
      }
    } catch (error) {
      console.error('Error opening negotiation:', error);
      showNotification('Error opening negotiation', 'error');
    }
  }, [validApplications]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const filteredRequests = useMemo(() => {
    console.log('🔍 Filtering requests:', {
      totalRequests: requests.length,
      filters: filters,
      requests: requests
    });
    
    const filtered = requests.filter(request => {
      if (filters.urgency !== 'all' && request.urgency !== filters.urgency) {
        console.log('🔍 Filtered out by urgency:', request.requestId, request.urgency, 'vs', filters.urgency);
        return false;
      }
      if (filters.location && !request.farmLocation.toLowerCase().includes(filters.location.toLowerCase())) {
        console.log('🔍 Filtered out by location:', request.requestId, request.farmLocation, 'vs', filters.location);
        return false;
      }
      return true;
    });
    
    console.log('🔍 Filtered results:', filtered.length, 'out of', requests.length);
    return filtered;
  }, [requests, filters.urgency, filters.location]);

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Available Service Requests</h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Apply for tapping service requests that match your skills and availability
            </p>
          </div>
        </div>
      </div>

      {/* Filters removed as per request */}

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Service Request Cards */}
          {requests.map((request) => (
            <motion.div
              key={request._id}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold">{request.requestId}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency.toUpperCase()}
                    </span>
                    {request.applicationCount > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {request.applicationCount} applications
                      </span>
                    )}
                    {/* Application Status Badge */}
                    {(() => {
                      const myApplication = validApplications.find(app => {
                        const appRequestId = typeof app.tappingRequestId === 'object' && app.tappingRequestId._id 
                          ? app.tappingRequestId._id 
                          : app.tappingRequestId;
                        return appRequestId === request._id;
                      });
                      
                      if (!myApplication) return null;
                      
                      const getStatusBadge = (status) => {
                        switch (status) {
                          case 'agreed':
                            return (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                ✅ AGREED
                              </span>
                            );
                          case 'negotiating':
                            return (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse">
                                🔄 NEGOTIATING
                              </span>
                            );
                          case 'rejected':
                            return (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                ❌ REJECTED
                              </span>
                            );
                          case 'submitted':
                          case 'under_review':
                            return (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                📋 {status === 'submitted' ? 'SUBMITTED' : 'UNDER REVIEW'}
                              </span>
                            );
                          default:
                            return (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                📝 {status.toUpperCase()}
                              </span>
                            );
                        }
                      };
                      
                      return getStatusBadge(myApplication.status);
                    })()}
                  </div>

                  {/* Farmer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="font-medium">{request.farmerName}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {request.farmerPhone}
                        </span>
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {request.farmerEmail}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{request.farmLocation}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <TreePine className="h-4 w-4 mr-1" />
                        <span>{request.farmSize} • {request.farmerEstimatedTrees || request.numberOfTrees || 'N/A'} trees</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                      <span>Start: {formatDate(request.startDate)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-primary-600" />
                      <span>{request.tappingType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-primary-600" />
                      <span>₹{request.budgetPerTree || request.budgetRange} per tree</span>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  {request.specialRequirements && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <strong>Special Requirements:</strong> {request.specialRequirements}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailsModal(true);
                    }}
                    className="px-4 py-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Details</span>
                  </button>
                  {(() => {
                    const applied = hasApplied(request._id);
                    
                    return applied ? (
                      <div className="flex flex-col space-y-2">
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed flex items-center space-x-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Applied</span>
                        </button>
                        <button
                          onClick={() => openNegotiation(request)}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-1"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Negotiate</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(request)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-1"
                      >
                        <Send className="h-4 w-4" />
                        <span>Apply</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          ))}

          {filteredRequests.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Available Requests</h3>
              <p className="text-gray-600">There are no service requests matching your current filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Direct apply: application modal removed */}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedRequest && (
          <motion.div
            key="details-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-4 rounded-t-2xl`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Request Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} text-2xl`}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Request ID and Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedRequest.requestId}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(selectedRequest.urgency)}`}>
                        {selectedRequest.urgency?.toUpperCase()}
                      </span>
                      {/* Application Status Badge in Details Modal */}
                      {(() => {
                        const myApplication = validApplications.find(app => {
                          const appRequestId = typeof app.tappingRequestId === 'object' && app.tappingRequestId._id 
                            ? app.tappingRequestId._id 
                            : app.tappingRequestId;
                          return appRequestId === selectedRequest._id;
                        });
                        
                        if (!myApplication) return null;
                        
                        const getStatusBadge = (status) => {
                          switch (status) {
                            case 'agreed':
                              return (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  ✅ AGREED
                                </span>
                              );
                            case 'negotiating':
                              return (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse">
                                  🔄 NEGOTIATING
                                </span>
                              );
                            case 'rejected':
                              return (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                  ❌ REJECTED
                                </span>
                              );
                            case 'submitted':
                            case 'under_review':
                              return (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                  📋 {status === 'submitted' ? 'SUBMITTED' : 'UNDER REVIEW'}
                                </span>
                              );
                            default:
                              return (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                  📝 {status.toUpperCase()}
                                </span>
                              );
                          }
                        };
                        
                        return getStatusBadge(myApplication.status);
                      })()}
                    </div>
                  </div>
                </div>

                {/* Farmer Information */}
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Farmer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Name</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.farmerName}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Phone</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.farmerPhone}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Email</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.farmerEmail}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Location</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.farmLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Farm Details */}
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Farm Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Farm Size</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.farmSize}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Number of Trees</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.farmerEstimatedTrees || selectedRequest.numberOfTrees || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Service Requirements */}
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Service Requirements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tapping Type</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.tappingType?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Preferred Time</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.preferredTime?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Start Date</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedRequest.startDate)}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Budget per Tree</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{selectedRequest.budgetPerTree}</p>
                    </div>
                  </div>
                  {selectedRequest.specialRequirements && (
                    <div className="mt-4">
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Special Requirements</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.specialRequirements}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className={`flex-1 px-6 py-3 border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors duration-200`}
                  >
                    Close
                  </button>
                  {hasApplied(selectedRequest._id) ? (
                    <button
                      disabled
                      className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Already Applied</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(selectedRequest)}
                      className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Apply for this Request</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            key="notification"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className={`px-6 py-4 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              <div className="flex items-center space-x-2">
                {notification.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span>{notification.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Negotiation Modal */}
      <EnhancedStaffNegotiationModal
        isOpen={showNegotiationModal}
        onClose={handleCloseNegotiationModal}
        application={selectedApplication}
        userRole="staff"
        onUpdate={handleUpdateNegotiation}
      />
    </div>
  );
};

export default AvailableServiceRequests;
