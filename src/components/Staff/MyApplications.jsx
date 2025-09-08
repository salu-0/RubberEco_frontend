import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  MapPin,
  DollarSign,
  TreePine,
  Calendar
} from 'lucide-react';
import EnhancedStaffNegotiationModal from './EnhancedStaffNegotiationModal';

const statusClasses = (status) => {
  switch (status) {
    case 'agreed':
    case 'accepted':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'negotiating':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'submitted':
    case 'under_review':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const MyApplications = ({ darkMode = false }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/service-applications/my-applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        setApplications(result.data || []);
      }
    } catch (e) {
      console.error('Failed to load applications', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const openNegotiation = useCallback((app) => {
    setSelectedApplication(app);
    setShowNegotiationModal(true);
  }, []);

  const onNegotiationUpdate = useCallback(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <div className={darkMode ? 'text-white' : 'text-gray-900'}>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold">No Applications Yet</h4>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Apply to a request to see it here with live status.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const req = typeof app.tappingRequestId === 'object' ? app.tappingRequestId : null;
            const current = app.negotiation?.currentProposal;
            return (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-mono">{app.applicationId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusClasses(app.status)}`}>
                        {app.status.toUpperCase()}
                      </span>
                      {current && !['accepted', 'agreed', 'selected', 'completed'].includes(app.status) && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {current.proposedBy === 'farmer' ? 'Farmer responded' : 'Your proposal pending'}
                        </span>
                      )}
                      {current && ['accepted', 'agreed', 'selected'].includes(app.status) && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Agreement reached
                        </span>
                      )}
                    </div>

                    {req && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{req.farmLocation}</div>
                        <div className="flex items-center"><TreePine className="h-4 w-4 mr-2" />{req.farmerEstimatedTrees || req.numberOfTrees || 'N/A'} trees</div>
                        <div className="flex items-center"><DollarSign className="h-4 w-4 mr-2" />₹{req.budgetPerTree || '—'} per tree</div>
                        <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" />Start: {req.startDate ? new Date(req.startDate).toLocaleDateString() : '—'}</div>
                      </div>
                    )}

                    {current && (
                      <div className={`mt-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center space-x-2">
                          {['accepted', 'agreed', 'selected'].includes(app.status) ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : current.proposedBy === 'farmer' ? (
                            <MessageSquare className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                          <span>
                            {['accepted', 'agreed', 'selected'].includes(app.status) 
                              ? 'Final agreement' 
                              : current.proposedBy === 'farmer' 
                                ? 'Farmer proposed' 
                                : 'Your current proposal'
                            }: ₹{current.proposedRate || 0} for {current.proposedTreeCount || 0} trees
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    {(app.status === 'agreed' || app.status === 'accepted') && (
                      <div className="px-3 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Agreement Reached</span>
                      </div>
                    )}
                    {app.status === 'rejected' && (
                      <div className="px-3 py-2 bg-red-600 text-white rounded-lg flex items-center space-x-1">
                        <XCircle className="h-4 w-4" />
                        <span>Rejected</span>
                      </div>
                    )}
                    {app.status === 'negotiating' && (
                      <button
                        onClick={() => openNegotiation(app)}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Open Negotiation</span>
                      </button>
                    )}
                    {(app.status === 'submitted' || app.status === 'under_review') && (
                      <div className={`px-3 py-2 rounded-lg flex items-center space-x-1 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                        <AlertCircle className="h-4 w-4" />
                        <span>Awaiting review</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <EnhancedStaffNegotiationModal
        isOpen={showNegotiationModal}
        onClose={() => setShowNegotiationModal(false)}
        application={selectedApplication}
        userRole="staff"
        onUpdate={onNegotiationUpdate}
      />
    </div>
  );
};

export default MyApplications;


