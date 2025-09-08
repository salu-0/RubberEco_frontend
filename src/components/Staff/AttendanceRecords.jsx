import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  UserCheck, 
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock3
} from 'lucide-react';

const AttendanceRecords = ({ darkMode = false }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    attendanceType: 'all'
  });
  const [summary, setSummary] = useState(null);

  // Get auth token with fallback
  const getAuthToken = () => {
    return localStorage.getItem('token') || 'dummy-token-for-testing';
  };

  useEffect(() => {
    loadAttendanceRecords();
    loadAttendanceSummary();
  }, [filters]);

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = getAuthToken();

      let url = `${backendUrl}/attendance/records`;
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.attendanceType !== 'all') params.append('attendanceType', filters.attendanceType);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAttendanceRecords(result.data || []);
      } else {
        console.error('Failed to load attendance records:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceSummary = async () => {
    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = getAuthToken();

      let url = `${backendUrl}/attendance/summary`;
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSummary(result.data);
      }
    } catch (error) {
      console.error('Error loading attendance summary:', error);
    }
  };

  const getAttendanceTypeIcon = (type) => {
    switch (type) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'late': return <Clock3 className="h-4 w-4 text-yellow-500" />;
      case 'half_day': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <UserCheck className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAttendanceTypeColor = (type) => {
    switch (type) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'half_day': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
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

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (filters.attendanceType !== 'all' && record.attendanceType !== filters.attendanceType) {
      return false;
    }
    return true;
  });

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Attendance Records</h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              View your attendance history and statistics
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Records</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{summary.totalRecords}</p>
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Present</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{summary.presentCount}</p>
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Absent</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{summary.absentCount}</p>
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Attendance Rate</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{summary.attendanceRate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 mb-6 shadow-sm`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Attendance Type
            </label>
            <select
              value={filters.attendanceType}
              onChange={(e) => setFilters({ ...filters, attendanceType: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Records List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No attendance records found</p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <motion.div
              key={record._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      {getAttendanceTypeIcon(record.attendanceType)}
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {record.taskName}
                      </h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAttendanceTypeColor(record.attendanceType)}`}>
                      {record.attendanceType.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                      <span>{formatDate(record.date)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-primary-600" />
                      <span>{formatTime(record.markedAt)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-primary-600" />
                      <span>{record.location}</span>
                    </div>
                  </div>
                  
                  {record.notes && (
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Notes:</strong> {record.notes}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AttendanceRecords;


