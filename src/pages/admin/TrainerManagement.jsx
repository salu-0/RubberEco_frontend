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
import { isRequired, isEmail, phoneValidator, numericValidator, nameValidator } from '../../utils/validation';

const TrainerManagement = ({ darkMode }) => {
  console.log('🎯 TrainerManagement component loaded!', { darkMode });

  const [trainers, setTrainers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showTrainerDetails, setShowTrainerDetails] = useState(false);
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [addTrainerLoading, setAddTrainerLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    totalTrainers: 0,
    totalEnrollments: 0,
    activeTrainers: 0,
    completionRate: 0
  });
  const [newTrainerForm, setNewTrainerForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    location: '',
    salary: '',
    skills: '',
    notes: '',
    avatar: ''
  });
  const [newTrainerErrors, setNewTrainerErrors] = useState({});

  const validateTrainerField = (field, value) => {
    let error = '';
    switch (field) {
      case 'name':
        error = nameValidator(value);
        break;
      case 'email':
        error = isEmail(value);
        break;
      case 'phone':
        error = phoneValidator(value, { allowedCountryCodes: ['+91', '+81'], message: 'Phone must start with +91 or +81 and include 10 digits' });
        break;
      case 'department':
      case 'location':
        error = isRequired(value, 'This field is required');
        break;
      case 'salary':
        if (value) error = numericValidator(value, { min: 0 });
        break;
      default:
        error = '';
    }
    setNewTrainerErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const validateTrainerForm = () => {
    const fields = ['name', 'email', 'phone', 'department', 'location', 'salary'];
    const errors = {};
    fields.forEach(f => {
      errors[f] = validateTrainerField(f, newTrainerForm[f]);
    });
    return Object.values(errors).filter(Boolean).length === 0;
  };

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || 'dummy-token';
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Create sample enrollments for trainers
  const createSampleEnrollments = async (trainers) => {
    console.log('📚 Creating sample enrollments for trainers...');
    const token = getAuthToken();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';

    const sampleEnrollments = [
      {
        userId: trainers[0]?.id || trainers[0]?._id,
        moduleId: 1,
        moduleTitle: 'Rubber Tapping Fundamentals',
        moduleLevel: 'Beginner',
        paymentAmount: 5000,
        paymentMethod: 'card',
        paymentStatus: 'completed',
        paymentId: 'demo_payment_1',
        userDetails: {
          name: trainers[0]?.name,
          email: trainers[0]?.email,
          phone: trainers[0]?.phone
        },
        progress: {
          completedLessons: [1, 2, 3],
          totalLessons: 5,
          progressPercentage: 100,
          lastAccessedDate: new Date()
        }
      },
      {
        userId: trainers[0]?.id || trainers[0]?._id,
        moduleId: 2,
        moduleTitle: 'Plantation Management',
        moduleLevel: 'Intermediate',
        paymentAmount: 7500,
        paymentMethod: 'upi',
        paymentStatus: 'completed',
        paymentId: 'demo_payment_2',
        userDetails: {
          name: trainers[0]?.name,
          email: trainers[0]?.email,
          phone: trainers[0]?.phone
        },
        progress: {
          completedLessons: [1, 2],
          totalLessons: 4,
          progressPercentage: 75,
          lastAccessedDate: new Date()
        }
      }
    ];

    if (trainers.length > 1) {
      sampleEnrollments.push({
        userId: trainers[1]?.id || trainers[1]?._id,
        moduleId: 3,
        moduleTitle: 'Advanced Tapping Techniques',
        moduleLevel: 'Advanced',
        paymentAmount: 8000,
        paymentMethod: 'card',
        paymentStatus: 'completed',
        paymentId: 'demo_payment_3',
        userDetails: {
          name: trainers[1]?.name,
          email: trainers[1]?.email,
          phone: trainers[1]?.phone
        },
        progress: {
          completedLessons: [1, 2, 3, 4],
          totalLessons: 4,
          progressPercentage: 100,
          lastAccessedDate: new Date()
        }
      });
    }

    for (const enrollment of sampleEnrollments) {
      try {
        const response = await fetch(`${API_BASE_URL}/training/demo-enroll`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(enrollment)
        });

        if (response.ok) {
          console.log(`✅ Created sample enrollment: ${enrollment.moduleTitle} for ${enrollment.userDetails.name}`);
        } else {
          const errorText = await response.text();
          console.log(`⚠️ Failed to create enrollment ${enrollment.moduleTitle}:`, errorText);
        }
      } catch (error) {
        console.log(`❌ Error creating enrollment ${enrollment.moduleTitle}:`, error);
      }
    }
  };

  // Create sample trainers if none exist
  const createSampleTrainers = async () => {
    console.log('🎯 Creating sample trainers...');
    const token = getAuthToken();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';

    const sampleTrainers = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@rubbereco.com',
        password: 'trainer123',
        phone: '+91 98765 43210',
        role: 'trainer',
        department: 'Training & Development',
        location: 'Kottayam District, Kerala',
        status: 'active',
        performance_rating: 4.8,
        tasks_completed: 45,
        tasks_assigned: 50,
        salary: 65000
      },
      {
        name: 'Prof. Rajesh Kumar',
        email: 'rajesh.kumar@rubbereco.com',
        password: 'trainer123',
        phone: '+91 87654 32109',
        role: 'trainer',
        department: 'Field Training',
        location: 'Thrissur District, Kerala',
        status: 'active',
        performance_rating: 4.9,
        tasks_completed: 38,
        tasks_assigned: 40,
        salary: 58000
      }
    ];

    for (const trainer of sampleTrainers) {
      try {
        const response = await fetch(`${API_BASE_URL}/staff`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(trainer)
        });

        if (response.ok) {
          console.log(`✅ Created sample trainer: ${trainer.name}`);
        } else {
          console.log(`⚠️ Failed to create trainer ${trainer.name}:`, await response.text());
        }
      } catch (error) {
        console.log(`❌ Error creating trainer ${trainer.name}:`, error);
      }
    }
  };

  // Fetch all trainers and enrollments
  const fetchTrainersAndEnrollments = async () => {
    console.log('🔄 Starting to fetch trainers and enrollments...');
    setLoading(true);
    try {
      const token = getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';

      console.log('🔗 API Base URL:', API_BASE_URL);
      console.log('🔑 Auth Token:', token ? 'Present' : 'Missing');

      // First, try to fetch all staff to see what's available
      console.log('📡 Fetching all staff members...');
      const allStaffResponse = await fetch(`${API_BASE_URL}/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 All staff response status:', allStaffResponse.status);

      let staffTrainers = [];
      let allEnrollments = [];

      if (allStaffResponse.ok) {
        const allStaffResult = await allStaffResponse.json();
        console.log('📊 All staff result:', allStaffResult);

        const allStaff = allStaffResult.data || allStaffResult.staff || [];
        console.log(`📚 Total staff members found: ${allStaff.length}`);

        // Log all staff to see what roles exist
        allStaff.forEach((staff, index) => {
          console.log(`👤 Staff ${index + 1}: ${staff.name} - Role: ${staff.role} - Department: ${staff.department}`);
        });

        // Filter for trainers specifically
        staffTrainers = allStaff.filter(staff => staff.role === 'trainer');
        console.log(`🎯 Trainers with role='trainer': ${staffTrainers.length}`);

        // If no exact trainers found, look for trainer-related roles
        if (staffTrainers.length === 0) {
          console.log('🔍 No exact trainers found, looking for trainer-related roles...');
          staffTrainers = allStaff.filter(staff =>
            staff.role === 'supervisor' ||
            staff.role === 'manager' ||
            staff.name?.toLowerCase().includes('trainer') ||
            staff.department?.toLowerCase().includes('training') ||
            staff.department?.toLowerCase().includes('education') ||
            staff.department?.toLowerCase().includes('development')
          );
          console.log(`🎯 Trainer-related staff found: ${staffTrainers.length}`);
        }

        // If still no trainers, use first few staff members as demo
        if (staffTrainers.length === 0 && allStaff.length > 0) {
          console.log('🎯 No trainer-related staff found, using first few staff as trainers...');
          staffTrainers = allStaff.slice(0, Math.min(5, allStaff.length));
          console.log(`🎯 Using ${staffTrainers.length} staff members as trainers`);
        }
      } else {
        const errorText = await allStaffResponse.text();
        console.error('❌ Failed to fetch staff:', allStaffResponse.status, errorText);
      }

      // Fetch training enrollments
      console.log('📡 Fetching training enrollments...');
      try {
        const enrollmentsResponse = await trainingAPI.getAllEnrollments();
        if (enrollmentsResponse.success) {
          allEnrollments = enrollmentsResponse.enrollments || [];
          console.log(`📚 Found ${allEnrollments.length} training enrollments`);

          // If no enrollments found and we have trainers, create sample enrollments
          if (allEnrollments.length === 0 && staffTrainers.length > 0) {
            console.log('📚 No enrollments found, creating sample enrollments...');
            await createSampleEnrollments(staffTrainers);

            // Retry fetching enrollments
            const retryEnrollmentsResponse = await trainingAPI.getAllEnrollments();
            if (retryEnrollmentsResponse.success) {
              allEnrollments = retryEnrollmentsResponse.enrollments || [];
              console.log(`📚 After creating samples, found ${allEnrollments.length} training enrollments`);
            }
          }
        } else {
          console.warn('⚠️ Failed to fetch training enrollments:', enrollmentsResponse.message);
        }
      } catch (enrollmentError) {
        console.warn('⚠️ Error fetching enrollments:', enrollmentError);
      }

      console.log(`🔄 Processing ${staffTrainers.length} trainers...`);

      // Enhance trainer data with enrollment information
      const enhancedTrainers = staffTrainers.map((trainer, index) => {
        console.log(`👤 Processing trainer ${index + 1}: ${trainer.name} (${trainer.email})`);

        // Try to match enrollments by email or staff ID
        const trainerEnrollments = allEnrollments.filter(enrollment => {
          const enrollmentUserId = enrollment.user?.id || enrollment.userId;
          const enrollmentUserEmail = enrollment.user?.email || enrollment.userDetails?.email;
          const enrollmentUserName = enrollment.user?.name || enrollment.userDetails?.name;

          // Match by email (most reliable), ID, or name
          const emailMatch = enrollmentUserEmail && trainer.email &&
                            enrollmentUserEmail.toLowerCase() === trainer.email.toLowerCase();
          const idMatch = enrollmentUserId && (enrollmentUserId === trainer._id || enrollmentUserId === trainer.id);
          const nameMatch = enrollmentUserName && trainer.name &&
                           enrollmentUserName.toLowerCase().includes(trainer.name.toLowerCase().split(' ')[0]);

          return emailMatch || idMatch || nameMatch;
        });

        console.log(`📚 Found ${trainerEnrollments.length} enrollments for ${trainer.name}`);
        if (trainerEnrollments.length > 0) {
          console.log(`   Enrollments:`, trainerEnrollments.map(e => ({
            title: e.moduleTitle,
            level: e.moduleLevel,
            progress: e.progress?.progressPercentage || 0,
            userEmail: e.user?.email || e.userDetails?.email,
            userName: e.user?.name || e.userDetails?.name
          })));
        }

        const completedCourses = trainerEnrollments.filter(e =>
          e.progress?.progressPercentage >= 100 || e.certificateIssued
        ).length;

        const totalRevenue = trainerEnrollments.reduce((sum, e) => sum + (e.paymentAmount || 0), 0);

        // Calculate last active date from staff data or enrollments
        let lastActiveDate = 'Never';
        if (trainer.last_active) {
          lastActiveDate = new Date(trainer.last_active).toLocaleDateString();
        } else if (trainer.updatedAt) {
          lastActiveDate = new Date(trainer.updatedAt).toLocaleDateString();
        } else if (trainer.createdAt) {
          lastActiveDate = new Date(trainer.createdAt).toLocaleDateString();
        } else if (trainerEnrollments.length > 0) {
          const latestEnrollment = Math.max(...trainerEnrollments.map(e => new Date(e.enrollmentDate || e.createdAt)));
          lastActiveDate = new Date(latestEnrollment).toLocaleDateString();
        }

        const enhancedTrainer = {
          // Map staff fields to trainer interface
          id: trainer._id || trainer.id,
          name: trainer.name || 'Unknown Name',
          email: trainer.email || 'No email',
          phone: trainer.phone || 'No phone',
          role: trainer.role || 'trainer',
          location: trainer.location || 'No location',
          department: trainer.department || 'No department',
          bio: `${trainer.role || 'trainer'} in ${trainer.department || 'Training'}`,
          avatar: trainer.avatar || '',
          hireDate: trainer.hire_date || trainer.createdAt,
          salary: trainer.salary || 0,
          performanceRating: trainer.performance_rating || 0,
          tasksCompleted: trainer.tasks_completed || 0,
          tasksAssigned: trainer.tasks_assigned || 0,

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
          status: trainer.status || 'active'
        };

        console.log(`✅ Enhanced trainer: ${enhancedTrainer.name} - ${enhancedTrainer.department}`);
        return enhancedTrainer;
      });

      console.log(`✅ Final enhanced trainers: ${enhancedTrainers.length}`);
      enhancedTrainers.forEach((trainer, index) => {
        console.log(`   ${index + 1}. ${trainer.name} - ${trainer.department} - ${trainer.email}`);
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

      const newStats = {
        totalTrainers,
        activeTrainers,
        totalEnrollments,
        completionRate
      };

      console.log('📊 Calculated stats:', newStats);
      setStats(newStats);

      // Only use demo data if we have absolutely no staff data
      if (enhancedTrainers.length === 0) {
        console.log('⚠️ No trainers found, will use demo data as fallback');
        throw new Error('No trainers found in database');
      }

    } catch (error) {
      console.error('❌ Error fetching trainers and enrollments:', error);

      // Try to create sample trainers if none exist
      console.log('🔄 Attempting to create sample trainers...');
      try {
        await createSampleTrainers();
        console.log('✅ Sample trainers created, retrying fetch...');

        // Retry fetching after creating sample data
        const retryResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api'}/staff`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        });

        if (retryResponse.ok) {
          const retryResult = await retryResponse.json();
          const retryStaff = retryResult.data || [];
          const retryTrainers = retryStaff.filter(staff => staff.role === 'trainer');

          if (retryTrainers.length > 0) {
            console.log(`✅ Found ${retryTrainers.length} trainers after creating samples`);
            const enhancedRetryTrainers = retryTrainers.map(trainer => ({
              id: trainer._id || trainer.id,
              name: trainer.name,
              email: trainer.email,
              phone: trainer.phone,
              role: trainer.role,
              location: trainer.location,
              department: trainer.department,
              bio: `${trainer.role} in ${trainer.department}`,
              avatar: trainer.avatar || '',
              hireDate: trainer.hire_date,
              salary: trainer.salary,
              performanceRating: trainer.performance_rating,
              tasksCompleted: trainer.tasks_completed,
              tasksAssigned: trainer.tasks_assigned,
              enrollments: [],
              totalCourses: 0,
              completedCourses: 0,
              totalRevenue: 0,
              completionRate: 0,
              avgProgress: 0,
              lastActive: trainer.last_active ? new Date(trainer.last_active).toLocaleDateString() : 'Recently',
              status: trainer.status || 'active'
            }));

            setTrainers(enhancedRetryTrainers);
            setStats({
              totalTrainers: enhancedRetryTrainers.length,
              activeTrainers: enhancedRetryTrainers.filter(t => t.status === 'active').length,
              totalEnrollments: 0,
              completionRate: 0
            });
            setLoading(false);
            return;
          }
        }
      } catch (createError) {
        console.error('❌ Failed to create sample trainers:', createError);
      }

      // Final fallback to demo data
      console.log('⚠️ Using fallback demo data');
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

  // Handle adding a new trainer
  const handleAddTrainer = async (e) => {
    e.preventDefault();
    // Final validation before submit
    const ok = validateTrainerForm();
    if (!ok) {
      showNotification('Please fix the highlighted errors before submitting.', 'error');
      return;
    }
    setAddTrainerLoading(true);

    try {
      const token = getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';

      // Validate required fields
      // Already validated via validateTrainerForm

      // Prepare trainer data
      const trainerData = {
        name: newTrainerForm.name.trim(),
        email: newTrainerForm.email.toLowerCase().trim(),
        password: 'trainer123', // Default password
        phone: newTrainerForm.phone.trim(),
        role: 'trainer',
        department: newTrainerForm.department.trim(),
        location: newTrainerForm.location.trim(),
        salary: parseInt(newTrainerForm.salary) || 0,
        avatar: newTrainerForm.avatar || '',
        skills: newTrainerForm.skills ? newTrainerForm.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        notes: (newTrainerForm.notes || '').trim(),
        status: 'active',
        performance_rating: 0,
        tasks_completed: 0,
        tasks_assigned: 0
      };

      console.log('🔄 Creating new trainer:', trainerData);

      const response = await fetch(`${API_BASE_URL}/staff`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trainerData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Trainer created successfully:', result);

        // Reset form
        setNewTrainerForm({
          name: '',
          email: '',
          phone: '',
          department: '',
          location: '',
          salary: '',
          skills: '',
          notes: ''
        });
        setNewTrainerErrors({});

        // Close modal
        setShowAddTrainerModal(false);

        // Refresh trainers list
        await fetchTrainersAndEnrollments();

        showNotification(`Trainer "${trainerData.name}" added successfully!`, 'success');
      } else {
        const errorResult = await response.json();
        console.error('❌ Failed to create trainer:', errorResult);
        showNotification(`Failed to add trainer: ${errorResult.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error adding trainer:', error);
      showNotification(`Error adding trainer: ${error.message}`, 'error');
    } finally {
      setAddTrainerLoading(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setNewTrainerForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Image upload handler
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNewTrainerErrors(prev => ({ ...prev, avatar: 'Please select a valid image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNewTrainerErrors(prev => ({ ...prev, avatar: 'Image must be less than 5MB' }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewTrainerForm(prev => ({ ...prev, avatar: String(reader.result) }));
      setNewTrainerErrors(prev => ({ ...prev, avatar: '' }));
    };
    reader.readAsDataURL(file);
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
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        </motion.div>
      )}

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
        <div className="flex space-x-3">
          <motion.button
            onClick={async () => {
              console.log('🔄 Manual refresh triggered');
              await fetchTrainersAndEnrollments();
            }}
            className="mt-4 sm:mt-0 bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🔄</span>
            <span>Refresh</span>
          </motion.button>
          {/* Removed 'Add Sample Enrollments' button as requested */}
          <motion.button
            onClick={() => setShowAddTrainerModal(true)}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-5 w-5" />
            <span>Add Trainer</span>
          </motion.button>
        </div>
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
                        {trainer.enrollments && trainer.enrollments.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {trainer.enrollments.slice(0, 2).map((enrollment, idx) => (
                              <div key={idx} className="truncate">
                                • {enrollment.moduleTitle}
                              </div>
                            ))}
                            {trainer.enrollments.length > 2 && (
                              <div className="text-primary-600 font-medium">
                                +{trainer.enrollments.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
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

      {/* Add Trainer Modal */}
      {showAddTrainerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Add New Trainer</h2>
                  <p className="text-primary-100">Create a new trainer profile</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTrainerModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <span className="text-white text-2xl">×</span>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleAddTrainer} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Basic Information
                  </h3>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Profile Image
                    </label>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                        {newTrainerForm.avatar ? (
                          <img src={newTrainerForm.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-100'}`}>No Image</div>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="text-sm" />
                    </div>
                    {newTrainerErrors.avatar && (
                      <p className="mt-1 text-sm text-red-500">{newTrainerErrors.avatar}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newTrainerForm.name}
                      onChange={(e) => {
                        handleFormChange('name', e.target.value);
                        validateTrainerField('name', e.target.value);
                      }}
                      onBlur={(e) => validateTrainerField('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } ${newTrainerErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter trainer's full name"
                      required
                    />
                    {newTrainerErrors.name && (
                      <p className="mt-1 text-sm text-red-500">{newTrainerErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={newTrainerForm.email}
                      onChange={(e) => {
                        handleFormChange('email', e.target.value);
                        validateTrainerField('email', e.target.value);
                      }}
                      onBlur={(e) => validateTrainerField('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } ${newTrainerErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="trainer@rubbereco.com"
                      required
                    />
                    {newTrainerErrors.email && (
                      <p className="mt-1 text-sm text-red-500">{newTrainerErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={newTrainerForm.phone}
                      onChange={(e) => {
                        handleFormChange('phone', e.target.value);
                        validateTrainerField('phone', e.target.value);
                      }}
                      onBlur={(e) => validateTrainerField('phone', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } ${newTrainerErrors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="+91 98765 43210"
                      required
                    />
                    {newTrainerErrors.phone && (
                      <p className="mt-1 text-sm text-red-500">{newTrainerErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Work Information */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Work Information
                  </h3>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Department *
                    </label>
                    <select
                      value={newTrainerForm.department}
                      onChange={(e) => {
                        handleFormChange('department', e.target.value);
                        validateTrainerField('department', e.target.value);
                      }}
                      onBlur={(e) => validateTrainerField('department', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } ${newTrainerErrors.department ? 'border-red-500 focus:ring-red-500' : ''}`}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Training & Development">Training & Development</option>
                      <option value="Field Training">Field Training</option>
                      <option value="Technical Training">Technical Training</option>
                      <option value="Safety Training">Safety Training</option>
                      <option value="Research & Training">Research & Training</option>
                      <option value="Quality Training">Quality Training</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Location *
                    </label>
                    <input
                      type="text"
                      value={newTrainerForm.location}
                      onChange={(e) => {
                        handleFormChange('location', e.target.value);
                        validateTrainerField('location', e.target.value);
                      }}
                      onBlur={(e) => validateTrainerField('location', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } ${newTrainerErrors.location ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Kottayam District, Kerala"
                      required
                    />
                    {newTrainerErrors.location && (
                      <p className="mt-1 text-sm text-red-500">{newTrainerErrors.location}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Monthly Salary (₹)
                    </label>
                    <input
                      type="number"
                      value={newTrainerForm.salary}
                      onChange={(e) => {
                        handleFormChange('salary', e.target.value);
                        validateTrainerField('salary', e.target.value);
                      }}
                      onBlur={(e) => validateTrainerField('salary', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } ${newTrainerErrors.salary ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="50000"
                      min="0"
                    />
                    {newTrainerErrors.salary && (
                      <p className="mt-1 text-sm text-red-500">{newTrainerErrors.salary}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTrainerForm.skills}
                    onChange={(e) => handleFormChange('skills', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Rubber Plantation Management, Training Delivery, Curriculum Development"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notes
                  </label>
                  <textarea
                    value={newTrainerForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Additional notes about the trainer..."
                  />
                </div>
              </div>

              {/* Default Password Info */}
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-blue-200'}`}>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                    Login Information
                  </span>
                </div>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                  Default password will be set to: <strong>trainer123</strong>
                  <br />
                  The trainer can change this password after first login.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddTrainerModal(false)}
                  className={`px-6 py-3 border rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={addTrainerLoading}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  whileHover={{ scale: addTrainerLoading ? 1 : 1.02 }}
                  whileTap={{ scale: addTrainerLoading ? 1 : 0.98 }}
                >
                  {addTrainerLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      <span>Add Trainer</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Enrolled Courses ({selectedTrainer.enrollments?.length || 0})
                  </h3>
                  {selectedTrainer.totalRevenue > 0 && (
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Revenue: <span className="font-semibold text-green-600">₹{selectedTrainer.totalRevenue.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {selectedTrainer.enrollments && selectedTrainer.enrollments.length > 0 ? (
                    selectedTrainer.enrollments.map((enrollment, index) => (
                      <div
                        key={index}
                        className={`p-5 rounded-xl border ${
                          darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        } hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                              enrollment.progress?.progressPercentage >= 100
                                ? 'bg-green-100 text-green-600'
                                : enrollment.progress?.progressPercentage >= 50
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-orange-100 text-orange-600'
                            }`}>
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {enrollment.moduleTitle || 'Unknown Course'}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className={`text-sm px-2 py-1 rounded-full ${
                                  enrollment.moduleLevel === 'Beginner'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : enrollment.moduleLevel === 'Intermediate'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                }`}>
                                  {enrollment.moduleLevel || 'Not specified'}
                                </span>
                                {enrollment.paymentAmount && (
                                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Fee: ₹{enrollment.paymentAmount.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              enrollment.progress?.progressPercentage >= 100
                                ? 'text-green-600'
                                : enrollment.progress?.progressPercentage >= 50
                                ? 'text-blue-600'
                                : 'text-orange-600'
                            }`}>
                              {enrollment.progress?.progressPercentage || 0}%
                            </div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Progress
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Lessons: {enrollment.progress?.completedLessons?.length || 0} / {enrollment.progress?.totalLessons || 0}
                            </span>
                            <span className={`text-sm font-medium ${
                              enrollment.progress?.progressPercentage >= 100
                                ? 'text-green-600'
                                : 'text-gray-600'
                            }`}>
                              {enrollment.progress?.progressPercentage >= 100 ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 ${
                                enrollment.progress?.progressPercentage >= 100
                                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                                  : enrollment.progress?.progressPercentage >= 50
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                  : 'bg-gradient-to-r from-orange-500 to-orange-600'
                              }`}
                              style={{ width: `${enrollment.progress?.progressPercentage || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Additional Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Method:</span>
                            <span className={`ml-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {enrollment.paymentMethod?.toUpperCase() || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                              enrollment.paymentStatus === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                              {enrollment.paymentStatus || 'Unknown'}
                            </span>
                          </div>
                        </div>

                        {/* Last Accessed */}
                        {enrollment.progress?.lastAccessedDate && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Last accessed: {new Date(enrollment.progress.lastAccessedDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">No enrolled courses found</p>
                      <p className="text-sm">This trainer hasn't enrolled in any courses yet.</p>
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
