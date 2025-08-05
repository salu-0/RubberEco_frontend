import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Plus,
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  GraduationCap,
  Target,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Building
} from 'lucide-react';
import { trainingAPI } from '../../utils/api';

const TrainerManagement = ({ darkMode }) => {
  console.log('🎯 TrainerManagement component loaded!', { darkMode });

  const [trainers, setTrainers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showTrainerDetails, setShowTrainerDetails] = useState(false);
  const [stats, setStats] = useState({
    totalTrainers: 0,
    totalEnrollments: 0,
    activeTrainers: 0,
    completionRate: 0
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || 'dummy-token';
  };

  // Fetch all trainers and enrollments
  const fetchTrainersAndEnrollments = async () => {
    console.log('🔄 Starting to fetch trainers and enrollments...');
    setLoading(true);
    try {
      const token = getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      // Fetch trainers from Staff collection with role=trainer
      const trainersResponse = await fetch(`${API_BASE_URL}/staff?role=trainer&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch all training enrollments
      const enrollmentsResponse = await trainingAPI.getAllEnrollments();

      let staffTrainers = [];
      let allEnrollments = [];

      if (trainersResponse.ok) {
        const trainersResult = await trainersResponse.json();
        staffTrainers = trainersResult.data || [];
        console.log(`📚 Found ${staffTrainers.length} trainers in Staff collection`);
      } else {
        console.warn('Failed to fetch trainers from Staff collection:', trainersResponse.statusText);
      }

      if (enrollmentsResponse.success) {
        allEnrollments = enrollmentsResponse.enrollments || [];
        console.log(`📚 Found ${allEnrollments.length} training enrollments`);
      } else {
        console.warn('Failed to fetch training enrollments:', enrollmentsResponse.message);
      }

      // If no trainers found in staff collection, fetch all staff and filter for trainer-like roles
      if (staffTrainers.length === 0) {
        console.log('📚 No trainers found with role=trainer, fetching all staff...');
        const allStaffResponse = await fetch(`${API_BASE_URL}/staff?limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (allStaffResponse.ok) {
          const allStaffResult = await allStaffResponse.json();
          const allStaff = allStaffResult.data || [];

          // Filter for trainer-related roles or names
          staffTrainers = allStaff.filter(staff =>
            staff.role === 'trainer' ||
            staff.role === 'supervisor' ||
            staff.role === 'manager' ||
            staff.name?.toLowerCase().includes('trainer') ||
            staff.department?.toLowerCase().includes('training') ||
            staff.department?.toLowerCase().includes('education')
          );

          console.log(`📚 Found ${staffTrainers.length} potential trainers from all staff`);
        }
      }

      // Enhance trainer data with enrollment information
      const enhancedTrainers = staffTrainers.map(trainer => {
        // Try to match enrollments by email or staff ID
        const trainerEnrollments = allEnrollments.filter(enrollment => {
          const enrollmentUserId = enrollment.user?.id || enrollment.userId;
          const enrollmentUserEmail = enrollment.user?.email || enrollment.userDetails?.email;

          // Match by email (most reliable) or by ID
          return enrollmentUserEmail === trainer.email ||
                 enrollmentUserId === trainer._id ||
                 enrollmentUserId === trainer.id;
        });

        const completedCourses = trainerEnrollments.filter(e =>
          e.progress?.progressPercentage >= 100 || e.certificateIssued
        ).length;

        const totalRevenue = trainerEnrollments.reduce((sum, e) => sum + (e.paymentAmount || 0), 0);

        // Calculate last active date from staff data or enrollments
        let lastActiveDate = 'Never';
        if (trainer.last_active) {
          lastActiveDate = new Date(trainer.last_active).toLocaleDateString();
        } else if (trainerEnrollments.length > 0) {
          const latestEnrollment = Math.max(...trainerEnrollments.map(e => new Date(e.enrollmentDate || e.createdAt)));
          lastActiveDate = new Date(latestEnrollment).toLocaleDateString();
        }

        return {
          // Map staff fields to trainer interface
          id: trainer._id || trainer.id,
          name: trainer.name,
          email: trainer.email,
          phone: trainer.phone,
          role: trainer.role,
          location: trainer.location,
          department: trainer.department,
          bio: `${trainer.role} in ${trainer.department}`,
          avatar: trainer.avatar,
          hireDate: trainer.hire_date,
          salary: trainer.salary,
          performanceRating: trainer.performance_rating,
          tasksCompleted: trainer.tasks_completed,
          tasksAssigned: trainer.tasks_assigned,

          // Enrollment-related data
          enrollments: trainerEnrollments,
          totalCourses: trainerEnrollments.length,
          completedCourses,
          totalRevenue,
          completionRate: trainerEnrollments.length > 0
            ? Math.round((completedCourses / trainerEnrollments.length) * 100)
            : 0,
          avgProgress: trainerEnrollments.length > 0
            ? Math.round(trainerEnrollments.reduce((sum, e) => sum + (e.progress?.progressPercentage || 0), 0) / trainerEnrollments.length)
            : 0,
          lastActive: lastActiveDate,
          status: trainer.status || (trainerEnrollments.length > 0 ? 'active' : 'inactive')
        };
      });

      setTrainers(enhancedTrainers);
      setEnrollments(allEnrollments);

      // Calculate stats
      const totalTrainers = enhancedTrainers.length;
      const activeTrainers = enhancedTrainers.filter(t => t.status === 'active').length;
      const totalEnrollments = allEnrollments.length;
      const completionRate = totalEnrollments > 0 
        ? Math.round((allEnrollments.filter(e => e.progress?.progressPercentage >= 100).length / totalEnrollments) * 100)
        : 0;

      setStats({
        totalTrainers,
        activeTrainers,
        totalEnrollments,
        completionRate
      });

    } catch (error) {
      console.error('Error fetching trainers and enrollments:', error);

      // Fallback demo data based on Staff collection structure
      const demoTrainers = [
        {
          id: 'staff_trainer_1',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@rubbereco.com',
          phone: '+91 98765 43210',
          role: 'trainer',
          department: 'Training & Development',
          location: 'Kottayam District, Kerala',
          bio: 'trainer in Training & Development',
          avatar: '',
          hireDate: '2023-01-15',
          salary: 65000,
          performanceRating: 4.8,
          tasksCompleted: 45,
          tasksAssigned: 50,
          totalCourses: 3,
          completedCourses: 2,
          completionRate: 67,
          avgProgress: 85,
          totalRevenue: 15000,
          lastActive: '1/15/2024',
          status: 'active',
          enrollments: [
            {
              moduleTitle: 'Rubber Tapping Fundamentals',
              moduleLevel: 'Beginner',
              progress: { progressPercentage: 100 },
              paymentAmount: 5000
            },
            {
              moduleTitle: 'Plantation Management',
              moduleLevel: 'Intermediate',
              progress: { progressPercentage: 75 },
              paymentAmount: 7500
            },
            {
              moduleTitle: 'Disease Control',
              moduleLevel: 'Advanced',
              progress: { progressPercentage: 80 },
              paymentAmount: 2500
            }
          ]
        },
        {
          id: 'staff_trainer_2',
          name: 'Prof. Rajesh Kumar',
          email: 'rajesh.kumar@rubbereco.com',
          phone: '+91 87654 32109',
          role: 'trainer',
          department: 'Field Training',
          location: 'Thrissur District, Kerala',
          bio: 'trainer in Field Training',
          avatar: '',
          hireDate: '2022-08-20',
          salary: 58000,
          performanceRating: 4.9,
          tasksCompleted: 38,
          tasksAssigned: 40,
          totalCourses: 2,
          completedCourses: 2,
          completionRate: 100,
          avgProgress: 95,
          totalRevenue: 8000,
          lastActive: '1/10/2024',
          status: 'active',
          enrollments: [
            {
              moduleTitle: 'Advanced Tapping Techniques',
              moduleLevel: 'Advanced',
              progress: { progressPercentage: 100 },
              paymentAmount: 5000
            },
            {
              moduleTitle: 'Quality Control',
              moduleLevel: 'Intermediate',
              progress: { progressPercentage: 90 },
              paymentAmount: 3000
            }
          ]
        },
        {
          id: 'staff_trainer_3',
          name: 'Ms. Priya Nair',
          email: 'priya.nair@rubbereco.com',
          phone: '+91 76543 21098',
          role: 'trainer',
          department: 'Technical Training',
          location: 'Ernakulam District, Kerala',
          bio: 'trainer in Technical Training',
          avatar: '',
          hireDate: '2023-03-10',
          salary: 52000,
          performanceRating: 4.7,
          tasksCompleted: 28,
          tasksAssigned: 35,
          totalCourses: 1,
          completedCourses: 1,
          completionRate: 100,
          avgProgress: 100,
          totalRevenue: 4000,
          lastActive: '1/12/2024',
          status: 'active',
          enrollments: [
            {
              moduleTitle: 'Modern Plantation Techniques',
              moduleLevel: 'Intermediate',
              progress: { progressPercentage: 100 },
              paymentAmount: 4000
            }
          ]
        }
      ];

      setTrainers(demoTrainers);
      setStats({
        totalTrainers: 3,
        activeTrainers: 3,
        totalEnrollments: 6,
        completionRate: 88
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainersAndEnrollments();
  }, []);

  // Filter trainers based on search term
  const filteredTrainers = trainers.filter(trainer =>
    trainer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewTrainer = (trainer) => {
    setSelectedTrainer(trainer);
    setShowTrainerDetails(true);
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <motion.div
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
        darkMode ? 'border-gray-700' : 'border-gray-100'
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className={`text-sm ${color} font-medium`}>
            {description}
          </p>
        </div>
        <div className={`p-3 rounded-xl ${color.includes('blue') ? 'bg-blue-50' : 
          color.includes('green') ? 'bg-green-50' : 
          color.includes('purple') ? 'bg-purple-50' : 'bg-orange-50'}`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Trainer Management
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage trainers and monitor their course enrollments
          </p>
        </div>
        <motion.button
          className="mt-4 sm:mt-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-5 w-5" />
          <span>Add Trainer</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Trainers"
          value={stats.totalTrainers}
          icon={Users}
          color="text-blue-600"
          description="Registered trainers"
        />
        <StatCard
          title="Active Trainers"
          value={stats.activeTrainers}
          icon={Target}
          color="text-green-600"
          description="Currently active"
        />
        <StatCard
          title="Total Enrollments"
          value={stats.totalEnrollments}
          icon={BookOpen}
          color="text-purple-600"
          description="Course enrollments"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={Award}
          color="text-orange-600"
          description="Average completion"
        />
      </div>

      {/* Search and Filters */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
        darkMode ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainers by name, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <button className={`px-6 py-3 border rounded-xl flex items-center space-x-2 hover:bg-gray-50 transition-colors ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}>
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Trainers Table */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${
        darkMode ? 'border-gray-700' : 'border-gray-100'
      } overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Trainer
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Contact
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Courses
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Progress
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Revenue
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTrainers.length > 0 ? (
                filteredTrainers.map((trainer, index) => (
                  <motion.tr
                    key={trainer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {trainer.name?.charAt(0) || 'T'}
                          </span>
                        </div>
                        <div>
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {trainer.name || 'Unknown Trainer'}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {trainer.role || 'Trainer'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {trainer.email || 'No email'}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {trainer.phone || 'No phone'}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {trainer.location || 'No location'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {trainer.totalCourses || 0} Total
                        </p>
                        <p className="text-sm text-green-600">
                          {trainer.completedCourses || 0} Completed
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                              style={{ width: `${trainer.avgProgress || 0}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {trainer.avgProgress || 0}%
                          </span>
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {trainer.completionRate || 0}% completion rate
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{(trainer.totalRevenue || 0).toLocaleString()}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total earned
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        trainer.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {trainer.status === 'active' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {trainer.status || 'inactive'}
                      </span>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Last: {trainer.lastActive || 'Never'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewTrainer(trainer)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No trainers found</p>
                      <p className="text-xs mt-1">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trainer Details Modal */}
      {showTrainerDetails && selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedTrainer.name}</h2>
                  <p className="text-primary-100">{selectedTrainer.role}</p>
                </div>
              </div>
              <button
                onClick={() => setShowTrainerDetails(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <span className="text-white text-2xl">×</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Trainer Info */}
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {selectedTrainer.email || 'No email'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {selectedTrainer.phone || 'No phone'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {selectedTrainer.location || 'No location'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {selectedTrainer.department || 'No department'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Staff Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hire Date</p>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {selectedTrainer.hireDate ? new Date(selectedTrainer.hireDate).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Salary</p>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        ₹{(selectedTrainer.salary || 0).toLocaleString()}/month
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Performance Rating</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(selectedTrainer.performanceRating || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {selectedTrainer.performanceRating || 0}/5
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Task Completion</p>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {selectedTrainer.tasksCompleted || 0}/{selectedTrainer.tasksAssigned || 0} tasks
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Training Stats
                  </h3>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedTrainer.totalCourses || 0}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Courses
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedTrainer.completionRate || 0}%
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Completion Rate
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-2xl font-bold text-green-600`}>
                        ₹{(selectedTrainer.totalRevenue || 0).toLocaleString()}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Training Revenue
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Enrolled Courses ({selectedTrainer.enrollments?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedTrainer.enrollments && selectedTrainer.enrollments.length > 0 ? (
                    selectedTrainer.enrollments.map((enrollment, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <BookOpen className="h-5 w-5 text-primary-600" />
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {enrollment.moduleTitle || 'Unknown Course'}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Level: {enrollment.moduleLevel || 'Not specified'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {enrollment.progress?.progressPercentage || 0}%
                            </p>
                            <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                              <div
                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                                style={{ width: `${enrollment.progress?.progressPercentage || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No enrolled courses found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TrainerManagement;
