import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  UserCheck, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AttendanceMarkingForm = ({ 
  isOpen, 
  onClose, 
  tasks = [], 
  onSuccess, 
  darkMode = false 
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date
    time: new Date().toTimeString().slice(0, 5), // Current time
    location: '',
    notes: '',
    attendanceType: 'present',
    selectedTasks: []
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Initialize selected tasks with all active tasks
  React.useEffect(() => {
    console.log('🔍 AttendanceMarkingForm received tasks:', tasks);
    if (isOpen && tasks.length > 0) {
      const activeTasks = tasks.filter(task => 
        ['in_progress', 'tapper_inspecting', 'tree_count_pending'].includes(task.status)
      );
      console.log('🔍 Active tasks found:', activeTasks);
      console.log('🔍 Active task IDs:', activeTasks.map(task => task._id));
      setFormData(prev => ({
        ...prev,
        selectedTasks: activeTasks.map(task => task._id)
      }));
    }
  }, [isOpen, tasks]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleTaskSelection = (taskId) => {
    setFormData(prev => ({
      ...prev,
      selectedTasks: prev.selectedTasks.includes(taskId)
        ? prev.selectedTasks.filter(id => id !== taskId)
        : [...prev.selectedTasks, taskId]
    }));
  };

  const handleSubmit = async () => {
    if (formData.selectedTasks.length === 0) {
      showNotification('Please select at least one task', 'error');
      return;
    }

    if (!formData.location.trim()) {
      showNotification('Please enter the location', 'error');
      return;
    }

    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      // Create timestamp from date and time
      const timestamp = new Date(`${formData.date}T${formData.time}`).toISOString();

      console.log('🔍 Form data being sent:', {
        taskIds: formData.selectedTasks,
        timestamp: timestamp,
        location: formData.location,
        notes: formData.notes,
        attendanceType: formData.attendanceType
      });

      const response = await fetch(`${backendUrl}/attendance/mark-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskIds: formData.selectedTasks,
          timestamp: timestamp,
          location: formData.location,
          notes: formData.notes,
          attendanceType: formData.attendanceType
        })
      });

      if (response.ok) {
        const result = await response.json();
        showNotification(`Attendance marked successfully for ${formData.selectedTasks.length} task(s)!`, 'success');
        onSuccess && onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        showNotification(`Failed to mark attendance: ${errorData.message}`, 'error');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      showNotification('Failed to mark attendance. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      location: '',
      notes: '',
      attendanceType: 'present',
      selectedTasks: []
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const activeTasks = tasks.filter(task => 
    ['in_progress', 'tapper_inspecting', 'tree_count_pending'].includes(task.status)
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleClose}
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
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Mark Attendance
                </h2>
                <button
                  onClick={handleClose}
                  className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} text-2xl`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Task Selection */}
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Select Tasks ({formData.selectedTasks.length} selected)
                </h3>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 max-h-48 overflow-y-auto`}>
                  {activeTasks.length === 0 ? (
                    <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No active tasks available for attendance marking
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {activeTasks.map((task) => (
                        <label
                          key={task._id}
                          className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-opacity-50 ${
                            darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedTasks.includes(task._id)}
                            onChange={() => handleTaskSelection(task._id)}
                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                          />
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Task ID: {task._id.slice(-8)}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Status: {task.status} | Application: {task.applicationId?.slice(-8) || 'N/A'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                    <Clock className="inline h-4 w-4 mr-1" />
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter the field location or address"
                  required
                />
              </div>

              {/* Attendance Type */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <UserCheck className="inline h-4 w-4 mr-1" />
                  Attendance Type
                </label>
                <select
                  value={formData.attendanceType}
                  onChange={(e) => setFormData({ ...formData, attendanceType: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FileText className="inline h-4 w-4 mr-1" />
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Add any additional notes about the attendance..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleClose}
                  className={`flex-1 px-6 py-3 border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors duration-200`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || formData.selectedTasks.length === 0 || !formData.location.trim()}
                  className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Marking...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>Mark Attendance</span>
                    </>
                  )}
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
    </>
  );
};

export default AttendanceMarkingForm;
