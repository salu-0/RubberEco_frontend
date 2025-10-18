import React, { useState, useEffect } from 'react';
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
  Calendar,
  Star,
  Award,
  Clock3,
  AlertCircle,
  Info
} from 'lucide-react';

const EnhancedNegotiationModal = ({ 
  isOpen, 
  onClose, 
  application, 
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
  const [showStaffDetails, setShowStaffDetails] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3000);
  };

  const timeSlots = [
    { id: 'early_morning', label: 'Early Morning (5:00 AM - 8:00 AM)' },
    { id: 'morning', label: 'Morning (8:00 AM - 12:00 PM)' },
    { id: 'afternoon', label: 'Afternoon (12:00 PM - 4:00 PM)' },
    { id: 'evening', label: 'Evening (4:00 PM - 7:00 PM)' }
  ];

  const workingDays = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    if (isOpen && application) {
      loadNegotiationDetails();
      // Reset form fields when opening modal
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
    }
  }, [isOpen, application]);

  const loadNegotiationDetails = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rubbereco-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/service-applications/${application._id}/negotiation`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setNegotiationData(result.data);
      }
    } catch (error) {
      console.error('Error loading negotiation details:', error);
    }
  };

  // Confirmation helpers
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

  const handleSubmitCounterProposal = async () => {
    if (!proposedRate || !proposedTreeCount) {
      showToast('Please fill in rate and tree count', 'error');
      return;
    }

    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rubbereco-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/service-applications/${application._id}/counter-propose`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proposedRate: Number(proposedRate),
          proposedTreeCount: Number(proposedTreeCount),
          proposedTiming: proposedTiming,
          notes,
          proposedBy: 'farmer'
        })
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
        onUpdate && onUpdate();
        showToast('Counter proposal submitted successfully!', 'success');
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to submit counter proposal', 'error');
      }
    } catch (error) {
      console.error('Error submitting counter proposal:', error);
      showToast('Failed to submit counter proposal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rubbereco-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/service-applications/${application._id}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ acceptedBy: 'farmer' })
      });

      if (response.ok) {
        const result = await response.json();
        setNegotiationData(result.data);
        onUpdate && onUpdate();
        showToast('Proposal accepted! Both parties have agreed.', 'success');
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to accept proposal', 'error');
      }
    } catch (error) {
      console.error('Error accepting proposal:', error);
      showToast('Failed to accept proposal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectProposal = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rubbereco-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/service-applications/${application._id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectedBy: 'farmer' })
      });

      if (response.ok) {
        const result = await response.json();
        setNegotiationData(result.data);
        onUpdate && onUpdate();
        showToast('Proposal rejected. You can submit a counter proposal.', 'info');
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to reject proposal', 'error');
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      showToast('Failed to reject proposal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotChange = (slotId) => {
    setProposedTiming(prev => ({
      ...prev,
      preferredTimeSlots: prev.preferredTimeSlots.includes(slotId)
        ? prev.preferredTimeSlots.filter(id => id !== slotId)
        : [...prev.preferredTimeSlots, slotId]
    }));
  };

  const handleWorkingDayChange = (dayId) => {
    setProposedTiming(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(dayId)
        ? prev.workingDays.filter(id => id !== dayId)
        : [...prev.workingDays, dayId]
    }));
  };

  const canSubmitCounterProposal = () => {
    if (!negotiationData) {
      console.log('❌ No negotiation data');
      return false;
    }
    
    // Cannot submit counter proposal if negotiation is already accepted/agreed
    if (negotiationData.status === 'accepted' || negotiationData.status === 'agreed') {
      console.log('❌ Negotiation already accepted/agreed:', negotiationData.status);
      return false;
    }
    
    const currentProposal = negotiationData.negotiation?.currentProposal;
    if (!currentProposal) {
      console.log('❌ No current proposal');
      return false;
    }
    
    console.log('🔍 Current proposal details:', {
      proposedBy: currentProposal.proposedBy,
      proposedRate: currentProposal.proposedRate,
      proposedTreeCount: currentProposal.proposedTreeCount,
      status: negotiationData.status
    });
    
    // Can submit counter proposal if current proposal is from staff and negotiation is still active
    const canSubmit = currentProposal.proposedBy === 'staff';
    console.log('✅ Can submit counter proposal:', canSubmit);
    return canSubmit;
  };

  const canAcceptProposal = () => {
    if (!negotiationData) return false;
    const currentProposal = negotiationData.negotiation?.currentProposal;
    if (!currentProposal) return false;
    
    // Can only accept if it's from staff
    return currentProposal.proposedBy === 'staff';
  };

  const canRejectProposal = () => {
    if (!negotiationData) return false;
    const currentProposal = negotiationData.negotiation?.currentProposal;
    if (!currentProposal) return false;
    
    // Can only reject if it's from staff
    return currentProposal.proposedBy === 'staff';
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

  if (!isOpen || !application) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="negotiation-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          key="neg-modal-card"
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
                <h2 className="text-2xl font-bold text-gray-900">Enhanced Negotiation</h2>
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
                {negotiationData?.negotiation?.currentProposal && (
                  <span className="text-sm text-blue-700">
                    Current proposal: ₹{negotiationData.negotiation.currentProposal.proposedRate} per tree, 
                    {negotiationData.negotiation.currentProposal.proposedTreeCount} trees
                  </span>
                )}
              </div>
              {negotiationData?.negotiation?.currentProposal && (
                <div className="mt-2 text-xs text-blue-600">
                  Last proposal by: <span className="font-medium">{negotiationData.negotiation.currentProposal.proposedBy}</span>
                  {canSubmitCounterProposal() && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      You can submit a counter proposal
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Staff Information */}
            {negotiationData?.staff && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Staff Applicant Details</h3>
                  <button
                    onClick={() => setShowStaffDetails(!showStaffDetails)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showStaffDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-600">Name</span>
                      <p className="font-medium">{negotiationData.staff.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-600">Email</span>
                      <p className="font-medium break-words">{negotiationData.staff.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-600">Phone</span>
                      <p className="font-medium break-words">{negotiationData.staff.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {showStaffDetails && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Role:</span>
                        <p className="font-medium">{application.staffRole || 'Field Worker'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Application Date:</span>
                        <p className="font-medium">{new Date(application.submittedAt).toLocaleDateString()}</p>
                      </div>
                      {application.coverLetter && (
                        <div className="md:col-span-2">
                          <span className="text-gray-600">Cover Letter:</span>
                          <p className="font-medium mt-1">{application.coverLetter}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Counter Proposal Form */}
            {canSubmitCounterProposal() && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-4">Submit Counter Proposal</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Staff has submitted a proposal. You can now submit your counter proposal with your preferred rate and tree count.
                </p>
                
                {/* Staff's Current Proposal Reference */}
                {negotiationData?.negotiation?.currentProposal && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-2">Staff's Current Proposal:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Rate:</span> ₹{negotiationData.negotiation.currentProposal.proposedRate} per tree
                      </div>
                      <div>
                        <span className="font-medium">Trees:</span> {negotiationData.negotiation.currentProposal.proposedTreeCount}
                      </div>
                    </div>
                    {negotiationData.negotiation.currentProposal.notes && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Notes:</span> {negotiationData.negotiation.currentProposal.notes}
                      </div>
                    )}
                  </div>
                )}

                
                {/* Rate and Tree Count */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposed Rate (₹ per tree) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter rate per tree"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposed Tree Count *
                    </label>
                    <div className="relative">
                      <TreePine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={proposedTreeCount}
                        onChange={(e) => setProposedTreeCount(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter tree count"
                      />
                    </div>
                  </div>
                </div>

                {/* Timing removed per request */}

                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any notes or explanations for your counter proposal..."
                  />
                </div>

                <button
                  onClick={handleSubmitCounterProposal}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? 'Submitting...' : 'Submit Counter Proposal'}</span>
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
                    <span>Accept Staff Proposal</span>
                  </button>
                )}
                {canRejectProposal() && (
                  <button
                    onClick={() => openConfirm('reject')}
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject Staff Proposal</span>
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
                          {new Date(proposal.proposedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Rate:</span> ₹{proposal.proposedRate} per tree
                        </div>
                        <div>
                          <span className="font-medium">Trees:</span> {proposal.proposedTreeCount}
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
                    <span className="font-medium">Agreed Rate:</span> ₹{negotiationData.negotiation.finalAgreement.agreedRate} per tree
                  </div>
                  <div>
                    <span className="font-medium">Agreed Tree Count:</span> {negotiationData.negotiation.finalAgreement.agreedTreeCount}
                  </div>
                </div>
                {negotiationData.negotiation.finalAgreement.agreedTiming && (
                  <div className="mt-2 text-sm text-green-700">
                    <span className="font-medium">Agreed Timing:</span> {negotiationData.negotiation.finalAgreement.agreedTiming.startDate} - {negotiationData.negotiation.finalAgreement.agreedTiming.endDate || 'Ongoing'}
                  </div>
                )}
                <div className="mt-2 text-sm text-green-700">
                  <span className="font-medium">Agreed on:</span> {new Date(negotiationData.negotiation.finalAgreement.agreedAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      {toast.show && (
        <div className={`fixed bottom-4 right-4 z-[70] px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'info' ? 'bg-blue-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
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
};

export default EnhancedNegotiationModal;
