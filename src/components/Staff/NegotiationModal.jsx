import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Check, XCircle, Clock, DollarSign, TreePine, MessageSquare } from 'lucide-react';

const NegotiationModal = React.memo(({ 
  isOpen, 
  onClose, 
  application, 
  userRole, 
  onUpdate 
}) => {
  // Debug logging removed to clean up console output
  const [loading, setLoading] = useState(false);
  const [proposedRate, setProposedRate] = useState('');
  const [proposedTreeCount, setProposedTreeCount] = useState('');
  const [notes, setNotes] = useState('');
  const [negotiationData, setNegotiationData] = useState(null);

  const loadNegotiationDetails = useCallback(async () => {
    try {
      // Additional validation
      if (!application || !application._id) {
        console.error('❌ Cannot load negotiation details: application or application._id is missing');
        return;
      }
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rubbereco-backend.onrender.com';
      console.log('🔍 Loading negotiation details for application:', application._id);
      
      const response = await fetch(`${backendUrl}/api/service-applications/${application._id}/negotiation`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setNegotiationData(result.data);
        console.log('✅ Negotiation details loaded successfully');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to load negotiation details:', response.status, errorData);
        
        if (response.status === 403) {
          alert('Access denied. You may not have permission to view this negotiation.');
        } else if (response.status === 404) {
          alert('Application not found. It may have been deleted or corrupted.');
        } else {
          alert(`Failed to load negotiation details: ${errorData.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading negotiation details:', error);
      alert('Network error while loading negotiation details. Please try again.');
    }
  }, [application?._id]); // Only depend on the ID, not the entire application object

  useEffect(() => {
    // Only run this effect when the modal is actually open and we have a valid application
    if (!isOpen || !application || !application._id || application._id === 'temp') {
      return; // Early return if conditions aren't met
    }
    
    // Debug logging removed to clean up console output
    
    // Validate application data before proceeding
    if (!application.tappingRequestId) {
      console.error('❌ Application missing tappingRequestId:', application);
      alert('Application data is corrupted. Please try again.');
      onClose();
      return;
    }
    
    // If this is a real application with valid data, load negotiation details
    console.log('🚀 Calling loadNegotiationDetails for application:', application._id);
    loadNegotiationDetails();
    // Set initial values for new proposals
    if (application.negotiation?.currentProposal) {
      const current = application.negotiation.currentProposal;
      setProposedRate(current.proposedRate || '');
      setProposedTreeCount(current.proposedTreeCount || '');
    } else {
      // This is a new application, set default values
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
  }, [isOpen, application?._id, onClose, loadNegotiationDetails]); // Only depend on the ID, not the entire application object

  const handleSubmitProposal = async () => {
    if (!proposedRate || !proposedTreeCount) {
      alert('Please fill in both rate and tree count');
      return;
    }

    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rubbereco-backend.onrender.com';
      const endpoint = (application.status === 'submitted' || application.status === 'under_review') ? 'propose' : 'counter-propose';
      
      const body = (application.status === 'submitted' || application.status === 'under_review')
        ? { proposedRate: Number(proposedRate), proposedTreeCount: Number(proposedTreeCount), notes }
        : { proposedRate: Number(proposedRate), proposedTreeCount: Number(proposedTreeCount), notes, proposedBy: userRole };

      const response = await fetch(`${backendUrl}/api/service-applications/${application._id}/${endpoint}`, {
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
        setNotes('');
        onUpdate && onUpdate();
        alert('Proposal submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit proposal');
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async () => {
    if (!confirm('Are you sure you want to accept this proposal?')) return;

    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rubbereco-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/service-applications/${application._id}/accept`, {
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
        alert('Proposal accepted! Both parties have agreed.');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to accept proposal');
      }
    } catch (error) {
      console.error('Error accepting proposal:', error);
      alert('Failed to accept proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectProposal = async () => {
    if (!confirm('Are you sure you want to reject this proposal?')) return;

    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rubbereco-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/service-applications/${application._id}/reject`, {
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
        alert('Proposal rejected. You can submit a counter proposal.');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to reject proposal');
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      alert('Failed to reject proposal');
    } finally {
      setLoading(false);
    }
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

  if (!isOpen || !application) return null;

  return (
    <AnimatePresence>
      <motion.div
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
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Negotiation</h2>
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  (negotiationData?.status === 'agreed' || negotiationData?.status === 'accepted') ? 'bg-green-100 text-green-800' :
                  negotiationData?.status === 'negotiating' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {negotiationData?.status?.toUpperCase() || 'LOADING...'}
                </span>
                {negotiationData?.negotiation?.currentProposal && (
                  <span className="text-sm text-blue-700">
                    Current proposal: ₹{negotiationData.negotiation.currentProposal.proposedRate || 0} per tree, 
                    {negotiationData.negotiation.currentProposal.proposedTreeCount || 0} trees
                  </span>
                )}
              </div>
            </div>

                         {/* Current Proposal Form */}
             {canSubmitProposal() && (
               <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                 <h3 className="font-semibold text-gray-900 mb-4">
                   {(!negotiationData || negotiationData.status === 'submitted') ? 'Submit Initial Proposal' : 'Submit Counter Proposal'}
                 </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposed Rate (₹ per tree)
                    </label>
                    <input
                      type="number"
                      value={proposedRate}
                      onChange={(e) => setProposedRate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter rate per tree"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposed Tree Count
                    </label>
                    <input
                      type="number"
                      value={proposedTreeCount}
                      onChange={(e) => setProposedTreeCount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter tree count"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any notes or explanations for your proposal..."
                  />
                </div>
                <button
                  onClick={handleSubmitProposal}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? 'Submitting...' : 'Submit Proposal'}</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            {negotiationData?.status === 'negotiating' && (
              <div className="flex space-x-4">
                {canAcceptProposal() && (
                  <button
                    onClick={handleAcceptProposal}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    <span>Accept Proposal</span>
                  </button>
                )}
                {canRejectProposal() && (
                  <button
                    onClick={handleRejectProposal}
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
                <div className="mt-2 text-sm text-green-700">
                  <span className="font-medium">Agreed on:</span> {negotiationData.negotiation.finalAgreement.agreedAt ? new Date(negotiationData.negotiation.finalAgreement.agreedAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default NegotiationModal;
