import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notificationService } from '../../services/notificationService';
import {
  MapPin,
  FileText,
  Upload,
  User,
  Phone,
  Mail,
  Home,
  TreePine,
  Ruler,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Send,
  Eye,
  Download,
  Plus,
  Trash2,
  Map,
  Camera,
  Droplets,
  Mountain
} from 'lucide-react';
import { isRequired, isEmail, phoneValidator, pincodeValidator, numericValidator, nameValidator } from '../../utils/validation';
import { useTranslation } from 'react-i18next';

const LandRegistration = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('new-registration');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [formErrors, setFormErrors] = useState({});

  // View Details Modal State
  const [selectedLand, setSelectedLand] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Registration Form State
  const [registrationForm, setRegistrationForm] = useState({
    // Owner Information
    ownerName: '',
    fatherName: '',
    phoneNumber: '',
    email: '',
    address: '',
    
    // Land Details
    landTitle: '',
    landLocation: '',
    district: '',
    state: 'Kerala',
    pincode: '',
    surveyNumber: '',
    subDivision: '',
    totalArea: '',
    landType: 'agricultural',
    topography: 'flat',
    
    // Coordinates
    latitude: '',
    longitude: '',
    
    // Infrastructure
    roadAccess: 'yes',
    electricityAvailable: 'yes',
    nearestTown: '',
    distanceFromTown: '',

    // Rubber Plantation Details
    numberOfTrees: '',
    treeAge: '',
    currentYield: '',
    plantingYear: '',
    treeVariety: '',
    
    // Legal Documents
    documents: [],
    
    // Additional Information
    previousCrops: '',
    irrigationFacility: 'no',
    storageCapacity: '',
    additionalNotes: ''
  });

  // Registered lands - will be loaded from API
  const [myLands, setMyLands] = useState([]);

  // Load user's registered lands on component mount
  useEffect(() => {
    if (isOpen) {
      loadMyLands();
    }
  }, [isOpen]);

  const loadMyLands = async () => {
    try {
      console.log('🏞️ Loading my lands from API...');
      console.log('🏞️ API URL:', `${import.meta.env.VITE_API_BASE_URL}/land-registration/my-lands`);

      const token = localStorage.getItem('token');
      const currentUser = localStorage.getItem('currentUser');

      console.log('🏞️ Token:', token ? 'Present' : 'Missing');
      console.log('🏞️ Token length:', token ? token.length : 0);
      console.log('🏞️ Current User:', currentUser ? 'Present' : 'Missing');

      if (!token) {
        console.log('❌ No authentication token found. Please login first.');
        setMyLands([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/land-registration/my-lands`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('🏞️ Response status:', response.status);
      console.log('🏞️ Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('🏞️ API Response:', data);
        console.log('🏞️ Lands data:', data.data);
        setMyLands(data.data || []);
      } else {
        console.log('🏞️ API response not ok:', response.status);
        const errorText = await response.text();
        console.log('🏞️ Error response:', errorText);
        setMyLands([]);
      }
    } catch (error) {
      console.error('🏞️ Error loading lands:', error);
      console.error('🏞️ Error details:', error.message);
      // Keep empty array if API fails
      setMyLands([]);
    }
  };

  // Handle View Details
  const handleViewDetails = (land) => {
    setSelectedLand(land);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLand(null);
  };

  const handleInputChange = (field, value) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleInputBlur = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'ownerName':
        error = nameValidator(value);
        break;
      case 'fatherName':
        error = nameValidator(value);
        break;
      case 'email':
        if (value && isEmail(value)) {
          error = isEmail(value);
        }
        break;
      default:
        break;
    }
    
    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
      uploadDate: new Date().toISOString()
    }));

    setRegistrationForm(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
  };

  const removeDocument = (documentId) => {
    setRegistrationForm(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId)
    }));
  };

  const validateRegistrationForm = () => {
    const errors = {};

    // Owner info
    if (nameValidator(registrationForm.ownerName)) errors.ownerName = nameValidator(registrationForm.ownerName);
    if (nameValidator(registrationForm.fatherName)) errors.fatherName = nameValidator(registrationForm.fatherName);
    if (phoneValidator(registrationForm.phoneNumber)) errors.phoneNumber = phoneValidator(registrationForm.phoneNumber);
    if (registrationForm.email && isEmail(registrationForm.email)) errors.email = isEmail(registrationForm.email);
    if (isRequired(registrationForm.address)) errors.address = isRequired(registrationForm.address, 'Current address is required');

    // Land details
    if (isRequired(registrationForm.surveyNumber)) errors.surveyNumber = isRequired(registrationForm.surveyNumber);
    if (isRequired(registrationForm.district)) errors.district = 'District is required';
    if (pincodeValidator(registrationForm.pincode)) errors.pincode = pincodeValidator(registrationForm.pincode);
    if (isRequired(registrationForm.totalArea)) errors.totalArea = isRequired(registrationForm.totalArea);
    if (isRequired(registrationForm.landLocation)) errors.landLocation = isRequired(registrationForm.landLocation, 'Land location is required');

    // Coordinates optional numeric
    if (registrationForm.latitude && numericValidator(registrationForm.latitude, { allowEmpty: true })) {
      errors.latitude = numericValidator(registrationForm.latitude, { allowEmpty: true });
    }
    if (registrationForm.longitude && numericValidator(registrationForm.longitude, { allowEmpty: true })) {
      errors.longitude = numericValidator(registrationForm.longitude, { allowEmpty: true });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();

    if (!validateRegistrationForm()) {
      setNotification({ show: true, message: 'Please fix the highlighted errors before submitting.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Get current user data
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      // Call API to register land
      console.log('🏞️ Submitting land registration...');
      console.log('🏞️ API URL:', `${import.meta.env.VITE_API_BASE_URL}/land-registration`);
      console.log('🏞️ Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log('🏞️ Form data:', registrationForm);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/land-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(registrationForm)
      });

      console.log('🏞️ Response status:', response.status);
      console.log('🏞️ Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('🏞️ Error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register land');
      }

      // Add to local state for immediate UI update
      const newLand = {
        id: data.data.registrationId,
        ...data.data,
        registeredDate: new Date(data.data.createdAt).toISOString().split('T')[0],
        isAvailableForLease: false
      };

      setMyLands(prev => [newLand, ...prev]);

      // Send notification to admin
      const farmerData = {
        name: currentUser.name || registrationForm.ownerName,
        email: currentUser.email || registrationForm.email,
        phone: currentUser.phone || registrationForm.phoneNumber
      };

      notificationService.addLandRegistrationNotification(data.data, farmerData);

      // Reset form
      setRegistrationForm({
        ownerName: '',
        fatherName: '',
        phoneNumber: '',
        email: '',
        address: '',
        landTitle: '',
        landLocation: '',
        district: '',
        state: 'Kerala',
        pincode: '',
        surveyNumber: '',
        subDivision: '',
        totalArea: '',
        cultivableArea: '',
        landType: 'agricultural',
        soilType: '',
        topography: 'flat',
        latitude: '',
        longitude: '',
        roadAccess: 'yes',
        electricityAvailable: 'yes',
        waterSource: '',
        nearestTown: '',
        distanceFromTown: '',
        existingTrees: 'no',
        numberOfTrees: '',
        treeAge: '',
        currentYield: '',
        plantingYear: '',
        treeVariety: '',
        documents: [],
        previousCrops: '',
        irrigationFacility: 'no',
        storageCapacity: '',
        additionalNotes: ''
      });

      setNotification({
        show: true,
        message: 'Land registration submitted successfully! Once verified, you can offer it for rubber tapping tenancy.',
        type: 'success'
      });

      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 5000);

    } catch (error) {
      console.error('Error submitting registration:', error);
      setNotification({
        show: true,
        message: 'Failed to submit registration. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: { color: 'bg-green-100 text-green-800', text: 'Verified', icon: CheckCircle },
      pending_verification: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Verification', icon: AlertCircle },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected', icon: X }
    };

    const config = statusConfig[status] || statusConfig.pending_verification;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
              <Map className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('landRegistration.title', 'Rubber Tapping Tenancy')}</h2>
              <p className="text-green-100">{t('landRegistration.subtitle', 'Register your land for Rubber Tapping Tenancy')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Notification */}
        {notification.show && (
          <motion.div
            className={`mx-6 mt-4 p-4 rounded-lg ${
              notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {notification.message}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('new-registration')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'new-registration'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              {t('landRegistration.newRegistration', 'New Registration')}
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('my-lands')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'my-lands'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                {t('landRegistration.myRegisteredLands', 'My Registered Lands')} ({myLands.length})
              </button>
              {activeTab === 'my-lands' && (
                <button
                  onClick={loadMyLands}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Refresh lands"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {activeTab === 'new-registration' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmitRegistration} className="space-y-8">
                {/* Owner Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-green-500" />
                    {t('landRegistration.ownerInformation', 'Owner Information')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.name', 'Full Name')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={registrationForm.ownerName}
                        onChange={(e) => handleInputChange('ownerName', e.target.value)}
                        onBlur={(e) => handleInputBlur('ownerName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          formErrors.ownerName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('profile.namePlaceholder', 'Enter full name (e.g., Raju Kumar)')}
                      />
                      {formErrors.ownerName && <p className="text-xs text-red-500 mt-1">{formErrors.ownerName}</p>}
                      {!formErrors.ownerName && registrationForm.ownerName && (
                        <p className="text-xs text-green-600 mt-1">✓ Name format is valid</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.fatherName', "Father's Name")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={registrationForm.fatherName}
                        onChange={(e) => handleInputChange('fatherName', e.target.value)}
                        onBlur={(e) => handleInputBlur('fatherName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          formErrors.fatherName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('profile.fatherNamePlaceholder', "Enter father's name (e.g., Kumar Raju)")}
                      />
                      {formErrors.fatherName && <p className="text-xs text-red-500 mt-1">{formErrors.fatherName}</p>}
                      {!formErrors.fatherName && registrationForm.fatherName && (
                        <p className="text-xs text-green-600 mt-1">✓ Name format is valid</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.phone', 'Phone Number')} *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          required
                          value={registrationForm.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder={t('profile.phonePlaceholder', 'Enter phone number (e.g., +91 98765 43210)')}
                        />
                      </div>
                      {formErrors.phoneNumber && <p className="text-xs text-red-500 mt-1">{formErrors.phoneNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.email', 'Email Address')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={registrationForm.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          onBlur={(e) => handleInputBlur('email', e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder={t('profile.emailPlaceholder', 'Enter email address (e.g., your@email.com)')}
                        />
                      </div>
                      {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                      {!formErrors.email && registrationForm.email && (
                        <p className="text-xs text-green-600 mt-1">✓ Email format is valid</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.address', 'Current Address')} *
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          required
                          value={registrationForm.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          rows={3}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder={t('profile.addressPlaceholder', 'Enter your complete address')}
                        />
                      </div>
                      {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
                    </div>
                  </div>
                </div>

                {/* Land Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Map className="h-5 w-5 mr-2 text-green-500" />
                    {t('landRegistration.landDetails', 'Land Details')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('land.title', 'Land Title/Name')} <span className="text-gray-500 text-xs">({t('optional', 'Optional')})</span>
                      </label>
                      <input
                        type="text"
                        value={registrationForm.landTitle}
                        onChange={(e) => handleInputChange('landTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={t('land.titlePlaceholder', 'e.g., Family Farm, Ancestral Land, or leave blank')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('land.surveyNumber', 'Survey Number')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={registrationForm.surveyNumber}
                        onChange={(e) => handleInputChange('surveyNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={t('land.surveyNumberPlaceholder', 'e.g., 123/4A')}
                      />
                      {formErrors.surveyNumber && <p className="text-xs text-red-500 mt-1">{formErrors.surveyNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('land.district', 'District')} *
                      </label>
                      <select
                        required
                        value={registrationForm.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">ജില്ല തിരഞ്ഞെടുക്കുക (Select District)</option>
                        <option value="">{t('land.selectDistrict', 'Select District')}</option>
                        <option value="Kottayam">Kottayam</option>
                        <option value="Wayanad">Wayanad</option>
                        <option value="Ernakulam">Ernakulam</option>
                        <option value="Thrissur">Thrissur</option>
                        <option value="Palakkad">Palakkad</option>
                        <option value="Idukki">Idukki</option>
                        <option value="Pathanamthitta">Pathanamthitta</option>
                      </select>
                      {formErrors.district && <p className="text-xs text-red-500 mt-1">{formErrors.district}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('land.pincode', 'Pincode')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={registrationForm.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={t('land.pincodePlaceholder', 'e.g., 686001')}
                      />
                      {formErrors.pincode && <p className="text-xs text-red-500 mt-1">{formErrors.pincode}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('land.totalArea', 'Total Area')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={registrationForm.totalArea}
                        onChange={(e) => handleInputChange('totalArea', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={t('land.areaPlaceholder', 'e.g., 5.2 hectares')}
                      />
                      {formErrors.totalArea && <p className="text-xs text-red-500 mt-1">{formErrors.totalArea}</p>}
                    </div>



                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('land.location', 'Land Location/Address')} *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          required
                          value={registrationForm.landLocation}
                          onChange={(e) => handleInputChange('landLocation', e.target.value)}
                          rows={3}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder={t('land.locationPlaceholder', 'Full land address, including landmarks')}
                        />
                      </div>
                      {formErrors.landLocation && <p className="text-xs text-red-500 mt-1">{formErrors.landLocation}</p>}
                    </div>
                  </div>
                </div>

                {/* Rubber Plantation Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TreePine className="h-5 w-5 mr-2 text-green-500" />
                    {t('landRegistration.rubberPlantationDetails', 'Rubber Plantation Details')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {registrationForm.existingTrees === 'yes' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('land.numberOfTrees', 'Number of Trees')}
                          </label>
                          <input
                            type="number"
                            value={registrationForm.numberOfTrees}
                            onChange={(e) => handleInputChange('numberOfTrees', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder={t('land.numberOfTreesPlaceholder', 'e.g., 500')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('land.treeAge', 'Tree Age (years)')}
                          </label>
                          <input
                            type="number"
                            value={registrationForm.treeAge}
                            onChange={(e) => handleInputChange('treeAge', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder={t('land.treeAgePlaceholder', 'e.g., 8')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('land.currentYield', 'Current Yield per month')}
                          </label>
                          <input
                            type="text"
                            value={registrationForm.currentYield}
                            onChange={(e) => handleInputChange('currentYield', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder={t('land.currentYieldPlaceholder', 'e.g., 200 kg')}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Documents Upload */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-500" />
                    {t('landRegistration.requiredDocuments', 'Required Documents')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('landRegistration.uploadDocuments', 'Upload Documents')} *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          {t('landRegistration.uploadClickOrDrag', 'Click to upload or drag & drop')}
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          {t('landRegistration.uploadHint', 'Land title deed, survey settlement, revenue documents, etc.')}
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
                          className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer transition-colors"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {t('landRegistration.chooseFiles', 'Choose Files')}
                        </label>
                      </div>
                    </div>

                    {/* Uploaded Documents */}
                    {registrationForm.documents.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</h4>
                        <div className="space-y-2">
                          {registrationForm.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDocument(doc.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        സമർപ്പിക്കുന്നു... (Submitting...)
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t('landRegistration.registerLand', 'Register Land')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'my-lands' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                {myLands.length === 0 ? (
                  <div className="text-center py-12">
                    <Map className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">ഭൂമി രജിസ്റ്റർ ചെയ്യുക</h3>
                    <p className="text-gray-500 mb-4">ആദ്യം, മുഴുവൻ വിവരങ്ങളും രേഖകളും നൽകി നിങ്ങളുടെ ഭൂമി രജിസ്റ്റർ ചെയ്യുക. സ്ഥിരീകരിച്ച ശേഷം, റബ്ബർ ടാപ്പിംഗ് ടെനൻസിക്ക് വാടകയ്ക്ക് നൽകാം.</p>
                    <button
                      onClick={() => setActiveTab('new-registration')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      പുതിയ ഭൂമി രജിസ്റ്റർ ചെയ്യുക
                    </button>
                  </div>
                ) : (
                  myLands.map((land) => (
                    <div key={land.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {land.landTitle || `Land at ${land.landLocation}`}
                            </h3>
                            {getStatusBadge(land.status)}
                          </div>
                          <p className="text-gray-600 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {land.landLocation}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Registered</p>
                          <p className="text-sm font-medium text-gray-900">{land.registeredDate}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Ruler className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Area: {land.totalArea}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TreePine className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Type: {land.landType || 'Agricultural'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">ID: {land.id}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(land)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </button>
                          {land.status === 'verified' && (
                            <button
                              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              onClick={() => {
                                if (window.openLandLeaseOffering) {
                                  window.openLandLeaseOffering(land);
                                }
                              }}
                            >
                              Offer for Tenancy
                            </button>
                          )}
                        </div>
                        {land.verificationDate && (
                          <span className="text-xs text-gray-500">
                            Verified on {land.verificationDate}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Land Details Modal */}
      {showDetailsModal && selectedLand && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDetailsModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedLand.landTitle || `Land at ${selectedLand.landLocation}`}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{selectedLand.landLocation}</span>
                  </div>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status and Registration Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Registration Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <div className="flex items-center space-x-2">
                        {selectedLand.status === 'verified' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-700 font-medium">Verified</span>
                          </>
                        ) : selectedLand.status === 'pending' ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-700 font-medium">Pending Verification</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-700 font-medium">Under Review</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Registration ID:</span>
                      <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                        {selectedLand.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Registered Date:</span>
                      <span className="font-medium">{selectedLand.registeredDate}</span>
                    </div>
                    {selectedLand.verificationDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Verified Date:</span>
                        <span className="font-medium">{selectedLand.verificationDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Owner Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Owner Name:</span>
                      <span className="font-medium">{selectedLand.ownerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Father's Name:</span>
                      <span className="font-medium">{selectedLand.fatherName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{selectedLand.phoneNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedLand.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Land Details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Land Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-600 text-sm">Location:</span>
                    <p className="font-medium">{selectedLand.landLocation}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">District:</span>
                    <p className="font-medium">{selectedLand.district}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">State:</span>
                    <p className="font-medium">{selectedLand.state}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Pincode:</span>
                    <p className="font-medium">{selectedLand.pincode}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Survey Number:</span>
                    <p className="font-medium">{selectedLand.surveyNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Sub Division:</span>
                    <p className="font-medium">{selectedLand.subDivision}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Total Area:</span>
                    <p className="font-medium">{selectedLand.totalArea}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Land Type:</span>
                    <p className="font-medium capitalize">{selectedLand.landType || 'Agricultural'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Topography:</span>
                    <p className="font-medium capitalize">{selectedLand.topography || 'Flat'}</p>
                  </div>
                </div>
              </div>

              {/* Infrastructure Details */}
              {(selectedLand.nearestTown || selectedLand.distanceFromTown || (selectedLand.latitude && selectedLand.longitude)) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Location Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedLand.nearestTown && (
                      <div>
                        <span className="text-gray-600 text-sm">Nearest Town:</span>
                        <p className="font-medium">{selectedLand.nearestTown}</p>
                      </div>
                    )}
                    {selectedLand.distanceFromTown && (
                      <div>
                        <span className="text-gray-600 text-sm">Distance from Town:</span>
                        <p className="font-medium">{selectedLand.distanceFromTown}</p>
                      </div>
                    )}
                    {(selectedLand.latitude && selectedLand.longitude) && (
                      <div>
                        <span className="text-gray-600 text-sm">Coordinates:</span>
                        <p className="font-medium">{selectedLand.latitude}, {selectedLand.longitude}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rubber Plantation Details */}
              {(selectedLand.numberOfTrees || selectedLand.treeAge || selectedLand.currentYield) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Rubber Plantation Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedLand.numberOfTrees && (
                      <div>
                        <span className="text-gray-600 text-sm">Number of Trees:</span>
                        <p className="font-medium">{selectedLand.numberOfTrees}</p>
                      </div>
                    )}
                    {selectedLand.treeAge && (
                      <div>
                        <span className="text-gray-600 text-sm">Tree Age:</span>
                        <p className="font-medium">{selectedLand.treeAge}</p>
                      </div>
                    )}
                    {selectedLand.currentYield && (
                      <div>
                        <span className="text-gray-600 text-sm">Current Yield:</span>
                        <p className="font-medium">{selectedLand.currentYield}</p>
                      </div>
                    )}
                    {selectedLand.plantingYear && (
                      <div>
                        <span className="text-gray-600 text-sm">Planting Year:</span>
                        <p className="font-medium">{selectedLand.plantingYear}</p>
                      </div>
                    )}
                    {selectedLand.treeVariety && (
                      <div>
                        <span className="text-gray-600 text-sm">Tree Variety:</span>
                        <p className="font-medium">{selectedLand.treeVariety}</p>
                      </div>
                    )}
                    {selectedLand.previousCrops && (
                      <div>
                        <span className="text-gray-600 text-sm">Previous Crops:</span>
                        <p className="font-medium">{selectedLand.previousCrops}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}



              {/* Documents */}
              {selectedLand.documents && selectedLand.documents.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Uploaded Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedLand.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <span className="text-sm font-medium">{doc.name}</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedLand.status === 'verified' && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Offer for Tenancy
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LandRegistration;
