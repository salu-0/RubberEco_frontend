import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Plus, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Filter,
  Search
} from 'lucide-react';

const Attendance = ({ darkMode = false }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    leaveType: 'all'
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'sick',
    startDate: '',
    endDate: '',
    reason: '',
    urgency: 'normal',
    contactDuringLeave: {
      phone: '',
      alternateContact: '',
      address: ''
    },
    workHandover: {
      assignedTo: '',
      handoverNotes: '',
      completedTasks: '',
      pendingTasks: ''
    }
  });

  // Get auth token with fallback
  const getAuthToken = () => {
    return localStorage.getItem('token') || 'dummy-token-for-testing';
  };

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = getAuthToken();



      const response = await fetch(`${backendUrl}/api/leave-requests/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setLeaveRequests(result.data);
      } else {
        showNotification('Failed to load leave requests', 'error');
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
      showNotification('Error loading leave requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmitLeave = async () => {
    try {
      setLoading(true);

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = getAuthToken();

      console.log('🚀 Submitting leave request...');
      console.log('📝 Leave form data:', leaveForm);
      console.log('🌐 Backend URL:', backendUrl);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');

      const requestData = {
        ...leaveForm,
        workHandover: {
          ...leaveForm.workHandover,
          completedTasks: leaveForm.workHandover.completedTasks.split('\n').filter(task => task.trim()),
          pendingTasks: leaveForm.workHandover.pendingTasks.split('\n').filter(task => task.trim())
        }
      };

      console.log('📋 Request data to send:', requestData);

      const response = await fetch(`${backendUrl}/api/leave-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Leave request submitted successfully:', result);
        showNotification('Leave request submitted successfully!', 'success');
        setShowLeaveModal(false);
        resetLeaveForm();
        loadLeaveRequests();
      } else {
        console.log('❌ Response not ok, status:', response.status);
        const error = await response.json();
        console.log('❌ Error response:', error);
        showNotification(error.message || 'Failed to submit leave request', 'error');
      }
    } catch (error) {
      console.error('❌ Error submitting leave request:', error);
      showNotification('Error submitting leave request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetLeaveForm = () => {
    setLeaveForm({
      leaveType: 'sick',
      startDate: '',
      endDate: '',
      reason: '',
      urgency: 'normal',
      contactDuringLeave: {
        phone: '',
        alternateContact: '',
        address: ''
      },
      workHandover: {
        assignedTo: '',
        handoverNotes: '',
        completedTasks: '',
        pendingTasks: ''
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'sick': return 'bg-red-50 text-red-700 border-red-200';
      case 'personal': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'emergency': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'vacation': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredRequests = leaveRequests.filter(request => {
    if (filters.status !== 'all' && request.status !== filters.status) return false;
    if (filters.leaveType !== 'all' && request.leaveType !== filters.leaveType) return false;
    return true;
  });

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Attendance & Leave Management</h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your leave requests and attendance records
            </p>
          </div>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 mb-6 shadow-sm`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Leave Type
            </label>
            <select
              value={filters.leaveType}
              onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="emergency">Emergency Leave</option>
              <option value="vacation">Vacation</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No leave requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {request.requestId}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLeaveTypeColor(request.leaveType)}`}>
                      {request.leaveType.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                      <span>{formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-primary-600" />
                      <span>{request.totalDays} day(s)</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-primary-600" />
                      <span>Submitted: {formatDate(request.submittedAt)}</span>
                    </div>
                  </div>
                  
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    <strong>Reason:</strong> {request.reason}
                  </p>
                </div>
                
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
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {showLeaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLeaveModal(false)}
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
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Apply for Leave</h2>
                  <button
                    onClick={() => setShowLeaveModal(false)}
                    className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} text-2xl`}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Leave Type *
                    </label>
                    <select
                      value={leaveForm.leaveType}
                      onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    >
                      <option value="sick">Sick Leave</option>
                      <option value="personal">Personal Leave</option>
                      <option value="emergency">Emergency Leave</option>
                      <option value="vacation">Vacation</option>
                      <option value="maternity">Maternity Leave</option>
                      <option value="paternity">Paternity Leave</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Urgency
                    </label>
                    <select
                      value={leaveForm.urgency}
                      onChange={(e) => setLeaveForm({ ...leaveForm, urgency: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reason for Leave *
                  </label>
                  <textarea
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Please provide a detailed reason for your leave request..."
                    required
                  />
                </div>

                {/* Contact Information */}
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Contact During Leave</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={leaveForm.contactDuringLeave.phone}
                        onChange={(e) => setLeaveForm({
                          ...leaveForm,
                          contactDuringLeave: { ...leaveForm.contactDuringLeave, phone: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          darkMode
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Your contact number"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Alternate Contact
                      </label>
                      <input
                        type="tel"
                        value={leaveForm.contactDuringLeave.alternateContact}
                        onChange={(e) => setLeaveForm({
                          ...leaveForm,
                          contactDuringLeave: { ...leaveForm.contactDuringLeave, alternateContact: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          darkMode
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Emergency contact number"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowLeaveModal(false)}
                    className={`flex-1 px-6 py-3 border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors duration-200`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitLeave}
                    disabled={loading || !leaveForm.leaveType || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason}
                    className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        <span>Submit Leave Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedRequest && (
          <motion.div
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
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Leave Request Details</h2>
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
                {/* Request Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedRequest.requestId}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLeaveTypeColor(selectedRequest.leaveType)}`}>
                        {selectedRequest.leaveType.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Leave Details */}
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Leave Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Start Date</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedRequest.startDate)}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>End Date</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedRequest.endDate)}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Days</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.totalDays} day(s)</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Urgency</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.urgency}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Reason</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.reason}</p>
                  </div>
                </div>

                {/* Admin Response */}
                {selectedRequest.adminResponse && selectedRequest.adminResponse.respondedBy && (
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Response</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Responded By</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.adminResponse.respondedBy}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Response Date</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedRequest.adminResponse.respondedAt)}</p>
                      </div>
                    </div>
                    {selectedRequest.adminResponse.comments && (
                      <div className="mt-4">
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Comments</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.adminResponse.comments}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Information */}
                {selectedRequest.contactDuringLeave && (selectedRequest.contactDuringLeave.phone || selectedRequest.contactDuringLeave.alternateContact) && (
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRequest.contactDuringLeave.phone && (
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Phone</p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.contactDuringLeave.phone}</p>
                        </div>
                      )}
                      {selectedRequest.contactDuringLeave.alternateContact && (
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Alternate Contact</p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.contactDuringLeave.alternateContact}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className={`px-6 py-3 border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors duration-200`}
                  >
                    Close
                  </button>
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

export default Attendance;
