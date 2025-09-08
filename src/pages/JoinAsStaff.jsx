import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Upload,
  FileText,
  Briefcase,
  Award,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Camera,
  Shield
} from 'lucide-react';

const JoinAsStaff = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    presentAddress: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    permanentAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      sameAsPresent: false
    },
    qualification: '',
    workExperience: '',
    skills: '',
    applyForPosition: '',
    additionalNotes: '',
    photo: null,
    idProof: null,
    resume: null
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const positions = [
    { value: 'tapper', label: 'Rubber Tapper' },
    { value: 'latex_collector', label: 'Latex Collector' },
    { value: 'supervisor', label: 'Field Supervisor' },
    { value: 'field_officer', label: 'Field Officer' },
    { value: 'trainer', label: 'Training Specialist' },
    { value: 'skilled_worker', label: 'Skilled Worker' },
    { value: 'manager', label: 'Operations Manager' }
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (field, file) => {
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [field]: 'File size must be less than 5MB' }));
        return;
      }
      
      // Validate file type
      const allowedTypes = {
        photo: ['image/jpeg', 'image/png', 'image/jpg'],
        idProof: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      };
      
      if (!allowedTypes[field].includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          [field]: `Invalid file type. Allowed: ${allowedTypes[field].join(', ')}` 
        }));
        return;
      }
      
      setFormData(prev => ({ ...prev, [field]: file }));
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      // Phone validation
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (formData.phone && !phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }
    
    if (step === 2) {
      if (!formData.presentAddress.street.trim()) newErrors['presentAddress.street'] = 'Street address is required';
      if (!formData.presentAddress.city.trim()) newErrors['presentAddress.city'] = 'City is required';
      if (!formData.presentAddress.state.trim()) newErrors['presentAddress.state'] = 'State is required';
      if (!formData.presentAddress.pincode.trim()) newErrors['presentAddress.pincode'] = 'Pincode is required';
      
      if (!formData.permanentAddress.sameAsPresent) {
        if (!formData.permanentAddress.street.trim()) newErrors['permanentAddress.street'] = 'Street address is required';
        if (!formData.permanentAddress.city.trim()) newErrors['permanentAddress.city'] = 'City is required';
        if (!formData.permanentAddress.state.trim()) newErrors['permanentAddress.state'] = 'State is required';
        if (!formData.permanentAddress.pincode.trim()) newErrors['permanentAddress.pincode'] = 'Pincode is required';
      }
    }
    
    if (step === 3) {
      if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
      if (!formData.applyForPosition) newErrors.applyForPosition = 'Please select a position';
      if (!formData.photo) newErrors.photo = 'Photo is required';
      if (!formData.idProof) newErrors.idProof = 'ID proof is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🚀 Form submission started');
    console.log('📋 Current form data:', formData);

    if (!validateStep(3)) {
      console.log('❌ Validation failed for step 3');
      console.log('🔍 Current errors:', errors);
      return;
    }

    console.log('✅ Validation passed, proceeding with submission');
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'presentAddress' || key === 'permanentAddress') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'photo' || key === 'idProof' || key === 'resume') {
          if (formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      console.log('🌐 API URL:', `${API_BASE_URL}/staff-requests`);
      console.log('📤 Sending form data...');

      const response = await fetch(`${API_BASE_URL}/staff-requests`, {
        method: 'POST',
        body: formDataToSend
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Success response:', responseData);
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        console.log('❌ Error response:', errorData);
        throw new Error(errorData.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('💥 Submission error:', error);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      setErrors({ submit: error.message });
    } finally {
      console.log('🏁 Form submission completed');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for your interest in joining RubberEco. Your application has been submitted successfully and is under review.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 font-medium mb-2">📧 Confirmation Email Sent</p>
            <p className="text-sm text-blue-700">
              A confirmation email has been sent to your registered email address with your application details.
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Our administrative team will review your application and you can expect to hear back from us within <strong>3-5 business days</strong>.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Address', icon: MapPin },
    { number: 3, title: 'Professional', icon: Briefcase }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-600">
            Apply to become a part of RubberEco's professional staff
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-primary-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.gender ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Address Information</h2>

                {/* Present Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Present Address</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={formData.presentAddress.street}
                        onChange={(e) => handleInputChange('presentAddress.street', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors['presentAddress.street'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="House/Flat No., Street Name"
                      />
                      {errors['presentAddress.street'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['presentAddress.street']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        value={formData.presentAddress.city}
                        onChange={(e) => handleInputChange('presentAddress.city', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors['presentAddress.city'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="City"
                      />
                      {errors['presentAddress.city'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['presentAddress.city']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <input
                        type="text"
                        value={formData.presentAddress.state}
                        onChange={(e) => handleInputChange('presentAddress.state', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors['presentAddress.state'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="State"
                      />
                      {errors['presentAddress.state'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['presentAddress.state']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                      <input
                        type="text"
                        value={formData.presentAddress.pincode}
                        onChange={(e) => handleInputChange('presentAddress.pincode', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors['presentAddress.pincode'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Pincode"
                      />
                      {errors['presentAddress.pincode'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['presentAddress.pincode']}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Permanent Address */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Permanent Address</h3>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permanentAddress.sameAsPresent}
                        onChange={(e) => {
                          handleInputChange('permanentAddress.sameAsPresent', e.target.checked);
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              permanentAddress: {
                                ...prev.presentAddress,
                                sameAsPresent: true
                              }
                            }));
                          }
                        }}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600">Same as present address</span>
                    </label>
                  </div>

                  {!formData.permanentAddress.sameAsPresent && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={formData.permanentAddress.street}
                          onChange={(e) => handleInputChange('permanentAddress.street', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors['permanentAddress.street'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="House/Flat No., Street Name"
                        />
                        {errors['permanentAddress.street'] && (
                          <p className="text-red-500 text-sm mt-1">{errors['permanentAddress.street']}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                        <input
                          type="text"
                          value={formData.permanentAddress.city}
                          onChange={(e) => handleInputChange('permanentAddress.city', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors['permanentAddress.city'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="City"
                        />
                        {errors['permanentAddress.city'] && (
                          <p className="text-red-500 text-sm mt-1">{errors['permanentAddress.city']}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                        <input
                          type="text"
                          value={formData.permanentAddress.state}
                          onChange={(e) => handleInputChange('permanentAddress.state', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors['permanentAddress.state'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="State"
                        />
                        {errors['permanentAddress.state'] && (
                          <p className="text-red-500 text-sm mt-1">{errors['permanentAddress.state']}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                        <input
                          type="text"
                          value={formData.permanentAddress.pincode}
                          onChange={(e) => handleInputChange('permanentAddress.pincode', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors['permanentAddress.pincode'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Pincode"
                        />
                        {errors['permanentAddress.pincode'] && (
                          <p className="text-red-500 text-sm mt-1">{errors['permanentAddress.pincode']}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Professional Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Information</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualification *
                    </label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => handleInputChange('qualification', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.qualification ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Your highest qualification"
                    />
                    {errors.qualification && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.qualification}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Experience
                    </label>
                    <input
                      type="text"
                      value={formData.workExperience}
                      onChange={(e) => handleInputChange('workExperience', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Years of experience or 'Fresher'"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <textarea
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="List your relevant skills (comma separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apply for Position *
                  </label>
                  <select
                    value={formData.applyForPosition}
                    onChange={(e) => handleInputChange('applyForPosition', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.applyForPosition ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a position</option>
                    {positions.map(position => (
                      <option key={position.value} value={position.value}>
                        {position.label}
                      </option>
                    ))}
                  </select>
                  {errors.applyForPosition && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.applyForPosition}
                    </p>
                  )}
                  {formData.applyForPosition === 'latex_collector' && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Latex Collector:</strong> Specialized role for collecting latex after skilled tappers have tapped the trees.
                        This allows tappers to focus on the skilled tapping work while collectors efficiently gather the latex from multiple trees.
                        Ideal for workers who want to support the tapping process without requiring advanced tapping skills.
                      </p>
                    </div>
                  )}
                </div>

                {/* File Uploads */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo * <span className="text-xs text-gray-500">(JPG, PNG - Max 5MB)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => handleFileUpload('photo', e.target.files[0])}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className={`w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          errors.photo ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {formData.photo ? formData.photo.name : 'Upload Photo'}
                        </span>
                      </label>
                    </div>
                    {errors.photo && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.photo}
                      </p>
                    )}
                  </div>

                  {/* ID Proof Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Proof * <span className="text-xs text-gray-500">(JPG, PNG, PDF - Max 5MB)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        onChange={(e) => handleFileUpload('idProof', e.target.files[0])}
                        className="hidden"
                        id="idproof-upload"
                      />
                      <label
                        htmlFor="idproof-upload"
                        className={`w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          errors.idProof ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <FileText className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {formData.idProof ? formData.idProof.name : 'Upload ID Proof'}
                        </span>
                      </label>
                    </div>
                    {errors.idProof && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.idProof}
                      </p>
                    )}
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume <span className="text-xs text-gray-500">(PDF, DOC - Max 5MB)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => handleFileUpload('resume', e.target.files[0])}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {formData.resume ? formData.resume.name : 'Upload Resume (Optional)'}
                        </span>
                      </label>
                    </div>
                    {errors.resume && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.resume}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.additionalNotes || ''}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>
              </div>
            )}

            {/* Display submission errors */}
            {errors.submit && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => console.log('🖱️ Submit button clicked!')}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinAsStaff;
