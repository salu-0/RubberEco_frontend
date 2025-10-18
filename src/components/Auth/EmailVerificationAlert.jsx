import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  X, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ExternalLink 
} from 'lucide-react';

const EmailVerificationAlert = ({ 
  isOpen, 
  onClose, 
  email, 
  onResendVerification 
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const response = await fetch('https://rubbereco-backend.onrender.com/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        throw new Error('Failed to resend verification email');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600">
              We've sent a verification link to your email address
            </p>
          </div>

          {/* Email Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Email:</span>
              <span className="text-sm text-gray-900 font-mono">{email}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <p className="text-sm text-gray-700">
                Check your email inbox (and spam folder) for a message from RubberEco
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <p className="text-sm text-gray-700">
                Click the "Verify Email" button in the email
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <p className="text-sm text-gray-700">
                Return here and try logging in again
              </p>
            </div>
          </div>

          {/* Resend Section */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the email?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleResendVerification}
                disabled={isResending || resendSuccess}
                className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : resendSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Sent!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Resend Email</span>
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {resendSuccess && (
              <motion.div
                className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Verification email sent successfully!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Having trouble? Contact our support team at{' '}
              <a 
                href="mailto:support@rubbereco.com" 
                className="text-orange-600 hover:text-orange-500 font-medium"
              >
                support@rubbereco.com
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailVerificationAlert;
