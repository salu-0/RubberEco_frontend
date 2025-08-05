import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe
} from 'lucide-react';
import { supabase } from "../../supabaseClient"; 
import Navbar from '../Navbar';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();



  // Enhanced validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return 'Full name is required';
    }

    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }

    if (name.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }

    // Check for valid name characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name.trim())) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    }

    // More comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    if (email.length > 254) {
      return 'Email address is too long';
    }

    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (password.length > 128) {
      return 'Password must be less than 128 characters';
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Password must contain at least one special character';
    }

    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }

    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }

    return '';
  };

  // Real-time validation on field change
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(value, formData.password);
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation only if field has been touched
    if (fieldTouched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }

    // Special case: if password changes, revalidate confirm password
    if (name === 'password' && fieldTouched.confirmPassword) {
      const confirmError = validateConfirmPassword(formData.confirmPassword, value);
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Mark field as touched
    setFieldTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate all fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Mark all fields as touched
    setFieldTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // First, sign up with supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'farmer'
          }
        }
      });

      if (error) throw error;

      // Then, insert user data into MongoDB via backend API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'farmer'
        })
      });

      const backendData = await response.json();

      if (!response.ok) {
        throw new Error(backendData.message || 'Registration failed on backend. Please try again.');
      }

      showNotification('Registration successful! Please check your email to verify your account.', 'success');
      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      showNotification(error.message || 'Registration failed. Please try again.', 'error');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      // Google signup with redirect to home page for new registrations
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?source=register`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;

    } catch (error) {
      showNotification(error.message || 'Google signup failed. Please try again.', 'error');
      console.error('Google signup error:', error);
      setGoogleLoading(false);
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

      {/* Notification */}
      {notification.show && (
        <motion.div
          className={`fixed top-20 right-4 z-[60] p-4 rounded-xl shadow-lg backdrop-blur-md border ${
            notification.type === 'error'
              ? 'bg-red-500/90 text-white border-red-400'
              : 'bg-green-500/90 text-white border-green-400'
          }`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'error' ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              className="ml-2 text-white hover:text-gray-200 transition-colors"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      <div className="relative w-full max-w-md">
        {/* Form shadow/glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-3xl blur-xl opacity-20 scale-105"></div>

        <motion.div
          className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 ring-1 ring-black/5"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
              Join RubberEco
            </h2>
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Name Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
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
                  disabled={loading || googleLoading}
                  autoComplete="name"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
              </div>
              {fieldTouched.name && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2"
                >
                  {errors.name ? (
                    <p
                      id="name-error"
                      className="text-sm text-red-600 flex items-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      {errors.name}
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      Name looks good
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
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
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
                      : fieldTouched.email && !errors.email
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50/50'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  disabled={loading || googleLoading}
                  autoComplete="email"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {fieldTouched.email && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2"
                >
                  {errors.email ? (
                    <p
                      id="email-error"
                      className="text-sm text-red-600 flex items-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      {errors.email}
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      Email format is valid
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>



            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
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
                  placeholder="Create a password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
                      : fieldTouched.password && !errors.password
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50/50'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  disabled={loading || googleLoading}
                  autoComplete="new-password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldTouched.password && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2"
                >
                  {errors.password ? (
                    <div>
                      <p
                        id="password-error"
                        className="text-sm text-red-600 flex items-center mb-2"
                      >
                        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        {errors.password}
                      </p>
                      {/* Password requirements checklist */}
                      <div className="text-xs space-y-1">
                        <div className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircle className={`h-3 w-3 mr-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`} />
                          At least 8 characters
                        </div>
                        <div className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircle className={`h-3 w-3 mr-1 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                          One lowercase letter
                        </div>
                        <div className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircle className={`h-3 w-3 mr-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                          One uppercase letter
                        </div>
                        <div className={`flex items-center ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircle className={`h-3 w-3 mr-1 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                          One number
                        </div>
                        <div className={`flex items-center ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircle className={`h-3 w-3 mr-1 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                          One special character
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      Strong password! All requirements met
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
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
                  disabled={loading || googleLoading}
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldTouched.confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2"
                >
                  {errors.confirmPassword ? (
                    <p
                      id="confirm-password-error"
                      className="text-sm text-red-600 flex items-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      {errors.confirmPassword}
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      Passwords match perfectly
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Register Button */}
            <motion.button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Signup */}
            <motion.button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading || googleLoading}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: googleLoading ? 1 : 1.02 }}
              whileTap={{ scale: googleLoading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Globe className="w-5 h-5" />
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Sign In Link */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-gray-600">
                Want to register as a broker?{' '}
                <Link
                  to="/register-broker"
                  className="text-purple-600 hover:text-purple-500 font-medium transition-colors"
                >
                  Broker Registration
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
