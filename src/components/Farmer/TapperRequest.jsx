import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notificationService, getCurrentFarmer } from '../../services/notificationService';
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  TreePine,
  DollarSign,
  FileText,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Briefcase,
  Star,
  Eye,
  MessageCircle,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';

const TapperRequest = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('new-request');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // New Request Form State
  const [requestForm, setRequestForm] = useState({
    farmLocation: '',
    farmSize: '',
    numberOfTrees: '',
    tappingType: 'daily',
    startDate: '',
    duration: '',
    urgency: 'normal',
    preferredTime: 'morning',
    budgetRange: '',
    specialRequirements: '',
    contactPreference: 'phone',
    documents: []
  });

  // Requests from database (no mock data)
  const [myRequests, setMyRequests] = useState([]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Load existing requests when modal opens
  useEffect(() => {
    if (isOpen) {
      loadExistingRequests();
    }
  }, [isOpen]);

  const loadExistingRequests = async () => {
    try {
      const farmerData = getCurrentFarmer();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/farmer-requests/farmer/${farmerData.id || '507f1f77bcf86cd799439011'}`);

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const formattedRequests = result.data.map(req => ({
            id: req.requestId,
            ...req,
            createdAt: req.submittedAt.split('T')[0],
            status: req.status === 'submitted' ? 'pending' : req.status
          }));
          setMyRequests(formattedRequests);
          console.log('✅ Loaded existing requests:', formattedRequests.length);
        } else {
          setMyRequests([]);
          console.log('ℹ️ No existing requests found');
        }
      } else {
        console.log('⚠️ Failed to load existing requests');
        setMyRequests([]);
      }
    } catch (error) {
      console.log('⚠️ Error loading requests:', error.message);
      setMyRequests([]);
    }
  };

  // Handle view request details
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
  };

  // Handle edit request
  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setRequestForm({
      farmLocation: request.farmLocation || '',
      farmSize: request.farmSize || '',
      numberOfTrees: request.numberOfTrees || '',
      soilType: request.soilType || '',
      tappingType: request.tappingType || 'daily',
      startDate: request.startDate || '',
      duration: request.duration || '',
      urgency: request.urgency || 'normal',
      preferredTime: request.preferredTime || 'morning',
      budgetRange: request.budgetRange || '',
      specialRequirements: request.specialRequirements || '',
      contactPreference: request.contactPreference || 'phone',
      documents: request.documents || []
    });
    setActiveTab('new-request');
  };

  // Handle delete request
  const handleDeleteRequest = async (requestId) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/farmer-requests/${requestId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove from local state
        setMyRequests(prev => prev.filter(req => req._id !== requestId && req.id !== requestId));
        showNotification('Request deleted successfully!', 'success');
        console.log('✅ Request deleted successfully');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete request');
      }
    } catch (error) {
      console.error('❌ Error deleting request:', error);
      showNotification('Failed to delete request. Please try again.', 'error');
    }
    setDeleteConfirm(null);
  };

  // Handle update request (when editing)
  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const farmerData = getCurrentFarmer();

      const requestData = {
        farmerId: farmerData.id || '507f1f77bcf86cd799439011',
        farmerName: farmerData.name,
        farmerEmail: farmerData.email,
        farmerPhone: farmerData.phone,
        farmLocation: requestForm.farmLocation,
        farmSize: requestForm.farmSize,
        numberOfTrees: parseInt(requestForm.numberOfTrees),
        soilType: requestForm.soilType,
        tappingType: requestForm.tappingType,
        startDate: requestForm.startDate,
        duration: requestForm.duration,
        preferredTime: requestForm.preferredTime,
        urgency: requestForm.urgency,
        budgetRange: requestForm.budgetRange,
        specialRequirements: requestForm.specialRequirements,
        contactPreference: requestForm.contactPreference
      };

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/farmer-requests/${editingRequest._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update request');
      }

      const result = await response.json();
      console.log('✅ Request updated:', result.data);

      // Update local state
      setMyRequests(prev => prev.map(req =>
        req._id === editingRequest._id ? { ...req, ...requestForm } : req
      ));

      // Reset form and editing state
      setRequestForm({
        farmLocation: '',
        farmSize: '',
        numberOfTrees: '',
        soilType: '',
        tappingType: 'daily',
        startDate: '',
        duration: '',
        urgency: 'normal',
        preferredTime: 'morning',
        budgetRange: '',
        specialRequirements: '',
        contactPreference: 'phone',
        documents: []
      });

      setEditingRequest(null);
      showNotification('Request updated successfully!', 'success');
      setActiveTab('my-requests');

    } catch (error) {
      console.error('❌ Error updating request:', error);
      showNotification(error.message || 'Failed to update request. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setRequestForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitRequest = async (e) => {
    // If we're editing, use the update function instead
    if (editingRequest) {
      return handleUpdateRequest(e);
    }

    e.preventDefault();
    setLoading(true);

    try {
      // Get farmer data
      const farmerData = getCurrentFarmer();

      // Prepare request data for API
      const requestData = {
        farmerId: farmerData.id || '507f1f77bcf86cd799439011', // Mock farmer ID
        farmerName: farmerData.name,
        farmerEmail: farmerData.email,
        farmerPhone: farmerData.phone,
        farmLocation: requestForm.farmLocation,
        farmSize: requestForm.farmSize,
        numberOfTrees: parseInt(requestForm.numberOfTrees),
        soilType: requestForm.soilType,
        tappingType: requestForm.tappingType,
        startDate: requestForm.startDate,
        duration: requestForm.duration,
        preferredTime: requestForm.preferredTime,
        urgency: requestForm.urgency,
        budgetRange: requestForm.budgetRange,
        specialRequirements: requestForm.specialRequirements,
        contactPreference: requestForm.contactPreference,
        documents: (requestForm.documents || []).map(doc => ({
          name: doc.name,
          type: doc.type,
          size: doc.size
        }))
      };

      // Submit to backend API
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/farmer-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit request');
      }

      const result = await response.json();
      console.log('✅ Tapping request submitted:', result.data);

      // Add to local state for immediate UI update
      const newRequest = {
        id: result.data.requestId,
        ...requestForm,
        status: 'submitted',
        applicants: 0,
        createdAt: new Date().toISOString().split('T')[0],
        assignedTapper: null,
        _id: result.data._id
      };

      setMyRequests(prev => [newRequest, ...prev]);

      // Send notification to admin (this will also be handled by backend)
      notificationService.addTapperRequestNotification(newRequest, farmerData);

      // Reset form
      setRequestForm({
        farmLocation: '',
        farmSize: '',
        numberOfTrees: '',
        tappingType: 'daily',
        startDate: '',
        duration: '',
        urgency: 'normal',
        preferredTime: 'morning',
        budgetRange: '',
        specialRequirements: '',
        contactPreference: 'phone',
        documents: []
      });
      
      showNotification('Tapper request submitted successfully!', 'success');
      setActiveTab('my-requests');
    } catch (error) {
      console.error('Error submitting request:', error);
      showNotification('Error submitting request. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      assigned: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Assigned' },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X, text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      low: { color: 'bg-gray-100 text-gray-800', text: 'Low' },
      normal: { color: 'bg-blue-100 text-blue-800', text: 'Normal' },
      high: { color: 'bg-red-100 text-red-800', text: 'High' }
    };
    
    const config = urgencyConfig[urgency] || urgencyConfig.normal;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Notification */}
      {notification.show && (
        <motion.div
          className={`fixed top-4 right-4 z-60 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          {notification.message}
        </motion.div>
      )}

      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tapper Services</h2>
              <p className="text-green-100">Request and manage rubber tapping services</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'new-request'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('new-request');
                if (editingRequest) {
                  setEditingRequest(null);
                  setRequestForm({
                    farmLocation: '',
                    farmSize: '',
                    numberOfTrees: '',
                    soilType: '',
                    tappingType: 'daily',
                    startDate: '',
                    duration: '',
                    urgency: 'normal',
                    preferredTime: 'morning',
                    budgetRange: '',
                    specialRequirements: '',
                    contactPreference: 'phone',
                    documents: []
                  });
                }
              }}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              {editingRequest ? 'Edit Request' : 'New Request'}
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'my-requests'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('my-requests')}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              My Requests ({myRequests.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {activeTab === 'new-request' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                {/* Farm Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TreePine className="h-5 w-5 mr-2 text-green-500" />
                    Farm Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Farm Location *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={requestForm.farmLocation}
                          onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter your farm location (e.g., Village, District, State)"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Be as specific as possible (e.g., "123 Farm Road, Village Name, District, State")
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Farm Size *
                      </label>
                      <input
                        type="text"
                        required
                        value={requestForm.farmSize}
                        onChange={(e) => handleInputChange('farmSize', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., 5 hectares"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Trees *
                      </label>
                      <input
                        type="number"
                        required
                        value={requestForm.numberOfTrees}
                        onChange={(e) => handleInputChange('numberOfTrees', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter number of trees"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tapping Type *
                      </label>
                      <select
                        required
                        value={requestForm.tappingType}
                        onChange={(e) => handleInputChange('tappingType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="daily">Daily Tapping</option>
                        <option value="alternate">Alternate Day Tapping</option>
                        <option value="weekly">Weekly Tapping</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Schedule Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-green-500" />
                    Schedule Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={requestForm.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration *
                      </label>
                      <input
                        type="text"
                        required
                        value={requestForm.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., 30 days"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Time
                      </label>
                      <select
                        value={requestForm.preferredTime}
                        onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="morning">Morning (6 AM - 10 AM)</option>
                        <option value="afternoon">Afternoon (2 PM - 6 PM)</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-500" />
                    Additional Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level
                      </label>
                      <select
                        value={requestForm.urgency}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="low">Low - Can wait</option>
                        <option value="normal">Normal - Standard timing</option>
                        <option value="high">High - Urgent</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Range
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={requestForm.budgetRange}
                          onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., ₹10,000 - ₹15,000"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requirements
                    </label>
                    <textarea
                      value={requestForm.specialRequirements}
                      onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Any special requirements or instructions..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>{editingRequest ? 'Update Request' : 'Submit Request'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'my-requests' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {myRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                  <p className="text-gray-600 mb-4">You haven't submitted any tapper requests.</p>
                  <button
                    onClick={() => setActiveTab('new-request')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Create First Request
                  </button>
                </div>
              ) : (
                myRequests.map((request) => (
                  <div key={request.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">Request #{request.id}</h3>
                          {getStatusBadge(request.status)}
                          {getUrgencyBadge(request.urgency)}
                        </div>
                        <p className="text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {request.farmLocation}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="text-sm font-medium text-gray-900">{request.createdAt}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Farm Size</p>
                        <p className="text-sm font-medium text-gray-900">{request.farmSize}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Trees</p>
                        <p className="text-sm font-medium text-gray-900">{request.numberOfTrees}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium text-gray-900">{request.duration}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Budget</p>
                        <p className="text-sm font-medium text-gray-900">{request.budgetRange}</p>
                      </div>
                    </div>

                    {request.assignedTapper && (
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Assigned Tapper</h4>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{request.assignedTapper.name}</p>
                            <p className="text-xs text-gray-500">{request.assignedTapper.experience} experience</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{request.assignedTapper.rating}</span>
                          </div>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                            <Phone className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {request.applicants} applicants
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Starts {request.startDate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditRequest(request)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Request"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {(request.status === 'pending' || request.status === 'submitted') && (
                          <button
                            onClick={() => setDeleteConfirm(request)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Request"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Request Details Modal */}
      {showRequestDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Request Details</h2>
                  <p className="text-blue-100">ID: {selectedRequest.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestDetails(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-6">
                {/* Status and Basic Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Request Status</h3>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Submitted Date</p>
                      <p className="font-medium">{selectedRequest.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Urgency</p>
                      <p className="font-medium">{selectedRequest.urgency}</p>
                    </div>
                  </div>
                </div>

                {/* Farm Details */}
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium">{selectedRequest.farmLocation}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Farm Size</p>
                      <p className="font-medium">{selectedRequest.farmSize}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Number of Trees</p>
                      <p className="font-medium">{selectedRequest.numberOfTrees}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Soil Type</p>
                      <p className="font-medium">{selectedRequest.soilType || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tapping Type</p>
                      <p className="font-medium">{selectedRequest.tappingType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-medium">{selectedRequest.startDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">{selectedRequest.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Preferred Time</p>
                      <p className="font-medium">{selectedRequest.preferredTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Budget Range</p>
                      <p className="font-medium">{selectedRequest.budgetRange || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Contact Preference</p>
                      <p className="font-medium">{selectedRequest.contactPreference}</p>
                    </div>
                  </div>
                  {selectedRequest.specialRequirements && (
                    <div className="mt-4">
                      <p className="text-gray-500">Special Requirements</p>
                      <p className="font-medium">{selectedRequest.specialRequirements}</p>
                    </div>
                  )}
                </div>

                {/* Assigned Tapper (if any) */}
                {selectedRequest.assignedTapper && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Tapper</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedRequest.assignedTapper.name}</p>
                        <p className="text-sm text-gray-600">{selectedRequest.assignedTapper.phone}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{selectedRequest.assignedTapper.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowRequestDetails(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {(selectedRequest.status === 'pending' || selectedRequest.status === 'submitted') && (
                <button
                  onClick={() => {
                    setShowRequestDetails(false);
                    handleEditRequest(selectedRequest);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit Request
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Trash2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Delete Request</h2>
                  <p className="text-red-100">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this tapping request?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">Request ID: <span className="font-medium">{deleteConfirm.id}</span></p>
                <p className="text-sm text-gray-600">Location: <span className="font-medium">{deleteConfirm.farmLocation}</span></p>
                <p className="text-sm text-gray-600">Trees: <span className="font-medium">{deleteConfirm.numberOfTrees}</span></p>
              </div>
              <p className="text-sm text-red-600">
                <strong>Warning:</strong> This will permanently remove the request from the database.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRequest(deleteConfirm._id || deleteConfirm.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TapperRequest;
