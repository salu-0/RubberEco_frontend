import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trainingAPI } from '../../utils/api';
import enrollmentManager from '../../utils/enrollmentManager';
import { autoPopulateForm, showProfilePopulationNotification } from '../../utils/userProfileUtils';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  X,
  Send,
  Eye,
  Star,
  Filter,
  Search,
  Play,
  Download,
  Plus
} from 'lucide-react';

const TrainingRegistration = ({ isOpen, onClose, selectedModule, onEnrollmentSuccess }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(selectedModule ? 'module-enrollment' : 'available-programs');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [enrollmentForm, setEnrollmentForm] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    motivation: ''
  });
  const [autoPopulatedFields, setAutoPopulatedFields] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script once
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay');
    document.body.appendChild(script);
  }, []);

  // Available Training Programs (removed static data)
  const [availablePrograms, setAvailablePrograms] = useState([]);

  // My Registrations (will be populated from API)
  const [myRegistrations, setMyRegistrations] = useState([]);

  const [filteredPrograms, setFilteredPrograms] = useState(availablePrograms);

  useEffect(() => {
    filterPrograms();
  }, [searchTerm, categoryFilter, levelFilter, availablePrograms]);

  const filterPrograms = () => {
    let filtered = [...availablePrograms];

    if (searchTerm) {
      filtered = filtered.filter(program =>
        program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(program => program.category === categoryFilter);
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(program => program.level === levelFilter);
    }

    setFilteredPrograms(filtered);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Handle module enrollment form submission
  const handleModuleEnrollment = async (e) => {
    e.preventDefault();

    if (!selectedModule) return;

    // Validate form
    if (!enrollmentForm.name || !enrollmentForm.email || !enrollmentForm.phone) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setPaymentLoading(true);

    try {
      // Get user token
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Please login to continue', 'error');
        setPaymentLoading(false);
        return;
      }

      // Prepare enrollment data
      const enrollmentData = {
        moduleId: selectedModule.id,
        moduleTitle: selectedModule.title,
        moduleLevel: selectedModule.level,
        paymentAmount: selectedModule.price,
        paymentMethod: paymentMethod,
        userDetails: enrollmentForm,
        timestamp: Date.now()
      };

      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error('Payment SDK failed to load. Please try again.');
      }

      // Create Razorpay order
      const orderResp = await trainingAPI.createRazorpayOrder({ amount: selectedModule.price, moduleId: selectedModule.id, moduleTitle: selectedModule.title });

      const options = {
        key: orderResp.data.key,
        amount: orderResp.data.amount,
        currency: 'INR',
        name: 'RubberEco Training',
        description: selectedModule.title,
        order_id: orderResp.data.orderId,
        prefill: { name: enrollmentForm.name, email: enrollmentForm.email, contact: enrollmentForm.phone },
        theme: { color: '#16a34a' },
        handler: async function (response) {
          try {
            const payload = {
              userId: JSON.parse(localStorage.getItem('user') || '{}').id,
              moduleId: enrollmentData.moduleId,
              moduleTitle: enrollmentData.moduleTitle,
              moduleLevel: enrollmentData.moduleLevel,
              paymentAmount: enrollmentData.paymentAmount,
              userDetails: enrollmentData.userDetails,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };
            const verify = await trainingAPI.verifyRazorpayAndEnroll(payload);
            showNotification('Enrollment successful!', 'success');
            setPaymentLoading(false);
            onEnrollmentSuccess && onEnrollmentSuccess(enrollmentData.moduleId);
          } catch (err) {
            console.error('Verify/enroll error:', err);
            showNotification(err.message || 'Enrollment failed after payment', 'error');
            setPaymentLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setPaymentLoading(false);

    } catch (error) {
      console.error('Payment redirect error:', error);
      showNotification(error.message || 'Failed to redirect to payment. Please try again.', 'error');
      setPaymentLoading(false);
    }
  };

  // Fetch user enrollments
  const fetchUserEnrollments = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData.id) return;

      // Get enrollments from local enrollment manager
      const localEnrollments = enrollmentManager.getUserEnrollments(userData.id);
      setMyRegistrations(localEnrollments);

      // Try to sync with database in background
      enrollmentManager.syncToDatabase().then(syncCount => {
        if (syncCount > 0) {
          console.log(`Synced ${syncCount} enrollments to database`);
          // Refresh local data after sync
          const updatedEnrollments = enrollmentManager.getUserEnrollments(userData.id);
          setMyRegistrations(updatedEnrollments);
        }
      }).catch(syncError => {
        console.warn('Database sync failed:', syncError);
      });

      // Also try to fetch from API as backup
      try {
        const apiEnrollments = await trainingAPI.getUserEnrollments(userData.id);
        if (apiEnrollments.success && apiEnrollments.enrollments.length > 0) {
          console.log('Found additional enrollments from API:', apiEnrollments.enrollments);
          // Merge with local enrollments if needed
        }
      } catch (apiError) {
        console.warn('API enrollment fetch failed:', apiError);
      }
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
    }
  };

  // Auto-populate form with user profile data
  const populateUserData = async () => {
    try {
      const fieldMapping = {
        name: 'name',
        email: 'email',
        phone: 'phone'
      };

      const result = await autoPopulateForm(
        setEnrollmentForm,
        enrollmentForm,
        fieldMapping,
        true // Fetch fresh data from server
      );

      // Track which fields were auto-populated
      if (result.success) {
        setAutoPopulatedFields(result.populatedFields.map(field => fieldMapping[field]).filter(Boolean));
      }

      // Show notification about auto-population
      showProfilePopulationNotification(showNotification, result);

    } catch (error) {
      console.error('Error auto-populating form:', error);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && selectedModule) {
      setActiveTab('module-enrollment');
      // Reset form and auto-populated fields tracking
      setEnrollmentForm({
        name: '',
        email: '',
        phone: '',
        experience: '',
        motivation: ''
      });
      setAutoPopulatedFields([]);
      // Then auto-populate with user data
      populateUserData();
    } else if (isOpen && !selectedModule) {
      // Fetch user enrollments when opening without selected module
      fetchUserEnrollments();
      setActiveTab('my-registrations');
    }
  }, [isOpen, selectedModule]);

  const handleRegister = async (programId) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const program = availablePrograms.find(p => p.id === programId);
      const newRegistration = {
        id: `REG${String(myRegistrations.length + 1).padStart(3, '0')}`,
        programId: program.id,
        programTitle: program.title,
        status: 'enrolled',
        registrationDate: new Date().toISOString().split('T')[0],
        startDate: program.startDate,
        progress: 0,
        attendance: 0,
        certificateEarned: false,
        location: program.location,
        instructor: program.instructor
      };
      
      setMyRegistrations(prev => [newRegistration, ...prev]);
      
      // Update enrollment count
      setAvailablePrograms(prev => prev.map(p => 
        p.id === programId 
          ? { ...p, currentEnrollments: p.currentEnrollments + 1 }
          : p
      ));
      
      showNotification('Successfully registered for the training program!', 'success');
      setActiveTab('my-registrations');
    } catch (error) {
      console.error('Error registering for program:', error);
      showNotification('Error registering for program. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      enrolled: { color: 'bg-blue-100 text-blue-800', icon: BookOpen, text: 'Enrolled' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X, text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.enrolled;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getLevelBadge = (level) => {
    const levelConfig = {
      beginner: { color: 'bg-green-100 text-green-800', text: 'Beginner' },
      intermediate: { color: 'bg-yellow-100 text-yellow-800', text: 'Intermediate' },
      advanced: { color: 'bg-red-100 text-red-800', text: 'Advanced' }
    };
    
    const config = levelConfig[level] || levelConfig.beginner;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      cultivation: 'Cultivation',
      organic: 'Organic Farming',
      processing: 'Processing',
      technology: 'Technology',
      business: 'Business'
    };
    
    return categoryLabels[category] || category;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Notification */}
      {notification.show && (
        <motion.div
          className={`fixed top-4 right-4 z-60 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          {notification.message}
        </motion.div>
      )}

      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Training Programs</h2>
              <p className="text-purple-100">Register for training programs and enhance your skills</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {selectedModule && (
              <button
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'module-enrollment'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('module-enrollment')}
              >
                <GraduationCap className="h-4 w-4 inline mr-2" />
                Enroll in Course
              </button>
            )}
            {!selectedModule && availablePrograms.length > 0 && (
              <button
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'available-programs'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('available-programs')}
              >
                <BookOpen className="h-4 w-4 inline mr-2" />
                Available Programs ({filteredPrograms.length})
              </button>
            )}
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'my-registrations'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('my-registrations')}
            >
              <User className="h-4 w-4 inline mr-2" />
              My Registrations ({myRegistrations.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {activeTab === 'module-enrollment' && selectedModule && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Course Information */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedModule.title}</h3>
                    <p className="text-gray-600 mb-4">{selectedModule.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{selectedModule.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{selectedModule.lessons} lessons</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4" />
                        <span>{selectedModule.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600">₹{selectedModule.price.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">One-time payment</div>
                  </div>
                </div>
              </div>

              {/* Enrollment Form */}
              <form onSubmit={handleModuleEnrollment} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                      {autoPopulatedFields.includes('name') && (
                        <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Auto-filled from profile
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      value={enrollmentForm.name}
                      onChange={(e) => {
                        setEnrollmentForm({...enrollmentForm, name: e.target.value});
                        // Remove from auto-populated list if user modifies
                        if (autoPopulatedFields.includes('name')) {
                          setAutoPopulatedFields(prev => prev.filter(field => field !== 'name'));
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        autoPopulatedFields.includes('name')
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                      {autoPopulatedFields.includes('email') && (
                        <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Auto-filled from profile
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      required
                      value={enrollmentForm.email}
                      onChange={(e) => {
                        setEnrollmentForm({...enrollmentForm, email: e.target.value});
                        // Remove from auto-populated list if user modifies
                        if (autoPopulatedFields.includes('email')) {
                          setAutoPopulatedFields(prev => prev.filter(field => field !== 'email'));
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        autoPopulatedFields.includes('email')
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                      {autoPopulatedFields.includes('phone') && (
                        <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Auto-filled from profile
                        </span>
                      )}
                    </label>
                    <input
                      type="tel"
                      required
                      value={enrollmentForm.phone}
                      onChange={(e) => {
                        setEnrollmentForm({...enrollmentForm, phone: e.target.value});
                        // Remove from auto-populated list if user modifies
                        if (autoPopulatedFields.includes('phone')) {
                          setAutoPopulatedFields(prev => prev.filter(field => field !== 'phone'));
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        autoPopulatedFields.includes('phone')
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={enrollmentForm.experience}
                      onChange={(e) => setEnrollmentForm({...enrollmentForm, experience: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select your experience</option>
                      <option value="beginner">Beginner (0-1 years)</option>
                      <option value="intermediate">Intermediate (1-5 years)</option>
                      <option value="advanced">Advanced (5+ years)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why do you want to take this course?
                  </label>
                  <textarea
                    value={enrollmentForm.motivation}
                    onChange={(e) => setEnrollmentForm({...enrollmentForm, motivation: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us about your goals and motivation..."
                  />
                </div>

                {/* Payment Method */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h4>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Credit/Debit Card</div>
                        <div className="text-sm text-gray-500">Visa, Mastercard, RuPay</div>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">UPI</div>
                        <div className="text-sm text-gray-500">PhonePe, GPay, Paytm</div>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="netbanking"
                        checked={paymentMethod === 'netbanking'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Net Banking</div>
                        <div className="text-sm text-gray-500">All major banks</div>
                      </div>
                    </label>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Course Fee</span>
                      <span className="font-medium">₹{selectedModule.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Processing Fee</span>
                      <span className="font-medium">₹0</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount</span>
                      <span className="text-lg font-bold text-primary-600">₹{selectedModule.price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Redirecting to Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay ₹{selectedModule.price.toLocaleString()} (Demo Mode)</span>
                      </>
                    )}
                  </button>

                  <div className="text-center text-sm text-gray-500 mt-2">
                    <p>🧪 Demo Mode - Payment Simulation</p>
                    <p>In production, this would redirect to Stripe payment gateway</p>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'available-programs' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No general programs available</h3>
                <p className="text-gray-600 mb-4">
                  Training programs are now integrated with the main training courses.
                  Please browse and enroll in courses from the main training page.
                </p>
                <button
                  onClick={() => {
                    onClose && onClose();
                    navigate('/training#browse');
                  }}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Go to Training Courses
                </button>
              </div>
            </motion.div>
          )}





          {activeTab === 'my-registrations' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {myRegistrations.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No course enrollments yet</h3>
                  <p className="text-gray-600 mb-4">You haven't enrolled in any paid training courses yet.</p>
                  <button
                    onClick={() => {
                      onClose && onClose();
                      navigate('/training#browse');
                    }}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Browse Training Courses
                  </button>
                </div>
              ) : (
                myRegistrations.map((registration) => (
                  <div key={registration.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{registration.moduleTitle}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            registration.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' :
                            registration.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {registration.paymentStatus === 'completed' ? 'Enrolled' :
                             registration.paymentStatus === 'pending' ? 'Pending' : 'Failed'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Enrollment ID: {registration.id}</span>
                          <span>•</span>
                          <span>Enrolled: {new Date(registration.enrollmentDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Progress</p>
                        <p className="text-2xl font-bold text-primary-600">{registration.progress?.progressPercentage || 0}%</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${registration.progress?.progressPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Module Level</p>
                        <p className="text-sm font-medium text-gray-900">{registration.moduleLevel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Payment Amount</p>
                        <p className="text-sm font-medium text-gray-900">₹{registration.paymentAmount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Payment Method</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">{registration.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Completed Lessons</p>
                        <p className="text-sm font-medium text-gray-900">
                          {registration.progress?.completedLessons?.length || 0} / {registration.progress?.totalLessons || 0}
                        </p>
                      </div>
                    </div>

                    {/* Certificate */}
                    {registration.certificateIssued && (
                      <div className="bg-green-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Award className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-800">Certificate Earned</p>
                              <p className="text-xs text-green-600">
                                Issued: {new Date(registration.certificateIssuedDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                            <Download className="h-4 w-4 inline mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Last accessed: {registration.progress?.lastAccessedDate ?
                          new Date(registration.progress.lastAccessedDate).toLocaleDateString() : 'Never'}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => window.open(`/training/${registration.moduleId}`, '_blank')}
                          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm flex items-center space-x-2"
                        >
                          <Play className="h-4 w-4" />
                          <span>Continue Learning</span>
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {registration.completionDate && (
                          <span>Completed: {registration.completionDate}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium">
                          <Eye className="h-4 w-4 inline mr-1" />
                          View Details
                        </button>
                        {registration.status === 'in_progress' && (
                          <button className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
                            <Play className="h-4 w-4 inline mr-1" />
                            Continue
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TrainingRegistration;

// Training Schedule Component
export const TrainingSchedule = ({ isOpen, onClose }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSchedules();
    }
  }, [isOpen]);

  const loadSchedules = async () => {
    try {
      // Mock data - replace with actual API call
      const mockSchedules = [
        {
          id: 'TS001',
          programTitle: 'Advanced Rubber Cultivation Techniques',
          instructor: 'Dr. Rajesh Kumar',
          startDate: '2024-03-01',
          endDate: '2024-03-15',
          schedule: 'Monday to Friday, 9:00 AM - 4:00 PM',
          location: 'Kottayam Training Center',
          status: 'upcoming',
          sessions: [
            { date: '2024-03-01', topic: 'Soil Management', time: '9:00 AM - 12:00 PM', status: 'scheduled' },
            { date: '2024-03-01', topic: 'Disease Control', time: '1:00 PM - 4:00 PM', status: 'scheduled' },
            { date: '2024-03-02', topic: 'Harvesting Techniques', time: '9:00 AM - 12:00 PM', status: 'scheduled' }
          ]
        }
      ];

      setSchedules(mockSchedules);
      setLoading(false);
    } catch (error) {
      console.error('Error loading schedules:', error);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Training Schedule</h2>
              <p className="text-indigo-100">View your training sessions and schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <p className="mt-4 text-gray-600">Loading schedules...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
              <p className="text-gray-600">You don't have any training schedules yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{schedule.programTitle}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {schedule.instructor}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {schedule.location}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Clock className="h-3 w-3 mr-1" />
                      {schedule.status}
                    </span>
                  </div>

                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Session Schedule</h4>
                    <div className="space-y-2">
                      {schedule.sessions.map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{session.topic}</p>
                            <p className="text-xs text-gray-500">{session.date} • {session.time}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            session.status === 'completed' ? 'bg-green-100 text-green-800' :
                            session.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
