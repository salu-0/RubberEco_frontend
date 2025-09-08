import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { autoPopulateForm, showProfilePopulationNotification } from '../utils/userProfileUtils';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  BookOpen,
  Award,
  Filter,
  Search,
  Plus,
  Eye,
  UserCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Settings,
  BarChart3,
  User,
  CreditCard
} from 'lucide-react';

const PracticalTraining = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [trainings, setTrainings] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [enrollmentForm, setEnrollmentForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    experienceLevel: '',
    notes: '',
    agreeToTerms: false
  });
  const [autoPopulatedFields, setAutoPopulatedFields] = useState([]);

  // Mock data for demonstration
  const mockTrainings = [
    {
      _id: '1',
      sessionId: 'PT-20241201-A1B2',
      title: 'Advanced Rubber Tapping Techniques',
      description: 'Learn professional rubber tapping methods with hands-on practice in real plantation environments.',
      category: 'rubber_tapping',
      level: 'Advanced',
      instructor: {
        name: 'Dr. Rajesh Kumar',
        specialization: 'Rubber Plantation Management',
        experience: 15
      },
      schedule: {
        startDate: '2024-12-15',
        endDate: '2024-12-20',
        duration: 40,
        totalSessions: 5,
        timeSlots: [
          { day: 'Monday', startTime: '08:00', endTime: '16:00' },
          { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
          { day: 'Wednesday', startTime: '08:00', endTime: '16:00' },
          { day: 'Thursday', startTime: '08:00', endTime: '16:00' },
          { day: 'Friday', startTime: '08:00', endTime: '16:00' }
        ]
      },
      location: {
        type: 'field_location',
        address: 'Rubber Research Institute, Kottayam, Kerala',
        capacity: 20,
        facilities: ['parking', 'restroom', 'cafeteria', 'equipment_storage', 'first_aid']
      },
      enrollment: {
        maxParticipants: 20,
        currentEnrollments: 12,
        fee: 5000,
        registrationDeadline: '2025-12-10',
        includesEquipment: true,
        includesMaterials: true,
        includesRefreshments: true
      },
      status: 'registration_open',
      curriculum: [
        {
          sessionNumber: 1,
          topic: 'Tapping Panel Preparation',
          objectives: ['Learn proper panel marking', 'Understand bark thickness assessment'],
          activities: ['demonstration', 'hands_on_practice'],
          duration: 480,
          materials: ['Tapping knives', 'Measuring tools', 'Marking chalk']
        },
        {
          sessionNumber: 2,
          topic: 'Tapping Technique Mastery',
          objectives: ['Master the V-cut technique', 'Learn optimal tapping depth'],
          activities: ['demonstration', 'hands_on_practice', 'assessment'],
          duration: 480,
          materials: ['Professional tapping knives', 'Practice panels']
        }
      ],
      prerequisites: {
        experienceLevel: 'intermediate',
        requiredModules: [
          { moduleId: 1, moduleTitle: 'Basic Rubber Cultivation' }
        ]
      },
      feedback: {
        averageRating: 4.8,
        participantRatings: []
      }
    },
    {
      _id: '2',
      sessionId: 'PT-20241208-C3D4',
      title: 'Beginner Rubber Plantation Management',
      description: 'Complete introduction to rubber plantation management for new farmers.',
      category: 'plantation_management',
      level: 'Beginner',
      instructor: {
        name: 'Prof. Meera Nair',
        specialization: 'Agricultural Sciences',
        experience: 12
      },
      schedule: {
        startDate: '2024-12-22',
        endDate: '2024-12-24',
        duration: 24,
        totalSessions: 3,
        timeSlots: [
          { day: 'Sunday', startTime: '09:00', endTime: '17:00' },
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' }
        ]
      },
      location: {
        type: 'training_center',
        address: 'Agricultural Training Center, Thrissur, Kerala',
        capacity: 30,
        facilities: ['parking', 'restroom', 'cafeteria', 'accommodation']
      },
      enrollment: {
        maxParticipants: 30,
        currentEnrollments: 8,
        fee: 3000,
        registrationDeadline: '2025-12-18',
        includesEquipment: false,
        includesMaterials: true,
        includesRefreshments: true
      },
      status: 'registration_open',
      curriculum: [
        {
          sessionNumber: 1,
          topic: 'Plantation Planning & Setup',
          objectives: ['Site selection', 'Soil preparation', 'Planting techniques'],
          activities: ['demonstration', 'field_work'],
          duration: 480
        }
      ],
      prerequisites: {
        experienceLevel: 'none'
      },
      feedback: {
        averageRating: 4.6
      }
    },
    {
      _id: '3',
      sessionId: 'PT-20250105-G7H8',
      title: 'Disease Prevention & Treatment Workshop',
      description: 'Comprehensive training on identifying and treating common rubber tree diseases.',
      category: 'disease_control',
      level: 'Intermediate',
      instructor: {
        name: 'Dr. Suresh Babu',
        specialization: 'Plant Pathology',
        experience: 18
      },
      schedule: {
        startDate: '2025-01-05',
        endDate: '2025-01-06',
        duration: 16,
        totalSessions: 2,
        timeSlots: [
          { day: 'Sunday', startTime: '08:00', endTime: '16:00' },
          { day: 'Monday', startTime: '08:00', endTime: '16:00' }
        ]
      },
      location: {
        type: 'field_location',
        address: 'Rubber Board Research Station, Kottayam, Kerala',
        capacity: 25,
        facilities: ['parking', 'restroom', 'laboratory', 'equipment_storage']
      },
      enrollment: {
        maxParticipants: 25,
        currentEnrollments: 15,
        fee: 2500,
        registrationDeadline: '2025-12-30',
        includesEquipment: true,
        includesMaterials: true,
        includesRefreshments: true
      },
      status: 'registration_open',
      curriculum: [
        {
          sessionNumber: 1,
          topic: 'Disease Identification & Diagnosis',
          objectives: ['Identify common diseases', 'Use diagnostic tools', 'Sample collection'],
          activities: ['demonstration', 'hands_on_practice', 'field_work'],
          duration: 480,
          materials: ['Microscopes', 'Sample containers', 'Field guides']
        }
      ],
      prerequisites: {
        experienceLevel: 'basic',
        requiredModules: [
          { moduleId: 2, moduleTitle: 'Basic Plant Health' }
        ]
      },
      feedback: {
        averageRating: 4.7
      }
    },
    {
      _id: '4',
      sessionId: 'PT-20250108-I9J0',
      title: 'Professional Latex Harvesting Techniques',
      description: 'Master the art of latex collection with optimal yield and quality techniques.',
      category: 'harvesting',
      level: 'Advanced',
      instructor: {
        name: 'Mr. Ravi Chandran',
        specialization: 'Latex Processing',
        experience: 20
      },
      schedule: {
        startDate: '2025-01-08',
        endDate: '2025-01-11',
        duration: 32,
        totalSessions: 4,
        timeSlots: [
          { day: 'Wednesday', startTime: '06:00', endTime: '14:00' },
          { day: 'Thursday', startTime: '06:00', endTime: '14:00' },
          { day: 'Friday', startTime: '06:00', endTime: '14:00' },
          { day: 'Saturday', startTime: '06:00', endTime: '14:00' }
        ]
      },
      location: {
        type: 'field_location',
        address: 'Commercial Rubber Estate, Idukki, Kerala',
        capacity: 15,
        facilities: ['parking', 'restroom', 'processing_unit', 'storage']
      },
      enrollment: {
        maxParticipants: 15,
        currentEnrollments: 10,
        fee: 4500,
        registrationDeadline: '2026-01-03',
        includesEquipment: true,
        includesMaterials: true,
        includesRefreshments: true
      },
      status: 'registration_open',
      curriculum: [
        {
          sessionNumber: 1,
          topic: 'Optimal Harvesting Timing',
          objectives: ['Weather assessment', 'Tree readiness', 'Yield optimization'],
          activities: ['demonstration', 'hands_on_practice', 'assessment'],
          duration: 480,
          materials: ['Collection cups', 'Measuring tools', 'Quality testing kits']
        }
      ],
      prerequisites: {
        experienceLevel: 'intermediate',
        requiredModules: [
          { moduleId: 1, moduleTitle: 'Rubber Tapping Fundamentals' }
        ]
      },
      feedback: {
        averageRating: 4.9
      }
    },
    {
      _id: '5',
      sessionId: 'PT-20250115-K1L2',
      title: 'Equipment Maintenance & Repair Workshop',
      description: 'Learn to maintain and repair essential rubber farming equipment and machinery.',
      category: 'equipment_maintenance',
      level: 'Intermediate',
      instructor: {
        name: 'Mr. Anil Kumar',
        specialization: 'Agricultural Engineering',
        experience: 14
      },
      schedule: {
        startDate: '2025-01-15',
        endDate: '2025-01-17',
        duration: 24,
        totalSessions: 3,
        timeSlots: [
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '17:00' }
        ]
      },
      location: {
        type: 'training_center',
        address: 'Technical Training Institute, Ernakulam, Kerala',
        capacity: 20,
        facilities: ['parking', 'restroom', 'workshop', 'tool_storage', 'cafeteria']
      },
      enrollment: {
        maxParticipants: 20,
        currentEnrollments: 6,
        fee: 3500,
        registrationDeadline: '2026-01-10',
        includesEquipment: false,
        includesMaterials: true,
        includesRefreshments: true
      },
      status: 'registration_open',
      curriculum: [
        {
          sessionNumber: 1,
          topic: 'Tapping Tools Maintenance',
          objectives: ['Tool sharpening', 'Handle replacement', 'Preventive care'],
          activities: ['demonstration', 'hands_on_practice'],
          duration: 480,
          materials: ['Sharpening stones', 'Replacement handles', 'Maintenance oils']
        }
      ],
      prerequisites: {
        experienceLevel: 'basic',
        requiredModules: [
          { moduleId: 3, moduleTitle: 'Basic Tool Usage' }
        ]
      },
      feedback: {
        averageRating: 4.5
      }
    },
    {
      _id: '6',
      sessionId: 'PT-20250120-M3N4',
      title: 'Safety Protocols & Emergency Response',
      description: 'Essential safety training for rubber plantation workers and emergency procedures.',
      category: 'safety_protocols',
      level: 'Beginner',
      instructor: {
        name: 'Ms. Priya Nair',
        specialization: 'Occupational Safety',
        experience: 10
      },
      schedule: {
        startDate: '2025-01-20',
        endDate: '2025-01-21',
        duration: 16,
        totalSessions: 2,
        timeSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' }
        ]
      },
      location: {
        type: 'training_center',
        address: 'Safety Training Center, Kochi, Kerala',
        capacity: 30,
        facilities: ['parking', 'restroom', 'first_aid_station', 'simulation_area']
      },
      enrollment: {
        maxParticipants: 30,
        currentEnrollments: 18,
        fee: 2000,
        registrationDeadline: '2026-01-15',
        includesEquipment: true,
        includesMaterials: true,
        includesRefreshments: true
      },
      status: 'registration_open',
      curriculum: [
        {
          sessionNumber: 1,
          topic: 'Workplace Safety Standards',
          objectives: ['Safety equipment usage', 'Hazard identification', 'Emergency procedures'],
          activities: ['demonstration', 'hands_on_practice', 'group_exercise'],
          duration: 480,
          materials: ['Safety gear', 'First aid kits', 'Emergency equipment']
        }
      ],
      prerequisites: {
        experienceLevel: 'none'
      },
      feedback: {
        averageRating: 4.8
      }
    }
  ];

  const mockUserEnrollments = [
    {
      _id: '1',
      sessionId: 'PT-20241101-E5F6',
      title: 'Disease Control in Rubber Plants',
      status: 'completed',
      enrollmentDate: '2024-10-15',
      completionDate: '2024-11-05',
      certificateEarned: true,
      finalGrade: 'A',
      attendance: [
        { sessionNumber: 1, status: 'present' },
        { sessionNumber: 2, status: 'present' },
        { sessionNumber: 3, status: 'present' }
      ]
    }
  ];

  useEffect(() => {
    loadTrainings();
    loadUserEnrollments();
  }, []);

  const loadTrainings = async () => {
    setLoading(true);
    try {
      // In production, replace with actual API call
      // const response = await fetch('/api/practical-training/available');
      // const data = await response.json();
      
      // Using mock data for now
      setTimeout(() => {
        setTrainings(mockTrainings);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading trainings:', error);
      setLoading(false);
    }
  };

  const loadUserEnrollments = async () => {
    try {
      // In production, replace with actual API call
      // const userId = getCurrentUser().id;
      // const response = await fetch(`/api/practical-training/user/${userId}`);
      // const data = await response.json();
      
      // Using mock data for now
      setUserEnrollments(mockUserEnrollments);
    } catch (error) {
      console.error('Error loading user enrollments:', error);
    }
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || training.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || training.level === levelFilter;
    const matchesLocation = locationFilter === 'all' || training.location.type === locationFilter;
    
    return matchesSearch && matchesCategory && matchesLevel && matchesLocation;
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // Auto-populate enrollment form with user profile data
  const populateEnrollmentForm = async () => {
    try {
      const fieldMapping = {
        name: 'fullName',
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
      console.error('Error auto-populating enrollment form:', error);
    }
  };

  // Handle opening enrollment modal with auto-population
  const handleOpenEnrollModal = async (training) => {
    setSelectedTraining(training);

    // Reset form and auto-populated fields tracking
    setEnrollmentForm({
      fullName: '',
      email: '',
      phone: '',
      experienceLevel: '',
      notes: '',
      agreeToTerms: false
    });
    setAutoPopulatedFields([]);

    setShowEnrollModal(true);

    // Auto-populate with user data
    await populateEnrollmentForm();
  };

  const handleEnroll = async (trainingId) => {
    try {
      // Validate form
      if (!enrollmentForm.fullName || !enrollmentForm.email || !enrollmentForm.phone || !enrollmentForm.agreeToTerms) {
        showNotification('Please fill in all required fields and agree to terms', 'error');
        return;
      }

      setLoading(true);

      try {
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          showNotification('Please log in to enroll in training courses.', 'error');
          setLoading(false);
          return;
        }

        // Make actual API call to enroll
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/practical-training/${trainingId}/enroll`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(enrollmentForm)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showNotification('Successfully enrolled in practical training! You will receive a confirmation email shortly.', 'success');
          setShowEnrollModal(false);
          setEnrollmentForm({
            fullName: '',
            email: '',
            phone: '',
            experienceLevel: '',
            notes: '',
            agreeToTerms: false
          });
          setAutoPopulatedFields([]);
          loadTrainings();
          loadUserEnrollments();
        } else {
          showNotification(result.message || 'Failed to enroll in training. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Enrollment error:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
      } finally {
        setLoading(false);
      }

    } catch (error) {
      console.error('Error enrolling:', error);
      showNotification('Failed to enroll in training', 'error');
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setEnrollmentForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Remove from auto-populated list if user modifies the field
    if (autoPopulatedFields.includes(field)) {
      setAutoPopulatedFields(prev => prev.filter(f => f !== field));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'registration_open':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'registration_closed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <Award className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'rubber_tapping':
        return '🌳';
      case 'plantation_management':
        return '🌱';
      case 'disease_control':
        return '🔬';
      case 'harvesting':
        return '🪣';
      case 'equipment_maintenance':
        return '🔧';
      case 'safety_protocols':
        return '🦺';
      default:
        return '📚';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAvailableSpots = (training) => {
    return training.enrollment.maxParticipants - training.enrollment.currentEnrollments;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Practical Training Programs
          </h1>
          <p className="text-gray-600 text-lg">
            Hands-on training sessions for real-world rubber farming skills
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm">
          {[
            { id: 'available', label: 'Available Training', icon: Calendar },
            { id: 'my-enrollments', label: 'My Enrollments', icon: BookOpen },
            { id: 'certificates', label: 'Certificates', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Available Training Tab */}
        {activeTab === 'available' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search training programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="rubber_tapping">Rubber Tapping</option>
                  <option value="plantation_management">Plantation Management</option>
                  <option value="disease_control">Disease Control</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="equipment_maintenance">Equipment Maintenance</option>
                  <option value="safety_protocols">Safety Protocols</option>
                </select>

                {/* Level Filter */}
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                {/* Location Filter */}
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Locations</option>
                  <option value="training_center">Training Center</option>
                  <option value="field_location">Field Location</option>
                  <option value="plantation_site">Plantation Site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Training Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                // Loading skeletons
                [...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : filteredTrainings.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Training Programs Found</h3>
                  <p className="text-gray-600">Try adjusting your filters to find available training programs.</p>
                </div>
              ) : (
                filteredTrainings.map((training) => (
                  <motion.div
                    key={training._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getCategoryIcon(training.category)}</span>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              training.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                              training.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {training.level}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(training.status)}
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {training.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {training.description}
                      </p>

                      {/* Training Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(training.schedule.startDate)} - {formatDate(training.schedule.endDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="truncate">{training.location.address}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{calculateAvailableSpots(training)} spots available</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{training.schedule.duration} hours total</span>
                        </div>
                      </div>

                      {/* Instructor */}
                      <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {training.instructor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{training.instructor.name}</p>
                          <p className="text-xs text-gray-600">{training.instructor.experience} years experience</p>
                        </div>
                      </div>

                      {/* Rating */}
                      {training.feedback.averageRating > 0 && (
                        <div className="flex items-center space-x-1 mb-4">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-900">
                            {training.feedback.averageRating}
                          </span>
                          <span className="text-sm text-gray-600">
                            ({training.feedback.participantRatings?.length || 0} reviews)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-primary-600">
                            ₹{training.enrollment.fee.toLocaleString()}
                          </span>
                          <p className="text-xs text-gray-600">
                            Registration closes: {formatDate(training.enrollment.registrationDeadline)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTraining(training);
                              setShowDetailsModal(true);
                            }}
                            className="px-3 py-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">Details</span>
                          </button>
                          <button
                            onClick={() => handleOpenEnrollModal(training)}
                            disabled={calculateAvailableSpots(training) === 0 || new Date() > new Date(training.enrollment.registrationDeadline)}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                          >
                            <Plus className="h-4 w-4" />
                            <span className="text-sm">Enroll</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* My Enrollments Tab */}
        {activeTab === 'my-enrollments' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Training Enrollments</h2>
            
            {userEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Enrollments Yet</h3>
                <p className="text-gray-600 mb-4">You haven't enrolled in any practical training programs yet.</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                >
                  Browse Available Training
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userEnrollments.map((enrollment) => (
                  <div key={enrollment._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {enrollment.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>Session ID: {enrollment.sessionId}</span>
                          <span>Enrolled: {formatDate(enrollment.enrollmentDate)}</span>
                          {enrollment.completionDate && (
                            <span>Completed: {formatDate(enrollment.completionDate)}</span>
                          )}
                        </div>
                        
                        {/* Attendance Summary */}
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <UserCheck className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-600">
                              Attendance: {enrollment.attendance?.filter(a => a.status === 'present').length || 0}/{enrollment.attendance?.length || 0}
                            </span>
                          </div>
                          {enrollment.finalGrade && (
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4 text-purple-500" />
                              <span className="text-sm text-gray-600">Grade: {enrollment.finalGrade}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          enrollment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          enrollment.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          enrollment.status === 'enrolled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                        </span>
                        
                        {enrollment.certificateEarned && (
                          <button className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-1">
                            <Download className="h-4 w-4" />
                            <span className="text-sm">Certificate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Training Certificates</h2>
            
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
              <p className="text-gray-600">Complete practical training programs to earn certificates.</p>
            </div>
          </div>
        )}
      </div>

      {/* Training Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedTraining && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTraining.title}</h2>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedTraining.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                        selectedTraining.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedTraining.level}
                      </span>
                      <span className="text-sm text-gray-600 capitalize">
                        {selectedTraining.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Training</h3>
                  <p className="text-gray-600">{selectedTraining.description}</p>
                </div>

                {/* Training Details Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Schedule Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                      Schedule
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">{formatDate(selectedTraining.schedule.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">{formatDate(selectedTraining.schedule.endDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{selectedTraining.schedule.duration} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sessions:</span>
                        <span className="font-medium">{selectedTraining.schedule.totalSessions}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                      Location
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Address:</span>
                        <p className="font-medium">{selectedTraining.location.address}</p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{selectedTraining.location.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{selectedTraining.location.capacity} people</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructor Information */}
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary-600" />
                    Instructor
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedTraining.instructor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedTraining.instructor.name}</p>
                      <p className="text-sm text-gray-600">{selectedTraining.instructor.specialization}</p>
                      <p className="text-sm text-gray-600">{selectedTraining.instructor.experience} years experience</p>
                    </div>
                  </div>
                </div>

                {/* Enrollment Information */}
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary-600" />
                    Enrollment Details
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fee:</span>
                        <span className="font-bold text-primary-600">₹{selectedTraining.enrollment.fee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available Spots:</span>
                        <span className="font-medium">{calculateAvailableSpots(selectedTraining)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration Deadline:</span>
                        <span className="font-medium">{formatDate(selectedTraining.enrollment.registrationDeadline)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`h-4 w-4 ${selectedTraining.enrollment.includesEquipment ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">Equipment Included</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`h-4 w-4 ${selectedTraining.enrollment.includesMaterials ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">Materials Included</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`h-4 w-4 ${selectedTraining.enrollment.includesRefreshments ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">Refreshments Included</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleOpenEnrollModal(selectedTraining);
                    }}
                    disabled={calculateAvailableSpots(selectedTraining) === 0 || new Date() > new Date(selectedTraining.enrollment.registrationDeadline)}
                    className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {showEnrollModal && selectedTraining && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEnrollModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Enroll in Training</h2>
                  <button
                    onClick={() => setShowEnrollModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Training Summary */}
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTraining.title}</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Duration: <span className="font-medium">{selectedTraining.schedule.duration} hours</span></p>
                      <p className="text-gray-600">Level: <span className="font-medium">{selectedTraining.level}</span></p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fee: <span className="font-bold text-primary-600">₹{selectedTraining.enrollment.fee.toLocaleString()}</span></p>
                      <p className="text-gray-600">Available Spots: <span className="font-medium">{calculateAvailableSpots(selectedTraining)}</span></p>
                    </div>
                  </div>
                </div>

                {/* Enrollment Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                      {autoPopulatedFields.includes('fullName') && (
                        <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Auto-filled from profile
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={enrollmentForm.fullName}
                      onChange={(e) => handleFormChange('fullName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        autoPopulatedFields.includes('fullName')
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                      required
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
                      value={enrollmentForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        autoPopulatedFields.includes('email')
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter your email address"
                      required
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
                      value={enrollmentForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        autoPopulatedFields.includes('phone')
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={enrollmentForm.experienceLevel}
                      onChange={(e) => handleFormChange('experienceLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select your experience level</option>
                      <option value="none">No Experience</option>
                      <option value="basic">Basic (1-2 years)</option>
                      <option value="intermediate">Intermediate (3-5 years)</option>
                      <option value="advanced">Advanced (5+ years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requirements or Notes
                    </label>
                    <textarea
                      rows="3"
                      value={enrollmentForm.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Any special requirements, dietary restrictions, or additional notes..."
                    ></textarea>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Full payment is required to confirm enrollment</li>
                    <li>• Cancellation must be made 48 hours before training starts</li>
                    <li>• Attendance is mandatory for certification</li>
                    <li>• Training materials and equipment will be provided as specified</li>
                  </ul>
                  <div className="flex items-center mt-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={enrollmentForm.agreeToTerms}
                      onChange={(e) => handleFormChange('agreeToTerms', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                      I agree to the terms and conditions *
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowEnrollModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEnroll(selectedTraining._id)}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        <span>Enroll & Pay ₹{selectedTraining.enrollment.fee.toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className={`px-6 py-4 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              <div className="flex items-center space-x-2">
                {notification.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <span>{notification.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PracticalTraining;
