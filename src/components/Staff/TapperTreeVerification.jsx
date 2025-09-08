import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TreePine,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit3,
  Save,
  X
} from 'lucide-react';

const TapperTreeVerification = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [verificationForm, setVerificationForm] = useState({
    proposedTreeCount: '',
    notes: '',
    action: 'propose' // 'propose', 'counter', 'accept'
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Load assigned tapping requests
  useEffect(() => {
    if (isOpen) {
      loadTappingRequests();
    }
  }, [isOpen]);

  const loadTappingRequests = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${backendUrl}/api/farmer-requests/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Filter for requests assigned to this tapper or pending assignment
        const tapperRequests = result.data.filter(req => 
          req.status === 'assigned' || 
          req.status === 'tapper_inspecting' || 
          req.status === 'tree_count_pending'
        );
        setRequests(tapperRequests);
      } else {
        showNotification('Failed to load tapping requests', 'error');
      }
    } catch (error) {
      showNotification('Error loading requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTreeCountAction = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      let endpoint, body;

      if (verificationForm.action === 'propose') {
        endpoint = `${backendUrl}/api/farmer-requests/${selectedRequest._id}/tapper-propose`;
        body = {
          proposedTreeCount: parseInt(verificationForm.proposedTreeCount),
          notes: verificationForm.notes
        };
      } else if (verificationForm.action === 'counter') {
        endpoint = `${backendUrl}/api/farmer-requests/${selectedRequest._id}/tapper-counter`;
        body = {
          proposedTreeCount: parseInt(verificationForm.proposedTreeCount),
          notes: verificationForm.notes
        };
      } else if (verificationForm.action === 'accept') {
        endpoint = `${backendUrl}/api/farmer-requests/${selectedRequest._id}/accept-proposal`;
        body = {
          notes: verificationForm.notes
        };
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const result = await response.json();
        showNotification(result.message, 'success');
        setSelectedRequest(null);
        setVerificationForm({ proposedTreeCount: '', notes: '', action: 'propose' });
        loadTappingRequests(); // Reload requests
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to process tree count', 'error');
      }
    } catch (error) {
      showNotification('Error processing tree count', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      assigned: { color: 'bg-blue-100 text-blue-800', text: 'Assigned', icon: CheckCircle },
      tapper_inspecting: { color: 'bg-orange-100 text-orange-800', text: 'Inspecting', icon: Eye },
      tree_count_pending: { color: 'bg-amber-100 text-amber-800', text: 'Pending Approval', icon: AlertCircle },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Accepted', icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig.assigned;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Notification */}
      {notification.show && (
        <motion.div
          className={`fixed top-4 right-4 z-60 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          {notification.message}
        </motion.div>
      )}

      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <TreePine className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tree Count Verification</h2>
              <p className="text-green-100">Verify and update tree counts for tapping requests</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-3 text-gray-600">Loading requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <TreePine className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Assigned</h3>
              <p className="text-gray-500">You don't have any tapping requests assigned for verification.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => (
                <div key={request._id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">Request #{request.requestId}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {request.farmLocation}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Submitted</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Farmer Info */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Farmer Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{request.farmerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{request.farmerPhone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{request.farmerEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tree Count Negotiation Info */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Tree Count Negotiation</h4>

                    {request.treeCountStatus === 'both_agreed' ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Agreed: {request.finalAgreedTrees} trees</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Farmer's Estimate</p>
                            <p className="text-sm font-medium text-blue-600">{request.farmerEstimatedTrees} trees</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Your Proposal</p>
                            <p className="text-sm font-medium text-orange-600">
                              {request.tapperCounterProposal
                                ? `${request.tapperCounterProposal} trees (counter)`
                                : request.tapperProposedTrees
                                  ? `${request.tapperProposedTrees} trees`
                                  : 'Not proposed'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Status</p>
                            <p className="text-sm font-medium text-amber-600">
                              {request.treeCountStatus === 'farmer_submitted' && 'Awaiting your proposal'}
                              {request.treeCountStatus === 'tapper_proposed' && 'Waiting for farmer response'}
                              {request.treeCountStatus === 'farmer_counter_proposed' && 'Farmer made counter-proposal'}
                              {request.treeCountStatus === 'tapper_counter_proposed' && 'Waiting for farmer response'}
                            </p>
                          </div>
                        </div>

                        {request.farmerCounterProposal && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-xs text-blue-600">
                              Farmer's counter-proposal: <strong>{request.farmerCounterProposal} trees</strong>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {request.treeCountStatus === 'farmer_submitted' && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setVerificationForm({
                            proposedTreeCount: request.farmerEstimatedTrees.toString(),
                            notes: '',
                            action: 'propose'
                          });
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Propose Tree Count</span>
                      </button>
                    )}

                    {request.treeCountStatus === 'farmer_counter_proposed' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setVerificationForm({
                              proposedTreeCount: '',
                              notes: '',
                              action: 'accept'
                            });
                          }}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Accept {request.farmerCounterProposal}</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setVerificationForm({
                              proposedTreeCount: request.farmerCounterProposal.toString(),
                              notes: '',
                              action: 'counter'
                            });
                          }}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Counter-Propose</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Tree Verification Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                {verificationForm.action === 'accept' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <TreePine className="h-6 w-6 text-green-500" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {verificationForm.action === 'propose' && 'Propose Tree Count'}
                  {verificationForm.action === 'counter' && 'Make Counter-Proposal'}
                  {verificationForm.action === 'accept' && 'Accept Farmer\'s Proposal'}
                </h3>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Farmer estimated: <strong>{selectedRequest.farmerEstimatedTrees} trees</strong>
                </p>
                {selectedRequest.farmerCounterProposal && (
                  <p className="text-sm text-blue-600 mb-2">
                    Farmer's counter-proposal: <strong>{selectedRequest.farmerCounterProposal} trees</strong>
                  </p>
                )}

                {verificationForm.action === 'accept' ? (
                  <p className="text-sm text-gray-600 mb-4">
                    You are about to accept the farmer's proposal of <strong>{selectedRequest.farmerCounterProposal} trees</strong>.
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mb-4">
                    {verificationForm.action === 'propose'
                      ? 'Enter the actual number of tappable trees you found during inspection.'
                      : 'Enter your counter-proposal for the number of tappable trees.'}
                  </p>
                )}
              </div>

              {verificationForm.action !== 'accept' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {verificationForm.action === 'propose' ? 'Proposed Tree Count *' : 'Counter-Proposal *'}
                  </label>
                  <input
                    type="number"
                    value={verificationForm.proposedTreeCount}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      proposedTreeCount: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter tree count"
                    min="1"
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={verificationForm.notes}
                  onChange={(e) => setVerificationForm(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  placeholder={
                    verificationForm.action === 'accept'
                      ? "Add any comments about accepting this proposal..."
                      : "Explain your reasoning for this tree count..."
                  }
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setVerificationForm({ proposedTreeCount: '', notes: '', action: 'propose' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTreeCountAction}
                  disabled={loading || (verificationForm.action !== 'accept' && !verificationForm.proposedTreeCount)}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 ${
                    verificationForm.action === 'accept'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {loading ? 'Processing...' : (
                      verificationForm.action === 'accept' ? 'Accept Proposal' :
                      verificationForm.action === 'propose' ? 'Send Proposal' :
                      'Send Counter-Proposal'
                    )}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TapperTreeVerification;
