import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Star,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Users,
  Eye,
  MessageCircle
} from 'lucide-react';

const AssignedWorkersModal = ({ isOpen, onClose, userEmail }) => {
  const [assignedWorkers, setAssignedWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showWorkerDetails, setShowWorkerDetails] = useState(false);

  useEffect(() => {
    if (isOpen && userEmail) {
      fetchAssignedWorkers();
    }
  }, [isOpen, userEmail]);

  const fetchAssignedWorkers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/farmer-requests/assigned-workers/${userEmail}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignedWorkers(data.workers || []);
      } else {
        console.error('Failed to fetch assigned workers');
        // Fallback to mock data for demonstration
        setAssignedWorkers(getMockAssignedWorkers());
      }
    } catch (error) {
      console.error('Error fetching assigned workers:', error);
      // Fallback to mock data
      setAssignedWorkers(getMockAssignedWorkers());
    } finally {
      setLoading(false);
    }
  };

  const getMockAssignedWorkers = () => [
    {
      id: 1,
      name: 'Ravi Kumar',
      role: 'tapper',
      phone: '+91 98765 43210',
      email: 'ravi.kumar@rubbereco.com',
      location: 'Kottayam, Kerala',
      assignedDate: '2024-01-15',
      status: 'active',
      rating: 4.8,
      experience: '5 years',
      tasksCompleted: 45,
      currentTask: 'Rubber Tapping - Block A',
      farmLocation: 'Farm Block A-12',
      workSchedule: '6:00 AM - 12:00 PM',
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      name: 'Priya Nair',
      role: 'latex_collector',
      phone: '+91 87654 32109',
      email: 'priya.nair@rubbereco.com',
      location: 'Thrissur, Kerala',
      assignedDate: '2024-01-20',
      status: 'active',
      rating: 4.6,
      experience: '3 years',
      tasksCompleted: 32,
      currentTask: 'Latex Collection - Block B',
      farmLocation: 'Farm Block B-08',
      workSchedule: '7:00 AM - 1:00 PM',
      lastActive: '1 hour ago'
    },
    {
      id: 3,
      name: 'Anil Varma',
      role: 'field_officer',
      phone: '+91 76543 21098',
      email: 'anil.varma@rubbereco.com',
      location: 'Ernakulam, Kerala',
      assignedDate: '2024-01-10',
      status: 'completed',
      rating: 4.9,
      experience: '8 years',
      tasksCompleted: 67,
      currentTask: 'Quality Inspection - Completed',
      farmLocation: 'Farm Block C-15',
      workSchedule: '8:00 AM - 4:00 PM',
      lastActive: '1 day ago'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'tapper':
        return 'bg-green-100 text-green-800';
      case 'latex_collector':
        return 'bg-teal-100 text-teal-800';
      case 'field_officer':
        return 'bg-blue-100 text-blue-800';
      case 'supervisor':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      tapper: 'Rubber Tapper',
      latex_collector: 'Latex Collector',
      field_officer: 'Field Officer',
      supervisor: 'Supervisor',
      trainer: 'Trainer'
    };
    return labels[role] || role;
  };

  const handleViewDetails = (worker) => {
    setSelectedWorker(worker);
    setShowWorkerDetails(true);
  };

  const handleContactWorker = (worker) => {
    // Open phone dialer or messaging app
    window.open(`tel:${worker.phone}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="assigned-workers-modal"
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Assigned Workers</h2>
                <p className="text-primary-100 text-sm">View and manage your assigned workers</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : assignedWorkers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Workers Assigned</h3>
                <p className="text-gray-500">You don't have any workers assigned to your farm yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {assignedWorkers.map((worker) => (
                  <motion.div
                    key={worker.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {worker.name.charAt(0)}
                          </span>
                        </div>

                        {/* Worker Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{worker.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(worker.role)}`}>
                              {getRoleLabel(worker.role)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(worker.status)}`}>
                              {worker.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{worker.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{worker.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>{worker.rating} ⭐ ({worker.experience})</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{worker.tasksCompleted} tasks completed</span>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Current Assignment:</span>
                              <span className="text-xs text-gray-500">{worker.lastActive}</span>
                            </div>
                            <p className="text-sm text-gray-900 font-medium">{worker.currentTask}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>📍 {worker.farmLocation}</span>
                              <span>🕐 {worker.workSchedule}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleViewDetails(worker)}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => handleContactWorker(worker)}
                          className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Contact</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Worker Details Modal */}
      {showWorkerDetails && selectedWorker && (
        <WorkerDetailsModal
          worker={selectedWorker}
          onClose={() => setShowWorkerDetails(false)}
        />
      )}
    </AnimatePresence>
  );
};

// Worker Details Modal Component
const WorkerDetailsModal = ({ worker, onClose }) => {
  const getRoleLabel = (role) => {
    const labels = {
      tapper: 'Rubber Tapper',
      latex_collector: 'Latex Collector',
      field_officer: 'Field Officer',
      supervisor: 'Supervisor',
      trainer: 'Trainer'
    };
    return labels[role] || role;
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="worker-details-backdrop"
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{worker.name}</h2>
                <p className="text-blue-100 text-sm">{getRoleLabel(worker.role)} • {worker.status}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{worker.rating}</div>
              <div className="text-sm text-green-700">Rating ⭐</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{worker.tasksCompleted}</div>
              <div className="text-sm text-blue-700">Tasks Done</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{worker.experience}</div>
              <div className="text-sm text-purple-700">Experience</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{worker.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                  <p className="text-sm font-medium text-gray-900 mt-1 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-green-600" />
                    {worker.phone}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                  <p className="text-sm font-medium text-gray-900 mt-1 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-600" />
                    {worker.email}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</label>
                  <p className="text-sm font-medium text-gray-900 mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-red-600" />
                    {worker.location}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned Date</label>
                  <p className="text-sm font-medium text-gray-900 mt-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                    {new Date(worker.assignedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                Work Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      worker.role === 'tapper' ? 'bg-green-100 text-green-800' :
                      worker.role === 'latex_collector' ? 'bg-teal-100 text-teal-800' :
                      worker.role === 'field_officer' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {getRoleLabel(worker.role)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      worker.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        worker.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      {worker.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Active</label>
                  <p className="text-sm font-medium text-gray-900 mt-1 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-orange-600" />
                    {worker.lastActive}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Assignment */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Current Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Task</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{worker.currentTask}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Farm Location</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{worker.farmLocation}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Work Schedule</label>
                <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  {worker.workSchedule}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Progress</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">75%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mt-6 bg-gray-50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{worker.rating}</div>
                <div className="text-xs text-gray-500">Average Rating</div>
                <div className="flex justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(worker.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{worker.tasksCompleted}</div>
                <div className="text-xs text-gray-500">Tasks Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">98%</div>
                <div className="text-xs text-gray-500">Attendance Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">5.2L</div>
                <div className="text-xs text-gray-500">Latex Collected</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-gray-50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Completed rubber tapping in Block A-12</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Started morning shift</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Submitted daily report</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.open(`tel:${worker.phone}`)}
              className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <Phone className="h-4 w-4" />
              <span>Call Worker</span>
            </button>
            <button
              onClick={() => window.open(`mailto:${worker.email}`)}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <Mail className="h-4 w-4" />
              <span>Send Email</span>
            </button>
            <button
              onClick={() => {
                // Add functionality to view worker's location on map
                alert('Map view feature coming soon!');
              }}
              className="flex-1 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <MapPin className="h-4 w-4" />
              <span>View Location</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
    </AnimatePresence>,
    document.body
  );
};



export default AssignedWorkersModal;
