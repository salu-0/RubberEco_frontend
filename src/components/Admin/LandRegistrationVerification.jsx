import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  AlertCircle,
  TreePine,
  Ruler,
  Mountain,
  Clock,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

const LandRegistrationVerification = ({ darkMode }) => {
  const [landRegistrations, setLandRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLand, setSelectedLand] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationLoading, setVerificationLoading] = useState(false);

  useEffect(() => {
    loadLandRegistrations();
  }, []);

  const loadLandRegistrations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/land-registration`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🏞️ Land registrations loaded:', data.data);
        const records = Array.isArray(data.data) ? data.data : [];
        // Remove obvious dummy data (test/demo/sample entries)
        const cleaned = records.filter((item) => {
          const hay = `${item.landTitle || ''} ${item.ownerName || ''} ${item.landLocation || ''}`.toLowerCase();
          return !/(^|\s)(test|demo|sample)(\s|$)/i.test(hay);
        });
        setLandRegistrations(cleaned);
      } else {
        console.error('Failed to load land registrations');
      }
    } catch (error) {
      console.error('Error loading land registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLand = async (landId, action) => {
    try {
      setVerificationLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/land-registration/${landId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'verified' : 'rejected',
          verificationNotes: action === 'approve' ? 'Land registration approved by admin' : 'Land registration rejected by admin'
        })
      });

      if (response.ok) {
        console.log(`✅ Land ${action}d successfully`);
        await loadLandRegistrations(); // Reload the list
        setShowDetailsModal(false);
        
        // Show success notification
        alert(`Land registration ${action}d successfully!`);
      } else {
        console.error(`Failed to ${action} land registration`);
        alert(`Failed to ${action} land registration. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${action}ing land registration:`, error);
      alert(`Error ${action}ing land registration. Please try again.`);
    } finally {
      setVerificationLoading(false);
    }
  };

  const filteredRegistrations = landRegistrations.filter(land => {
    const matchesSearch = land.landTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         land.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         land.landLocation?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || land.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Land Registration Verification
          </h2>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Review and verify farmer land registrations
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadLandRegistrations}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <RefreshCw className="h-4 w-4 mr-2 inline" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm border ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by land title, owner name, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`pl-10 pr-8 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Registrations', value: landRegistrations.length, color: 'blue' },
          { label: 'Pending Review', value: landRegistrations.filter(l => l.status === 'pending').length, color: 'yellow' },
          { label: 'Verified', value: landRegistrations.filter(l => l.status === 'verified').length, color: 'green' },
          { label: 'Rejected', value: landRegistrations.filter(l => l.status === 'rejected').length, color: 'red' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm border ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <TreePine className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Land Registrations List */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading land registrations...
            </p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-8 text-center">
            <TreePine className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No Land Registrations Found
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchQuery || statusFilter !== 'all' 
                ? 'No registrations match your current filters.' 
                : 'No land registrations have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${
                darkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Land Details
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Owner
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Submitted
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredRegistrations.map((land) => (
                  <tr key={land._id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`h-10 w-10 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                            <TreePine className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {land.landTitle || 'Untitled Land'}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {land.landLocation}, {land.district}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Ruler className="h-3 w-3 inline mr-1" />
                            {land.totalArea}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {land.ownerName}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Phone className="h-3 w-3 inline mr-1" />
                        {land.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(land.status)}`}>
                        {getStatusIcon(land.status)}
                        <span className="ml-1 capitalize">{land.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {new Date(land.createdAt).toLocaleDateString()}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(land.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLand(land);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {land.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVerifyLand(land._id, 'approve')}
                              disabled={verificationLoading}
                              className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleVerifyLand(land._id, 'reject')}
                              disabled={verificationLoading}
                              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandRegistrationVerification;
