import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Phone,
  Mail,
  TreePine,
  Droplets,
  Wrench,
  AlertCircle,
  Eye,
  Filter,
  Search
} from 'lucide-react';

const ServiceRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    status: 'approved',
    reviewNotes: '',
    estimatedCost: ''
  });
  const [filters, setFilters] = useState({
    status: 'all',
    serviceType: 'all',
    search: ''
  });

  useEffect(() => {
    loadServiceRequests();
  }, [filters]);

  const loadServiceRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams();
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.serviceType !== 'all') queryParams.append('serviceType', filters.serviceType);
      
      const response = await fetch(`https://rubbereco-backend.onrender.com/api/service-requests/all?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        let filteredRequests = data.data || [];
        
        // Apply search filter
        if (filters.search) {
          filteredRequests = filteredRequests.filter(request =>
            request.farmerName.toLowerCase().includes(filters.search.toLowerCase()) ||
            request.requestId.toLowerCase().includes(filters.search.toLowerCase()) ||
            request.farmLocation.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        
        setRequests(filteredRequests);
      } else {
        console.error('Failed to load service requests');
      }
    } catch (error) {
      console.error('Error loading service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://rubbereco-backend.onrender.com/api/service-requests/${selectedRequest._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(approvalForm)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the request in the list
        setRequests(prev => prev.map(req => 
          req._id === selectedRequest._id ? data.data : req
        ));
        
        setShowApprovalModal(false);
        setSelectedRequest(null);
        setApprovalForm({
          status: 'approved',
          reviewNotes: '',
          estimatedCost: ''
        });
        
        alert(`Service request ${approvalForm.status} successfully! Email notification sent to farmer.`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating service request:', error);
      alert('Error updating service request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceIcon = (serviceType) => {
    return serviceType === 'fertilizer' ? 
      <Droplets className="w-5 h-5 text-green-600" /> : 
      <Wrench className="w-5 h-5 text-blue-600" />;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600';
      case 'normal': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Request Management</h1>
        <p className="text-gray-600">Review and approve fertilizer and rain guard service requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Services</option>
              <option value="fertilizer">Fertilizer</option>
              <option value="rain_guard">Rain Guard</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by farmer name, request ID, or location..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No service requests found</h3>
            <p className="text-gray-600">No service requests match your current filters.</p>
          </div>
        ) : (
          requests.map((request) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getServiceIcon(request.serviceType)}
                    <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{request.farmerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{request.farmLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Preferred: {new Date(request.preferredDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <TreePine className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{request.numberOfTrees} trees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">₹{request.ratePerTree}/tree</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Submitted: {new Date(request.submittedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailsModal(true);
                    }}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {request.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setApprovalForm({ status: 'approved', reviewNotes: '', estimatedCost: '' });
                          setShowApprovalModal(true);
                        }}
                        className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setApprovalForm({ status: 'rejected', reviewNotes: '', estimatedCost: '' });
                          setShowApprovalModal(true);
                        }}
                        className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Approval/Rejection Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {approvalForm.status === 'approved' ? 'Approve' : 'Reject'} Service Request
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Request ID: {selectedRequest.requestId}</p>
              <p className="text-sm text-gray-600 mb-2">Farmer: {selectedRequest.farmerName}</p>
              <p className="text-sm text-gray-600">Service: {selectedRequest.title}</p>
            </div>
            
            {approvalForm.status === 'approved' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Cost (₹)
                </label>
                <input
                  type="number"
                  value={approvalForm.estimatedCost}
                  onChange={(e) => setApprovalForm(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter estimated cost"
                />
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Notes
              </label>
              <textarea
                value={approvalForm.reviewNotes}
                onChange={(e) => setApprovalForm(prev => ({ ...prev, reviewNotes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={approvalForm.status === 'approved' ? 'Add any notes for the farmer...' : 'Reason for rejection...'}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveReject}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  approvalForm.status === 'approved' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {approvalForm.status === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequestManagement;
