import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Check, 
  XCircle, 
  Clock, 
  DollarSign, 
  TreePine, 
  MessageSquare,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  Award,
  AlertCircle,
  Info,
  Edit3,
  CheckCircle
} from 'lucide-react';
import toastService from '../../services/toastService';

const EnhancedStaffNegotiationModal = React.memo(({ 
  isOpen, 
  onClose, 
  application, 
  userRole, 
  onUpdate 
}) => {
  const [loading, setLoading] = useState(false);
  const [proposedRate, setProposedRate] = useState('');
  const [proposedTreeCount, setProposedTreeCount] = useState('');
  const [proposedTiming, setProposedTiming] = useState({
    startDate: '',
    endDate: '',
    preferredTimeSlots: [],
    workingDays: [],
    estimatedDuration: ''
  });
  const [notes, setNotes] = useState('');
  const [negotiationData, setNegotiationData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [confirmAction, setConfirmAction] = useState(null); // 'accept' | 'reject' | null

  const loadNegotiationDetails = useCallback(async () => {
    try {
      if (!application || !application.applicationId) {
        console.error('❌ Cannot load negotiation details: application or application.applicationId is missing');
        return;
      }
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      console.log('🔍 Loading negotiation details for application:', application.applicationId);
      
      const response = await fetch(`${backendUrl}/api/service-applications/${application.applicationId}/negotiation`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setNegotiationData(result.data);
        console.log('✅ Negotiation details loaded successfully');
        console.log('📊 Tapping Request Data:', result.data.tappingRequest);
        
        // Set initial values from farmer's original request if no proposals exist
        if (result.data && !result.data.negotiation?.currentProposal) {
          const tappingRequest = result.data.tappingRequest;
          if (tappingRequest) {
            console.log('💰 Setting initial values:', {
              budgetPerTree: tappingRequest.budgetPerTree,
              numberOfTrees: tappingRequest.numberOfTrees
            });
            setProposedRate(tappingRequest.budgetPerTree || '');
            setProposedTreeCount(tappingRequest.numberOfTrees || '');
          }
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to load negotiation details:', response.status, errorData);
        
        if (response.status === 403) {
          showNotification('Access denied. You may not have permission to view this negotiation.', 'error');
        } else if (response.status === 404) {
          showNotification('Application not found. It may have been deleted or corrupted.', 'error');
        } else {
          showNotification(`Failed to load negotiation details: ${errorData.message || 'Unknown error'}`, 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error loading negotiation details:', error);
      showNotification('Network error while loading negotiation details. Please try again.', 'error');
    }
  }, [application?.applicationId]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  }, []);

  useEffect(() => {
    if (!isOpen || !application || !application.applicationId || application.applicationId === 'temp') {
      return;
    }
    
    if (!application.tappingRequestId) {
      console.error('❌ Application missing tappingRequestId:', application);
      showNotification('Application data is corrupted. Please try again.', 'error');
      onClose();
      return;
    }
    
    console.log('🚀 Calling loadNegotiationDetails for application:', application.applicationId);
    loadNegotiationDetails();
    
    // Set initial values based on farmer's proposal or current proposal
    if (application.negotiation?.currentProposal) {
      const current = application.negotiation.currentProposal;
      // If current proposal is from farmer, use it as starting point for staff negotiation
      if (current.proposedBy === 'farmer') {
        setProposedRate(current.proposedRate || '');
        setProposedTreeCount(current.proposedTreeCount || '');
      } else {
        // If current proposal is from staff, use it for counter proposal
        setProposedRate(current.proposedRate || '');
        setProposedTreeCount(current.proposedTreeCount || '');
      }
    } else {
      // This is a new application, set default values from farmer's original request
      setProposedRate('');
      setProposedTreeCount('');
      setNotes('');
      setNegotiationData({
        status: 'submitted',
        negotiation: {
          initialProposal: null,
          currentProposal: null,
          history: [],
          finalAgreement: null
        }
      });
    }
  }, [isOpen, application?.applicationId, onClose, loadNegotiationDetails]);

  const handleSubmitProposal = async () => {
    if (!proposedRate || !proposedTreeCount) {
      showNotification('Please fill in rate and tree count', 'error');
      return;
    }

    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const endpoint = (application.status === 'submitted' || application.status === 'under_review') ? 'propose' : 'counter-propose';
      
      const body = (application.status === 'submitted' || application.status === 'under_review')
        ? { 
            proposedRate: Number(proposedRate), 
            proposedTreeCount: Number(proposedTreeCount), 
            proposedTiming: proposedTiming,
            notes 
          }
        : { 
            proposedRate: Number(proposedRate), 
            proposedTreeCount: Number(proposedTreeCount), 
            proposedTiming: proposedTiming,
            notes, 
            proposedBy: userRole 
          };

      const response = await fetch(`${backendUrl}/api/service-applications/${application.applicationId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const result = await response.json();
        setNegotiationData(result.data);
        setProposedRate('');
        setProposedTreeCount('');
        setProposedTiming({
          startDate: '',
          endDate: '',
          preferredTimeSlots: [],
          workingDays: [],
          estimatedDuration: ''
        });
        setNotes('');
        setIsEditing(false);
        onUpdate && onUpdate();
        showNotification('Proposal submitted successfully!', 'success');
        
        // Show toast notification
        const farmerName = negotiationData?.tappingRequest?.farmerName || 'Farmer';
        const requestId = application?.applicationId || 'Unknown';
        toastService.proposalSubmitted(requestId, farmerName);
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to submit proposal', 'error');
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      showNotification('Failed to submit proposal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/service-applications/${application.applicationId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ acceptedBy: userRole })
      });

      if (response.ok) {
        const result = await response.json();
        setNegotiationData(result.data);
        onUpdate && onUpdate();
        showNotification('Proposal accepted! Both parties have agreed.', 'success');
        
        // Show toast notification
        const farmerName = negotiationData?.tappingRequest?.farmerName || 'Farmer';
        const requestId = application?.applicationId || 'Unknown';
        toastService.agreementReached(requestId, farmerName);
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to accept proposal', 'error');
      }
    } catch (error) {
      console.error('Error accepting proposal:', error);
      showNotification('Failed to accept proposal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectProposal = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/service-applications/${application.applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectedBy: userRole })
      });

      if (response.ok) {
        const result = await response.json();
        setNegotiationData(result.data);
        onUpdate && onUpdate();
        showNotification('Proposal rejected. You can submit a counter proposal.', 'info');
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to reject proposal', 'error');
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      showNotification('Failed to reject proposal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openConfirm = (action) => setConfirmAction(action);
  const closeConfirm = () => setConfirmAction(null);
  const confirmHandler = async () => {
    if (confirmAction === 'accept') {
      await handleAcceptProposal();
    } else if (confirmAction === 'reject') {
      await handleRejectProposal();
    }
    setConfirmAction(null);
  };

  const canSubmitProposal = () => {
    if (!negotiationData) return false;
    
    // Cannot submit proposal if negotiation is already accepted/agreed
    if (negotiationData.status === 'accepted' || negotiationData.status === 'agreed') {
      return false;
    }
    
    const currentProposal = negotiationData.negotiation?.currentProposal;
    if (!currentProposal) return true;
    
    // Can't submit if it's your own proposal that's pending
    return currentProposal.proposedBy !== userRole || currentProposal.status === 'rejected';
  };

  const canAcceptProposal = () => {
    if (!negotiationData) return false;
    const currentProposal = negotiationData.negotiation?.currentProposal;
    if (!currentProposal) return false;
    
    // Can only accept if it's not your own proposal
    return currentProposal.proposedBy !== userRole;
  };

  const canRejectProposal = () => {
    if (!negotiationData) return false;
    const currentProposal = negotiationData.negotiation?.currentProposal;
    if (!currentProposal) return false;
    
    // Can only reject if it's not your own proposal
    return currentProposal.proposedBy !== userRole;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'agreed': 
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'negotiating': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get the farmer's current proposal for editing
  const getFarmerProposal = () => {
    if (!negotiationData?.negotiation?.currentProposal) return null;
    const current = negotiationData.negotiation.currentProposal;
    return current.proposedBy === 'farmer' ? current : null;
  };

  const farmerProposal = getFarmerProposal();

  if (!isOpen || !application) return null;

  return (
    <AnimatePresence>
      {/* Custom Notification */}
      {notification.show && (
        <motion.div
          key="notification"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-[60] p-4 rounded-lg shadow-lg border-l-4 max-w-md ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : notification.type === 'error'
              ? 'bg-red-50 border-red-400 text-red-800'
              : 'bg-blue-50 border-blue-400 text-blue-800'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Info className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Negotiation Form</h2>
                <p className="text-gray-600">Application: {application.applicationId}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Status */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Current Status</h3>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(negotiationData?.status)}`}>
                  {negotiationData?.status?.toUpperCase() || 'LOADING...'}
                </span>

              </div>
            </div>

            {/* Farmer Information */}
            {negotiationData?.tappingRequest && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Farmer Request Details</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Farmer Name</span>
                      <p className="font-medium">{negotiationData.tappingRequest.farmerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Farm Location</span>
                      <p className="font-medium">{negotiationData.tappingRequest.farmLocation}</p>
                    </div>
                  </div>
                                     <div className="flex items-center space-x-2">
                     <TreePine className="h-4 w-4 text-gray-500" />
                     <div>
                       <span className="text-gray-600">Original Tree Count</span>
                       <p className="font-medium">{negotiationData.tappingRequest.farmerEstimatedTrees || negotiationData.tappingRequest.numberOfTrees || 'Not specified'}</p>
                     </div>
                   </div>
                   <div className="flex items-center space-x-2">
                     <DollarSign className="h-4 w-4 text-gray-500" />
                     <div>
                       <span className="text-gray-600">Budget Per Tree</span>
                       <p className="font-medium">₹{negotiationData.tappingRequest.budgetPerTree || 'Not specified'}</p>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {/* Farmer's Original Request Details - Read Only Reference */}
            {negotiationData?.tappingRequest && !farmerProposal && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-4">Farmer's Original Request (Reference)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-yellow-800 mb-2">
                      Budget Per Tree (₹)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={negotiationData.tappingRequest.budgetPerTree || ''}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        placeholder="No budget specified"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-800 mb-2">
                      Estimated Tree Count
                    </label>
                    <div className="relative">
                      <TreePine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={negotiationData.tappingRequest.farmerEstimatedTrees || negotiationData.tappingRequest.numberOfTrees || ''}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        placeholder="Not specified"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Farmer's Proposal Display and Response Section */}
            {farmerProposal && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-yellow-900">Farmer's Proposal</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-yellow-700 hover:text-yellow-800 text-sm font-medium flex items-center space-x-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{isEditing ? 'Cancel Response' : 'Respond to Proposal'}</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-yellow-800 mb-2">
                      Farmer's Proposed Rate (₹ per tree)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={farmerProposal.proposedRate || 0}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        placeholder="No rate specified"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-800 mb-2">
                      Farmer's Proposed Tree Count
                    </label>
                    <div className="relative">
                      <TreePine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={farmerProposal.proposedTreeCount || 0}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        placeholder="No count specified"
                      />
                    </div>
                  </div>
                </div>

                {farmerProposal.notes && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-yellow-700 mb-2">
                      Farmer's Notes
                    </label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-700">
                      {farmerProposal.notes}
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3">Your Response</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          Your Proposed Rate (₹ per tree) *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            value={proposedRate}
                            onChange={(e) => setProposedRate(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your proposed rate"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          Your Proposed Tree Count *
                        </label>
                        <div className="relative">
                          <TreePine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            value={proposedTreeCount}
                            onChange={(e) => setProposedTreeCount(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your proposed count"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Your Response Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add your response notes..."
                      />
                    </div>

                    <button
                      onClick={handleSubmitProposal}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>{loading ? 'Submitting...' : 'Submit Response'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Initial Proposal Form (when no farmer proposal exists) */}
            {!farmerProposal && canSubmitProposal() && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-blue-900 text-lg">
                    Submit Your Initial Proposal
                  </h3>
                </div>
                
                {/* Rate and Tree Count */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-2">
                      Your Proposed Rate (₹ per tree) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your proposed rate per tree"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-2">
                      Your Proposed Tree Count *
                    </label>
                    <div className="relative">
                      <TreePine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={proposedTreeCount}
                        onChange={(e) => setProposedTreeCount(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your proposed tree count"
                      />
                    </div>
                  </div>
                </div>

                {/* Timing removed per request */}

                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-blue-800 mb-2">Your Proposal Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any notes or explanations for your proposal (e.g., trees are tappable)"
                  />
                </div>

                <button
                  onClick={handleSubmitProposal}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 text-lg font-semibold"
                >
                  <Send className="h-5 w-5" />
                  <span>{loading ? 'Submitting...' : 'Submit Your Initial Proposal'}</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            {negotiationData?.status === 'negotiating' && (
              <div className="flex space-x-4">
                {canAcceptProposal() && (
                  <button
                    onClick={() => openConfirm('accept')}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    <span>Accept Proposal</span>
                  </button>
                )}
                {canRejectProposal() && (
                  <button
                    onClick={() => openConfirm('reject')}
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject Proposal</span>
                  </button>
                )}
              </div>
            )}

            {/* Negotiation History */}
            {negotiationData?.negotiation?.history && negotiationData.negotiation.history.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Negotiation History</h3>
                <div className="space-y-3">
                  {negotiationData.negotiation.history.map((proposal, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        proposal.status === 'accepted' ? 'bg-green-100 border-green-200' :
                        proposal.status === 'rejected' ? 'bg-red-100 border-red-200' :
                        proposal.status === 'countered' ? 'bg-yellow-100 border-yellow-200' :
                        'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            proposal.proposedBy === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {proposal.proposedBy === 'staff' ? 'Staff' : 'Farmer'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            proposal.status === 'countered' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {proposal.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {proposal.proposedAt ? new Date(proposal.proposedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Rate:</span> ₹{proposal.proposedRate || 0} per tree
                        </div>
                        <div>
                          <span className="font-medium">Trees:</span> {proposal.proposedTreeCount || 0}
                        </div>
                      </div>
                      {proposal.proposedTiming && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Timing:</span> {proposal.proposedTiming.startDate} - {proposal.proposedTiming.endDate || 'Ongoing'}
                        </div>
                      )}
                      {proposal.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {proposal.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Agreement */}
            {negotiationData?.negotiation?.finalAgreement && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-4">Final Agreement</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Agreed Rate:</span> ₹{negotiationData.negotiation.finalAgreement.agreedRate || 0} per tree
                  </div>
                  <div>
                    <span className="font-medium">Agreed Tree Count:</span> {negotiationData.negotiation.finalAgreement.agreedTreeCount || 0}
                  </div>
                </div>
                {negotiationData.negotiation.finalAgreement.agreedTiming && (
                  <div className="mt-2 text-sm text-green-700">
                    <span className="font-medium">Agreed Timing:</span> {negotiationData.negotiation.finalAgreement.agreedTiming.startDate} - {negotiationData.negotiation.finalAgreement.agreedTiming.endDate || 'Ongoing'}
                  </div>
                )}
                <div className="mt-2 text-sm text-green-700">
                  <span className="font-medium">Agreed on:</span> {negotiationData.negotiation.finalAgreement.agreedAt ? new Date(negotiationData.negotiation.finalAgreement.agreedAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      {/* Confirmation Modal */}
      {confirmAction && (
        <motion.div
          key="confirm-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60] p-4"
          onClick={closeConfirm}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmAction === 'accept' ? 'Accept Proposal' : 'Reject Proposal'}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmAction === 'accept'
                ? 'Are you sure you want to accept this proposal? This will finalize the agreement.'
                : 'Are you sure you want to reject this proposal? You can still submit a counter later.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmHandler}
                className={`${confirmAction === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} px-4 py-2 rounded-lg text-white`}
              >
                {confirmAction === 'accept' ? 'Accept' : 'Reject'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default EnhancedStaffNegotiationModal;
