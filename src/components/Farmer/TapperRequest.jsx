import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notificationService, getCurrentFarmer } from '../../services/notificationService';
import EnhancedNegotiationModal from './EnhancedNegotiationModal';
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  TreePine,
  DollarSign,
  FileText,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Briefcase,
  Star,
  Eye,
  MessageCircle,
  Plus,
  Edit3,
  Trash2,
  Search,
  Play,
  MoreVertical
} from 'lucide-react';
import { isRequired, numericValidator } from '../../utils/validation';
import { useTranslation } from 'react-i18next';

const TapperRequest = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('new-request');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [treeCountApproval, setTreeCountApproval] = useState({
    show: false,
    request: null,
    notes: '',
    action: '', // 'accept' or 'counter'
    counterProposal: ''
  });
  
  // New state for viewing applications
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  // Confirm modal for accepting an application
  const [confirmApprove, setConfirmApprove] = useState({ show: false, application: null });
  // Confirm modal for rejecting an application
  const [confirmReject, setConfirmReject] = useState({ show: false, application: null });

  // Enhanced negotiation modal state
  const [showEnhancedNegotiation, setShowEnhancedNegotiation] = useState(false);
  const [selectedApplicationForNegotiation, setSelectedApplicationForNegotiation] = useState(null);
  
  // Application filtering and sorting
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [applicationSortBy, setApplicationSortBy] = useState('submittedAt');

  // Helper function to get user-friendly tapping type names
  const getTappingTypeDisplay = (tappingType) => {
    const tappingTypeMap = {
      'daily': 'Daily Tapping',
      'alternate_day': 'Alternate Day Tapping',
      'weekly': 'Weekly Tapping',
      'slaughter': 'Slaughter Tapping',
      'custom': 'Custom Tapping'
    };
    return tappingTypeMap[tappingType] || tappingType;
  };

  // New Request Form State
  const [requestForm, setRequestForm] = useState({
    farmLocation: '',
    farmSize: '',
    numberOfTrees: '',
    requiredTappers: 1,
    tappingType: 'daily',
    startDate: '',
    urgency: 'normal',
    preferredTime: 'morning',
    budgetPerTree: '',
    specialRequirements: '',
    contactPreference: 'phone',
    documents: []
  });

  // Requests from database (no mock data)
  const [myRequests, setMyRequests] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Load existing requests when modal opens
  useEffect(() => {
    if (isOpen) {
      loadExistingRequests();
    }
  }, [isOpen]);

  // Load applications for a specific request
  const loadApplications = async (requestId) => {
    setLoadingApplications(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${backendUrl}/api/service-applications/farmer/request/${requestId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setApplications(result.data || []);
        console.log('✅ Loaded applications:', result.data);
        // Debug: Log negotiation data for each application
        result.data?.forEach((app, index) => {
          console.log(`📋 Application ${index + 1} negotiation data:`, {
            id: app._id,
            status: app.status,
            hasNegotiation: !!app.negotiation,
            negotiationKeys: app.negotiation ? Object.keys(app.negotiation) : [],
            currentProposal: app.negotiation?.currentProposal,
            history: app.negotiation?.history?.length || 0
          });
        });
      } else {
        console.error('Failed to load applications');
        setApplications([]);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  // Combined update function that refreshes both applications and main requests
  const handleNegotiationUpdate = async () => {
    // Refresh applications if we have a selected request
    if (selectedRequest) {
      await loadApplications(selectedRequest._id);
    }
    // Always refresh the main requests list to show updated statuses
    await loadExistingRequests();
  };

  // Handle view applications
  const handleViewApplications = (request) => {
    setSelectedRequest(request);
    loadApplications(request._id);
    setShowApplicationsModal(true);
  };

  // Quick view proposal directly from request card
  const handleQuickViewProposal = async (request) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendUrl}/api/service-applications/farmer/request/${request._id}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        showNotification('Failed to load proposals', 'error');
        return;
      }
      const data = await res.json();
      const apps = data.data || [];
      const proposalApp = apps.find(app => app?.negotiation?.currentProposal?.proposedBy === 'staff');
      if (!proposalApp) {
        showNotification('No staff proposal yet for this request', 'error');
        return;
      }
      setSelectedApplicationForNegotiation(proposalApp);
      setShowEnhancedNegotiation(true);
    } catch (e) {
      showNotification('Error opening proposal', 'error');
    }
  };

  // Handle enhanced negotiation
  const handleEnhancedNegotiate = (application) => {
    setSelectedApplicationForNegotiation(application);
    setShowEnhancedNegotiation(true);
  };

  // Farmer approves/accepts an application (fills one tapper slot)
  const handleApproveApplication = async (application) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      // Prevent approving when all slots are filled
      const accepted = selectedRequest?.acceptedTappers || 0;
      const required = selectedRequest?.requiredTappers || 1;
      if (accepted >= required) {
        showNotification('All required tapper slots are already filled for this request.', 'error');
        return;
      }

      const idParam = application.applicationId || application._id;
      const res = await fetch(`${backendUrl}/api/new-service-applications/applications/${idParam}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to approve application');
      }

      const result = await res.json();
      showNotification(result.message || 'Application approved', 'success');

      // Refresh applications and requests so counts update
      await handleNegotiationUpdate();

      // Try to refresh selectedRequest with updated data from myRequests
      setSelectedRequest((prev) => {
        const updatedFromList = myRequests.find(r => r._id === prev?._id);
        const merged = updatedFromList || prev || {};
        const counts = result?.data || {};
        return {
          ...merged,
          acceptedTappers: typeof counts.acceptedTappers !== 'undefined' ? counts.acceptedTappers : merged.acceptedTappers,
          requiredTappers: typeof counts.requiredTappers !== 'undefined' ? counts.requiredTappers : merged.requiredTappers,
        };
      });

      // Close confirm modal if open
      setConfirmApprove({ show: false, application: null });
    } catch (e) {
      console.error('Approve application error:', e);
      showNotification(e.message || 'Error approving application', 'error');
    }
  };

  // Farmer rejects an application
  const handleRejectApplication = async (application) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const idParam = application.applicationId || application._id;

      const res = await fetch(`${backendUrl}/api/new-service-applications/applications/${idParam}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to reject application');
      }

      const result = await res.json();
      showNotification(result.message || 'Application rejected', 'success');

      // Refresh lists
      await handleNegotiationUpdate();
      setConfirmReject({ show: false, application: null });
    } catch (e) {
      console.error('Reject application error:', e);
      showNotification(e.message || 'Error rejecting application', 'error');
    }
  };

  const loadExistingRequests = async () => {
    try {
      const farmerData = getCurrentFarmer();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/farmer-requests/farmer/${farmerData.id || '507f1f77bcf86cd799439011'}`);

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const formattedRequests = result.data.map(req => ({
            id: req.requestId,
            ...req,
            createdAt: req.submittedAt.split('T')[0],
            status: req.status === 'submitted' ? 'pending' : req.status
          }));
          setMyRequests(formattedRequests);
          console.log('✅ Loaded existing requests:', formattedRequests.length);
        } else {
          setMyRequests([]);
          console.log('ℹ️ No existing requests found');
        }
      } else {
        console.log('⚠️ Failed to load existing requests');
        setMyRequests([]);
      }
    } catch (error) {
      console.log('⚠️ Error loading requests:', error.message);
      setMyRequests([]);
    }
  };

  // Handle view request details
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
  };

  // Handle edit request
  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setRequestForm({
      farmLocation: request.farmLocation || '',
      farmSize: request.farmSize || '',
      numberOfTrees: request.numberOfTrees || '',
      tappingType: request.tappingType || 'daily',
      startDate: request.startDate || '',
      urgency: request.urgency || 'normal',
      preferredTime: request.preferredTime || 'morning',
      budgetPerTree: request.budgetPerTree || '',
      specialRequirements: request.specialRequirements || '',
      contactPreference: request.contactPreference || 'phone',
      documents: request.documents || []
    });
    setActiveTab('new-request');
  };

  // Handle delete request
  const handleDeleteRequest = async (requestId) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/farmer-requests/${requestId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove from local state
        setMyRequests(prev => prev.filter(req => req._id !== requestId && req.id !== requestId));
        showNotification('Request deleted successfully!', 'success');
        console.log('✅ Request deleted successfully');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete request');
      }
    } catch (error) {
      console.error('❌ Error deleting request:', error);
      showNotification('Failed to delete request. Please try again.', 'error');
    }
    setDeleteConfirm(null);
  };

  const validateField = (key, value) => {
    switch (key) {
      case 'farmSize': {
        const err = numericValidator(value, { min: 0.1, max: 500 });
        if (err) return err === 'This field is required' ? 'Farm size is required' : `Farm size: ${err}`;
        return '';
      }
      case 'numberOfTrees': {
        // must be integer and within range
        if (value === '' || value === null || value === undefined) return 'Number of trees is required';
        if (!/^\d+$/.test(String(value))) return 'Number of trees must be a whole number';
        const err = numericValidator(value, { min: 1, max: 1000 });
        return err ? (err === 'This field is required' ? 'Number of trees is required' : `Number of trees: ${err}`) : '';
      }
      case 'requiredTappers': {
        if (value === '' || value === null || value === undefined) return 'Required tappers is required';
        if (!/^\d+$/.test(String(value))) return 'Required tappers must be a whole number';
        const err = numericValidator(value, { min: 1, max: 20 });
        return err ? (err === 'This field is required' ? 'Required tappers is required' : `Required tappers: ${err}`) : '';
      }
      case 'budgetPerTree': {
        const err = numericValidator(value, { min: 1, max: 100 });
        return err ? (err === 'This field is required' ? 'Rate per tree is required' : `Rate per tree: ${err}`) : '';
      }
      default:
        return '';
    }
  };

  const validateRequestForm = () => {
    const errors = [];
    const requiredFields = [
      { key: 'farmLocation', label: 'Farm location' },
      { key: 'farmSize', label: 'Farm size' },
      { key: 'numberOfTrees', label: 'Number of trees' },
      { key: 'requiredTappers', label: 'Required tappers' },
      { key: 'tappingType', label: 'Tapping type' },
      { key: 'startDate', label: 'Start date' },
      { key: 'budgetPerTree', label: 'Rate per tree' }
    ];

    requiredFields.forEach(({ key, label }) => {
      const err = isRequired(requestForm[key], `${label} is required`);
      if (err) errors.push(err);
    });

    const treesErr = validateField('numberOfTrees', requestForm.numberOfTrees);
    if (treesErr) errors.push(treesErr);

    const farmSizeErr = validateField('farmSize', requestForm.farmSize);
    if (farmSizeErr) errors.push(farmSizeErr);

    const rateErr = validateField('budgetPerTree', requestForm.budgetPerTree);
    if (rateErr) errors.push(rateErr);

    if (!requestForm.startDate) {
      errors.push('Start date is required');
    }

    if (errors.length > 0) {
      showNotification(errors[0], 'error');
      return false;
    }

    return true;
  };

  // Handle update request (when editing)
  const handleUpdateRequest = async (e) => {
    e.preventDefault();

    if (!validateRequestForm()) return;

    setLoading(true);

    try {
      const farmerData = getCurrentFarmer();

      const requestData = {
        farmerId: farmerData.id || '507f1f77bcf86cd799439011',
        farmerName: farmerData.name,
        farmerEmail: farmerData.email,
        farmerPhone: farmerData.phone,
        farmLocation: requestForm.farmLocation,
        farmSize: requestForm.farmSize,
        numberOfTrees: parseInt(requestForm.numberOfTrees),
        tappingType: requestForm.tappingType,
        startDate: requestForm.startDate,
        preferredTime: requestForm.preferredTime,
        urgency: requestForm.urgency,
        budgetPerTree: requestForm.budgetPerTree,
        specialRequirements: requestForm.specialRequirements,
        contactPreference: requestForm.contactPreference
      };

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/farmer-requests/${editingRequest._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update request');
      }

      const result = await response.json();
      console.log('✅ Request updated:', result.data);

      // Update local state
      setMyRequests(prev => prev.map(req =>
        req._id === editingRequest._id ? { ...req, ...requestForm } : req
      ));

      // Reset form and editing state
      setRequestForm({
        farmLocation: '',
        farmSize: '',
        numberOfTrees: '',
        tappingType: 'daily',
        startDate: '',
        urgency: 'normal',
        preferredTime: 'morning',
        budgetPerTree: '',
        specialRequirements: '',
        contactPreference: 'phone',
        documents: []
      });

      setEditingRequest(null);
      showNotification('Request updated successfully!', 'success');
      setActiveTab('my-requests');

    } catch (error) {
      console.error('❌ Error updating request:', error);
      showNotification(error.message || 'Failed to update request. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setRequestForm(prev => ({
      ...prev,
      [field]: value
    }));

    // real-time validation
    const err = validateField(field, value);
    if (err) {
      setFormErrors(prev => ({ ...prev, [field]: err }));
    } else {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmitRequest = async (e) => {
    // If we're editing, use the update function instead
    if (editingRequest) {
      return handleUpdateRequest(e);
    }

    e.preventDefault();

    if (!validateRequestForm()) return;

    setLoading(true);

    try {
      // Get farmer data
      const farmerData = getCurrentFarmer();

      // Prepare request data for API
      const requestData = {
        farmerId: farmerData.id || '507f1f77bcf86cd799439011', // Mock farmer ID
        farmerName: farmerData.name,
        farmerEmail: farmerData.email,
        farmerPhone: farmerData.phone,
        farmLocation: requestForm.farmLocation,
        farmSize: requestForm.farmSize,
        numberOfTrees: parseInt(requestForm.numberOfTrees),
        requiredTappers: parseInt(requestForm.requiredTappers),
        tappingType: requestForm.tappingType,
        startDate: requestForm.startDate,
        preferredTime: requestForm.preferredTime,
        urgency: requestForm.urgency,
        budgetPerTree: requestForm.budgetPerTree,
        specialRequirements: requestForm.specialRequirements,
        contactPreference: requestForm.contactPreference,
        documents: (requestForm.documents || []).map(doc => ({
          name: doc.name,
          type: doc.type,
          size: doc.size
        }))
      };

      // Submit to backend API
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/farmer-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit request');
      }

      const result = await response.json();
      console.log('✅ Tapping request submitted:', result.data);

      // Add to local state for immediate UI update
      const newRequest = {
        id: result.data.requestId,
        ...requestForm,
        status: 'submitted',
        applicants: 0,
        createdAt: new Date().toISOString().split('T')[0],
        assignedTapper: null,
        _id: result.data._id,
        // Ensure immediate display for "Your estimate"
        farmerEstimatedTrees: requestForm.numberOfTrees,
        numberOfTrees: requestForm.numberOfTrees
      };

      setMyRequests(prev => [newRequest, ...prev]);

      // Send notification to admin (this will also be handled by backend)
      notificationService.addTapperRequestNotification(newRequest, farmerData);

      // Reset form
      setRequestForm({
        farmLocation: '',
        farmSize: '',
        numberOfTrees: '',
        requiredTappers: 1,
        tappingType: 'daily',
        startDate: '',
        urgency: 'normal',
        preferredTime: 'morning',
        budgetPerTree: '',
        specialRequirements: '',
        contactPreference: 'phone',
        documents: []
      });
      
      showNotification('Tapper request submitted successfully!', 'success');
      setActiveTab('my-requests');
    } catch (error) {
      console.error('Error submitting request:', error);
      showNotification('Error submitting request. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      // Backend statuses
      submitted: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Submitted' },
      under_review: { color: 'bg-blue-100 text-blue-800', icon: Eye, text: 'Under Review' },
      negotiating: { color: 'bg-orange-100 text-orange-800', icon: MessageCircle, text: 'Negotiating' },
      assigned: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Assigned' },
      tapper_inspecting: { color: 'bg-purple-100 text-purple-800', icon: Search, text: 'Inspecting' },
      tree_count_pending: { color: 'bg-orange-100 text-orange-800', icon: TreePine, text: 'Tree Count Pending' },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Accepted' },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: Play, text: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X, text: 'Cancelled' },
      rejected: { color: 'bg-red-100 text-red-800', icon: X, text: 'Rejected' },
      // Frontend statuses (for backward compatibility)
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' }
    };
    
    const config = statusConfig[status] || statusConfig.submitted;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      low: { color: 'bg-gray-100 text-gray-800', text: 'Low' },
      normal: { color: 'bg-blue-100 text-blue-800', text: 'Normal' },
      high: { color: 'bg-red-100 text-red-800', text: 'High' }
    };
    
    const config = urgencyConfig[urgency] || urgencyConfig.normal;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Handle tree count negotiation
  const handleTreeCountNegotiation = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      let endpoint, body;

      if (treeCountApproval.action === 'accept') {
        // Accept the tapper's proposal
        endpoint = `${backendUrl}/api/farmer-requests/${treeCountApproval.request._id}/accept-proposal`;
        body = { notes: treeCountApproval.notes };
      } else if (treeCountApproval.action === 'counter') {
        // Make a counter-proposal
        endpoint = `${backendUrl}/api/farmer-requests/${treeCountApproval.request._id}/farmer-counter`;
        body = {
          proposedTreeCount: parseInt(treeCountApproval.counterProposal),
          notes: treeCountApproval.notes
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
        setTreeCountApproval({ show: false, request: null, notes: '', action: '', counterProposal: '' });
        loadExistingRequests(); // Reload requests
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to process request', 'error');
      }
    } catch (error) {
      showNotification('Error processing request', 'error');
    } finally {
      setLoading(false);
    }
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('tapperRequest.title', 'Tapper Services')}</h2>
              <p className="text-green-100">{t('tapperRequest.subtitle', 'Request and manage rubber tapping services')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'new-request'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('new-request');
                if (editingRequest) {
                  setEditingRequest(null);
                  setRequestForm({
                    farmLocation: '',
                    farmSize: '',
                    numberOfTrees: '',
                    tappingType: 'daily',
                    startDate: '',
                    urgency: 'normal',
                    preferredTime: 'morning',
                    budgetPerTree: '',
                    specialRequirements: '',
                    contactPreference: 'phone',
                    documents: []
                  });
                }
              }}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              {editingRequest ? 'Edit Request' : 'New Request'}
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'my-requests'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('my-requests')}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              My Requests ({myRequests.length})
            </button>
          </div>
        </div>

  {/* Content */}
  <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {activeTab === 'new-request' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                {/* Farm Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TreePine className="h-5 w-5 mr-2 text-green-500" />
                    {t('tapperRequest.farmDetails', 'Farm Details')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('tapperRequest.farmLocation', 'Farm Location')} *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={requestForm.farmLocation}
                          onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder={t('tapperRequest.farmLocationPlaceholder', 'Enter your farm location (e.g., Village, District, State)')}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 {t('tapperRequest.farmLocationHint', 'Be as specific as possible (e.g., "123 Farm Road, Village Name, District, State")')}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('tapperRequest.farmSize', 'Farm Size')} *
                      </label>
                      <input
                        type="number"
                        required
                        value={requestForm.farmSize}
                        onChange={(e) => handleInputChange('farmSize', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={t('tapperRequest.farmSizePlaceholder', 'e.g., 5')}
                        min="0.1"
                        max="500"
                        step="0.1"
                      />
                      {formErrors.farmSize && (
                        <p className="text-xs text-red-600 mt-1">{formErrors.farmSize}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('tapperRequest.numberOfTrees', 'Number of Trees')} *
                      </label>
                      <input
                        type="number"
                        required
                        value={requestForm.numberOfTrees}
                        onChange={(e) => handleInputChange('numberOfTrees', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={t('tapperRequest.numberOfTreesPlaceholder', 'Enter number of trees')}
                        min="1"
                        max="1000"
                      />
                      {formErrors.numberOfTrees && (
                        <p className="text-xs text-red-600 mt-1">{formErrors.numberOfTrees}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('tapperRequest.requiredTappers', 'Required Tappers')} *
                      </label>
                      <input
                        type="number"
                        required
                        value={requestForm.requiredTappers}
                        onChange={(e) => handleInputChange('requiredTappers', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={t('tapperRequest.requiredTappersPlaceholder', 'How many tappers do you need?')}
                        min="1"
                        max="20"
                      />
                      {formErrors.requiredTappers && (
                        <p className="text-xs text-red-600 mt-1">{formErrors.requiredTappers}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        💡 {t('tapperRequest.requiredTappersHint', 'Specify how many tappers you need for your plantation size')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('tapperRequest.tappingType', 'Tapping Type')} *
                      </label>
                      <select
                        required
                        value={requestForm.tappingType}
                        onChange={(e) => handleInputChange('tappingType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="daily">{t('tapperRequest.tappingTypeDaily', 'Daily Tapping')}</option>
                        <option value="alternate_day">{t('tapperRequest.tappingTypeAlternateDay', 'Alternate Day Tapping')}</option>
                        <option value="weekly">{t('tapperRequest.tappingTypeWeekly', 'Weekly Tapping')}</option>
                        <option value="slaughter">{t('tapperRequest.tappingTypeSlaughter', 'Slaughter Tapping')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Schedule Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-green-500" />
                    {t('tapperRequest.scheduleDetails', 'Schedule Details')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('tapperRequest.startDate', 'Start Date')} *
                      </label>
                      <input
                        type="date"
                        required
                        value={requestForm.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('tapperRequest.preferredTime', 'Preferred Time')}
                      </label>
                      <select
                        value={requestForm.preferredTime}
                        onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="early_morning">{t('tapperRequest.preferredTimeEarlyMorning', 'Early Morning (4 AM - 6 AM)')}</option>
                        <option value="morning">{t('tapperRequest.preferredTimeMorning', 'Morning (6 AM - 10 AM)')}</option>
                        <option value="afternoon">{t('tapperRequest.preferredTimeAfternoon', 'Afternoon (2 PM - 6 PM)')}</option>
                        <option value="evening">{t('tapperRequest.preferredTimeEvening', 'Evening (6 PM - 8 PM)')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-500" />
                    {t('tapperRequest.additionalDetails', 'Additional Details')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('tapperRequest.urgencyLevel', 'Urgency Level')}
                      </label>
                      <select
                        value={requestForm.urgency}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="low">{t('tapperRequest.urgencyLow', 'Low - Can wait')}</option>
                        <option value="normal">{t('tapperRequest.urgencyNormal', 'Normal - Standard timing')}</option>
                        <option value="high">{t('tapperRequest.urgencyHigh', 'High - Urgent')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('tapperRequest.ratePerTree', 'Rate Per Tree')} *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          required
                          value={requestForm.budgetPerTree}
                          onChange={(e) => handleInputChange('budgetPerTree', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder={t('tapperRequest.ratePerTreePlaceholder', 'e.g., 3')}
                          min="1"
                          max="100"
                          step="0.5"
                        />
                        {formErrors.budgetPerTree && (
                          <p className="text-xs text-red-600 mt-1">{formErrors.budgetPerTree}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{t('tapperRequest.ratePerTreeHint', 'Amount in ₹ per tree for cutting/tapping service')}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tapperRequest.specialRequirements', 'Special Requirements')}
                    </label>
                    <textarea
                      value={requestForm.specialRequirements}
                      onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={t('tapperRequest.specialRequirementsPlaceholder', 'Any special requirements or instructions...')}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || Object.keys(formErrors).length > 0}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>{editingRequest ? 'Update Request' : 'Submit Request'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'my-requests' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {myRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                  <p className="text-gray-600 mb-4">You haven't submitted any tapper requests.</p>
                  <button
                    onClick={() => setActiveTab('new-request')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Create First Request
                  </button>
                </div>
              ) : (
                myRequests.map((request) => (
                  <div key={request.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">Request #{request.id}</h3>
                          {getStatusBadge(request.status)}
                          {getUrgencyBadge(request.urgency)}
                          {((request.applicationsCount ?? request.applicationCount ?? 0) > 0) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {(request.applicationsCount ?? request.applicationCount)} application{(request.applicationsCount ?? request.applicationCount) !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {request.farmLocation}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="text-sm font-medium text-gray-900">{request.createdAt}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Farm Size</p>
                        <p className="text-sm font-medium text-gray-900">{request.farmSize}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tree Count Negotiation</p>
                        <div className="text-sm font-medium text-gray-900">
                          {(request.treeCountStatus === 'both_agreed' || ['assigned','accepted','in_progress','completed'].includes(request.status)) ? (
                            <div className="text-green-600 font-semibold flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Agreed: {(request.finalAgreedTrees || request.agreedTreeCount || request.tapperCounterProposal || request.tapperProposedTrees) || 'Confirmed'} trees
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="text-blue-600">Your estimate: {request.farmerEstimatedTrees || request.numberOfTrees}</span>
                              </div>
                              {request.tapperProposedTrees && (
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="text-orange-600">Tapper proposed: {request.tapperProposedTrees}</span>
                                </div>
                              )}
                              {request.farmerCounterProposal && (
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="text-blue-600">Your counter: {request.farmerCounterProposal}</span>
                                </div>
                              )}
                              {request.tapperCounterProposal && (
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="text-orange-600">Tapper counter: {request.tapperCounterProposal}</span>
                                </div>
                              )}
                              <div className="text-amber-600 text-xs flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Negotiating...
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rate Per Tree</p>
                        <p className="text-sm font-medium text-gray-900">₹{request.budgetPerTree || request.budgetRange}</p>
                      </div>
                    </div>

                    {request.assignedTapper && (
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Assigned Tapper</h4>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{request.assignedTapper.name}</p>
                            <p className="text-xs text-gray-500">{request.assignedTapper.experience} experience</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{request.assignedTapper.rating}</span>
                          </div>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                            <Phone className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tree Count Negotiation Section */}
                    {request.status === 'tree_count_pending' && request.treeCountStatus !== 'both_agreed' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-amber-800 mb-2">
                              Tree Count Negotiation
                            </h4>

                            {/* Show current negotiation status */}
                            {request.treeCountStatus === 'tapper_proposed' && (
                              <div className="mb-3">
                                <p className="text-sm text-amber-700 mb-2">
                                  The tapper found <strong>{request.tapperProposedTrees} trees</strong> suitable for tapping,
                                  different from your estimate of <strong>{request.farmerEstimatedTrees} trees</strong>.
                                </p>
                                {request.treeCountNotes?.tapperNotes && (
                                  <p className="text-sm text-amber-600 italic mb-2">
                                    Tapper's note: "{request.treeCountNotes.tapperNotes}"
                                  </p>
                                )}
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setTreeCountApproval({
                                      show: true,
                                      request: request,
                                      notes: '',
                                      action: 'accept'
                                    })}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                  >
                                    Accept {request.tapperProposedTrees} trees
                                  </button>
                                  <button
                                    onClick={() => setTreeCountApproval({
                                      show: true,
                                      request: request,
                                      notes: '',
                                      action: 'counter'
                                    })}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                  >
                                    Make Counter-Offer
                                  </button>
                                </div>
                              </div>
                            )}

                            {request.treeCountStatus === 'tapper_counter_proposed' && (
                              <div className="mb-3">
                                <p className="text-sm text-amber-700 mb-2">
                                  The tapper has counter-proposed <strong>{request.tapperCounterProposal} trees</strong>
                                  in response to your proposal of <strong>{request.farmerCounterProposal} trees</strong>.
                                </p>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setTreeCountApproval({
                                      show: true,
                                      request: request,
                                      notes: '',
                                      action: 'accept'
                                    })}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                  >
                                    Accept {request.tapperCounterProposal} trees
                                  </button>
                                  <button
                                    onClick={() => setTreeCountApproval({
                                      show: true,
                                      request: request,
                                      notes: '',
                                      action: 'counter'
                                    })}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                  >
                                    Make Another Counter-Offer
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Show negotiation history */}
                            {request.negotiationHistory && request.negotiationHistory.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-amber-200">
                                <p className="text-xs text-amber-600 mb-2">Negotiation History:</p>
                                <div className="space-y-1 max-h-20 overflow-y-auto">
                                  {request.negotiationHistory.slice(-3).map((entry, index) => (
                                    <div key={index} className="text-xs text-amber-700">
                                      <span className="font-medium capitalize">{entry.proposedBy}</span>: {entry.proposedCount} trees
                                      {entry.notes && <span className="italic"> - {entry.notes}</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {request.applicants} applicants
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Starts {request.startDate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditRequest(request)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Request"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {(request.status === 'pending' || request.status === 'submitted') && (
                          <button
                            onClick={() => setDeleteConfirm(request)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Request"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {((request.applicationsCount ?? request.applicationCount ?? 0) > 0) && (
                          <button
                            onClick={() => handleViewApplications(request)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View Applications"
                          >
                            <Users className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleQuickViewProposal(request)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="View Proposal (if available)"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </div>
  </motion.div>

      {/* Request Details Modal */}
      {showRequestDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Request Details</h2>
                  <p className="text-blue-100">ID: {selectedRequest.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestDetails(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-6">
                {/* Status and Basic Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Request Status</h3>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Submitted Date</p>
                      <p className="font-medium">{selectedRequest.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Urgency</p>
                      <p className="font-medium">{selectedRequest.urgency}</p>
                    </div>
                  </div>
                </div>

                {/* Farm Details */}
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium">{selectedRequest.farmLocation}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Farm Size</p>
                      <p className="font-medium">{selectedRequest.farmSize}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Number of Trees</p>
                      <p className="font-medium">{selectedRequest.farmerEstimatedTrees || selectedRequest.numberOfTrees || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Required Tappers</p>
                      <p className="font-medium">
                        {selectedRequest.acceptedTappers || 0} / {selectedRequest.requiredTappers || 1}
                        <span className="ml-2 text-xs text-gray-500">tappers accepted</span>
                        {typeof selectedRequest.applicationsCount !== 'undefined' && (
                          <span className="ml-2 text-xs text-gray-500">(applied: {selectedRequest.applicationsCount})</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Soil Type</p>
                      <p className="font-medium">{selectedRequest.soilType || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tapping Type</p>
                      <p className="font-medium">{getTappingTypeDisplay(selectedRequest.tappingType)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-medium">{selectedRequest.startDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Preferred Time</p>
                      <p className="font-medium">{selectedRequest.preferredTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rate Per Tree</p>
                      <p className="font-medium">₹{selectedRequest.budgetPerTree || selectedRequest.budgetRange || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Contact Preference</p>
                      <p className="font-medium">{selectedRequest.contactPreference}</p>
                    </div>
                  </div>
                  {selectedRequest.specialRequirements && (
                    <div className="mt-4">
                      <p className="text-gray-500">Special Requirements</p>
                      <p className="font-medium">{selectedRequest.specialRequirements}</p>
                    </div>
                  )}
                </div>

                {/* Assigned Tapper (if any) */}
                {selectedRequest.assignedTapper && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Tapper</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedRequest.assignedTapper.name}</p>
                        <p className="text-sm text-gray-600">{selectedRequest.assignedTapper.phone}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{selectedRequest.assignedTapper.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowRequestDetails(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {(selectedRequest.applicationsCount || selectedRequest.applicationCount) > 0 && (
                <button
                  onClick={() => {
                    setShowRequestDetails(false);
                    handleViewApplications(selectedRequest);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Applications ({selectedRequest.applicationsCount ?? selectedRequest.applicationCount})
                </button>
              )}
              {(selectedRequest.status === 'pending' || selectedRequest.status === 'submitted') && (
                <button
                  onClick={() => {
                    setShowRequestDetails(false);
                    handleEditRequest(selectedRequest);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit Request
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Trash2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Delete Request</h2>
                  <p className="text-red-100">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this tapping request?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">Request ID: <span className="font-medium">{deleteConfirm.id}</span></p>
                <p className="text-sm text-gray-600">Location: <span className="font-medium">{deleteConfirm.farmLocation}</span></p>
                <p className="text-sm text-gray-600">Trees: <span className="font-medium">{deleteConfirm.farmerEstimatedTrees || deleteConfirm.numberOfTrees || 'N/A'}</span></p>
              </div>
              <p className="text-sm text-red-600">
                <strong>Warning:</strong> This will permanently remove the request from the database.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRequest(deleteConfirm._id || deleteConfirm.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Request
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tree Count Negotiation Modal */}
      {treeCountApproval.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                {treeCountApproval.action === 'accept' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Edit3 className="h-6 w-6 text-blue-500" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {treeCountApproval.action === 'accept' ? 'Accept Proposal' : 'Make Counter-Proposal'}
                </h3>
              </div>

              <div className="mb-4">
                {treeCountApproval.action === 'accept' ? (
                  <p className="text-sm text-gray-600 mb-2">
                    You are about to accept the tapper's proposal of{' '}
                    <strong>
                      {treeCountApproval.request?.tapperCounterProposal || treeCountApproval.request?.tapperProposedTrees} trees
                    </strong>.
                  </p>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Current tapper proposal:{' '}
                      <strong>
                        {treeCountApproval.request?.tapperCounterProposal || treeCountApproval.request?.tapperProposedTrees} trees
                      </strong>
                    </p>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Counter-Proposal *
                      </label>
                      <input
                        type="number"
                        value={treeCountApproval.counterProposal}
                        onChange={(e) => setTreeCountApproval(prev => ({
                          ...prev,
                          counterProposal: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your proposed tree count"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                )}

                {treeCountApproval.request?.treeCountNotes?.tapperNotes && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-xs text-gray-500 mb-1">Tapper's Note:</p>
                    <p className="text-sm text-gray-700 italic">
                      "{treeCountApproval.request.treeCountNotes.tapperNotes}"
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Notes (Optional)
                </label>
                <textarea
                  value={treeCountApproval.notes}
                  onChange={(e) => setTreeCountApproval(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  placeholder={treeCountApproval.action === 'accept'
                    ? "Add any comments about accepting this proposal..."
                    : "Explain your counter-proposal..."}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setTreeCountApproval({
                    show: false,
                    request: null,
                    notes: '',
                    action: '',
                    counterProposal: ''
                  })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTreeCountNegotiation}
                  disabled={loading || (treeCountApproval.action === 'counter' && !treeCountApproval.counterProposal)}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                    treeCountApproval.action === 'accept'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Processing...' : (
                    treeCountApproval.action === 'accept' ? 'Accept Proposal' : 'Send Counter-Proposal'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Staff Applications</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedRequest.requestId} - {selectedRequest.farmerName}
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>{applications.length} staff members have applied for this request</p>
                    <p className="mt-1">
                      Slots: {(selectedRequest.acceptedTappers || 0)} / {(selectedRequest.requiredTappers || 1)}
                      <span className="ml-2">Remaining: {Math.max((selectedRequest.requiredTappers || 1) - (selectedRequest.acceptedTappers || 0), 0)}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApplicationsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Summary Statistics */}
              {!loadingApplications && applications.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-3">Application Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
                      <div className="text-blue-700">Total Applications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {applications.filter(app => app.status === 'submitted').length}
                      </div>
                      <div className="text-green-700">New Applications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {applications.filter(app => app.status === 'negotiating').length}
                      </div>
                      <div className="text-orange-700">In Negotiation</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {applications.filter(app => app.status === 'agreed' || app.status === 'accepted').length}
                      </div>
                      <div className="text-purple-700">Agreements Reached</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter and Sort Controls */}
              {!loadingApplications && applications.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status:</label>
                        <select
                          value={applicationFilter}
                          onChange={(e) => setApplicationFilter(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Applications</option>
                          <option value="submitted">New Applications</option>
                          <option value="negotiating">In Negotiation</option>
                          <option value="agreed">Agreements Reached</option>
                          <option value="accepted">Accepted</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
                        <select
                          value={applicationSortBy}
                          onChange={(e) => setApplicationSortBy(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="submittedAt">Application Date</option>
                          <option value="staffName">Staff Name</option>
                          <option value="proposedRate">Proposed Rate</option>
                          <option value="status">Status</option>
                        </select>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Showing {applications.filter(app => applicationFilter === 'all' || app.status === applicationFilter).length} of {applications.length} applications
                    </div>
                  </div>
                </div>
              )}

              {loadingApplications ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600">Staff members will appear here once they apply for your request.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {applications
                    .filter(app => applicationFilter === 'all' || app.status === applicationFilter)
                    .sort((a, b) => {
                      switch (applicationSortBy) {
                        case 'staffName':
                          return (a.staffName || '').localeCompare(b.staffName || '');
                        case 'proposedRate':
                          const rateA = typeof a.proposedRate === 'object' ? a.proposedRate.amount || a.proposedRate.rate : a.proposedRate;
                          const rateB = typeof b.proposedRate === 'object' ? b.proposedRate.amount || b.proposedRate.rate : b.proposedRate;
                          return (rateA || 0) - (rateB || 0);
                        case 'status':
                          return (a.status || '').localeCompare(b.status || '');
                        case 'submittedAt':
                        default:
                          return new Date(b.submittedAt) - new Date(a.submittedAt);
                      }
                    })
                    .map((application, index) => (
                      <motion.div
                        key={application._id}
                        className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                              {(application.staffName || 'S')[0]}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-lg font-semibold text-gray-900">{application.staffName || 'Staff Applicant'}</h4>
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 capitalize">{application.status || 'submitted'}</span>
                              </div>
                              <div className="mt-1 text-sm text-gray-600">
                                {application.staffPhone && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-3 w-3" />
                                    <span>{application.staffPhone}</span>
                                  </div>
                                )}
                                {application.staffEmail && (
                                  <div className="flex items-center space-x-2">
                                    <Mail className="h-3 w-3" />
                                    <span>{application.staffEmail}</span>
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 text-sm text-gray-700">
                                {typeof application.proposedRate !== 'undefined' && (
                                  <div>
                                    <span className="font-medium">Proposed Rate: </span>
                                    <span>
                                      {typeof application.proposedRate === 'object'
                                        ? (application.proposedRate.amount || application.proposedRate.rate)
                                        : application.proposedRate}
                                    </span>
                                  </div>
                                )}
                                {application.notes && (
                                  <div className="mt-1 text-xs text-gray-600 italic">"{application.notes}"</div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {(() => {
                              const nonApprovable = new Set(['accepted', 'selected', 'rejected', 'withdrawn']);
                              const accepted = selectedRequest?.acceptedTappers || 0;
                              const required = selectedRequest?.requiredTappers || 1;
                              const slotsFilled = accepted >= required;
                              const canApprove = !nonApprovable.has(application.status) && !slotsFilled;
                              return (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => setConfirmApprove({ show: true, application })}
                                    disabled={!canApprove}
                                    className={`px-4 py-2 rounded-lg text-white text-sm ${canApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
                                    title={slotsFilled ? 'All required tappers already selected' : 'Accept this application'}
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => setConfirmReject({ show: true, application })}
                                    disabled={new Set(['accepted', 'selected', 'rejected', 'withdrawn']).has(application.status)}
                                    className={`px-4 py-2 rounded-lg text-sm border ${new Set(['accepted', 'selected', 'rejected', 'withdrawn']).has(application.status) ? 'text-gray-500 border-gray-300 cursor-not-allowed' : 'text-red-600 border-red-300 hover:bg-red-50'}`}
                                    title={'Reject this application'}
                                  >
                                    Reject
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
          </motion.div>
        </div>
      )}

      {/* Confirm Accept Modal */}
      {confirmApprove.show && confirmApprove.application && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-[101]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Acceptance</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Accept <span className="font-medium">{confirmApprove.application.staffName || 'this staff member'}</span>'s application?
                This will reserve one of your required tapper slots.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-4">
                Slots: {(selectedRequest?.acceptedTappers || 0)} / {(selectedRequest?.requiredTappers || 1)}
                <span className="ml-2">Remaining: {Math.max((selectedRequest?.requiredTappers || 1) - (selectedRequest?.acceptedTappers || 0), 0)}</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmApprove({ show: false, application: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproveApplication(confirmApprove.application)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Confirm Accept
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirm Reject Modal */}
      {confirmReject.show && confirmReject.application && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-[101]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <X className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Rejection</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Reject <span className="font-medium">{confirmReject.application.staffName || 'this staff member'}</span>'s application?
                They will no longer appear in your candidates for this request.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmReject({ show: false, application: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectApplication(confirmReject.application)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Enhanced Negotiation Modal */}
      <EnhancedNegotiationModal
        isOpen={showEnhancedNegotiation}
        onClose={() => setShowEnhancedNegotiation(false)}
        application={selectedApplicationForNegotiation}
        onUpdate={handleNegotiationUpdate}
      />
    </div>
  );
};

export default TapperRequest;
