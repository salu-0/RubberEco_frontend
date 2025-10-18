import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  FileText,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Download,
  Eye,
  MessageCircle,
  RefreshCw,
  Filter,
  Search,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const ApplicationStatus = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, typeFilter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token || !user.id) {
        console.log('❌ No authentication found');
        setApplications([]);
        setLoading(false);
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rubbereco-backend.onrender.com';
      const applications = [];

      // Load different types of applications
      try {
        // 1. Load tapping requests
        const tappingResponse = await fetch(`${backendUrl}/api/farmer-requests/my-requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (tappingResponse.ok) {
          const tappingData = await tappingResponse.json();
          const tappingApps = (tappingData.data || []).map(req => ({
            id: req._id,
            type: 'tapper_request',
            title: 'Rubber Tapper Request',
            description: `Request for ${req.serviceType || 'tapping'} service`,
            status: req.status,
            submittedDate: req.createdAt,
            lastUpdated: req.updatedAt,
            currentStage: getStageFromStatus(req.status),
            progress: getProgressFromStatus(req.status),
            priority: req.priority || 'normal',
            comments: req.comments || 'Application is being processed.'
          }));
          applications.push(...tappingApps);
        }
      } catch (error) {
        console.warn('Failed to load tapping requests:', error.message);
      }

      try {
        // 2. Load land registrations
        const landResponse = await fetch(`${backendUrl}/api/land-registration/my-lands`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (landResponse.ok) {
          const landData = await landResponse.json();
          const landApps = (landData.data || []).map(land => ({
            id: land._id,
            type: 'land_registration',
            title: 'Land Registration',
            description: `Registration for ${land.area} ${land.areaUnit} in ${land.location}`,
            status: land.verificationStatus,
            submittedDate: land.createdAt,
            lastUpdated: land.updatedAt,
            currentStage: getStageFromStatus(land.verificationStatus),
            progress: getProgressFromStatus(land.verificationStatus),
            priority: 'normal',
            comments: land.verificationNotes || 'Land registration is being processed.'
          }));
          applications.push(...landApps);
        }
      } catch (error) {
        console.warn('Failed to load land registrations:', error.message);
      }

      try {
        // 3. Load tenancy offerings
        const tenancyResponse = await fetch(`${backendUrl}/api/tenancy-offerings/my-offerings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (tenancyResponse.ok) {
          const tenancyData = await tenancyResponse.json();
          const tenancyApps = (tenancyData.data || []).map(offering => ({
            id: offering._id,
            type: 'tenancy_offering',
            title: 'Land Lease Offering',
            description: `Offering ${offering.area} ${offering.areaUnit} for lease`,
            status: offering.status,
            submittedDate: offering.createdAt,
            lastUpdated: offering.updatedAt,
            currentStage: getStageFromStatus(offering.status),
            progress: getProgressFromStatus(offering.status),
            priority: offering.featured ? 'high' : 'normal',
            comments: 'Land lease offering is active.'
          }));
          applications.push(...tenancyApps);
        }
      } catch (error) {
        console.warn('Failed to load tenancy offerings:', error.message);
      }

      // 4. Load service requests (fertilizer & rain guard)
      try {
        const serviceResponse = await fetch(`${backendUrl}/api/service-requests/my-requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (serviceResponse.ok) {
          const serviceData = await serviceResponse.json();
          const serviceApps = (serviceData.data || []).map(req => ({
            id: req._id,
            type: req.serviceType === 'fertilizer' ? 'fertilizer_service' : 'rain_guard_service',
            title: req.serviceType === 'fertilizer' ? 'Fertilizer Application Service' : 'Rain Guard Installation Service',
            description: `${req.serviceType} service for ${req.farmSize} farm with ${req.numberOfTrees} trees`,
            status: req.status,
            submittedDate: req.createdAt,
            lastUpdated: req.updatedAt,
            currentStage: getStageFromStatus(req.status),
            progress: getProgressFromStatus(req.status),
            priority: req.urgency || 'normal',
            comments: req.specialRequirements || 'Service request is being processed.',
            assignedProvider: req.assignedProvider,
            estimatedCost: req.estimatedCost
          }));
          applications.push(...serviceApps);
        }
      } catch (error) {
        console.warn('Failed to load service requests:', error.message);
      }

      // 5. Load training enrollments
      try {
        const trainingResponse = await fetch(`${backendUrl}/api/training/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (trainingResponse.ok) {
          const trainingData = await trainingResponse.json();
          const trainingApps = (trainingData.data || []).map(enrollment => ({
            id: enrollment._id,
            type: 'training_registration',
            title: 'Training Registration',
            description: `Enrollment in ${enrollment.moduleTitle || enrollment.trainingTitle || 'training program'}`,
            status: enrollment.status,
            submittedDate: enrollment.createdAt,
            lastUpdated: enrollment.updatedAt,
            currentStage: getStageFromStatus(enrollment.status),
            progress: getProgressFromStatus(enrollment.status),
            priority: 'normal',
            comments: enrollment.notes || 'Training enrollment is being processed.',
            trainingDetails: {
              moduleTitle: enrollment.moduleTitle,
              startDate: enrollment.startDate,
              duration: enrollment.duration
            }
          }));
          applications.push(...trainingApps);
        }
      } catch (error) {
        console.warn('Failed to load training enrollments:', error.message);
      }

      setApplications(applications);
      console.log(`✅ Loaded ${applications.length} applications from APIs`);

    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for status mapping
  const getStageFromStatus = (status) => {
    const stageMap = {
      'submitted': 'Initial Review',
      'under_review': 'Document Verification',
      'approved': 'Completed',
      'rejected': 'Rejected',
      'pending_documents': 'Awaiting Documents',
      'in_progress': 'Processing',
      'verified': 'Verified',
      'unverified': 'Pending Verification',
      'active': 'Active',
      'inactive': 'Inactive'
    };
    return stageMap[status] || 'Unknown';
  };

  const getProgressFromStatus = (status) => {
    const progressMap = {
      'submitted': 20,
      'under_review': 50,
      'pending_documents': 30,
      'in_progress': 70,
      'approved': 100,
      'verified': 100,
      'active': 100,
      'rejected': 0,
      'inactive': 0
    };
    return progressMap[status] || 0;
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(app => app.type === typeFilter);
    }

    setFilteredApplications(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Submitted' },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Rejected' },
      pending_documents: { color: 'bg-orange-100 text-orange-800', icon: FileText, text: 'Pending Documents' },
      in_progress: { color: 'bg-purple-100 text-purple-800', icon: RefreshCw, text: 'In Progress' },
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Verified' },
      unverified: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Unverified' },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'Inactive' }
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

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', text: 'Low' },
      normal: { color: 'bg-blue-100 text-blue-800', text: 'Normal' },
      high: { color: 'bg-red-100 text-red-800', text: 'High' }
    };
    
    const config = priorityConfig[priority] || priorityConfig.normal;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      land_registration: 'Land Registration',
      tenancy_offering: 'Land Lease',
      tapper_request: 'Tapper Request',
      fertilizer_service: 'Fertilizer Service',
      rain_guard_service: 'Rain Guard Service',
      training_registration: 'Training Registration',
      payment_request: 'Payment Request'
    };

    return typeLabels[type] || type;
  };

  const refreshApplications = () => {
    setLoading(true);
    loadApplications();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('applicationStatus.title')}</h2>
              <p className="text-blue-100">{t('applicationStatus.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshApplications}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('applicationStatus.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('applicationStatus.allStatus')}</option>
                <option value="submitted">{t('applicationStatus.submitted')}</option>
                <option value="under_review">{t('applicationStatus.underReview')}</option>
                <option value="approved">{t('applicationStatus.approved')}</option>
                <option value="rejected">{t('applicationStatus.rejected')}</option>
                <option value="pending_documents">{t('applicationStatus.pendingDocuments')}</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('applicationStatus.allTypes')}</option>
                <option value="land_registration">{t('applicationStatus.landRegistration')}</option>
                <option value="tenancy_offering">{t('applicationStatus.landLease')}</option>
                <option value="tapper_request">{t('applicationStatus.tapperRequest')}</option>
                <option value="fertilizer_service">{t('applicationStatus.fertilizerService')}</option>
                <option value="rain_guard_service">{t('applicationStatus.rainGuardService')}</option>
                <option value="training_registration">{t('applicationStatus.training')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">{t('applicationStatus.loadingApplications')}</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('applicationStatus.noApplications')}</h3>
              <p className="text-gray-600">{t('applicationStatus.noApplicationsMessage')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredApplications.map((application, index) => (
                <motion.div
                  key={application.id}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {/* Application Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{application.title}</h3>
                        {getStatusBadge(application.status)}
                        {getPriorityBadge(application.priority)}
                      </div>
                      <p className="text-gray-600 mb-2">{application.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>ID: {application.id}</span>
                        <span>•</span>
                        <span>Type: {getTypeLabel(application.type)}</span>
                        <span>•</span>
                        <span>Submitted: {application.submittedDate ? new Date(application.submittedDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Progress</p>
                      <p className="text-2xl font-bold text-blue-600">{application.progress}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Current Stage: {application.currentStage}</span>
                      <span className="text-sm text-gray-600">
                        {application.estimatedCompletion && `Est. completion: ${application.estimatedCompletion}`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          application.status === 'approved' ? 'bg-green-500' :
                          application.status === 'rejected' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${application.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Reviewer Information */}
                  {(application.reviewerName || application.reviewerContact) && (
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Assigned Reviewer</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{application.reviewerName || 'Not assigned'}</p>
                            <p className="text-xs text-gray-500">{application.reviewerContact || 'Contact not available'}</p>
                          </div>
                        </div>
                        {application.reviewerContact && (
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Phone className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {application.documents && application.documents.length > 0 && (
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Submitted Documents</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.documents.map((doc, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Documents (if any) */}
                  {application.requiredDocuments && application.requiredDocuments.length > 0 && (
                    <div className="bg-orange-50 rounded-xl p-4 mb-4">
                      <h4 className="text-sm font-medium text-orange-800 mb-3 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Required Documents
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {application.requiredDocuments.map((doc, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Information */}
                  {application.assignedTapper && (
                    <div className="bg-green-50 rounded-xl p-4 mb-4">
                      <h4 className="text-sm font-medium text-green-800 mb-3">Assigned Tapper</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-800">{application.assignedTapper.name}</p>
                          <p className="text-xs text-green-600">Rating: {application.assignedTapper.rating} ⭐</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {application.trainingDetails && (
                    <div className="bg-purple-50 rounded-xl p-4 mb-4">
                      <h4 className="text-sm font-medium text-purple-800 mb-3">Training Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-purple-600">Start Date</p>
                          <p className="text-purple-800 font-medium">{application.trainingDetails.startDate}</p>
                        </div>
                        <div>
                          <p className="text-purple-600">Duration</p>
                          <p className="text-purple-800 font-medium">{application.trainingDetails.duration}</p>
                        </div>
                        <div>
                          <p className="text-purple-600">Location</p>
                          <p className="text-purple-800 font-medium">{application.trainingDetails.location}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  {application.comments && (
                    <div className="bg-blue-50 rounded-xl p-4 mb-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Latest Comments</h4>
                      <p className="text-sm text-blue-700">{application.comments}</p>
                      {application.lastUpdated && (
                        <p className="text-xs text-blue-600 mt-2">
                          Last updated: {new Date(application.lastUpdated).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Last updated: {application.lastUpdated}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
                        <Eye className="h-4 w-4 inline mr-1" />
                        View Details
                      </button>
                      <button className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg text-sm font-medium">
                        <Download className="h-4 w-4 inline mr-1" />
                        Download
                      </button>
                      <button className="px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium">
                        <MessageCircle className="h-4 w-4 inline mr-1" />
                        Contact
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ApplicationStatus;
