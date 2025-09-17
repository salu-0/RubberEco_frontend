import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Mail, 
  ArrowRight, 
  Home,
  LogIn,
  RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';

const VerifySuccess = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to login after 5 seconds
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToHome = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative">
      <Navbar />

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated success elements */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-300 to-emerald-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-gradient-to-r from-teal-300 to-cyan-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-88 h-88 bg-gradient-to-r from-green-200 to-teal-200 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse animation-delay-4000"></div>

        {/* Success particles */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-green-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-emerald-400 rounded-full animate-bounce animation-delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-teal-400 rounded-full animate-bounce animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-bounce animation-delay-3000"></div>

        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
      </div>

      <div className="flex items-center justify-center p-4 relative z-10 min-h-screen pt-20">
        <motion.div
          className="relative w-full max-w-lg"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          {/* Success Card Shadow */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl blur-xl opacity-20 scale-105"></div>

          <motion.div
            className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 ring-1 ring-black/5"
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            {/* Success Icon */}
            <motion.div
              className="text-center mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                Email Verified!
              </h1>
              
              <p className="text-gray-600 text-lg">
                Your email has been successfully verified. You can now access your RubberEco account.
              </p>
            </motion.div>

            {/* Success Details */}
            <motion.div
              className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <Mail className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">
                  Verification Complete
                </h3>
              </div>
              
              <ul className="space-y-2 text-green-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Email address confirmed</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Account activated</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Ready to login</span>
                </li>
              </ul>
            </motion.div>

            {/* Auto-redirect Notice */}
            <motion.div
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                <p className="text-blue-800 font-medium">
                  Redirecting to login in {countdown} seconds...
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                onClick={handleGoToLogin}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogIn className="h-5 w-5" />
                <span>Go to Login</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                onClick={handleGoToHome}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center space-x-2 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="h-5 w-5" />
                <span>Go to Home</span>
              </motion.button>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <p className="text-sm text-gray-500">
                Having trouble? Contact our support team at{' '}
                <a 
                  href="mailto:support@rubbereco.com" 
                  className="text-green-600 hover:text-green-500 font-medium"
                >
                  support@rubbereco.com
                </a>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifySuccess;
