import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Video,
  Users,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
  Download,
  Star,
  Lock,
  Leaf
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useNavigationGuard } from '../hooks/useNavigationGuard';
import TrainingRegistration from '../components/Farmer/TrainingRegistration';
import EnrollmentSync from '../components/EnrollmentSync';
import PracticalTraining from './PracticalTraining';
import { getUserData } from '../utils/api';

const Training = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrainingEnrollmentOpen, setIsTrainingEnrollmentOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isEnrollmentSyncOpen, setIsEnrollmentSyncOpen] = useState(false);
  const [isPracticalTrainingOpen, setIsPracticalTrainingOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  // Initialize navigation guard
  const { getUserData } = useNavigationGuard();

  // Check for payment cancellation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cancelled') === 'true') {
      setNotification({
        show: true,
        message: 'Payment was cancelled. You can try enrolling again.',
        type: 'warning'
      });

      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);

      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'info' });
      }, 5000);
    }
  }, []);

  // Handle deep links via hash to auto-browse modules or open practical schedules
  useEffect(() => {
    const applyHashAction = () => {
      const hash = window.location.hash;
      if (hash === '#browse') {
        const modulesSection = document.getElementById('training-modules');
        if (modulesSection) {
          modulesSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (hash === '#practical') {
        setIsPracticalTrainingOpen(true);
      }
    };

    // Run on mount
    applyHashAction();

    // Respond to hash changes
    window.addEventListener('hashchange', applyHashAction);
    return () => window.removeEventListener('hashchange', applyHashAction);
  }, []);

  // Check authentication status
  useEffect(() => {
    const { user, isLoggedIn } = getUserData();

    // Staff users should be redirected to their dashboard
    if (isLoggedIn && user?.role === 'staff' && user?.useStaffDashboard) {
      navigate('/staff-dashboard', { replace: true });
      return;
    }

    // Admin users should be redirected to their dashboard
    if (isLoggedIn && user?.role === 'admin') {
      navigate('/admin-dashboard', { replace: true });
      return;
    }

    // Broker users should be redirected to their dashboard
    if (isLoggedIn && user?.role === 'broker') {
      navigate('/broker-dashboard', { replace: true });
      return;
    }

    setIsAuthenticated(isLoggedIn);
    setIsLoading(false);

  }, [getUserData, navigate]);

  // Handle module access - redirect to login if not authenticated, all video modules are now free
  const handleModuleAccess = (moduleId) => {
    if (!isAuthenticated) {
      // Store the intended destination for redirect after login
      localStorage.setItem('redirectAfterLogin', `/training/${moduleId}`);
      navigate('/login');
      return;
    }

    // Find the module
    const module = trainingModules.find(m => m.id === moduleId);
    if (!module) {
      console.error('Module not found:', moduleId);
      return;
    }

    // All video training modules are now free - navigate directly
    navigate(`/training/${moduleId}`);
  };
  const trainingModules = [
    {
      id: 1,
      title: "Rubber Tapping Fundamentals",
      description: "Learn the basics of proper rubber tapping techniques and best practices.",
      duration: "2 hours",
      level: "Beginner",
      icon: <BookOpen className="h-6 w-6" />,
      lessons: 8,
      rating: 4.8,
      price: 0,
      isFree: true
    },
    {
      id: 2,
      title: "Plantation Management",
      description: "Comprehensive guide to managing rubber plantations efficiently.",
      duration: "3 hours",
      level: "Intermediate",
      icon: <Users className="h-6 w-6" />,
      lessons: 12,
      rating: 4.9,
      price: 0,
      isFree: true
    },
    {
      id: 3,
      title: "Disease Prevention & Treatment",
      description: "Identify and treat common rubber tree diseases and pests.",
      duration: "1.5 hours",
      level: "Advanced",
      icon: <Award className="h-6 w-6" />,
      lessons: 6,
      rating: 4.7,
      price: 0,
      isFree: true
    },
    {
      id: 4,
      title: "Market Analysis & Pricing",
      description: "Understanding rubber market trends and optimal selling strategies.",
      duration: "2.5 hours",
      level: "Intermediate",
      icon: <Video className="h-6 w-6" />,
      lessons: 10,
      rating: 4.6,
      price: 0,
      isFree: true
    }
  ];

  const features = [
    {
      icon: <Video className="h-8 w-8" />,
      title: "Video Tutorials",
      description: "High-quality video content with expert demonstrations"
    },
    {
      icon: <Download className="h-8 w-8" />,
      title: "Downloadable Resources",
      description: "PDF guides, checklists, and reference materials"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Certification",
      description: "Earn certificates upon completion of training modules"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Expert Support",
      description: "Get help from experienced rubber plantation professionals"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Notification */}
      {notification.show && (
        <motion.div
          className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            notification.type === 'warning' ? 'bg-yellow-100 border border-yellow-400 text-yellow-800' :
            notification.type === 'error' ? 'bg-red-100 border border-red-400 text-red-800' :
            'bg-blue-100 border border-blue-400 text-blue-800'
          }`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          <p className="text-sm font-medium">{notification.message}</p>
        </motion.div>
      )}
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                {t('training.heading')}
              </span>
              <br />
              <span className="text-gray-900">{t('training.heading2')}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('training.heroSub')}
            </p>
            <div className="flex justify-center">
              {isAuthenticated ? (
                <motion.button
                  onClick={() => {
                    // Scroll to training modules section
                    const modulesSection = document.getElementById('training-modules');
                    if (modulesSection) {
                      modulesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 inline-flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{t('training.browseModules')}</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              ) : (
                <Link to="/login">
                  <motion.button
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 inline-flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{t('training.loginToStart')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Training Modules */}
      <section id="training-modules" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('training.modulesTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('training.modulesSub')}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {trainingModules.map((module, index) => (
              <motion.div
                key={module.id}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          module.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                          module.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {module.level}
                        </span>
                        {!module.isFree && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                            ₹{module.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{module.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{module.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{module.lessons} {t('training.lessons')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{module.rating}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleModuleAccess(module.id)}
                      className={`w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                        !isAuthenticated
                          ? 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg'
                      }`}
                    >
                      {!isAuthenticated && <Lock className="w-4 h-4" />}
                      <span>
                        {!isAuthenticated
                          ? t('training.loginToAccess')
                          : t('training.startModule')
                        }
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('training.featuresTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('training.featuresSub')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Practical Training Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('training.practicalTitle')}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {t('training.practicalSub')}
            </p>
            <motion.button
              onClick={() => setIsPracticalTrainingOpen(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 inline-flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-5 h-5" />
              <span>{t('training.viewSchedules')}</span>
            </motion.button>
          </motion.div>

          {/* Quick Preview Cards - All Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Rubber Tapping */}
            <motion.div
              className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rubber Tapping</h3>
              <p className="text-gray-600 mb-4">5-day intensive hands-on training</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>Dec 15-20, 2024</span>
              </div>
            </motion.div>

            {/* Plantation Management */}
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Plantation Management</h3>
              <p className="text-gray-600 mb-4">3-day comprehensive field training</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>Dec 22-24, 2024</span>
              </div>
            </motion.div>

            {/* Disease Control */}
            <motion.div
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Disease Control</h3>
              <p className="text-gray-600 mb-4">2-day practical workshop</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>Jan 5-6, 2025</span>
              </div>
            </motion.div>

            {/* Harvesting */}
            <motion.div
              className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white mb-4">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Harvesting</h3>
              <p className="text-gray-600 mb-4">4-day latex collection training</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>Jan 8-11, 2025</span>
              </div>
            </motion.div>

            {/* Equipment Maintenance */}
            <motion.div
              className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Equipment Maintenance</h3>
              <p className="text-gray-600 mb-4">3-day machinery & tools workshop</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>Jan 15-17, 2025</span>
              </div>
            </motion.div>

            {/* Safety Protocols */}
            <motion.div
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Safety Protocols</h3>
              <p className="text-gray-600 mb-4">2-day safety & emergency training</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>Jan 20-21, 2025</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Training Enrollment Modal */}
      <TrainingRegistration
        isOpen={isTrainingEnrollmentOpen}
        onClose={() => {
          setIsTrainingEnrollmentOpen(false);
          setSelectedModule(null);
        }}
        selectedModule={selectedModule}
        onEnrollmentSuccess={(moduleId) => {
          // After successful enrollment and payment, navigate to the module
          setIsTrainingEnrollmentOpen(false);
          setSelectedModule(null);
          navigate(`/training/${moduleId}`);
        }}
      />

      {/* Enrollment Sync Modal */}
      {isEnrollmentSyncOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Enrollment Management</h2>
              <button
                onClick={() => setIsEnrollmentSyncOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <EnrollmentSync />
            </div>
          </motion.div>
        </div>
      )}

      {/* Practical Training Modal */}
      {isPracticalTrainingOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <button
                onClick={() => setIsPracticalTrainingOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <PracticalTraining />
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2024 RubberEco. All rights reserved. Empowering sustainable rubber farming.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Training;
