import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Award,
  AlertCircle,
  User,
  TreePine,
  Truck
} from 'lucide-react';

const ServiceRequestApplicationManagement = ({ darkMode = false }) => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    urgency: 'all',
    location: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadRequestsWithApplications();
  }, [filters]);

  const loadRequestsWithApplications = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Load tapping requests that have applications
      const response = await fetch(`${backendUrl}/api/farmer-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const allRequests = result.data || [];
        
        // Filter requests that are submitted or under_review (have potential applications)
        const requestsWithPotentialApps = allRequests.filter(req => 
          ['submitted', 'under_review'].includes(req.status)
        );
        
        setRequests(requestsWithPotentialApps);
        console.log(`✅ Loaded ${requestsWithPotentialApps.length} requests with potential applications`);
      } else {
        console.error('Failed to load requests');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationsForRequest = async (requestId) => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/service-applications/request/${requestId}/applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setApplications(result.data || []);
        console.log(`✅ Loaded ${result.data?.length || 0} applications for request`);
      } else {
        console.error('Failed to load applications');
        setApplications([]);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStaff = async (applicationId) => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${backendUrl}/api/service-applications/select/${applicationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          finalRate: { rateType: 'per_day', amount: 800 },
          startDate: new Date().toISOString(),
          specialInstructions: 'Please coordinate with farmer before starting'
        })
      });

      if (response.ok) {
        showNotification('Staff selected and assigned successfully!', 'success');
        setShowApplicationsModal(false);
        loadRequestsWithApplications(); // Refresh the list
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to select staff', 'error');
      }
    } catch (error) {
      console.error('Error selecting staff:', error);
      showNotification('Error selecting staff', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'normal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredRequests = requests.filter(request => {
    if (filters.status !== 'all' && request.status !== filters.status) return false;
    if (filters.urgency !== 'all' && request.urgency !== filters.urgency) return false;
    if (filters.location && !request.farmLocation.toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Service Request Applications</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage staff applications for tapping service requests
        </p>
      </div>

      {/* Filters */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 mb-6 shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Urgency
            </label>
            <select
              value={filters.urgency}
              onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Urgency Levels</option>
              <option value="high">High Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Location
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Search by location..."
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
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
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {request.applicationCount || 0} applications
                    </span>
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
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{request.farmLocation}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <TreePine className="h-4 w-4 mr-1" />
                        <span>{request.farmSize} • {request.numberOfTrees} trees</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>

                {/* Action Button */}
                <div className="ml-4">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      loadApplicationsForRequest(request._id);
                      setShowApplicationsModal(true);
                    }}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Users className="h-4 w-4" />
                    <span>View Applications</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredRequests.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
              <p className="text-gray-600">There are no service requests with applications matching your current filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Applications Modal */}
      <AnimatePresence>
        {showApplicationsModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowApplicationsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Staff Applications</h2>
                    <p className="text-gray-600 mt-1">{selectedRequest.requestId} - {selectedRequest.farmerName}</p>
                  </div>
                  <button
                    onClick={() => setShowApplicationsModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Request Summary */}
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Details</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Location: <span className="font-medium">{selectedRequest.farmLocation}</span></p>
                      <p className="text-gray-600">Farm Size: <span className="font-medium">{selectedRequest.farmSize}</span></p>
                    </div>
                    <div>
                      <p className="text-gray-600">Trees: <span className="font-medium">{selectedRequest.numberOfTrees}</span></p>
                      <p className="text-gray-600">Type: <span className="font-medium">{selectedRequest.tappingType}</span></p>
                    </div>
                    <div>
                      <p className="text-gray-600">Budget: <span className="font-medium">₹{selectedRequest.budgetPerTree || selectedRequest.budgetRange} per tree</span></p>
                    </div>
                  </div>
                </div>

                {/* Applications List */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Applications ({applications.length})</h4>

                  {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h5 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h5>
                      <p className="text-gray-600">No staff members have applied for this service request yet.</p>
                    </div>
                  ) : (
                    applications.map((application) => (
                      <div key={application._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Staff Info */}
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                {application.staffName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <h5 className="text-lg font-semibold text-gray-900">{application.staffName}</h5>
                                <p className="text-sm text-gray-600">{application.staffRole} • {application.experience.yearsOfExperience} years experience</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                  <span className="flex items-center">
                                    <Phone className="h-4 w-4 mr-1" />
                                    {application.staffPhone}
                                  </span>
                                  <span className="flex items-center">
                                    <Mail className="h-4 w-4 mr-1" />
                                    {application.staffEmail}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Application Details */}
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <h6 className="font-medium text-gray-900 mb-2">Location & Distance</h6>
                                <div className="text-sm text-gray-600">
                                  <p className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {application.location.currentLocation}
                                  </p>
                                  <p className="flex items-center mt-1">
                                    <Truck className="h-4 w-4 mr-1" />
                                    {application.location.distanceFromFarm} km • {application.location.transportationMode.replace('_', ' ')}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h6 className="font-medium text-gray-900 mb-2">Proposed Rate</h6>
                                <div className="text-sm text-gray-600">
                                  <p className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    ₹{application.proposedRate.amount} {application.proposedRate.rateType.replace('_', ' ')}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {application.proposedRate.includesEquipment && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Equipment Included</span>
                                    )}
                                    {application.proposedRate.includesTransport && (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Transport Included</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h6 className="font-medium text-gray-900 mb-2">Priority Score</h6>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                  <span className="text-lg font-bold text-gray-900">{application.priorityScore}/100</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Based on experience, distance, and rate</p>
                              </div>
                            </div>

                            {/* Experience & Cover Letter */}
                            <div className="space-y-3">
                              <div>
                                <h6 className="font-medium text-gray-900 mb-1">Relevant Experience</h6>
                                <p className="text-sm text-gray-600">{application.experience.relevantExperience}</p>
                              </div>

                              {application.experience.specializations.length > 0 && (
                                <div>
                                  <h6 className="font-medium text-gray-900 mb-1">Specializations</h6>
                                  <div className="flex flex-wrap gap-2">
                                    {application.experience.specializations.map((spec, index) => (
                                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                        {spec.replace('_', ' ')}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <h6 className="font-medium text-gray-900 mb-1">Cover Letter</h6>
                                <p className="text-sm text-gray-600">{application.coverLetter}</p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col space-y-2 ml-6">
                            <button
                              onClick={() => handleSelectStaff(application.applicationId)}
                              disabled={loading}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Select</span>
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-1">
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
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
    </div>
  );
};

export default ServiceRequestApplicationManagement;
