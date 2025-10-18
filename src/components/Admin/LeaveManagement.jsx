import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  FileText,
  Filter,
  Search,
  Download,
  Eye,
  AlertCircle,
  CalendarDays,
  Users,
  TrendingUp
} from 'lucide-react';

const LeaveManagement = ({ darkMode }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Get auth token (same logic as admin dashboard)
  const getAuthToken = () => {
    return localStorage.getItem('token') || 'dummy-token-for-testing';
  };

  // Fetch leave requests from backend
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rubbereco-backend.onrender.com';

      const response = await fetch(`${backendUrl}/api/leave-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const requests = data.data || [];
        setLeaveRequests(requests);

        // Calculate stats
        const stats = {
          total: requests.length,
          pending: requests.filter(req => req.status === 'pending').length,
          approved: requests.filter(req => req.status === 'approved').length,
          rejected: requests.filter(req => req.status === 'rejected').length
        };
        setStats(stats);
      } else {
        console.error('Failed to fetch leave requests - Status:', response.status);
        setLeaveRequests([]);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle approve/reject actions
  const handleStatusUpdate = async (requestId, newStatus, adminComments = '') => {
    try {
      const token = getAuthToken();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rubbereco-backend.onrender.com';
      
      const response = await fetch(`${backendUrl}/api/leave-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          adminComments: adminComments,
          reviewedBy: JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin',
          reviewedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Refresh the list
        fetchLeaveRequests();
        setShowModal(false);
        setSelectedRequest(null);
      } else {
        console.error('Failed to update leave request status');
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Filter requests based on status and search
  const filteredRequests = leaveRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = request.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.leaveType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return darkMode
          ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30'
          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return darkMode
          ? 'bg-green-900/30 text-green-300 border-green-500/30'
          : 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return darkMode
          ? 'bg-red-900/30 text-red-300 border-red-500/30'
          : 'bg-red-100 text-red-800 border-red-200';
      default:
        return darkMode
          ? 'bg-gray-700/30 text-gray-300 border-gray-500/30'
          : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Leave Management
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Manage staff leave requests and approvals
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className={`px-4 py-2 rounded-lg border transition-colors ${
            darkMode 
              ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' 
              : 'border-green-500 text-green-600 hover:bg-green-50'
          }`}>
            <Download className="h-4 w-4 mr-2 inline" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, icon: FileText, color: 'blue' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'yellow' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'green' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white border-gray-200'} 
              rounded-xl p-4 border backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white border-gray-200'} 
        rounded-xl p-4 border backdrop-blur-sm`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-green-500 focus:border-green-500`}
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search by staff name, leave type, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2 w-80 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-green-500 focus:border-green-500`}
            />
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white border-gray-200'} 
        rounded-xl border backdrop-blur-sm overflow-hidden`}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading leave requests...
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              No leave requests found
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-1`}>
              {filter === 'all' ? 'No leave requests have been submitted yet.' : `No ${filter} requests found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Staff Member
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Leave Type
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Duration
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Dates
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-800/30' : 'bg-white'} divide-y ${
                darkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {filteredRequests.map((request, index) => (
                  <motion.tr
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`hover:${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'} transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {request.staffName}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {request.staffEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {request.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {calculateDuration(request.startDate, request.endDate)} days
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowModal(true);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode 
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(request._id, 'approved')}
                              className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(request._id, 'rejected')}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for viewing request details */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
              rounded-xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Leave Request Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Staff Info */}
                <div>
                  <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Staff Information
                  </h4>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <strong>Name:</strong> {selectedRequest.staffName}
                    </p>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-1`}>
                      <strong>Email:</strong> {selectedRequest.staffEmail}
                    </p>
                  </div>
                </div>

                {/* Leave Details */}
                <div>
                  <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Leave Details
                  </h4>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} space-y-2`}>
                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <strong>Type:</strong> {selectedRequest.leaveType}
                    </p>
                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <strong>Start Date:</strong> {formatDate(selectedRequest.startDate)}
                    </p>
                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <strong>End Date:</strong> {formatDate(selectedRequest.endDate)}
                    </p>
                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <strong>Duration:</strong> {calculateDuration(selectedRequest.startDate, selectedRequest.endDate)} days
                    </p>
                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <strong>Reason:</strong> {selectedRequest.reason}
                    </p>
                  </div>
                </div>

                {/* Status and Actions */}
                {selectedRequest.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest._id, 'approved')}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-2 inline" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest._id, 'rejected')}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4 mr-2 inline" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default LeaveManagement;
