import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  TreePine,
  Calendar,
  User,
  Phone,
  MessageSquare,
  Eye,
  Mail,
  X
} from 'lucide-react';

const statusClasses = (status) => {
  switch (status) {
    // ServiceRequestApplication statuses
    case 'submitted':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'shortlisted':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'negotiating':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'agreed':
    case 'accepted':
    case 'selected':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'assigned':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'withdrawn':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    // TappingRequest statuses
    case 'tapper_inspecting':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'tree_count_pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'cancelled':
      return 'bg-red-100 text-red-600 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const AssignedTasks = ({ darkMode = false }) => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const loadAssignedTasks = useCallback(async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';
      const response = await fetch(`${backendUrl}/service-applications/assigned-tasks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        setAssignedTasks(result.data || []);
      } else {
        console.error('Failed to fetch assigned tasks:', response.status, response.statusText);
      }
    } catch (e) {
      console.error('Failed to load assigned tasks', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const openContactModal = (task) => {
    setSelectedRequest(task.tappingRequestId);
    setShowContactModal(true);
  };

  const startTask = async (task) => {
    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';
      const response = await fetch(`${backendUrl}/service-applications/update-status/${task.applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'in_progress',
          notes: 'Task started by staff member'
        })
      });

      if (response.ok) {
        // Reload the tasks to reflect the status change
        await loadAssignedTasks();
        console.log('Task started successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to start task:', errorData.message);
        alert(`Failed to start task: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error starting task:', error);
      alert('Error starting task. Please try again.');
    }
  };

  const completeTask = async (task) => {
    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';
      const response = await fetch(`${backendUrl}/service-applications/update-status/${task.applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'completed',
          notes: 'Task completed by staff member'
        })
      });

      if (response.ok) {
        // Reload the tasks to reflect the status change
        await loadAssignedTasks();
        console.log('Task completed successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to complete task:', errorData.message);
        alert(`Failed to complete task: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Error completing task. Please try again.');
    }
  };

  useEffect(() => {
    loadAssignedTasks();
  }, [loadAssignedTasks]);

  const getTaskStats = () => {
    const pending = assignedTasks.filter(task => 
      ['assigned', 'accepted', 'agreed', 'selected', 'under_review', 'shortlisted'].includes(task.status)
    ).length;
    const inProgress = assignedTasks.filter(task => 
      ['in_progress', 'tapper_inspecting', 'tree_count_pending', 'negotiating'].includes(task.status)
    ).length;
    const highPriority = assignedTasks.filter(task => 
      task.priority === 'high' || task.priorityScore > 80
    ).length;
    const thisWeek = assignedTasks.filter(task => {
      const taskDate = new Date(task.startDate || task.createdAt || task.submittedAt);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return taskDate <= weekFromNow;
    }).length;

    return { pending, inProgress, highPriority, thisWeek };
  };

  const stats = getTaskStats();

  return (
    <div className={darkMode ? 'text-white' : 'text-gray-900'}>
      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {stats.pending}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-orange-50">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                In Progress
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {stats.inProgress}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                High Priority
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {stats.highPriority}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-red-50">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This Week
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {stats.thisWeek}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-50">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : assignedTasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold">No Assigned Tasks</h4>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>You don't have any assigned tasks yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignedTasks.map((task) => {
            const req = typeof task.tappingRequestId === 'object' ? task.tappingRequestId : null;
            const current = task.negotiation?.currentProposal;
            return (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-mono">{task.applicationId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusClasses(task.status)}`}>
                        {task.status.toUpperCase()}
                      </span>
                      {current && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                          Agreement: ₹{current.proposedRate || 0} for {current.proposedTreeCount || 0} trees
                        </span>
                      )}
                    </div>

                    {req && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{typeof req.farmLocation === 'string' ? req.farmLocation : 
                                                                                                   typeof req.farmLocation === 'object' && req.farmLocation?.address ? req.farmLocation.address :
                                                                                                   'Location not specified'}</div>
                        <div className="flex items-center"><TreePine className="h-4 w-4 mr-2" />{req.farmerEstimatedTrees || req.numberOfTrees || 'N/A'} trees</div>
                        <div className="flex items-center"><DollarSign className="h-4 w-4 mr-2" />₹{req.budgetPerTree || '—'} per tree</div>
                        <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" />Start: {req.startDate ? new Date(req.startDate).toLocaleDateString() : '—'}</div>
                        <div className="flex items-center"><User className="h-4 w-4 mr-2" />{req.farmerName || 'Farmer'}</div>
                        <div className="flex items-center"><Phone className="h-4 w-4 mr-2" />{req.farmerPhone || '—'}</div>
                      </div>
                    )}

                    {current && (
                      <div className={`mt-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            Final agreement: ₹{current.proposedRate || 0} for {current.proposedTreeCount || 0} trees
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    {/* Action buttons based on status */}
                    {['assigned', 'accepted', 'agreed', 'selected'].includes(task.status) && (
                      <button 
                        onClick={() => startTask(task)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Start Task</span>
                      </button>
                    )}
                    {['in_progress', 'tapper_inspecting', 'tree_count_pending'].includes(task.status) && (
                      <button 
                        onClick={() => completeTask(task)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark Complete</span>
                      </button>
                    )}
                    {task.status === 'negotiating' && (
                      <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>Continue Negotiation</span>
                      </button>
                    )}
                    {task.status === 'completed' && (
                      <div className="px-3 py-2 bg-purple-600 text-white rounded-lg flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completed</span>
                      </div>
                    )}
                    {['rejected', 'cancelled', 'withdrawn'].includes(task.status) && (
                      <div className="px-3 py-2 bg-red-600 text-white rounded-lg flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
                      </div>
                    )}
                    
                    {/* Always available actions */}
                    <button 
                      onClick={() => {
                        setSelectedTask(task);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">View Details</span>
                    </button>
                    {req && req.farmerPhone && (
                      <button 
                        onClick={() => openContactModal(task)}
                        className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">Contact Farmer</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Task Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedTask && (
          <motion.div
            key="task-details-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
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
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Task Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} text-2xl`}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Task ID and Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedTask.applicationId}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusClasses(selectedTask.status)}`}>
                        {selectedTask.status?.toUpperCase()}
                      </span>
                      {selectedTask.negotiation?.currentProposal && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                          Agreement: ₹{selectedTask.negotiation.currentProposal.proposedRate || 0} for {selectedTask.negotiation.currentProposal.proposedTreeCount || 0} trees
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Task Information */}
                {selectedTask.tappingRequestId && typeof selectedTask.tappingRequestId === 'object' && (
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Request Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Farm Location</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{typeof selectedTask.tappingRequestId.farmLocation === 'string' ? selectedTask.tappingRequestId.farmLocation : 
                                                                                                                      typeof selectedTask.tappingRequestId.farmLocation === 'object' && selectedTask.tappingRequestId.farmLocation?.address ? selectedTask.tappingRequestId.farmLocation.address :
                                                                                                                      'Location not specified'}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Farmer Name</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedTask.tappingRequestId.farmerName || 'Farmer'}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Number of Trees</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedTask.tappingRequestId.farmerEstimatedTrees || selectedTask.tappingRequestId.numberOfTrees || 'N/A'} trees</p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Budget per Tree</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{selectedTask.tappingRequestId.budgetPerTree || '—'}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Start Date</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedTask.tappingRequestId.startDate ? new Date(selectedTask.tappingRequestId.startDate).toLocaleDateString() : '—'}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Contact Number</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedTask.tappingRequestId.farmerPhone || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Agreement Details */}
                {selectedTask.negotiation?.currentProposal && (
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Agreement Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Proposed Rate</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{selectedTask.negotiation.currentProposal.proposedRate || 0} per tree</p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tree Count</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedTask.negotiation.currentProposal.proposedTreeCount || 0} trees</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                        darkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Close
                    </button>
                    {selectedTask.tappingRequestId && selectedTask.tappingRequestId.farmerPhone && (
                      <button
                        onClick={() => openContactModal(selectedTask)}
                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        Contact Farmer
                      </button>
                    )}
                  </div>
                  
                  {/* Task Action Buttons */}
                  {['assigned', 'accepted', 'agreed', 'selected'].includes(selectedTask.status) && (
                    <button 
                      onClick={() => {
                        startTask(selectedTask);
                        setShowDetailsModal(false);
                      }}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Start Task</span>
                    </button>
                  )}
                  {['in_progress', 'tapper_inspecting', 'tree_count_pending'].includes(selectedTask.status) && (
                    <button 
                      onClick={() => {
                        completeTask(selectedTask);
                        setShowDetailsModal(false);
                      }}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark Complete</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Farmer Modal */}
      {showContactModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
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
                {selectedRequest.farmerName || 'Farmer'}
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                📧 {selectedRequest.farmerEmail || 'No email provided'}
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

              {selectedRequest.farmerEmail && (
                <a
                  href={`mailto:${selectedRequest.farmerEmail}?subject=Regarding your tapping request ${selectedRequest.requestId}&body=Dear ${selectedRequest.farmerName || 'Farmer'},%0D%0A%0D%0ARegarding your rubber tapping request (${selectedRequest.requestId}) for your farm at ${typeof selectedRequest.farmLocation === 'string' ? selectedRequest.farmLocation : 
                                                                                                                                                                                                                                                      typeof selectedRequest.farmLocation === 'object' && selectedRequest.farmLocation?.address ? selectedRequest.farmLocation.address :
                                                                                                                                                                                                                                                      'your farm'}.%0D%0A%0D%0ABest regards,%0D%0ARubberEco Team`}
                  className="flex items-center justify-center w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Send Email
                </a>
              )}

              <button
                onClick={() => {
                  // Open WhatsApp or SMS
                  const message = `Hello ${selectedRequest.farmerName || 'Farmer'}, regarding your tapping request ${selectedRequest.requestId} for your farm at ${typeof selectedRequest.farmLocation === 'string' ? selectedRequest.farmLocation : 
                                                                                                                                                                                      typeof selectedRequest.farmLocation === 'object' && selectedRequest.farmLocation?.address ? selectedRequest.farmLocation.address :
                                                                                                                                                                                      'your farm'}. We will get back to you soon.`;
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

export default AssignedTasks;
