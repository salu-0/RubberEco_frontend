import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe
} from 'lucide-react';
import { supabase } from "../../supabaseClient";
import Navbar from '../Navbar';
import { useNavigationGuard } from '../../hooks/useNavigationGuard';
import EmailVerificationAlert from './EmailVerificationAlert';
import { useTranslation } from 'react-i18next';

const Login = () => {
  // const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const navigate = useNavigate();

  // Initialize navigation guard
  const { guardedNavigate, getUserData } = useNavigationGuard({
    preventBackToLogin: true,
    preventBackToHome: false
  });

  // Check if user is already authenticated and redirect
  useEffect(() => {
    const { user, isLoggedIn } = getUserData();
    if (isLoggedIn) {
      // Staff users always go to staff dashboard
      if (user?.role === 'staff' && user?.useStaffDashboard) {
        guardedNavigate('/staff-dashboard');
      }
      // Admin users always go to admin dashboard
      else if (user?.role === 'admin') {
        guardedNavigate('/admin-dashboard');
      }
      // Broker users always go to broker dashboard
      else if (user?.role === 'broker') {
        guardedNavigate('/broker-dashboard');
      }
      // Regular users go to home
      else {
        guardedNavigate('/home');
      }
    }
  }, [guardedNavigate, getUserData]);

  // Keep global language (for navbar), but form strings remain English

  // Enhanced validation functions
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

    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    return '';
  };

  // Real-time validation on field change
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
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
      email: true,
      password: true
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    // Longer timeout for success messages to let users read them
    const timeout = type === 'success' ? 3000 : 5000;
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), timeout);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // First, try MongoDB backend authentication
      const loginUrl = 'http://localhost:5000/api/auth/login';
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // MongoDB login successful
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Show success message with user's name and role
        const userName = data.user.name || 'User';
        const userRole = data.user.role || 'user';
        showNotification(`Welcome back, ${userName}! Redirecting to your ${userRole} dashboard...`, 'success');

        // Add delay to show success message before redirect
        const role = data.user.role ? data.user.role.toLowerCase().trim() : '';

        // Clear browser history to prevent back navigation to login
        window.history.replaceState(null, '', window.location.pathname);

        // Delay redirect to show success message
        setTimeout(() => {
          // Nursery admin users go to nursery admin dashboard
          if (role === 'nursery_admin') {
            localStorage.setItem('nurseryAdminToken', data.token);
            localStorage.setItem('nurseryAdminUser', JSON.stringify(data.user));
            localStorage.removeItem('redirectAfterLogin'); // Clean up any stored redirect
            guardedNavigate('/nursery-admin/dashboard');
          }
          // Staff users always go to staff dashboard, regardless of redirect
          else if (role === 'staff' && data.user.useStaffDashboard) {
            localStorage.removeItem('redirectAfterLogin'); // Clean up any stored redirect
            guardedNavigate('/staff-dashboard');
          }
          // Admin users always go to admin dashboard
          else if (role === 'admin') {
            localStorage.removeItem('redirectAfterLogin'); // Clean up any stored redirect
            guardedNavigate('/admin-dashboard');
          }
          // Broker users always go to broker dashboard
          else if (role === 'broker') {
            localStorage.removeItem('redirectAfterLogin'); // Clean up any stored redirect
            guardedNavigate('/broker-dashboard');
          }
          // Regular users can be redirected to training modules or home
          else {
            // Check if there's a redirect URL stored (from training module access)
            const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');

            if (redirectAfterLogin) {
              localStorage.removeItem('redirectAfterLogin'); // Clean up
              guardedNavigate(redirectAfterLogin);
            } else {
              guardedNavigate('/home');
            }
          }
        }, 1500); // 1.5 second delay to show success message

        return;
      }

      // If MongoDB login fails with 403 (email verification required)
      if (response.status === 403 && data.message?.includes('verify your email')) {
        console.log('📧 Email verification required for:', formData.email);
        
        // Show email verification alert
        setVerificationEmail(formData.email);
        setShowEmailVerification(true);
        setLoading(false);
        return;
      }

      // If MongoDB login fails with 403 (user not found), check if user exists in Supabase
      if (response.status === 403 && !data.message?.includes('verify your email')) {
        console.log('🔄 User not found in MongoDB, checking Supabase...');
        
        try {
          // Check if user exists in Supabase (OAuth user)
          const { data: supabaseUsers, error: supabaseError } = await supabase
            .from('users')
            .select('*')
            .eq('email', formData.email);

          if (supabaseUsers && supabaseUsers.length > 0 && !supabaseError) {
            // User exists in Supabase but not MongoDB - they need to use Google OAuth
            showNotification('This account was created with Google. Please use "Continue with Google" to sign in.', 'error');
            setLoading(false);
            return;
          }
        } catch (supabaseQueryError) {
          console.log('⚠️ Supabase query failed:', supabaseQueryError);
          // Continue with normal error handling
        }
      }

      // If we get here, the login failed for other reasons
      throw new Error(data.message || 'Login failed. Please try again.');

    } catch (error) {
      console.error('❌ Login error:', error);
      showNotification(error.message || 'Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;

    } catch (error) {
      showNotification(error.message || 'Google login failed. Please try again.', 'error');
      console.error('Google login error:', error);
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
              Welcome Back
            </h2>
            <p className="text-gray-600">Sign in to your RubberEco account</p>
          </div>

          {/* Language selection hidden on login; default is enforced to English */}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
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
              transition={{ delay: 0.2 }}
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
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
                      : fieldTouched.password && !errors.password
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50/50'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  disabled={loading || googleLoading}
                  autoComplete="current-password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
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
                    <p
                      id="password-error"
                      className="text-sm text-red-600 flex items-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      {errors.password}
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      Password meets requirements
                    </p>
                  )}
                </motion.div>
              )}
              
              {/* Forgot Password Link */}
              <div className="text-right mt-2">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary-600 hover:text-primary-500 transition-colors font-medium"
                >
                  Forgot your password?
                </Link>
              </div>
            </motion.div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
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

            {/* Google Login */}
            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: googleLoading ? 1 : 1.02 }}
              whileTap={{ scale: googleLoading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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

          {/* Sign Up Link */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
                >
                  Sign up as Farmer
                </Link>
              </p>
              <p className="text-gray-600">
                Are you a broker?{' '}
                <Link
                  to="/register-broker"
                  className="text-purple-600 hover:text-purple-500 font-medium transition-colors"
                >
                  Register as Broker
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
        </div>
      </div>

      {/* Email Verification Alert */}
      <EmailVerificationAlert
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        email={verificationEmail}
        onResendVerification={() => {
          // This will be handled by the EmailVerificationAlert component
        }}
      />
    </div>
  );
};

export default Login;
