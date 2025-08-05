import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  TreePine,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  X,
  Eye,
  Filter,
  Search,
  Plus,
  BarChart3,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import './TappingScheduleManagement.css';

const TappingScheduleManagement = ({ darkMode }) => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({});
  const [acceptedRequests, setAcceptedRequests] = useState([]);

  useEffect(() => {
    loadSchedules();
    loadStats();
    loadAcceptedRequests();
  }, []);

  useEffect(() => {
    filterSchedules();
  }, [schedules, searchTerm, statusFilter]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      console.log('📅 Loading tapping schedules from database...');

      const getAuthToken = () => {
        return localStorage.getItem('token') || 'dummy-token-for-testing';
      };

      // Get schedules from the tapping_schedules collection
      const response = await fetch('http://localhost:5000/api/tapping-schedules', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📅 Schedules loaded from database:', data);

        // Use schedules directly from the database
        const schedules = data.data || [];

        console.log('📅 Raw schedules:', schedules);
        setSchedules(schedules);

        // Temporary alert for debugging
        if (schedules.length > 0) {
          console.log('✅ Schedules loaded successfully:', schedules.length);
        } else {
          console.log('⚠️ No schedules found in database.');
        }
      } else {
        console.error('❌ Failed to load schedules:', response.status);
        setSchedules([]);
      }
    } catch (error) {
      console.error('❌ Error loading schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const calculateEndDate = (startDate, duration) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(duration));
    return end.toISOString();
  };

  const calculateProgress = (startDate, duration, status) => {
    if (status === 'accepted') return 0;

    const start = new Date(startDate);
    const now = new Date();
    const totalDays = parseInt(duration);
    const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));

    if (daysPassed <= 0) return 0;
    if (daysPassed >= totalDays) return 100;

    return Math.round((daysPassed / totalDays) * 100);
  };

  const calculateCompletedDays = (startDate, status) => {
    if (status === 'accepted') return 0;

    const start = new Date(startDate);
    const now = new Date();
    const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));

    return Math.max(0, daysPassed);
  };

  const calculateTotalDays = (tappingType, duration) => {
    const totalDuration = parseInt(duration);

    switch (tappingType) {
      case 'daily':
        return totalDuration;
      case 'alternate_day':
        return Math.ceil(totalDuration / 2);
      case 'weekly':
        return Math.ceil(totalDuration / 7);
      default:
        return totalDuration;
    }
  };

  const generateMockDailyRecords = (startDate, status, tappingType) => {
    if (status === 'accepted') return [];

    const records = [];
    const start = new Date(startDate);
    const today = new Date();
    const daysPassed = Math.floor((today - start) / (1000 * 60 * 60 * 24));

    // Generate records for days that have passed
    for (let i = 0; i < Math.min(daysPassed, 10); i++) {
      const recordDate = new Date(start);
      recordDate.setDate(start.getDate() + i);

      // Skip weekends for daily tapping (optional)
      if (tappingType === 'daily' && (recordDate.getDay() === 0 || recordDate.getDay() === 6)) {
        continue;
      }

      records.push({
        date: recordDate.toISOString(),
        status: i < daysPassed - 1 ? 'completed' : 'in_progress',
        treesCompleted: Math.floor(Math.random() * 20) + 80, // 80-100 trees
        latexCollected: (Math.random() * 5 + 15).toFixed(1), // 15-20 kg
        quality: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
        weather: ['sunny', 'cloudy', 'light_rain'][Math.floor(Math.random() * 3)],
        notes: `Day ${i + 1} tapping completed successfully`
      });
    }

    return records;
  };

  const loadStats = async () => {
    try {
      const getAuthToken = () => {
        return localStorage.getItem('token') || 'dummy-token-for-testing';
      };

      // Get stats from the tapping schedules
      const response = await fetch('http://localhost:5000/api/tapping-schedules', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        const schedules = data.data || [];

        const activeSchedules = schedules.filter(s => s.status === 'active');
        const completedSchedules = schedules.filter(s => s.status === 'completed');
        const scheduledSchedules = schedules.filter(s => s.status === 'scheduled');

        console.log('📊 Stats calculation:', {
          totalSchedules: schedules.length,
          activeSchedules: activeSchedules.length,
          completedSchedules: completedSchedules.length,
          scheduledSchedules: scheduledSchedules.length
        });

        // Calculate average progress
        const avgProgress = schedules.length > 0
          ? schedules.reduce((sum, s) => sum + (s.progressPercentage || 0), 0) / schedules.length
          : 0;

        setStats({
          total: schedules.length,
          active: activeSchedules.length,
          completed: completedSchedules.length,
          scheduled: scheduledSchedules.length,
          averageProgress: Math.round(avgProgress)
        });
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      setStats({
        total: 0,
        active: 0,
        completed: 0,
        scheduled: 0,
        averageProgress: 0
      });
    }
  };

  const loadAcceptedRequests = async () => {
    try {
      const getAuthToken = () => {
        return localStorage.getItem('token') || 'dummy-token-for-testing';
      };

      const response = await fetch('http://localhost:5000/api/farmer-requests?status=accepted', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAcceptedRequests(data.data || []);
      }
    } catch (error) {
      console.error('❌ Error loading accepted requests:', error);
    }
  };

  const filterSchedules = () => {
    let filtered = [...schedules];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(schedule => 
        schedule.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.tapperName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.farmLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.scheduleId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === statusFilter);
    }

    setFilteredSchedules(filtered);
  };

  const createSchedule = async (requestId, notes) => {
    try {
      const getAuthToken = () => {
        return localStorage.getItem('token') || 'dummy-token-for-testing';
      };

      // Update the tapping request status to 'in_progress' to activate the schedule
      const response = await fetch(`http://localhost:5000/api/farmer-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'in_progress'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Schedule activated:', data);
        setShowCreateModal(false);
        loadSchedules();
        loadStats();
        loadAcceptedRequests();
      } else {
        console.error('❌ Failed to activate schedule:', response.status);
        alert('Failed to activate schedule. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error activating schedule:', error);
      alert('Error activating schedule. Please try again.');
    }
  };

  const updateScheduleStatus = async (scheduleId, newStatus, reason) => {
    try {
      const getAuthToken = () => {
        return localStorage.getItem('token') || 'dummy-token-for-testing';
      };

      // Find the schedule to get the actual request ID
      const schedule = schedules.find(s => s.scheduleId === scheduleId);
      if (!schedule) {
        console.error('❌ Schedule not found:', scheduleId);
        return;
      }

      // Map schedule status to request status
      const statusMap = {
        'scheduled': 'accepted',
        'active': 'in_progress',
        'paused': 'in_progress',
        'completed': 'completed',
        'cancelled': 'cancelled'
      };

      const requestStatus = statusMap[newStatus] || newStatus;

      const response = await fetch(`http://localhost:5000/api/farmer-requests/${schedule._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: requestStatus
        })
      });

      if (response.ok) {
        console.log('✅ Schedule status updated');
        loadSchedules();
        loadStats();
      } else {
        console.error('❌ Failed to update schedule status:', response.status);
        alert('Failed to update schedule status. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error updating schedule status:', error);
      alert('Error updating schedule status. Please try again.');
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'scheduled': { text: 'Scheduled', color: '#3b82f6', bgColor: '#dbeafe' },
      'active': { text: 'Active', color: '#10b981', bgColor: '#d1fae5' },
      'paused': { text: 'Paused', color: '#f59e0b', bgColor: '#fef3c7' },
      'completed': { text: 'Completed', color: '#10b981', bgColor: '#d1fae5' },
      'cancelled': { text: 'Cancelled', color: '#ef4444', bgColor: '#fee2e2' }
    };
    return statusMap[status] || { text: status, color: '#6b7280', bgColor: '#f3f4f6' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tapping schedules...</p>
      </div>
    );
  }

  return (
    <div className={`tapping-schedule-management ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className="schedule-header">
        <div className="header-content">
          <h1>Tapping Schedules</h1>
          <p>Manage and monitor rubber tapping schedules</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="btn-create"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            Create Schedule
          </button>
          <button
            className="btn-create"
            onClick={() => {
              console.log('🔄 Refreshing schedules...');
              loadSchedules();
              loadStats();
            }}
            style={{ background: '#3b82f6' }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar />
          </div>
          <div className="stat-content">
            <h3>{stats.total || 0}</h3>
            <p>Total Schedules</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <Activity />
          </div>
          <div className="stat-content">
            <h3>{stats.active || 0}</h3>
            <p>Active Schedules</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.completed || 0}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <h3>{stats.averageProgress || 0}%</h3>
            <p>Avg Progress</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>Showing {filteredSchedules.length} of {schedules.length} schedules</p>
      </div>

      {/* Schedules List */}
      <div className="schedules-list">
        {filteredSchedules.map(schedule => (
          <ScheduleCard 
            key={schedule._id || schedule.scheduleId} 
            schedule={schedule}
            onViewDetails={() => {
              setSelectedSchedule(schedule);
              setShowDetails(true);
            }}
            onUpdateStatus={updateScheduleStatus}
            getStatusInfo={getStatusInfo}
            formatDate={formatDate}
            darkMode={darkMode}
          />
        ))}
      </div>

      {filteredSchedules.length === 0 && (
        <div className="no-results">
          <Calendar className="no-results-icon" />
          <h3>No schedules found</h3>
          <p>Try adjusting your search criteria or create a new schedule</p>
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <CreateScheduleModal
          acceptedRequests={acceptedRequests}
          onClose={() => setShowCreateModal(false)}
          onCreate={createSchedule}
          darkMode={darkMode}
        />
      )}

      {/* Schedule Details Modal */}
      {showDetails && selectedSchedule && (
        <ScheduleDetailsModal
          schedule={selectedSchedule}
          onClose={() => setShowDetails(false)}
          onUpdateStatus={updateScheduleStatus}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

// Schedule Card Component
const ScheduleCard = ({ schedule, onViewDetails, onUpdateStatus, getStatusInfo, formatDate, darkMode }) => {
  const statusInfo = getStatusInfo(schedule.status);
  
  return (
    <motion.div 
      className="schedule-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="schedule-header">
        <div className="schedule-info">
          <h3>{schedule.scheduleId}</h3>
          <p className="farmer-name">{schedule.farmerName}</p>
          <div className="schedule-details">
            <span><User size={16} /> {schedule.tapperName}</span>
            <span><MapPin size={16} /> {schedule.farmLocation}</span>
            <span><TreePine size={16} /> {schedule.numberOfTrees} trees</span>
            <span><Calendar size={16} /> {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}</span>
          </div>
        </div>
        
        <div className="schedule-status">
          <div 
            className="status-badge"
            style={{ 
              backgroundColor: statusInfo.bgColor, 
              color: statusInfo.color 
            }}
          >
            {statusInfo.text}
          </div>
          <div className="progress-info">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${schedule.progressPercentage || 0}%` }}
              ></div>
            </div>
            <span>{schedule.progressPercentage || 0}% Complete</span>
          </div>
        </div>
      </div>

      <div className="schedule-actions">
        <button 
          className="btn-view"
          onClick={onViewDetails}
        >
          <Eye size={16} />
          View Details
        </button>
        
        {schedule.status === 'scheduled' && (
          <button 
            className="btn-start"
            onClick={() => onUpdateStatus(schedule.scheduleId, 'active', 'Started by admin')}
          >
            <Play size={16} />
            Start
          </button>
        )}
        
        {schedule.status === 'active' && (
          <button 
            className="btn-pause"
            onClick={() => onUpdateStatus(schedule.scheduleId, 'paused', 'Paused by admin')}
          >
            <Pause size={16} />
            Pause
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Create Schedule Modal Component
const CreateScheduleModal = ({ acceptedRequests, onClose, onCreate, darkMode }) => {
  const [selectedRequest, setSelectedRequest] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRequest) {
      onCreate(selectedRequest, notes);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Tapping Schedule</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Accepted Request</label>
            <select
              value={selectedRequest}
              onChange={(e) => setSelectedRequest(e.target.value)}
              required
            >
              <option value="">Choose a request...</option>
              {acceptedRequests.map(request => (
                <option key={request._id} value={request._id}>
                  {request.requestId} - {request.farmerName} ({request.farmLocation})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes for this schedule..."
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-create">
              Create Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Schedule Details Modal Component
const ScheduleDetailsModal = ({ schedule, onClose, onUpdateStatus, darkMode }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusInfo = (status) => {
    const statusMap = {
      'scheduled': { text: 'Scheduled', color: '#3b82f6', bgColor: '#dbeafe' },
      'active': { text: 'Active', color: '#10b981', bgColor: '#d1fae5' },
      'paused': { text: 'Paused', color: '#f59e0b', bgColor: '#fef3c7' },
      'completed': { text: 'Completed', color: '#10b981', bgColor: '#d1fae5' },
      'cancelled': { text: 'Cancelled', color: '#ef4444', bgColor: '#fee2e2' }
    };
    return statusMap[status] || { text: status, color: '#6b7280', bgColor: '#f3f4f6' };
  };

  const statusInfo = getStatusInfo(schedule.status);

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <div>
            <h2>Schedule Details - {schedule.scheduleId}</h2>
            <div
              className="status-badge"
              style={{
                backgroundColor: statusInfo.bgColor,
                color: statusInfo.color
              }}
            >
              {statusInfo.text}
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'progress' ? 'active' : ''}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
          <button
            className={activeTab === 'daily' ? 'active' : ''}
            onClick={() => setActiveTab('daily')}
          >
            Daily Records
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="info-grid">
                <div className="info-section">
                  <h3>Farmer Information</h3>
                  <div className="info-item">
                    <span>Name:</span>
                    <span>{schedule.farmerName}</span>
                  </div>
                  <div className="info-item">
                    <span>Email:</span>
                    <span>{schedule.farmerEmail}</span>
                  </div>
                  <div className="info-item">
                    <span>Phone:</span>
                    <span>{schedule.farmerPhone}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Tapper Information</h3>
                  <div className="info-item">
                    <span>Name:</span>
                    <span>{schedule.tapperName}</span>
                  </div>
                  <div className="info-item">
                    <span>Phone:</span>
                    <span>{schedule.tapperPhone}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Farm Details</h3>
                  <div className="info-item">
                    <span>Location:</span>
                    <span>{schedule.farmLocation}</span>
                  </div>
                  <div className="info-item">
                    <span>Size:</span>
                    <span>{schedule.farmSize}</span>
                  </div>
                  <div className="info-item">
                    <span>Trees:</span>
                    <span>{schedule.numberOfTrees}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Schedule Details</h3>
                  <div className="info-item">
                    <span>Type:</span>
                    <span>{schedule.tappingType}</span>
                  </div>
                  <div className="info-item">
                    <span>Duration:</span>
                    <span>{schedule.duration} days</span>
                  </div>
                  <div className="info-item">
                    <span>Preferred Time:</span>
                    <span>{schedule.preferredTime}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="progress-tab">
              <div className="progress-overview">
                <div className="progress-circle">
                  <div className="circle-progress" style={{ '--progress': `${schedule.progressPercentage || 0}%` }}>
                    <span>{schedule.progressPercentage || 0}%</span>
                  </div>
                </div>
                <div className="progress-stats">
                  <div className="stat">
                    <span>Completed Days</span>
                    <span>{schedule.completedDays || 0}</span>
                  </div>
                  <div className="stat">
                    <span>Total Days</span>
                    <span>{schedule.totalScheduledDays || 0}</span>
                  </div>
                  <div className="stat">
                    <span>Missed Days</span>
                    <span>{schedule.missedDays || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'daily' && (
            <div className="daily-tab">
              <div className="daily-records">
                {schedule.dailyRecords && schedule.dailyRecords.length > 0 ? (
                  schedule.dailyRecords.slice(0, 10).map((record, index) => (
                    <div key={index} className="daily-record">
                      <div className="record-date">
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                      <div className="record-status">
                        <span className={`status ${record.status}`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="record-details">
                        <span>Trees: {record.treesCompleted}</span>
                        <span>Latex: {record.latexCollected}kg</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No daily records available</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>

          {schedule.status === 'scheduled' && (
            <button
              className="btn-start"
              onClick={() => {
                onUpdateStatus(schedule.scheduleId, 'active', 'Started by admin');
                onClose();
              }}
            >
              <Play size={16} />
              Start Schedule
            </button>
          )}

          {schedule.status === 'active' && (
            <button
              className="btn-pause"
              onClick={() => {
                onUpdateStatus(schedule.scheduleId, 'paused', 'Paused by admin');
                onClose();
              }}
            >
              <Pause size={16} />
              Pause Schedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TappingScheduleManagement;
