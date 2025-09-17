import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  CreditCard,
  Briefcase,
  Building,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Navbar from '../Navbar';
import { nameValidator, isEmail, passwordStrength, phoneValidator, isRequired, validateSchema } from '../../utils/validation';

const BrokerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    experience: '',
    companyName: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const experienceOptions = [
    'Less than 1 year',
    '1-3 years',
    '3-5 years',
    '5-10 years',
    '10+ years'
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setFieldTouched(prev => ({ ...prev, [name]: true }));

    // Validate on blur using shared validators
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        error = nameValidator(value);
        break;
      case 'email':
        error = isEmail(value);
        break;
      case 'password':
        error = passwordStrength(value);
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (value !== formData.password) error = 'Passwords do not match';
        break;
      case 'phone':
        error = phoneValidator(value);
        break;
      case 'location':
        error = isRequired(value, 'Location is required');
        break;
      case 'experience':
        error = isRequired(value, 'Experience level is required');
        break;
      case 'companyName':
      case 'bio':
        error = '';
        break;
      default:
        error = '';
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const schema = {
      name: [(v) => nameValidator(v)],
      email: [(v) => isEmail(v)],
      password: [(v) => passwordStrength(v)],
      confirmPassword: [
        (v) => (v ? '' : 'Please confirm your password'),
        (v) => (v === formData.password ? '' : 'Passwords do not match')
      ],
      phone: [(v) => phoneValidator(v)],
      location: [(v) => isRequired(v, 'Location is required')],
      experience: [(v) => isRequired(v, 'Experience level is required')],
      // Optional fields left without validators
      companyName: [],
      bio: []
    };

    const newErrors = validateSchema(formData, schema);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Please fill in all required fields correctly.', 'error');
      return;
    }

    setLoading(true);

    try {
      const brokerData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        role: 'broker',
        bio: formData.bio?.trim() || '',
        
        // Broker-specific data
        brokerProfile: {
          experience: formData.experience?.trim() || '',
          specialization: ['Rubber Trading'], // Simplified for now
          companyName: formData.companyName?.trim() || '',
          companyAddress: '',
          education: '',
          previousWork: ''
        }
      };

      console.log('Sending broker data:', brokerData);
      console.log('Experience field value:', formData.experience);
      console.log('Broker profile:', brokerData.brokerProfile);
      
      // Additional validation before sending
      if (!brokerData.brokerProfile.experience) {
        console.error('Experience field is missing!');
        showNotification('Please select an experience level.', 'error');
        setLoading(false);
        return;
      }
      
      if (!brokerData.brokerProfile.specialization || brokerData.brokerProfile.specialization.length === 0) {
        console.error('Specialization is missing!');
        showNotification('Specialization is required.', 'error');
        setLoading(false);
        return;
      }

      // Try the backend server first, fallback to mock if needed
      const response = await fetch('http://localhost:5000/api/auth/register-broker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brokerData),
      });

      const data = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (response.ok) {
        showNotification('Registration successful! Please check your email for verification.', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setErrors({ submit: data.message || 'Registration failed' });
        showNotification(data.message || 'Registration failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = 'Network error. Please try again.';
      setErrors({ submit: errorMessage });
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 relative">
      <Navbar />

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary-300 to-primary-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-gradient-to-r from-accent-300 to-accent-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-88 h-88 bg-gradient-to-r from-secondary-300 to-secondary-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-primary-200 to-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>

        {/* Geometric patterns */}
        <div className="absolute top-32 right-32 w-32 h-32 border border-primary-200 rounded-lg rotate-45 opacity-30 animate-spin-slow"></div>
        <div className="absolute bottom-32 left-32 w-24 h-24 border border-accent-200 rounded-full opacity-40 animate-bounce-slow"></div>

        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
      </div>

      <div className="flex items-center justify-center p-4 relative z-10 min-h-screen pt-20">

        {/* Enhanced Notification */}
        {notification.show && (
          <motion.div
            className={`fixed top-20 right-4 z-[60] p-4 rounded-xl shadow-2xl backdrop-blur-md border-2 max-w-sm ${
              notification.type === 'error'
                ? 'bg-red-500/95 text-white border-red-300 shadow-red-500/25'
                : 'bg-green-500/95 text-white border-green-300 shadow-green-500/25'
            }`}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
          >
            <div className="flex items-start space-x-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
              >
                {notification.type === 'error' ? (
                  <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                )}
              </motion.div>
              <div className="flex-1">
                <motion.span
                  className="text-sm font-medium leading-relaxed block"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {notification.message}
                </motion.span>
              </div>
              <button
                onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                className="ml-2 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.div>
              </button>
            </div>
          </motion.div>
        )}

        <div className="relative w-full max-w-2xl">
          {/* Form shadow/glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-3xl blur-xl opacity-20 scale-105"></div>

          <motion.div
            className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 ring-1 ring-black/5"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <UserCheck className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                Become a Rubber Broker
              </h2>
              <p className="text-gray-600">Join our platform and connect with rubber farmers across Kerala</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-600" />
                  Basic Information
                </h3>

                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your full name"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                          errors.name
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
                            : fieldTouched.name && !errors.name
                              ? 'border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50/50'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {fieldTouched.name && (
                      <div className="mt-2">
                        {errors.name ? (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.name}
                          </p>
                        ) : (
                          <p className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            Name looks good
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your email address"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                          errors.email
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
                            : fieldTouched.email && !errors.email
                              ? 'border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50/50'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {fieldTouched.email && (
                      <div className="mt-2">
                        {errors.email ? (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.email}
                          </p>
                        ) : (
                          <p className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            Email format is valid
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Password and Confirm Password Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Create a strong password"
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                          errors.password
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
                            : fieldTouched.password && !errors.password
                              ? 'border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50/50'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {fieldTouched.password && (
                      <div className="mt-2">
                        {errors.password ? (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.password}
                          </p>
                        ) : (
                          <p className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            Password strength is good
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Confirm your password"
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                          errors.confirmPassword
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
                            : fieldTouched.confirmPassword && !errors.confirmPassword
                              ? 'border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50/50'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {fieldTouched.confirmPassword && (
                      <div className="mt-2">
                        {errors.confirmPassword ? (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.confirmPassword}
                          </p>
                        ) : (
                          <p className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            Passwords match
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone and Location Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your phone number"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                          errors.phone
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
                            : fieldTouched.phone && !errors.phone
                              ? 'border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50/50'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {fieldTouched.phone && (
                      <div className="mt-2">
                        {errors.phone ? (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.phone}
                          </p>
                        ) : (
                          <p className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            Phone number is valid
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Location Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="City, State"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                          errors.location
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
                            : fieldTouched.location && !errors.location
                              ? 'border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50/50'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {fieldTouched.location && (
                      <div className="mt-2">
                        {errors.location ? (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.location}
                          </p>
                        ) : (
                          <p className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            Location is valid
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary-600" />
                  Professional Information
                </h3>

                {/* Experience Field */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                          errors.experience
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
                            : fieldTouched.experience && !errors.experience
                              ? 'border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50/50'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                        disabled={loading}
                      >
                        <option value="">Select experience level</option>
                        {experienceOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    {fieldTouched.experience && (
                      <div className="mt-2">
                        {errors.experience ? (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.experience}
                          </p>
                        ) : (
                          <p className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            Experience level selected
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Name and Bio */}
                <div className="space-y-6">
                  {/* Company Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your company name"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                          errors.companyName
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
                            : fieldTouched.companyName && !errors.companyName
                              ? 'border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50/50'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {fieldTouched.companyName && formData.companyName.trim() && (
                      <div className="mt-2">
                        {errors.companyName ? (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.companyName}
                          </p>
                        ) : (
                          <p className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            Company name is valid
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Professional Bio Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Tell us about yourself and your expertise in the rubber industry"
                      rows="4"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none ${
                        errors.bio
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
                          : fieldTouched.bio && !errors.bio
                            ? 'border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50/50'
                            : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      }`}
                      disabled={loading}
                    />
                    {fieldTouched.bio && formData.bio.trim() && (
                      <div className="mt-2">
                        {errors.bio ? (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.bio}
                          </p>
                        ) : (
                          <p className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            Bio looks good
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>


              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-6 w-6 mr-3" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-6 w-6 mr-3" />
                    Register as Broker
                  </>
                )}
              </motion.button>

              {errors.submit && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    {errors.submit}
                  </p>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-200 mt-8">
              <div className="space-y-2">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
                <p className="text-gray-600">
                  Want to register as a farmer?{' '}
                  <Link
                    to="/register"
                    className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
                  >
                    Farmer Registration
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BrokerRegister;
