import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    try {
      // Mock data - replace with actual API call
      const mockApplications = [
        {
          id: 'LA001',
          type: 'land_lease',
          title: 'Land Lease Application',
          description: 'Application for 5 hectares agricultural land in Kottayam',
          status: 'under_review',
          submittedDate: '2024-01-15',
          lastUpdated: '2024-01-20',
          estimatedCompletion: '2024-02-15',
          currentStage: 'Document Verification',
          progress: 60,
          reviewerName: 'Mr. Suresh Kumar',
          reviewerContact: '+91 9876543210',
          documents: ['ID Proof', 'Address Proof', 'Income Certificate'],
          comments: 'Application is being reviewed by the land committee. Additional documents may be required.',
          priority: 'normal'
        },
        {
          id: 'TR001',
          type: 'tapper_request',
          title: 'Rubber Tapper Request',
          description: 'Request for daily tapping service for 250 trees',
          status: 'approved',
          submittedDate: '2024-01-10',
          lastUpdated: '2024-01-25',
          estimatedCompletion: '2024-01-25',
          currentStage: 'Completed',
          progress: 100,
          reviewerName: 'Ms. Priya Nair',
          reviewerContact: '+91 9876543211',
          documents: ['Farm Details', 'Location Map'],
          comments: 'Tapper has been assigned successfully. Service will start from February 1st.',
          priority: 'high',
          assignedTapper: {
            name: 'Ravi Kumar',
            phone: '+91 9876543212',
            rating: 4.8
          }
        },
        {
          id: 'FS001',
          type: 'fertilizer_service',
          title: 'Fertilizer Service Request',
          description: 'Request for organic fertilizer application service',
          status: 'pending_documents',
          submittedDate: '2024-01-20',
          lastUpdated: '2024-01-22',
          estimatedCompletion: '2024-02-10',
          currentStage: 'Awaiting Documents',
          progress: 25,
          reviewerName: 'Mr. Rajesh Menon',
          reviewerContact: '+91 9876543213',
          documents: ['Soil Test Report', 'Farm Registration'],
          comments: 'Please submit the soil test report to proceed with the application.',
          priority: 'normal',
          requiredDocuments: ['Soil Test Report', 'Previous Fertilizer Usage History']
        },
        {
          id: 'TR002',
          type: 'training_registration',
          title: 'Training Program Registration',
          description: 'Registration for Advanced Rubber Cultivation Techniques',
          status: 'approved',
          submittedDate: '2024-01-05',
          lastUpdated: '2024-01-15',
          estimatedCompletion: '2024-01-15',
          currentStage: 'Enrolled',
          progress: 100,
          reviewerName: 'Dr. Lakshmi Devi',
          reviewerContact: '+91 9876543214',
          documents: ['Registration Form', 'Experience Certificate'],
          comments: 'Successfully enrolled in the training program. Classes start from February 5th.',
          priority: 'normal',
          trainingDetails: {
            startDate: '2024-02-05',
            duration: '2 weeks',
            location: 'Kottayam Training Center'
          }
        }
      ];
      
      setApplications(mockApplications);
      setLoading(false);
    } catch (error) {
      console.error('Error loading applications:', error);
      setLoading(false);
    }
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
      in_progress: { color: 'bg-purple-100 text-purple-800', icon: RefreshCw, text: 'In Progress' }
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
      land_lease: 'Land Lease',
      tapper_request: 'Tapper Request',
      fertilizer_service: 'Fertilizer Service',
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
              <h2 className="text-xl font-bold text-white">Application Status</h2>
              <p className="text-blue-100">Monitor progress of all your applications</p>
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
                  placeholder="Search applications..."
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
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="pending_documents">Pending Documents</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="land_lease">Land Lease</option>
                <option value="tapper_request">Tapper Request</option>
                <option value="fertilizer_service">Fertilizer Service</option>
                <option value="training_registration">Training</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">No applications match your current filters.</p>
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
                        <span>Submitted: {application.submittedDate}</span>
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
                  <div className="bg-white rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Assigned Reviewer</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{application.reviewerName}</p>
                          <p className="text-xs text-gray-500">{application.reviewerContact}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
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
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Latest Comments</h4>
                    <p className="text-sm text-blue-700">{application.comments}</p>
                    <p className="text-xs text-blue-600 mt-2">Last updated: {application.lastUpdated}</p>
                  </div>

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
