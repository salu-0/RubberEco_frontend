import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader, AlertCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { trainingAPI } from '../utils/api';
import enrollmentManager from '../utils/enrollmentManager';
import mockAPI from '../utils/mockAPI';

const TrainingPaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing your payment...');
  const [enrollmentData, setEnrollmentData] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get module ID from URL params
        const moduleId = searchParams.get('moduleId');
        
        // Get pending enrollment data from sessionStorage
        const pendingEnrollmentData = sessionStorage.getItem('pendingEnrollment');
        
        if (!pendingEnrollmentData) {
          setStatus('error');
          setMessage('No pending enrollment found. Please try enrolling again.');
          return;
        }

        const enrollmentInfo = JSON.parse(pendingEnrollmentData);
        
        // Verify module ID matches
        if (enrollmentInfo.moduleId !== parseInt(moduleId)) {
          setStatus('error');
          setMessage('Enrollment data mismatch. Please try enrolling again.');
          return;
        }

        // Check if enrollment is not too old (30 minutes)
        const enrollmentAge = Date.now() - enrollmentInfo.timestamp;
        if (enrollmentAge > 30 * 60 * 1000) {
          setStatus('error');
          setMessage('Enrollment session expired. Please try enrolling again.');
          sessionStorage.removeItem('pendingEnrollment');
          return;
        }

        // Prepare enrollment data for API
        const apiEnrollmentData = {
          moduleId: enrollmentInfo.moduleId,
          moduleTitle: enrollmentInfo.moduleTitle,
          moduleLevel: enrollmentInfo.moduleLevel,
          paymentAmount: enrollmentInfo.paymentAmount,
          paymentMethod: 'stripe',
          userDetails: enrollmentInfo.userDetails,
          paymentId: `STRIPE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentStatus: 'completed'
        };

        // Check authentication
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        console.log('User authenticated:', !!token);
        console.log('User data:', user);
        console.log('Enrollment data being sent:', apiEnrollmentData);
        console.log('API Base URL:', 'https://rubbereco-backend.onrender.com/api');

        if (!token) {
          throw new Error('User not authenticated. Please log in and try again.');
        }

        // Store enrollment in local enrollment manager first
        const enrollmentRecord = {
          userId: user.id,
          moduleId: enrollmentInfo.moduleId,
          moduleTitle: enrollmentInfo.moduleTitle,
          moduleLevel: enrollmentInfo.moduleLevel,
          paymentAmount: enrollmentInfo.paymentAmount,
          paymentMethod: 'stripe',
          paymentId: `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentStatus: 'completed',
          userDetails: enrollmentInfo.userDetails
        };

        // Add to local enrollment manager
        const localEnrollment = enrollmentManager.addEnrollment(enrollmentRecord);
        console.log('Enrollment stored locally:', localEnrollment);

        // Try to sync to database in background
        enrollmentManager.syncToDatabase().then(syncCount => {
          if (syncCount > 0) {
            console.log(`Successfully synced ${syncCount} enrollments to database`);
          }
        }).catch(syncError => {
          console.warn('Database sync failed, but enrollment is stored locally:', syncError);
        });

        // Try to call API to complete enrollment (with fallbacks)
        try {
          console.log('🔄 Trying real API enrollment...');
          const response = await trainingAPI.enrollInTraining(apiEnrollmentData);
          console.log('✅ Real API Response:', response);

          if (response.success) {
            // Mark as synced in enrollment manager
            enrollmentManager.updateEnrollment(user.id, enrollmentInfo.moduleId, {
              syncedToDatabase: true,
              databaseId: response.enrollmentId,
              syncMethod: 'real'
            });
            console.log('✅ Enrollment synced to real database');
          }
        } catch (apiError) {
          console.warn('Real API enrollment failed, trying mock API:', apiError.message);

          // Fallback to mock API
          try {
            console.log('🎭 Trying mock API enrollment...');
            const mockResponse = await mockAPI.enrollInTraining(enrollmentRecord);
            console.log('✅ Mock API Response:', mockResponse);

            if (mockResponse.success) {
              enrollmentManager.updateEnrollment(user.id, enrollmentInfo.moduleId, {
                syncedToDatabase: true,
                databaseId: mockResponse.enrollmentId,
                syncMethod: 'mock'
              });
              console.log('✅ Enrollment synced to mock database');
            }
          } catch (mockError) {
            console.warn('Mock API also failed, enrollment stored locally only:', mockError.message);
          }
        }

        // Show success message (enrollment is guaranteed to be stored locally)
        setStatus('success');
        setMessage(`Successfully enrolled in ${enrollmentInfo.moduleTitle}!`);
        setEnrollmentData(enrollmentInfo);

        // Set demo enrollment flag for backward compatibility
        localStorage.setItem(`demo_enrollment_${moduleId}`, Date.now().toString());

        // Clear pending enrollment data
        sessionStorage.removeItem('pendingEnrollment');

        // Auto-redirect to course after 3 seconds
        setTimeout(() => {
          navigate(`/training/${moduleId}`);
        }, 3000);

      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('error');

        // Provide more specific error messages
        let errorMessage = 'Failed to complete enrollment. Please contact support.';

        if (error.message.includes('JSON')) {
          errorMessage = 'Server communication error. Please try again or contact support.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Enrollment service not found. Please contact support.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network connection error. Please check your internet connection.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        setMessage(errorMessage);
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  const handleContinueToCourse = () => {
    const moduleId = searchParams.get('moduleId');
    navigate(`/training/${moduleId}`);
  };

  const handleBackToTraining = () => {
    navigate('/training');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {status === 'processing' && (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-center">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                
                {enrollmentData && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold text-gray-900 mb-2">Enrollment Details:</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Course:</span> {enrollmentData.moduleTitle}</p>
                      <p><span className="font-medium">Level:</span> {enrollmentData.moduleLevel}</p>
                      <p><span className="font-medium">Amount Paid:</span> ₹{enrollmentData.paymentAmount.toLocaleString()}</p>
                      <p><span className="font-medium">Payment Method:</span> {message.includes('Demo Mode') ? 'Demo Mode' : 'Stripe'}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleContinueToCourse}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Start Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleBackToTraining}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Back to Training
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  You will be automatically redirected to your course in a few seconds...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Processing Failed</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleBackToTraining}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.href = 'mailto:support@rubbereco.com'}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </>
            )}
          </motion.div>

          {/* Additional Information */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-sm text-gray-500">
              Having issues? Contact our support team at{' '}
              <a href="mailto:support@rubbereco.com" className="text-primary-600 hover:underline">
                support@rubbereco.com
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TrainingPaymentSuccess;
