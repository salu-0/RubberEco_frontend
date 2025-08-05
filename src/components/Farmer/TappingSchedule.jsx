import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Calendar,
  User,
  MapPin,
  TreePine,
  CheckCircle,
  AlertCircle,
  X,
  Phone,
  MessageCircle,
  Star,
  Filter,
  Search,
  Download,
  Eye
} from 'lucide-react';

const TappingSchedule = ({ isOpen, onClose }) => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadSchedules();
    }
  }, [isOpen]);

  useEffect(() => {
    filterSchedules();
  }, [schedules, searchTerm, statusFilter]);

  const loadSchedules = async () => {
    try {
      setLoading(true);

      // Get current farmer data from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.error('❌ No user data found in localStorage');
        setSchedules([]);
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const farmerId = user._id || user.id;

      console.log('🗓️ Loading tapping schedules for farmer:', farmerId);

      // Fetch real tapping schedules from API
      const response = await fetch(`http://localhost:5000/api/farmer-requests/farmer/${farmerId}/schedules`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ Loaded schedules:', result.data);
        setSchedules(result.data);
      } else {
        console.error('❌ Failed to load schedules:', result.message);
        setSchedules([]);
      }

    } catch (error) {
      console.error('❌ Error loading schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSchedules = () => {
    let filtered = [...schedules];

    if (searchTerm) {
      filtered = filtered.filter(schedule =>
        schedule.tapperName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.farmLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === statusFilter);
    }

    setFilteredSchedules(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Active' },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Completed' },
      upcoming: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Upcoming' },
      paused: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'Paused' }
    };
    
    const config = statusConfig[status] || statusConfig.upcoming;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getProgressPercentage = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tapping Schedule</h2>
              <p className="text-blue-100">View and manage your tapping schedules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by tapper name, location, or schedule ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
                <option value="paused">Paused</option>
              </select>
              
              <button className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading schedules...</p>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
              <p className="text-gray-600">No tapping schedules match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSchedules.map((schedule) => (
                <motion.div
                  key={schedule.id}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Schedule Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">Schedule #{schedule.id}</h3>
                        {getStatusBadge(schedule.status)}
                      </div>
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {schedule.farmLocation}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Progress</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {getProgressPercentage(schedule.completedDays, schedule.totalDays)}%
                      </p>
                    </div>
                  </div>

                  {/* Tapper Info */}
                  <div className="bg-white rounded-xl p-4 mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Assigned Tapper</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{schedule.tapperName}</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{schedule.tapperRating}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{schedule.tapperPhone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TreePine className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-gray-500">Trees</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{schedule.numberOfTrees}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-gray-500">Type</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{schedule.scheduleType}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="text-xs text-gray-500">Duration</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{schedule.totalDays} days</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-gray-500">Completed</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{schedule.completedDays} days</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">
                        {schedule.completedDays} of {schedule.totalDays} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(schedule.completedDays, schedule.totalDays)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Schedule Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Start Date</p>
                      <p className="text-sm font-medium text-gray-900">{schedule.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">End Date</p>
                      <p className="text-sm font-medium text-gray-900">{schedule.endDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Time Slot</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{schedule.timeSlot}</p>
                    </div>
                  </div>

                  {/* Last/Next Tapping */}
                  {schedule.status === 'active' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 mb-1">Last Tapped</p>
                        <p className="text-sm font-medium text-green-800">{schedule.lastTapped}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 mb-1">Next Tapping</p>
                        <p className="text-sm font-medium text-blue-800">{schedule.nextTapping}</p>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {schedule.notes && (
                    <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-yellow-600 mb-1">Notes</p>
                      <p className="text-sm text-yellow-800">{schedule.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Schedule ID: {schedule.id}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
                        <Eye className="h-4 w-4 inline mr-1" />
                        View Details
                      </button>
                      {schedule.status === 'active' && (
                        <button className="px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-medium">
                          Pause Schedule
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TappingSchedule;
