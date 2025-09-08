import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  TreePine,
  DollarSign,
  Phone,
  Mail,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  RefreshCw,
  Download,
  User,
  FileText,
  Star,
  MessageSquare,
  MessageCircle,
  X
} from 'lucide-react';

const TappingRequestManagement = ({ darkMode }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [availableTappers, setAvailableTappers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    assigned: 0,
    completed: 0
  });

  useEffect(() => {
    loadRequests();
    loadStats();
    loadAvailableTappers();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/tapping-requests`);
      
      if (response.ok) {
        const result = await response.json();
        setRequests(result.data);
        console.log('✅ Loaded tapping requests:', result.data.length);
      } else {
        console.error('Failed to load tapping requests');
      }
    } catch (error) {
      console.error('Error loading tapping requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/tapping-requests/stats/summary`);
      
      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateRequestStatus = async (requestId, newStatus, note = '') => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/tapping-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          adminId: '507f1f77bcf86cd799439012', // Mock admin ID
          note
        })
      });

      if (response.ok) {
        const result = await response.json();
        setRequests(prev => prev.map(req => 
          req._id === requestId ? { ...req, status: newStatus } : req
        ));
        console.log('✅ Updated request status:', newStatus);
        loadStats(); // Refresh stats
      } else {
        console.error('Failed to update request status');
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Submitted' },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Eye, text: 'Under Review' },
      negotiating: { color: 'bg-orange-100 text-orange-800', icon: MessageCircle, text: 'Negotiating' },
      assigned: { color: 'bg-purple-100 text-purple-800', icon: UserPlus, text: 'Assigned' },
      tapper_inspecting: { color: 'bg-indigo-100 text-indigo-800', icon: Eye, text: 'Tapper Inspecting' },
      tree_count_pending: { color: 'bg-amber-100 text-amber-800', icon: TreePine, text: 'Tree Count Pending' },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Accepted' },
      in_progress: { color: 'bg-orange-100 text-orange-800', icon: Clock, text: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'Cancelled' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.submitted;
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
      high: { color: 'bg-red-100 text-red-800', text: 'High', icon: AlertTriangle }
    };
    
    const config = urgencyConfig[urgency] || urgencyConfig.normal;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon && <config.icon className="h-3 w-3 mr-1" />}
        {config.text}
      </span>
    );
  };

  // Load available tappers
  const loadAvailableTappers = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/available-tappers`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTappers(data.tappers || []);
      }
    } catch (error) {
      console.error('❌ Failed to load available tappers:', error);
    }
  };

  // Handle tapper assignment
  const handleAssignTapper = async (requestId, tapperId, tapperName, tapperPhone, tapperEmail) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/farmer-requests/${requestId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tapperId,
          tapperName,
          tapperPhone,
          tapperEmail,
          assignedBy: 'admin'
        })
      });

      if (response.ok) {
        // Refresh requests and available tappers
        loadRequests();
        loadAvailableTappers();
        setShowAssignModal(false);
        setSelectedRequest(null);
        console.log('✅ Tapper assigned successfully');
      } else {
        console.error('Failed to assign tapper');
      }
    } catch (error) {
      console.error('❌ Error assigning tapper:', error);
    }
  };

  // Handle opening assign modal
  const openAssignModal = (request) => {
    setSelectedRequest(request);
    setShowAssignModal(true);
    loadAvailableTappers(); // Refresh available tappers
  };

  // Handle opening contact modal
  const openContactModal = (request) => {
    setSelectedRequest(request);
    setShowContactModal(true);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.farmLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Tapping Request Management</h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and track all tapping service requests
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadRequests}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                <p className="text-2xl font-bold">{stats.submitted}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Assigned</p>
                <p className="text-2xl font-bold">{stats.assigned}</p>
              </div>
              <UserPlus className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Urgency</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className={`rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Users className={`h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
              No requests found
            </h3>
            <p className={`${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              No tapping requests match your current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Request</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Farmer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Farm Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredRequests.map((request, index) => (
                  <motion.tr
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium">{request.requestId}</div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(request.submittedAt)}
                        </div>
                        <div className="mt-1">
                          {getUrgencyBadge(request.urgency)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{request.farmerName}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {request.farmerPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          {request.farmLocation}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center mt-1`}>
                          <TreePine className="h-3 w-3 mr-1" />
                          {request.numberOfTrees} trees • {request.farmSize}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm">{request.tappingType}</div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center mt-1`}>
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(request.startDate)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {request.status === 'submitted' && (
                          <button
                            onClick={() => openAssignModal(request)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Assign Tapper"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => openContactModal(request)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Contact Farmer"
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Tapper Modal */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Assign Tapper - {selectedRequest.farmerName}
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRequest(null);
                }}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Request Details */}
            <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Request Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Request ID:</span>
                  <span className={`ml-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.requestId}</span>
                </div>
                <div>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Farm Location:</span>
                  <span className={`ml-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.farmLocation}</span>
                </div>
                <div>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Trees:</span>
                  <span className={`ml-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.numberOfTrees}</span>
                </div>
                <div>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Start Date:</span>
                  <span className={`ml-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedRequest.startDate)}</span>
                </div>
              </div>
            </div>

            {/* Available Tappers */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Tapper
              </label>
              <div className="grid gap-3">
                {availableTappers.length > 0 ? (
                  availableTappers.map((tapper) => (
                    <div
                      key={tapper.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        darkMode ? 'bg-gray-700 border-gray-600 hover:border-green-500' : 'bg-gray-50 border-gray-200 hover:border-green-500'
                      }`}
                      onClick={() => handleAssignTapper(selectedRequest._id, tapper.id, tapper.name, tapper.phone, tapper.email)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {tapper.name}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            📍 {tapper.location} • ⭐ {tapper.rating}/5
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            📞 {tapper.phone} • 📧 {tapper.email}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                          Assign
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No available tappers at the moment</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Contact Farmer Modal */}
      {showContactModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Contact Farmer
              </h3>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedRequest(null);
                }}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Farmer Details */}
            <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedRequest.farmerName}
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                📧 {selectedRequest.farmerEmail}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                📞 {selectedRequest.farmerPhone}
              </p>
            </div>

            {/* Contact Options */}
            <div className="space-y-3">
              <a
                href={`tel:${selectedRequest.farmerPhone}`}
                className="flex items-center justify-center w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Farmer
              </a>

              <a
                href={`mailto:${selectedRequest.farmerEmail}?subject=Regarding your tapping request ${selectedRequest.requestId}&body=Dear ${selectedRequest.farmerName},%0D%0A%0D%0ARegarding your rubber tapping request (${selectedRequest.requestId}) for your farm at ${selectedRequest.farmLocation}.%0D%0A%0D%0ABest regards,%0D%0ARubberEco Admin Team`}
                className="flex items-center justify-center w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                Send Email
              </a>

              <button
                onClick={() => {
                  // Open WhatsApp or SMS
                  const message = `Hello ${selectedRequest.farmerName}, regarding your tapping request ${selectedRequest.requestId} for your farm at ${selectedRequest.farmLocation}. We will get back to you soon.`;
                  const whatsappUrl = `https://wa.me/${selectedRequest.farmerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="flex items-center justify-center w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                WhatsApp
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TappingRequestManagement;
