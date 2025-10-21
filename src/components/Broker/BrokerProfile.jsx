import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  Award,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Briefcase
} from 'lucide-react';

const BrokerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    profileImage: '',
    
    // Broker Specific Information
    licenseNumber: '',
    experience: '',
    specialization: [],
    companyName: '',
    
    // Additional Details
    education: '',
    previousWork: '',
    joinedDate: '',
    verificationStatus: 'pending'
  });
  
  const [editData, setEditData] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});
  const [validationTimeout, setValidationTimeout] = useState({});
  const [validating, setValidating] = useState({});

  useEffect(() => {
    loadProfileData();
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimeout).forEach(timeoutId => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
  }, [validationTimeout]);

  const loadProfileData = async () => {
    try {
      // Get user data from localStorage (from login)
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // TODO: Replace with actual API call to get complete broker profile
      const mockProfileData = {
        name: userData.name || 'John Doe',
        email: userData.email || 'john.doe@example.com',
        phone: userData.phone || '+91 9876543210',
        location: userData.location || 'Kottayam, Kerala',
        bio: userData.bio || 'Experienced rubber broker with 5+ years in the industry.',
        profileImage: userData.profileImage || '',
        
        licenseNumber: userData.brokerProfile?.licenseNumber || 'RB2024001',
        experience: userData.brokerProfile?.experience || '3-5 years',
        specialization: userData.brokerProfile?.specialization || ['Rubber Trading', 'Quality Assessment'],
        companyName: userData.brokerProfile?.companyName || 'Kerala Rubber Trading Co.',
        
        education: userData.brokerProfile?.education || 'B.Com in Commerce',
        previousWork: userData.brokerProfile?.previousWork || 'Assistant Broker at ABC Trading',
        joinedDate: userData.createdAt || '2024-01-15',
        verificationStatus: userData.verificationStatus || 'verified'
      };
      
      setProfileData(mockProfileData);
      setEditData(mockProfileData);
    } catch (error) {
      console.error('Error loading profile data:', error);
      showNotification('Error loading profile data', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...profileData });
    setErrors({}); // Clear errors when canceling
  };

  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm(editData)) {
      showNotification('Please fix the errors before saving', 'error');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfileData({ ...editData });
      setIsEditing(false);
      setErrors({}); // Clear errors on successful save
      
      // Update localStorage user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUserData = {
        ...userData,
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        location: editData.location,
        bio: editData.bio,
        brokerProfile: {
          ...userData.brokerProfile,
          licenseNumber: editData.licenseNumber,
          experience: editData.experience,
          specialization: editData.specialization,
          companyName: editData.companyName,
          education: editData.education,
          previousWork: editData.previousWork
        }
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Error updating profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear existing timeout for this field
    if (validationTimeout[field]) {
      clearTimeout(validationTimeout[field]);
    }
    
    // Immediate validation for critical fields (name with numbers, phone with letters)
    let immediateError = null;
    if (field === 'name' && /\d/.test(value)) {
      immediateError = 'Name should not contain numbers';
    } else if (field === 'phone' && /[a-zA-Z]/.test(value)) {
      immediateError = 'Phone number should not contain letters';
    }
    
    if (immediateError) {
      setErrors(prev => ({
        ...prev,
        [field]: immediateError
      }));
      return;
    }
    
    // Show validating state
    setValidating(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Debounced validation for other cases - show error after user stops typing for 500ms
    const timeoutId = setTimeout(() => {
      let error = null;
      switch (field) {
        case 'name':
          error = validateName(value);
          break;
        case 'email':
          error = validateEmail(value);
          break;
        case 'phone':
          error = validatePhone(value);
          break;
        case 'location':
          error = validateLocation(value);
          break;
        case 'bio':
          error = validateBio(value);
          break;
        case 'licenseNumber':
          error = validateLicenseNumber(value);
          break;
        case 'companyName':
          error = validateCompanyName(value);
          break;
        case 'education':
          error = validateEducation(value);
          break;
        case 'previousWork':
          error = validatePreviousWork(value);
          break;
        default:
          break;
      }
      
      // Update errors state and clear validating
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
      
      setValidating(prev => ({
        ...prev,
        [field]: false
      }));
    }, 500);
    
    // Store timeout ID
    setValidationTimeout(prev => ({
      ...prev,
      [field]: timeoutId
    }));
  };

  const handleSpecializationChange = (specialization) => {
    const newSpecialization = editData.specialization.includes(specialization)
      ? editData.specialization.filter(s => s !== specialization)
      : [...editData.specialization, specialization];
    
    setEditData(prev => ({
      ...prev,
      specialization: newSpecialization
    }));
    
    // Real-time validation for specialization
    const error = newSpecialization.length === 0 ? 'Please select at least one specialization' : null;
    setErrors(prev => ({
      ...prev,
      specialization: error
    }));
  };

  // Validation functions
  const validateName = (name) => {
    if (!name || name.trim().length === 0) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }
    // Check for numbers in name
    if (/\d/.test(name)) {
      return 'Name should not contain numbers';
    }
    // Check for special characters (allow spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-']+$/.test(name)) {
      return 'Name should only contain letters, spaces, hyphens, and apostrophes';
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email || email.trim().length === 0) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    if (email.length > 100) {
      return 'Email must be less than 100 characters';
    }
    return null;
  };

  const validatePhone = (phone) => {
    if (!phone || phone.trim().length === 0) {
      return 'Phone number is required';
    }
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    if (cleanPhone.length > 15) {
      return 'Phone number must be less than 15 digits';
    }
    // Check for valid phone format (allows +, spaces, hyphens, parentheses)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid phone number';
    }
    return null;
  };

  const validateLocation = (location) => {
    if (!location || location.trim().length === 0) {
      return 'Location is required';
    }
    if (location.trim().length < 2) {
      return 'Location must be at least 2 characters';
    }
    if (location.trim().length > 100) {
      return 'Location must be less than 100 characters';
    }
    return null;
  };

  const validateBio = (bio) => {
    if (bio && bio.trim().length > 500) {
      return 'Bio must be less than 500 characters';
    }
    return null;
  };

  const validateLicenseNumber = (licenseNumber) => {
    if (!licenseNumber || licenseNumber.trim().length === 0) {
      return 'License number is required';
    }
    if (licenseNumber.trim().length < 3) {
      return 'License number must be at least 3 characters';
    }
    if (licenseNumber.trim().length > 20) {
      return 'License number must be less than 20 characters';
    }
    // Check for valid license format (alphanumeric with optional hyphens)
    const licenseRegex = /^[A-Za-z0-9\-]+$/;
    if (!licenseRegex.test(licenseNumber)) {
      return 'License number should only contain letters, numbers, and hyphens';
    }
    return null;
  };

  const validateCompanyName = (companyName) => {
    if (!companyName || companyName.trim().length === 0) {
      return 'Company name is required';
    }
    if (companyName.trim().length < 2) {
      return 'Company name must be at least 2 characters';
    }
    if (companyName.trim().length > 100) {
      return 'Company name must be less than 100 characters';
    }
    return null;
  };

  const validateEducation = (education) => {
    if (education && education.trim().length > 200) {
      return 'Education must be less than 200 characters';
    }
    return null;
  };

  const validatePreviousWork = (previousWork) => {
    if (previousWork && previousWork.trim().length > 500) {
      return 'Previous work experience must be less than 500 characters';
    }
    return null;
  };

  const validateForm = (data) => {
    const newErrors = {};
    
    const nameError = validateName(data.name);
    if (nameError) newErrors.name = nameError;
    
    const emailError = validateEmail(data.email);
    if (emailError) newErrors.email = emailError;
    
    const phoneError = validatePhone(data.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    const locationError = validateLocation(data.location);
    if (locationError) newErrors.location = locationError;
    
    const bioError = validateBio(data.bio);
    if (bioError) newErrors.bio = bioError;
    
    const licenseError = validateLicenseNumber(data.licenseNumber);
    if (licenseError) newErrors.licenseNumber = licenseError;
    
    const companyError = validateCompanyName(data.companyName);
    if (companyError) newErrors.companyName = companyError;
    
    const educationError = validateEducation(data.education);
    if (educationError) newErrors.education = educationError;
    
    const previousWorkError = validatePreviousWork(data.previousWork);
    if (previousWorkError) newErrors.previousWork = previousWorkError;
    
    // Check if at least one specialization is selected
    if (!data.specialization || data.specialization.length === 0) {
      newErrors.specialization = 'Please select at least one specialization';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const specializationOptions = [
    'Rubber Trading',
    'Quality Assessment',
    'Price Analysis',
    'Market Research',
    'Contract Negotiation',
    'Export/Import',
    'Plantation Management',
    'Processing Consultation'
  ];

  const getVerificationBadge = (status) => {
    const badges = {
      verified: { color: 'bg-green-100 text-green-800', text: 'Verified', icon: Shield },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending', icon: Calendar },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected', icon: X }
    };
    
    const badge = badges[status] || badges.pending;
    const IconComponent = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <IconComponent className="h-4 w-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.show && (
        <motion.div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          {notification.message}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Broker Profile</h2>
            <p className="text-gray-600">Manage your professional information</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
              onClick={handleEdit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </motion.button>
          ) : (
            <div className="flex items-center space-x-2">
              <motion.button
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
                onClick={handleCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </motion.button>
              <motion.button
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200"
                onClick={handleSave}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            {/* Profile Image */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-3">{profileData.name}</h3>
              <p className="text-gray-600">{profileData.companyName}</p>
              <div className="mt-3">
                {getVerificationBadge(profileData.verificationStatus)}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-gray-600">Experience</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{profileData.experience}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-gray-600">Joined</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(profileData.joinedDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-gray-600">License</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{profileData.licenseNumber}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Detailed Information */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="space-y-8">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-500" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <div>
                        <div className="relative">
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                              errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {validating.name && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                            </div>
                          )}
                        </div>
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    {isEditing ? (
                      <div>
                        <div className="relative">
                          <input
                            type="tel"
                            value={editData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                              errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {validating.phone && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                            </div>
                          )}
                        </div>
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={editData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.location ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.location && (
                          <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.location}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {isEditing ? (
                    <div>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.bio ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.bio && (
                        <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.bio}</p>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary-500" />
                  Professional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={editData.licenseNumber}
                          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.licenseNumber && (
                          <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.licenseNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                    {isEditing ? (
                      <select
                        value={editData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="Less than 1 year">Less than 1 year</option>
                        <option value="1-3 years">1-3 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5-10 years">5-10 years</option>
                        <option value="More than 10 years">More than 10 years</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.experience}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={editData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.companyName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.companyName && (
                          <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.companyName}</p>
                    )}
                  </div>
                </div>
                
                {/* Specialization */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  {isEditing ? (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {specializationOptions.map((spec) => (
                          <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editData.specialization.includes(spec)}
                              onChange={() => handleSpecializationChange(spec)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{spec}</span>
                          </label>
                        ))}
                      </div>
                      {errors.specialization && (
                        <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profileData.specialization.map((spec) => (
                        <span
                          key={spec}
                          className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary-500" />
                  Additional Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={editData.education}
                          onChange={(e) => handleInputChange('education', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.education ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.education && (
                          <p className="mt-1 text-sm text-red-600">{errors.education}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.education}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Previous Work Experience</label>
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editData.previousWork}
                          onChange={(e) => handleInputChange('previousWork', e.target.value)}
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.previousWork ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.previousWork && (
                          <p className="mt-1 text-sm text-red-600">{errors.previousWork}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.previousWork}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BrokerProfile;
