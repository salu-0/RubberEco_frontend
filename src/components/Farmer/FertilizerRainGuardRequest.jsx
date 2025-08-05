import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notificationService, getCurrentFarmer } from '../../services/notificationService';
import {
  Wrench,
  Droplets,
  TreePine,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Send,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Phone,
  Star,
  Eye,
  Plus,
  Trash2,
  Upload
} from 'lucide-react';

const FertilizerRainGuardRequest = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('new-request');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // Request Form State
  const [requestForm, setRequestForm] = useState({
    serviceType: 'fertilizer',
    farmLocation: '',
    farmSize: '',
    numberOfTrees: '',
    soilType: '',
    lastFertilizerDate: '',
    fertilizerType: 'organic',
    rainGuardType: 'temporary',
    urgency: 'normal',
    preferredDate: '',
    budgetRange: '',
    specialRequirements: '',
    contactPreference: 'phone',
    documents: []
  });

  // Service requests from database (no mock data)
  const [myRequests, setMyRequests] = useState([]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleInputChange = (field, value) => {
    setRequestForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    
    setRequestForm(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
  };

  const removeDocument = (documentId) => {
    setRequestForm(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId)
    }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newRequest = {
        id: `${requestForm.serviceType === 'fertilizer' ? 'FR' : 'RG'}${String(myRequests.length + 1).padStart(3, '0')}`,
        serviceType: requestForm.serviceType,
        title: requestForm.serviceType === 'fertilizer' ? 'Fertilizer Application Service' : 'Rain Guard Installation',
        ...requestForm,
        status: 'submitted',
        submittedDate: new Date().toISOString().split('T')[0]
      };
      
      setMyRequests(prev => [newRequest, ...prev]);

      // Send notification to admin
      const farmerData = getCurrentFarmer();
      notificationService.addServiceRequestNotification(newRequest, farmerData);

      // Reset form
      setRequestForm({
        serviceType: 'fertilizer',
        farmLocation: '',
        farmSize: '',
        numberOfTrees: '',
        soilType: '',
        lastFertilizerDate: '',
        fertilizerType: 'organic',
        rainGuardType: 'temporary',
        urgency: 'normal',
        preferredDate: '',
        budgetRange: '',
        specialRequirements: '',
        contactPreference: 'phone',
        documents: []
      });
      
      showNotification('Service request submitted successfully!', 'success');
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
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Submitted' },
      assigned: { color: 'bg-yellow-100 text-yellow-800', icon: User, text: 'Assigned' },
      in_progress: { color: 'bg-purple-100 text-purple-800', icon: Clock, text: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X, text: 'Cancelled' }
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Fertilizer & Rain Guard Services</h2>
              <p className="text-red-100">Request professional agricultural services</p>
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
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('new-request')}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              New Request
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'my-requests'
                  ? 'border-red-500 text-red-600'
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
                {/* Service Type Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Wrench className="h-5 w-5 mr-2 text-red-500" />
                    Service Type
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        requestForm.serviceType === 'fertilizer'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-red-300'
                      }`}
                      onClick={() => handleInputChange('serviceType', 'fertilizer')}
                    >
                      <div className="flex items-center space-x-3">
                        <TreePine className="h-6 w-6 text-green-500" />
                        <div>
                          <h4 className="font-medium text-gray-900">Fertilizer Application</h4>
                          <p className="text-sm text-gray-600">Organic and chemical fertilizer services</p>
                        </div>
                      </div>
                    </div>
                    
                    <div
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        requestForm.serviceType === 'rain_guard'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-red-300'
                      }`}
                      onClick={() => handleInputChange('serviceType', 'rain_guard')}
                    >
                      <div className="flex items-center space-x-3">
                        <Droplets className="h-6 w-6 text-blue-500" />
                        <div>
                          <h4 className="font-medium text-gray-900">Rain Guard Installation</h4>
                          <p className="text-sm text-gray-600">Weather protection for rubber trees</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Farm Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TreePine className="h-5 w-5 mr-2 text-red-500" />
                    Farm Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Farm Location *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={requestForm.farmLocation}
                          onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter farm location"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Farm Size *
                      </label>
                      <input
                        type="text"
                        required
                        value={requestForm.farmSize}
                        onChange={(e) => handleInputChange('farmSize', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., 5 hectares"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Trees *
                      </label>
                      <input
                        type="number"
                        required
                        value={requestForm.numberOfTrees}
                        onChange={(e) => handleInputChange('numberOfTrees', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter number of trees"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Soil Type
                      </label>
                      <input
                        type="text"
                        value={requestForm.soilType}
                        onChange={(e) => handleInputChange('soilType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., Laterite, Alluvial"
                      />
                    </div>
                  </div>
                </div>

                {/* Service Specific Details */}
                {requestForm.serviceType === 'fertilizer' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TreePine className="h-5 w-5 mr-2 text-red-500" />
                      Fertilizer Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Fertilizer Application
                        </label>
                        <input
                          type="date"
                          value={requestForm.lastFertilizerDate}
                          onChange={(e) => handleInputChange('lastFertilizerDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fertilizer Type Preference
                        </label>
                        <select
                          value={requestForm.fertilizerType}
                          onChange={(e) => handleInputChange('fertilizerType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="organic">Organic Fertilizer</option>
                          <option value="chemical">Chemical Fertilizer</option>
                          <option value="mixed">Mixed (Organic + Chemical)</option>
                          <option value="bio">Bio-fertilizer</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {requestForm.serviceType === 'rain_guard' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Droplets className="h-5 w-5 mr-2 text-red-500" />
                      Rain Guard Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rain Guard Type
                        </label>
                        <select
                          value={requestForm.rainGuardType}
                          onChange={(e) => handleInputChange('rainGuardType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="temporary">Temporary (Seasonal)</option>
                          <option value="permanent">Permanent Installation</option>
                          <option value="semi_permanent">Semi-Permanent</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Schedule and Budget */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-red-500" />
                    Schedule & Budget
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={requestForm.preferredDate}
                        onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level
                      </label>
                      <select
                        value={requestForm.urgency}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="low">Low - Can wait</option>
                        <option value="normal">Normal - Standard timing</option>
                        <option value="high">High - Urgent</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Range
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={requestForm.budgetRange}
                          onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="e.g., ₹15,000 - ₹20,000"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-red-500" />
                    Additional Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requirements
                      </label>
                      <textarea
                        value={requestForm.specialRequirements}
                        onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Any special requirements or instructions..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Preference
                      </label>
                      <select
                        value={requestForm.contactPreference}
                        onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="phone">Phone Call</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                        <option value="visit">Farm Visit</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-red-500" />
                    Supporting Documents
                  </h3>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload supporting documents</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Farm photos, soil test reports, previous service records
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </label>
                  </div>
                  
                  {requestForm.documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {requestForm.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(doc.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Request</span>
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
              className="space-y-6"
            >
              {myRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                  <p className="text-gray-600 mb-4">You haven't submitted any service requests.</p>
                  <button
                    onClick={() => setActiveTab('new-request')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
                          <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                          {getStatusBadge(request.status)}
                          {getUrgencyBadge(request.urgency)}
                        </div>
                        <p className="text-gray-600 flex items-center mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {request.farmLocation}
                        </p>
                        <p className="text-sm text-gray-500">Request ID: {request.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="text-sm font-medium text-gray-900">{request.submittedDate}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Farm Size</p>
                        <p className="text-sm font-medium text-gray-900">{request.farmSize}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Trees</p>
                        <p className="text-sm font-medium text-gray-900">{request.numberOfTrees}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Preferred Date</p>
                        <p className="text-sm font-medium text-gray-900">{request.preferredDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Budget</p>
                        <p className="text-sm font-medium text-gray-900">{request.budgetRange}</p>
                      </div>
                    </div>

                    {request.assignedProvider && (
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Assigned Service Provider</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.assignedProvider.name}</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="text-xs text-gray-600">{request.assignedProvider.rating}</span>
                                </div>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-600">{request.assignedProvider.experience}</span>
                              </div>
                            </div>
                          </div>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Phone className="h-4 w-4" />
                          </button>
                        </div>
                        {request.estimatedCost && (
                          <div className="mt-3 p-2 bg-green-50 rounded">
                            <p className="text-sm text-green-800">
                              Estimated Cost: <span className="font-medium">{request.estimatedCost}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {request.status === 'completed' && request.actualCost && (
                      <div className="bg-green-50 rounded-lg p-3 mb-4">
                        <h4 className="text-sm font-medium text-green-800 mb-2">Service Completed</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-green-600">Completion Date</p>
                            <p className="text-green-800 font-medium">{request.completionDate}</p>
                          </div>
                          <div>
                            <p className="text-green-600">Final Cost</p>
                            <p className="text-green-800 font-medium">{request.actualCost}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{request.serviceDetails}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">
                          <Eye className="h-4 w-4 inline mr-1" />
                          View Details
                        </button>
                        {request.assignedProvider && (
                          <button className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
                            <Phone className="h-4 w-4 inline mr-1" />
                            Contact
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FertilizerRainGuardRequest;
