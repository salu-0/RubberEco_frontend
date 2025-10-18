import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  Award,
  AlertCircle,
  ChevronDown,
  Star,
  Building
} from 'lucide-react';

const StaffRequestManagement = ({ darkMode }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    position: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filter requests based on current filters
  const filteredRequests = requests.filter(request => {
    const matchesStatus = filters.status === 'all' || request.status === filters.status;
    const matchesPosition = filters.position === 'all' || request.applyForPosition === filters.position;
    const matchesSearch = !filters.search ||
      request.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.applicationId?.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesPosition && matchesSearch;
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || 'dummy-token-for-testing';
  };

  // Download file with authentication
  const downloadFile = async (requestId, fileType, fileName) => {
    try {
      const token = getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';

      const response = await fetch(`${API_BASE_URL}/staff-requests/${requestId}/download/${fileType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        // Get the file blob
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || `${fileType}_${requestId}`;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        showNotification('File downloaded successfully', 'success');
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to download file', 'error');
      }
    } catch (error) {
      console.error('Download error:', error);
      showNotification('Failed to download file', 'error');
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch staff requests
  const fetchStaffRequests = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';
      
      const queryParams = new URLSearchParams({
        status: filters.status,
        position: filters.position,
        search: filters.search,
        limit: 50
      });

      const response = await fetch(`${API_BASE_URL}/staff-requests?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setRequests(result.data || []);
        setStats(result.stats || stats);
        console.log(`📋 Loaded ${result.data?.length || 0} staff requests`);
      } else {
        console.error('Failed to fetch staff requests:', response.statusText);
        // Demo data fallback
        setRequests([
          {
            _id: 'demo1',
            applicationId: 'APP-DEMO-001',
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+91 98765 43210',
            applyForPosition: 'tapper',
            status: 'pending',
            submittedAt: new Date().toISOString(),
            age: 28,
            applicationDuration: 2
          },
          {
            _id: 'demo2',
            applicationId: 'APP-DEMO-002',
            fullName: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+91 87654 32109',
            applyForPosition: 'supervisor',
            status: 'under_review',
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            age: 32,
            applicationDuration: 3
          }
        ]);
        setStats({ total: 2, pending: 1, under_review: 1, approved: 0, rejected: 0 });
      }
    } catch (error) {
      console.error('Error fetching staff requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffRequests();
  }, [filters]);

  // Handle request action (approve, reject, review)
  const handleRequestAction = async (requestId, action, notes = '', salary = 0) => {
    setActionLoading(true);
    try {
      const token = getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';

      const response = await fetch(`${API_BASE_URL}/staff-requests/${requestId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes, salary })
      });

      if (response.ok) {
        const result = await response.json();
        showNotification(result.message, 'success');
        await fetchStaffRequests(); // Refresh list
        setShowRequestDetails(false);
      } else {
        const errorResult = await response.json();
        showNotification(errorResult.message || `Failed to ${action} request`, 'error');
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      showNotification(`Error ${action}ing request: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Download file
  const handleDownloadFile = async (requestId, fileType) => {
    try {
      const token = getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';

      const response = await fetch(`${API_BASE_URL}/staff-requests/${requestId}/download/${fileType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileType}-${requestId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        showNotification('Failed to download file', 'error');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      showNotification('Error downloading file', 'error');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      under_review: Eye,
      approved: CheckCircle,
      rejected: XCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const getPositionLabel = (position) => {
    const labels = {
      tapper: 'Rubber Tapper',
      latex_collector: 'Latex Collector',
      supervisor: 'Field Supervisor',
      field_officer: 'Field Officer',
      trainer: 'Training Specialist',
      skilled_worker: 'Skilled Worker',
      manager: 'Operations Manager'
    };
    return labels[position] || position;
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => {
    const gradientColors = {
      'text-blue-600': darkMode ? 'from-green-500/20 to-emerald-600/20' : 'from-green-500/10 to-emerald-600/10',
      'text-yellow-600': darkMode ? 'from-green-500/20 to-emerald-600/20' : 'from-green-500/10 to-emerald-600/10',
      'text-green-600': darkMode ? 'from-green-500/20 to-emerald-600/20' : 'from-green-500/10 to-emerald-600/10',
      'text-red-600': darkMode ? 'from-green-500/20 to-emerald-600/20' : 'from-green-500/10 to-emerald-600/10',
      'text-purple-600': darkMode ? 'from-green-500/20 to-emerald-600/20' : 'from-green-500/10 to-emerald-600/10'
    };

    const iconBgColors = {
      'text-blue-600': 'from-green-600 to-emerald-600',
      'text-yellow-600': 'from-green-600 to-emerald-600',
      'text-green-600': 'from-green-600 to-emerald-600',
      'text-red-600': 'from-green-600 to-emerald-600',
      'text-purple-600': 'from-green-600 to-emerald-600'
    };

    return (
      <div
        className={`relative overflow-hidden ${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white/50'} backdrop-blur-sm rounded-2xl p-6 shadow-xl border ${
          darkMode ? 'border-green-500/20' : 'border-gray-200/50'
        } hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 group hover:-translate-y-1`}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[color] || gradientColors['text-blue-600']} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>

        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              {title}
            </p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
              {value}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {description}
            </p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${iconBgColors[color] || iconBgColors['text-blue-600']} shadow-lg group-hover:scale-105 transition-all duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl backdrop-blur-sm flex items-center space-x-3 border ${
              notification.type === 'success'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400/20'
                : 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-400/20'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-white/80 hover:text-white transition-colors"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Modern Header with Gradient Background */}
        <div className="relative overflow-hidden">
          <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-r from-green-600/10 to-emerald-600/10' : 'bg-gradient-to-r from-green-500/5 to-emerald-500/5'} rounded-3xl blur-3xl`}></div>
          <div className={`relative ${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white/50'} backdrop-blur-sm rounded-3xl p-8 border ${darkMode ? 'border-green-500/20' : 'border-gray-200/50'} shadow-xl`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-500/25`}>
                  <Users className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className={`text-4xl font-bold bg-gradient-to-r ${darkMode ? 'from-green-400 to-emerald-300' : 'from-gray-900 to-gray-600'} bg-clip-text text-transparent mb-2`}>
                    Staff Applications
                  </h1>
                  <p className={`text-lg ${darkMode ? 'text-green-400' : 'text-gray-600'}`}>
                    Review and manage staff applications with modern workflow
                  </p>
                </div>
              </div>
              <div className="mt-6 sm:mt-0">
                <div className={`px-4 py-2 rounded-full ${darkMode ? 'bg-green-900/30 border-green-500/30' : 'bg-green-50 border-green-200'} backdrop-blur-sm border`}>
                  <span className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                    {stats.total} Total Applications
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Applications"
          value={stats.total}
          icon={Users}
          color="text-blue-600"
          description="All applications"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="text-yellow-600"
          description="Awaiting review"
        />
        <StatCard
          title="Under Review"
          value={stats.under_review}
          icon={Eye}
          color="text-blue-600"
          description="Being reviewed"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="text-green-600"
          description="Approved & hired"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="text-red-600"
          description="Not selected"
        />
      </div>

        {/* Modern Filters Section */}
        <div className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white/50'} backdrop-blur-sm rounded-2xl p-6 shadow-xl border ${
          darkMode ? 'border-green-500/20' : 'border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Filter Applications
            </h3>
            <button
              onClick={() => setFilters({ status: 'all', position: 'all', search: '' })}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Clear Filters
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative group">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
                darkMode ? 'text-gray-400 group-focus-within:text-green-400' : 'text-gray-400 group-focus-within:text-green-500'
              }`} />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 ${
                  darkMode
                    ? 'bg-gray-700/50 border-green-500/30 text-white placeholder-gray-400 focus:bg-gray-700 focus:border-green-500/50'
                    : 'bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:bg-white'
                }`}
              />
            </div>

            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 appearance-none ${
                  darkMode
                    ? 'bg-gray-700/50 border-green-500/30 text-white focus:bg-gray-700 focus:border-green-500/50'
                    : 'bg-white/50 border-gray-300/50 text-gray-900 focus:bg-white'
                }`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>

            <div className="relative">
              <select
                value={filters.position}
                onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 appearance-none ${
                  darkMode
                    ? 'bg-gray-700/50 border-green-500/30 text-white focus:bg-gray-700 focus:border-green-500/50'
                    : 'bg-white/50 border-gray-300/50 text-gray-900 focus:bg-white'
                }`}
              >
                <option value="all">All Positions</option>
                <option value="tapper">Rubber Tapper</option>
                <option value="latex_collector">Latex Collector</option>
                <option value="supervisor">Field Supervisor</option>
                <option value="field_officer">Field Officer</option>
                <option value="trainer">Training Specialist</option>
                <option value="skilled_worker">Skilled Worker</option>
                <option value="manager">Operations Manager</option>
              </select>
              <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>

          <button
            onClick={() => setFilters({ status: 'all', position: 'all', search: '' })}
            className={`px-6 py-3 border rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

        {/* Modern Applications Table */}
        <div className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-xl border ${
          darkMode ? 'border-green-500/20' : 'border-gray-200/50'
        } overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700/50 bg-gray-800/80' : 'border-gray-200/50 bg-gray-50/80'}`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Applications Overview
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              {filteredRequests.length} applications found
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-800/80' : 'bg-gray-50/80'} backdrop-blur-sm`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  } border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Applicant</span>
                    </div>
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  } border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Position</span>
                    </div>
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  } border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Status</span>
                    </div>
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  } border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Applied</span>
                    </div>
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  } border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700/50' : 'divide-gray-200/50'}`}>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request, index) => (
                    <motion.tr
                      key={request._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`group hover:${darkMode ? 'bg-gray-700/50' : 'bg-gray-50/50'} transition-all duration-300 hover:shadow-lg`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <span className="text-white font-bold text-lg">
                                {request.fullName?.charAt(0)?.toUpperCase() || 'A'}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-blue-600 transition-colors`}>
                              {request.fullName}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Mail className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {request.email}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <FileText className={`h-4 w-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                              <p className={`text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-gray-500'} bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded`}>
                                {request.applicationId}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-blue-500" />
                          <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50 group-hover:scale-105 transition-transform duration-300`}>
                            {getPositionLabel(request.applyForPosition)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(request.status)} group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-2 capitalize">{request.status.replace('_', ' ')}</span>
                          </span>
                          {request.verification?.idOcr?.status && (
                            <span
                              title={`OCR: ${request.verification.idOcr.status}${request.verification.idOcr.confidence ? ` (conf ${Math.round(request.verification.idOcr.confidence)}%)` : ''}`}
                              className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${
                                request.verification.idOcr.status === 'passed'
                                  ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50'
                                  : request.verification.idOcr.status === 'failed'
                                  ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50'
                                  : request.verification.idOcr.status === 'error'
                                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50'
                                  : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/50'
                              }`}
                            >
                              OCR: {request.verification.idOcr.status}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {new Date(request.submittedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {Math.floor((Date.now() - new Date(request.submittedAt)) / (1000 * 60 * 60 * 24))} days ago
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRequestDetails(true);
                            }}
                            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                              darkMode
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                                : 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20'
                            } shadow-sm hover:shadow-md`}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {(['pending','under_review'].includes(request.status)) && (
                            <>
                              <button
                                onClick={() => handleRequestAction(request._id, 'approve')}
                                disabled={actionLoading}
                                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  darkMode
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                                    : 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20'
                                } shadow-sm hover:shadow-md`}
                                title="Approve Application"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRequestAction(request._id, 'reject')}
                                disabled={actionLoading}
                                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  darkMode
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                                    : 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20'
                                } shadow-sm hover:shadow-md`}
                                title="Reject Application"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                  </motion.tr>
                ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'} flex items-center justify-center`}>
                          <Users className="h-10 w-10 opacity-50" />
                        </div>
                        <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          No Applications Found
                        </h3>
                        <p className="text-sm mb-1">No staff applications match your current filters</p>
                        <p className="text-xs">Try adjusting your search criteria or check back later</p>
                      </motion.div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Staff Request Details Modal */}
      {showRequestDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            } rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
          >
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Staff Application Details</h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Application ID: {selectedRequest.applicationId}
                  </p>
                </div>
                <button
                  onClick={() => setShowRequestDetails(false)}
                  className={`p-2 rounded-lg hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`}
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Full Name
                    </label>
                    <p className={`mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedRequest.fullName}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date of Birth
                    </label>
                    <p className={`mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {new Date(selectedRequest.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Gender
                    </label>
                    <p className={`mt-1 capitalize ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedRequest.gender}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone
                    </label>
                    <p className={`mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedRequest.phone}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <p className={`mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedRequest.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Address Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Present Address
                    </h4>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p>{selectedRequest.presentAddress?.street}</p>
                      <p>{selectedRequest.presentAddress?.city}, {selectedRequest.presentAddress?.state}</p>
                      <p>PIN: {selectedRequest.presentAddress?.pincode}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Permanent Address
                    </h4>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      {selectedRequest.permanentAddress?.sameAsPresent ? (
                        <p className={`italic ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Same as present address
                        </p>
                      ) : (
                        <>
                          <p>{selectedRequest.permanentAddress?.street}</p>
                          <p>{selectedRequest.permanentAddress?.city}, {selectedRequest.permanentAddress?.state}</p>
                          <p>PIN: {selectedRequest.permanentAddress?.pincode}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Professional Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Qualification
                    </label>
                    <p className={`mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedRequest.qualification}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Work Experience
                    </label>
                    <p className={`mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedRequest.workExperience || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Skills
                    </label>
                    <p className={`mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedRequest.skills || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Applied Position
                    </label>
                    <p className={`mt-1 capitalize ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedRequest.applyForPosition?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                {selectedRequest.additionalNotes && (
                  <div className="mt-4">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Additional Notes
                    </label>
                    <div className={`mt-1 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {selectedRequest.additionalNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Files */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Uploaded Files
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {selectedRequest.photo && (
                    <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Photo
                      </h4>
                      <button
                        onClick={() => downloadFile(selectedRequest._id, 'photo', `photo_${selectedRequest.fullName}.jpg`)}
                        className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  )}
                  {selectedRequest.idProof && (
                    <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ID Proof
                      </h4>
                      <button
                        onClick={() => downloadFile(selectedRequest._id, 'idProof', `idproof_${selectedRequest.fullName}.pdf`)}
                        className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  )}
                  {selectedRequest.resume && (
                    <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Resume
                      </h4>
                      <button
                        onClick={() => downloadFile(selectedRequest._id, 'resume', `resume_${selectedRequest.fullName}.pdf`)}
                        className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Verification */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Document Verification (OCR)
                </h3>
                {selectedRequest.verification?.idOcr ? (
                  <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                        selectedRequest.verification.idOcr.status === 'passed'
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50'
                          : selectedRequest.verification.idOcr.status === 'failed'
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50'
                          : selectedRequest.verification.idOcr.status === 'error'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50'
                          : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/50'
                      }`}>
                        {selectedRequest.verification.idOcr.status.toUpperCase()}
                      </span>
                      {typeof selectedRequest.verification.idOcr.confidence === 'number' && (
                        <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Confidence: {Math.round(selectedRequest.verification.idOcr.confidence)}%
                        </span>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Extracted Name</p>
                        <p className={`${darkMode ? 'text-gray-100' : 'text-gray-900'} font-medium`}>{selectedRequest.verification.idOcr.extracted?.name || '—'}</p>
                        <p className={`mt-1 text-xs ${selectedRequest.verification.idOcr.matched?.name ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedRequest.verification.idOcr.matched?.name ? 'Matched' : 'Not matched'}
                        </p>
                      </div>
                      <div>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Extracted DOB</p>
                        <p className={`${darkMode ? 'text-gray-100' : 'text-gray-900'} font-medium`}>{selectedRequest.verification.idOcr.extracted?.dob || '—'}</p>
                        <p className={`mt-1 text-xs ${selectedRequest.verification.idOcr.matched?.dob ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedRequest.verification.idOcr.matched?.dob ? 'Matched' : 'Not matched'}
                        </p>
                      </div>
                    </div>
                    {selectedRequest.verification.idOcr.notes && (
                      <p className={`mt-3 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Notes: {selectedRequest.verification.idOcr.notes}</p>
                    )}
                  </div>
                ) : (
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No OCR verification data.</p>
                )}
              </div>

              {/* Application Status */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Application Status</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {getStatusIcon(selectedRequest.status)}
                    <span className={`ml-2 capitalize ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedRequest.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Applied on: {new Date(selectedRequest.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between`}>
              <button
                onClick={() => setShowRequestDetails(false)}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Close
              </button>
              {(['pending','under_review'].includes(selectedRequest.status)) && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      handleRequestAction(selectedRequest._id, 'reject');
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 flex items-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleRequestAction(selectedRequest._id, 'approve');
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StaffRequestManagement;
