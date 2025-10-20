import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AvailableServiceRequests from '../../components/Staff/AvailableServiceRequests';
import MyApplications from '../../components/Staff/MyApplications';
import AssignedTasks from '../../components/Staff/AssignedTasks';
import Attendance from '../../components/Staff/Attendance';
import AttendanceRecords from '../../components/Staff/AttendanceRecords';
import AttendanceMarkingForm from '../../components/Staff/AttendanceMarkingForm';
import Toast from '../../components/Toast';
import { passwordStrength } from '../../utils/validation';

import {
  MapPin,
  Plus,
  CheckCircle,
  Clock,
  Users,
  Settings,
  User,
  Calendar,
  Droplets,
  Shield,
  Wrench,
  TreePine,
  Target,
  UserCheck,
  FileText,
  Eye,
  Edit,
  Filter,
  Search,
  MoreVertical,
  LogOut,
  ChevronDown,
  X,
  EyeOff,
  Camera,
  Phone,
  DollarSign,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

const StaffDashboard = ({ darkMode }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [serviceRequestsSubTab, setServiceRequestsSubTab] = useState('available');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [collections, setCollections] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [staffData, setStaffData] = useState(null);
  const [loadingStaffData, setLoadingStaffData] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [availableRequestsCount, setAvailableRequestsCount] = useState(0);
  const [showCollectionDetailsModal, setShowCollectionDetailsModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  // Profile edit UI state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '', assignedRegion: '' });
  const [profileErrors, setProfileErrors] = useState({});

  const validateName = (value) => {
    if (!value || !value.trim()) return 'Full name is required';
    const ok = /^[A-Za-z][A-Za-z\s.'-]{1,}$/.test(value.trim());
    return ok ? '' : 'Name can only contain letters, spaces, apostrophes, periods and hyphens';
  };

  const handleProfileInputChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    if (field === 'fullName') {
      const err = validateName(value);
      setProfileErrors(prev => ({ ...prev, fullName: err }));
    }
  };

  // Handle profile save
  const handleProfileSave = async () => {
    try {
      setLoading(true);
      const userData = getUserData();
      
      if (!userData || !userData.id) {
        showNotification('User data not found', 'error');
        return;
      }

      // Validate form data
      if (profileErrors.fullName) {
        showNotification('Please fix validation errors', 'error');
        return;
      }

      const updateData = {
        name: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        location: profileForm.assignedRegion.trim()
      };

      console.log('🔄 Updating staff profile:', updateData);

      const response = await fetch(`${API_BASE_URL}/staff/${userData.id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Profile updated successfully');
        
        // Update local state
        setStaffData(prevData => ({
          ...prevData,
          name: updateData.name,
          phone: updateData.phone,
          location: updateData.location
        }));

        // Update user data in localStorage
        const currentUserData = getUserData();
        if (currentUserData) {
          const updatedUserData = { 
            ...currentUserData, 
            name: updateData.name,
            phone: updateData.phone,
            location: updateData.location
          };
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
          setUser(updatedUserData);
        }

        showNotification('Profile updated successfully!', 'success');
        setIsEditingProfile(false);
        
        // Refresh staff data to ensure consistency
        await fetchStaffData();
      } else {
        console.error('❌ Profile update failed:', data);
        showNotification(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showNotification('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // API base URL - use local server for development
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const BACKEND_URL = isDevelopment ? 'http://localhost:5000' : (import.meta.env.VITE_BACKEND_URL || 'https://rubbereco-backend.onrender.com');
  const API_BASE_URL = `${BACKEND_URL}/api`;
  
  console.log('🔍 Environment detection:', {
    hostname: window.location.hostname,
    isDevelopment,
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
    BACKEND_URL,
    API_BASE_URL
  });

  // Fetch available service requests count for badge
  useEffect(() => {
    const fetchAvailableRequestsCount = async () => {
      try {
        const url = `${BACKEND_URL}/api/service-applications/available-requests`;
        const resp = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        if (resp.ok) {
          const result = await resp.json();
          const availableList = Array.isArray(result?.data) ? result.data : [];
          
          // Then get user's applications to filter out already applied requests
          const applicationsUrl = `${BACKEND_URL}/api/service-applications/my-applications`;
          console.log(`🔍 Fetching applications from: ${applicationsUrl}`);
          const applicationsResp = await fetch(applicationsUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (applicationsResp.ok) {
            const applicationsResult = await applicationsResp.json();
            console.log(`📋 Raw applications data:`, applicationsResult.data);
            
            // Log each application with its status and tappingRequestId
            applicationsResult.data?.forEach((app, index) => {
              console.log(`📋 Application ${index + 1}:`, {
                id: app._id,
                status: app.status,
                tappingRequestId: app.tappingRequestId,
                mappedId: typeof app.tappingRequestId === 'object' && app.tappingRequestId._id ? app.tappingRequestId._id : app.tappingRequestId
              });
            });
            
            const appliedRequestIds = applicationsResult.data?.map(app => {
              if (typeof app.tappingRequestId === 'object' && app.tappingRequestId._id) {
                return app.tappingRequestId._id;
              }
              return app.tappingRequestId;
            }) || [];
            
            console.log(`📋 Mapped applied request IDs:`, appliedRequestIds);
            console.log(`📋 Available requests before filtering:`, availableList.map(r => ({ id: r._id, title: r.title })));
            
            // Filter out requests the user has already applied for (regardless of status)
            const trulyAvailableRequests = availableList.filter(request => {
              const isApplied = appliedRequestIds.includes(request._id);
              console.log(`🔍 Request ${request._id} (${request.title}): isApplied = ${isApplied}`);
              return !isApplied;
            });
            
            setAvailableRequestsCount(trulyAvailableRequests.length);
            console.log(`📊 Badge count: ${trulyAvailableRequests.length} truly available requests (${availableList.length} total - ${appliedRequestIds.length} already applied)`);
            console.log(`🔍 Available requests after filtering:`, trulyAvailableRequests.map(r => ({ id: r._id, title: r.title })));
          } else {
            // Fallback: show all available requests if can't get applications
            setAvailableRequestsCount(availableList.length);
          }
        } else {
          setAvailableRequestsCount(0);
        }
      } catch (e) {
        setAvailableRequestsCount(0);
      }
    };

    fetchAvailableRequestsCount();
    // Only refresh available requests count every 5 minutes (300000ms) instead of every minute
    const timer = setInterval(fetchAvailableRequestsCount, 300000);
    return () => clearInterval(timer);
  }, []);

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || 'dummy-token-for-testing';
  };

  // Get user data
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      const parsed = userData ? JSON.parse(userData) : null;
      console.log('🔍 Current user data from localStorage:', parsed);
      console.log('🔍 User ID type:', typeof parsed?.id);
      console.log('🔍 User ID value:', parsed?.id);
      console.log('🔍 User email:', parsed?.email);
      return parsed;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  // Fetch staff data from backend
  const fetchStaffData = async () => {
    try {
      setLoadingStaffData(true);
      const userData = getUserData();
      console.log('🔍 User data for staff fetch:', userData);

      if (!userData || !userData.id) {
        console.error('❌ No user data found');
        return;
      }

      const apiUrl = `${API_BASE_URL}/staff/${userData.id}`;
      console.log('🌐 Making API request to:', apiUrl);
      console.log('🔑 Auth token exists:', !!getAuthToken());

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`❌ Staff data fetch failed: ${response.status} ${response.statusText}`);
        if (response.status === 404) {
          console.log('❌ Staff member not found by ID, trying to find by email...');
          console.log('🔍 API_BASE_URL:', API_BASE_URL);
          console.log('🔍 User email for search:', userData.email);
          console.log('🔍 Full search URL will be:', `${API_BASE_URL}/staff?search=${encodeURIComponent(userData.email)}`);

          // Try to find staff by email as fallback
          try {
            const emailResponse = await fetch(`${API_BASE_URL}/staff?search=${encodeURIComponent(userData.email)}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json',
              },
            });

            if (emailResponse.ok) {
              const emailData = await emailResponse.json();
              console.log('✅ Found staff by email:', emailData);
              console.log('🔍 Search response data structure:', Object.keys(emailData));
              console.log('🔍 Data array exists:', !!emailData.data);
              console.log('🔍 Data array length:', emailData.data?.length || 'undefined');

              if (emailData.data && emailData.data.length > 0) {
                const staffInfo = emailData.data[0];
                const mappedStaffData = {
                  fullName: staffInfo.name || 'Staff Member',
                  email: staffInfo.email || 'staff@rubbereco.com',
                  role: staffInfo.role || 'Field Officer',
                  employeeId: staffInfo._id || 'N/A',
                  phone: staffInfo.phone || 'N/A',
                  assignedRegion: staffInfo.location || 'N/A',
                  department: staffInfo.department || 'Field Operation',
                  salary: staffInfo.salary || 0,
                  status: staffInfo.status || 'active',
                  performance_rating: staffInfo.performance_rating || 0,
                  tasks_completed: staffInfo.tasks_completed || 0,
                  tasks_assigned: staffInfo.tasks_assigned || 0,
                  avatar: staffInfo.avatar || null
                };
                setStaffData(mappedStaffData);
                return;
              }
            }
          } catch (emailError) {
            console.error('❌ Email lookup also failed:', emailError);
          }

          console.log('Using fallback data');
          setStaffData({
            fullName: userData?.name || 'Staff Member',
            email: userData?.email || 'staff@rubbereco.com',
            role: userData?.staffRole || 'Field Officer',
            phone: userData?.phone || 'N/A',
            avatar: null
          });
          return;
        }
        throw new Error(`Failed to fetch staff data: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
        console.log('✅ Staff data fetched:', data);
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON response:', jsonError);
        const textResponse = await response.text();
        console.error('❌ Response text:', textResponse);
        throw new Error('Invalid JSON response from server');
      }

      // Map the API response to the expected format
      const staffInfo = data.data; // API returns data in data.data
      const mappedStaffData = {
        fullName: staffInfo.name,
        email: staffInfo.email,
        phone: staffInfo.phone,
        role: staffInfo.role,
        employeeId: staffInfo._id, // Use MongoDB _id as employee ID
        assignedRegion: staffInfo.location, // Use location as assigned region
        department: staffInfo.department,
        salary: staffInfo.salary,
        status: staffInfo.status,
        performance_rating: staffInfo.performance_rating,
        tasks_completed: staffInfo.tasks_completed,
        tasks_assigned: staffInfo.tasks_assigned,
        hire_date: staffInfo.hire_date,
        last_active: staffInfo.last_active,
        avatar: staffInfo.avatar || null // Include avatar field
      };

      console.log('🖼️ Avatar in fetched data:', staffInfo.avatar ? 'Present' : 'Not present');
      console.log('📊 Setting staff data with avatar:', mappedStaffData.avatar ? 'Present' : 'Not present');
      setStaffData(mappedStaffData);

    } catch (error) {
      console.error('❌ Error fetching staff data:', error);
      // Fallback to basic user data if staff data fetch fails
      const userData = getUserData();
      setStaffData({
        fullName: userData?.name || 'Staff Member',
        email: userData?.email || 'staff@rubbereco.com',
        role: userData?.staffRole || 'tapper',
        employeeId: userData?.id || 'Loading...',
        phone: userData?.phone || 'Loading...',
        assignedRegion: userData?.location || 'Loading...',
        department: userData?.department || 'Field Operation',
        salary: userData?.salary || 0,
        status: 'active',
        performance_rating: 0,
        tasks_completed: 0,
        tasks_assigned: 0
      });
    } finally {
      setLoadingStaffData(false);
    }
  };

  // Generate auto-generated password (same logic as backend)
  const generateStaffPassword = (name, phone) => {
    if (!name || !phone) return '';

    // Extract first name and remove spaces/special characters
    const firstName = name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');

    // Extract first two digits from phone number
    const phoneDigits = phone.replace(/[^0-9]/g, '').substring(0, 2);

    // Create password: firstname + first2digits + "eco"
    const password = `${firstName}${phoneDigits}eco`;

    return password;
  };

  // Image upload functions
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      showNotification('Please select an image first', 'error');
      return;
    }

    setImageUploading(true);
    try {
      const userData = getUserData();

      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target.result;

        const response = await fetch(`${API_BASE_URL}/staff/${userData.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            avatar: base64Image
          })
        });

        const data = await response.json();

        if (response.ok) {
          console.log('✅ Image upload successful, updating UI...');

          // Update staffData immediately to show new image
          setStaffData(prevData => ({
            ...prevData,
            avatar: base64Image
          }));

          // Also update userData in localStorage if needed
          const currentUserData = getUserData();
          if (currentUserData) {
            const updatedUserData = { ...currentUserData, avatar: base64Image };
            localStorage.setItem('userData', JSON.stringify(updatedUserData));
          }

          showNotification('Profile image updated successfully!', 'success');
          setShowImageModal(false);
          setSelectedImage(null);
          setImagePreview(null);

          // Refresh staff data to ensure consistency
          fetchStaffData();
        } else {
          showNotification(data.message || 'Failed to upload image', 'error');
        }
      };
      reader.readAsDataURL(selectedImage);

    } catch (error) {
      console.error('Image upload error:', error);
      showNotification('Failed to upload image', 'error');
    } finally {
      setImageUploading(false);
    }
  };

  // Password change functions
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const pwdErr = passwordStrength(passwordForm.newPassword);
    if (pwdErr) {
      setNotification({ show: true, message: pwdErr, type: 'error' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotification({ show: true, message: 'Passwords do not match', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    try {
      const userData = getUserData();
      console.log('🔍 User data:', userData);
      console.log('🔍 User ID:', userData.id);
      console.log('🔍 User ID type:', typeof userData.id);
      console.log('🔍 API URL:', `${API_BASE_URL}/staff/${userData.id}/change-password`);
      console.log('🔍 Request payload:', {
        newPassword: passwordForm.newPassword
      });
      console.log('🔍 Password form state:', passwordForm);
      console.log('🔍 New password length:', passwordForm.newPassword?.length);

      const response = await fetch(`${API_BASE_URL}/staff/${userData.id}/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response data:', data);

      if (response.ok) {
        showNotification('Password changed successfully!', 'success');
        setShowPasswordModal(false);
        setPasswordForm({
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showNotification(data.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showNotification('Failed to change password. Please try again.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Sign out function
  const handleSignOut = () => {
    console.log('🚪 Staff user signing out...');

    // Clear all authentication tokens and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('nurseryAdminToken');
    localStorage.removeItem('nurseryAdminUser');
    localStorage.removeItem('redirectAfterLogin');

    // Clear any other stored data
    setUser(null);
    setStaffData(null);
    setPendingRequests([]);
    setCollections([]);
    setAssignments([]);

    // Navigate to login page
    navigate('/login', { replace: true });
  };

  // Fetch assigned tasks data
  const fetchAssignedTasks = async () => {
    try {
      const backendUrl = isDevelopment ? 'http://localhost:5000/api' : (import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api');
      const response = await fetch(`${backendUrl}/service-applications/assigned-tasks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        setAssignedTasks(result.data || []);
        // Also update assignments for the assignments tab
        setAssignments(result.data || []);
      } else {
        console.error('Failed to fetch assigned tasks:', response.status, response.statusText);
      }
    } catch (e) {
      console.error('Failed to load assigned tasks', e);
    }
  };

  // Mark attendance for a specific task
  const markAttendance = (taskId, taskName) => {
    // For individual task marking, we'll also use the form but pre-select the specific task
    const specificTask = assignments.find(task => task._id === taskId);
    if (specificTask) {
      // Set the assignments to only include this specific task
      const singleTaskArray = [specificTask];
      // We'll need to modify the form to handle single task selection
      setShowAttendanceForm(true);
    } else {
      showNotification('Task not found', 'error');
    }
  };

  // Mark attendance for all active tasks
  const markAttendanceForAll = () => {
    const activeTasks = assignments.filter(task => 
      ['in_progress', 'tapper_inspecting', 'tree_count_pending'].includes(task.status)
    );

    if (activeTasks.length === 0) {
      showNotification('No active tasks to mark attendance for.', 'error');
      return;
    }

    // Open the attendance form modal
    setShowAttendanceForm(true);
  };

  // Handle successful attendance marking
  const handleAttendanceSuccess = async () => {
    // Refresh the tasks to show updated attendance
    await fetchAssignedTasks();
  };

  // Load user data and fetch staff data on component mount
  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
    console.log('👤 Staff dashboard loaded for user:', userData?.name);

    // Fetch detailed staff data from backend
    fetchStaffData();
    
    // Fetch assigned tasks data
    fetchAssignedTasks();
  }, []);

  // Initialize profile form when user/staff data is available
  useEffect(() => {
    setProfileForm({
      fullName: (staffData?.fullName || user?.name || '').toString(),
      phone: (staffData?.phone || user?.phone || '').toString(),
      assignedRegion: (staffData?.assignedRegion || user?.location || '').toString()
    });
    setProfileErrors({ fullName: '' });
  }, [staffData, user]);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);


  // Sample data - replace with API calls
  useEffect(() => {

    setPendingRequests([]);

    setCollections([
      {
        id: 1,
        farmLocation: 'Farm Block A-12',
        farmer: 'Suresh Menon',
        latexQuantity: 25.5,
        rubberSheetQuantity: 12.3,
        quality: 'Grade A',
        collectionDate: '2024-01-15',
        status: 'completed'
      },
      {
        id: 2,
        farmLocation: 'Farm Block B-07',
        farmer: 'Maya Pillai',
        latexQuantity: 18.2,
        rubberSheetQuantity: 8.7,
        quality: 'Grade B',
        collectionDate: '2024-01-14',
        status: 'pending'
      }
    ]);

    setAssignments([]);
  }, []);

  // Quick stats for overview
  const quickStats = [
    {
      title: 'Pending Requests',
      value: pendingRequests.length,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Today\'s Collections',
      value: collections.filter(c => c.collectionDate === new Date().toISOString().split('T')[0]).length,
      icon: Droplets,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Assignments',
      value: assignments.filter(a => a.status === 'in_progress').length,
      icon: Target,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
  ];

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'collections', label: 'Collections', icon: Droplets },
    { id: 'requests', label: 'Service Requests', icon: Wrench },
    { id: 'assignments', label: 'Assignments', icon: Users },
    { id: 'attendance', label: 'Leave Management', icon: Calendar },
    { id: 'attendance-records', label: 'Attendance Records', icon: UserCheck },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <motion.div
      className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Toast Notifications */}
      <Toast />
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-40 backdrop-blur-md bg-opacity-90`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TreePine className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Staff Dashboard
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Welcome back, {loadingStaffData ? 'Loading...' : (staffData?.fullName || user?.name || 'Staff Member')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Current Time */}
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentTime.toLocaleTimeString()}
              </div>

              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {staffData?.avatar ? (
                    <img
                      src={staffData.avatar}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="text-left hidden sm:block">
                    <span className={`text-sm font-medium block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {loadingStaffData ? 'Loading...' : (staffData?.fullName || user?.name || 'Staff Member')}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {loadingStaffData ? '...' : (staffData?.role || user?.staffRole || 'Field Officer')}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                    showProfileDropdown ? 'rotate-180' : ''
                  } ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute right-0 mt-2 w-64 rounded-lg shadow-xl border ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      } z-50 overflow-hidden`}
                      style={{ minWidth: '240px' }}
                    >
                      <div className="py-1">
                        {/* User Info Header */}
                        <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          {loadingStaffData ? (
                            <div className="animate-pulse">
                              <div className={`h-4 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                              <div className={`h-3 rounded mb-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                              <div className={`h-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                            </div>
                          ) : (
                            <>
                              <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {staffData?.fullName || user?.name || 'Staff Member'}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                {staffData?.email || user?.email || 'staff@rubbereco.com'}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                ID: {staffData?.employeeId || user?.employeeId || 'EMP001'}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                Role: {staffData?.role || user?.staffRole || 'Field Officer'}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setActiveTab('profile');
                              setShowProfileDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-3 ${
                              darkMode
                                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Profile Settings</span>
                          </button>

                          <button
                            onClick={handleSignOut}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-3 text-red-600 ${
                              darkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                            }`}
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="relative flex items-center">
                  {tab.label}
                  {tab.id === 'requests' && availableRequestsCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs h-5 min-w-[1.25rem] px-1">
                      {availableRequestsCount}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {quickStats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {stat.title}
                        </p>
                        <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-2`}>
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`h-8 w-8 ${stat.textColor}`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid grid-cols-1 gap-8">

                {/* Today's Tasks */}
                <motion.div
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                    darkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Today's Tasks
                  </h3>
                  <div className="space-y-4">
                    {assignments.slice(0, 3).map((task) => {
                      const req = typeof task.tappingRequestId === 'object' ? task.tappingRequestId : null;
                      return (
                        <div
                          key={task._id}
                          className={`p-4 rounded-xl border ${
                            darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {task.applicationId}
                              </h4>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {req ? (typeof req.farmLocation === 'string' ? req.farmLocation : 
                                        typeof req.farmLocation === 'object' && req.farmLocation?.address ? req.farmLocation.address :
                                        'Service Request') : 'Service Request'}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                                {req && req.startDate ? new Date(req.startDate).toLocaleDateString() : 'Start date not specified'}
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              task.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : task.status === 'accepted' || task.status === 'agreed' || task.status === 'selected'
                                ? 'bg-green-100 text-green-800'
                                : task.status === 'negotiating'
                                ? 'bg-orange-100 text-orange-800'
                                : task.status === 'completed'
                                ? 'bg-purple-100 text-purple-800'
                                : task.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status?.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className="w-full mt-4 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    View All Assignments
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'collections' && (
            <motion.div
              key="collections"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Collections Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Latex & Rubber Sheet Collection
                </h2>
                <button className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <Plus className="h-5 w-5" />
                  <span>Add Collection</span>
                </button>
              </div>

              {/* Collection Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Today's Latex
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        43.7 kg
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50">
                      <Droplets className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Rubber Sheets
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        21.0 kg
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-50">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Farms Visited
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {collections.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Collections List */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Collection Records
                  </h3>
                </div>
                {collections.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Droplets className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                      No Collection Records
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                      No collection records found. Start collecting latex and rubber sheets to see them here.
                    </p>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors">
                      Add Collection
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                        <tr>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                            Farm Location
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                            Farmer
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                            Latex (kg)
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                            Rubber Sheets (kg)
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                            Quality
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                            Status
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {collections.map((collection) => (
                          <tr key={collection.id} className={`hover:${darkMode ? 'bg-gray-750' : 'bg-gray-50'} transition-colors`}>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {collection.farmLocation}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {collection.farmer}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {collection.latexQuantity}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {collection.rubberSheetQuantity}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                collection.quality === 'Grade A'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {collection.quality}
                              </span>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                collection.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {collection.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => {
                                    setSelectedCollection(collection);
                                    setShowCollectionDetailsModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="text-green-600 hover:text-green-900 transition-colors">
                                  <Edit className="h-4 w-4" />
                                </button>
                                {collection.status === 'pending' && (
                                  <button className="text-green-600 hover:text-green-900 transition-colors">
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>


            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Service Requests Header */}
              <div className="mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Service Requests
                </h2>

                {/* Sub-tabs */}
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {[
                    { id: 'available', label: 'Available Requests', icon: Search },
                    { id: 'my-applications', label: 'My Applications', icon: FileText },
                    { id: 'assigned', label: 'Assigned Tasks', icon: CheckCircle }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setServiceRequestsSubTab(tab.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          serviceRequestsSubTab === tab.id
                            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-tab Content */}
              {serviceRequestsSubTab === 'available' && (
                <AvailableServiceRequests darkMode={darkMode} />
              )}

              {serviceRequestsSubTab === 'my-applications' && (
                <MyApplications darkMode={darkMode} />
              )}

              {serviceRequestsSubTab === 'assigned' && (
                <AssignedTasks darkMode={darkMode} />
              )}
            </motion.div>
          )}

          {activeTab === 'attendance' && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Attendance darkMode={darkMode} />
            </motion.div>
          )}

          {activeTab === 'attendance-records' && (
            <motion.div
              key="attendance-records"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AttendanceRecords darkMode={darkMode} />
            </motion.div>
          )}

          {activeTab === 'assignments' && (
            <motion.div
              key="assignments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Assignments Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tapping Assignments & Tasks
                </h2>
                <button 
                  onClick={markAttendanceForAll}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <UserCheck className="h-5 w-5" />
                  <span>Mark Attendance</span>
                </button>
              </div>

              {/* Assignment Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Active Tasks
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {assignments.filter(a => ['in_progress', 'tapper_inspecting', 'tree_count_pending'].includes(a.status)).length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-50">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Assignments
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {assignments.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Completed Tasks
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {assignments.filter(a => a.status === 'completed').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50">
                      <UserCheck className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Completion Rate
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        85%
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-50">
                      <CheckCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignments List */}
              <div className="space-y-6">
                {assignments.length === 0 ? (
                  <motion.div
                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-12 shadow-lg border ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    } text-center`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Target className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                      No Assignments Available
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                      You don't have any assignments at the moment. Check back later for new tasks.
                    </p>
                    <button 
                      onClick={fetchAssignedTasks}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Refresh Assignments
                    </button>
                  </motion.div>
                ) : (
                  assignments.map((task) => {
                    const req = typeof task.tappingRequestId === 'object' ? task.tappingRequestId : null;
                    const current = task.negotiation?.currentProposal;
                    return (
                      <motion.div
                        key={task._id}
                        className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                          darkMode ? 'border-gray-700' : 'border-gray-100'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Target className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {task.applicationId}
                                </h3>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {req ? (typeof req.farmLocation === 'string' ? req.farmLocation : 
                                          typeof req.farmLocation === 'object' && req.farmLocation?.address ? req.farmLocation.address :
                                          'Service Request') : 'Service Request'}
                                </p>
                              </div>
                            </div>

                            {req && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-4">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {typeof req.farmLocation === 'string' ? req.farmLocation : 
                                   typeof req.farmLocation === 'object' && req.farmLocation?.address ? req.farmLocation.address :
                                   'Location not specified'}
                                </div>
                                <div className="flex items-center">
                                  <TreePine className="h-4 w-4 mr-2" />
                                  {req.farmerEstimatedTrees || req.numberOfTrees || 'N/A'} trees
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  ₹{req.budgetPerTree || '—'} per tree
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Start: {req.startDate ? new Date(req.startDate).toLocaleDateString() : '—'}
                                </div>
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-2" />
                                  {req.farmerName || 'Farmer'}
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {req.farmerPhone || '—'}
                                </div>
                              </div>
                            )}

                            {current && (
                              <div className={`mb-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>
                                    Agreement: ₹{current.proposedRate || 0} for {current.proposedTreeCount || 0} trees
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              task.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : task.status === 'accepted' || task.status === 'agreed' || task.status === 'selected'
                                ? 'bg-green-100 text-green-800'
                                : task.status === 'negotiating'
                                ? 'bg-orange-100 text-orange-800'
                                : task.status === 'completed'
                                ? 'bg-purple-100 text-purple-800'
                                : task.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status?.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={() => markAttendance(task._id, task.applicationId)}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <UserCheck className="h-4 w-4" />
                              <span className="text-sm">Mark Attendance</span>
                            </button>
                            <button className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">Field Report</span>
                            </button>
                            {req && req.farmerPhone && (
                              <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors">
                                <MessageSquare className="h-4 w-4" />
                                <span className="text-sm">Contact Farmer</span>
                              </button>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {['assigned', 'accepted', 'agreed', 'selected'].includes(task.status) && (
                              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                                Start Task
                              </button>
                            )}
                            {['in_progress', 'tapper_inspecting', 'tree_count_pending'].includes(task.status) && (
                              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                                Complete Task
                              </button>
                            )}
                            {task.status === 'completed' && (
                              <div className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm">
                                Completed
                              </div>
                            )}
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

            </motion.div>
          )}


          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Profile Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Profile & Settings
                </h2>
                <button
                  onClick={() => setIsEditingProfile((prev) => !prev)}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit className="h-5 w-5" />
                  <span>{isEditingProfile ? 'Close' : 'Edit Profile'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Info */}
                <div className="lg:col-span-2">
                  <motion.div
                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    } mb-6`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={isEditingProfile ? profileForm.fullName : (staffData?.fullName || user?.name || 'Loading...')}
                          onChange={(e) => handleProfileInputChange('fullName', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                          readOnly={!isEditingProfile}
                        />
                        {isEditingProfile && (
                          <div className="mt-3">
                            <button
                              disabled={!!profileErrors.fullName || loading}
                              onClick={(e) => {
                                e.preventDefault();
                                if (profileErrors.fullName || loading) return;
                                handleProfileSave();
                              }}
                              className={`px-4 py-2 rounded-lg text-white ${profileErrors.fullName || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                              {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        )}
                        {isEditingProfile && profileErrors.fullName && (
                          <p className="text-xs text-red-600 mt-1">{profileErrors.fullName}</p>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Employee ID
                        </label>
                        <input
                          type="text"
                          value={staffData?.employeeId || user?.employeeId || 'Loading...'}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Email
                        </label>
                        <input
                          type="email"
                          value={staffData?.email || user?.email || 'Loading...'}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={isEditingProfile ? profileForm.phone : (staffData?.phone || user?.phone || 'Loading...')}
                          onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                          readOnly={!isEditingProfile}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Role
                        </label>
                        <input
                          type="text"
                          value={staffData?.role || user?.staffRole || 'Loading...'}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Location
                        </label>
                        <input
                          type="text"
                          value={isEditingProfile ? profileForm.assignedRegion : (staffData?.assignedRegion || user?.location || 'Loading...')}
                          onChange={(e) => handleProfileInputChange('assignedRegion', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                          readOnly={!isEditingProfile}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Settings */}
                  <motion.div
                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Assignment Notifications
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Get notified about new task assignments
                          </p>
                        </div>
                        <div className="relative">
                          <input type="checkbox" className="sr-only" defaultChecked />
                          <div className="w-10 h-6 bg-green-500 rounded-full shadow-inner"></div>
                          <div className="absolute w-4 h-4 bg-white rounded-full shadow top-1 right-1 transition"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Weather Alerts
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Receive weather-related notifications
                          </p>
                        </div>
                        <div className="relative">
                          <input type="checkbox" className="sr-only" defaultChecked />
                          <div className="w-10 h-6 bg-green-500 rounded-full shadow-inner"></div>
                          <div className="absolute w-4 h-4 bg-white rounded-full shadow top-1 right-1 transition"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            System Updates
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Get notified about system maintenance
                          </p>
                        </div>
                        <div className="relative">
                          <input type="checkbox" className="sr-only" />
                          <div className="w-10 h-6 bg-gray-300 rounded-full shadow-inner"></div>
                          <div className="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition"></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Profile Stats */}
                <div>
                  <motion.div
                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    } mb-6`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-center mb-6">
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        {staffData?.avatar ? (
                          <img
                            src={staffData.avatar}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover border-4 border-green-500"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                            <User className="h-10 w-10 text-white" />
                          </div>
                        )}
                        <button
                          onClick={() => setShowImageModal(true)}
                          className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                          title="Change profile picture"
                        >
                          <Camera className="h-3 w-3 text-white" />
                        </button>
                      </div>
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {loadingStaffData ? 'Loading...' : (staffData?.fullName || user?.name || 'Staff Member')}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {loadingStaffData ? 'Loading...' : (staffData?.role || user?.staffRole || 'Field Officer')}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Tasks Completed
                        </span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {loadingStaffData ? '...' : (staffData?.tasksCompleted || '127')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Collections Made
                        </span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {loadingStaffData ? '...' : (staffData?.collectionsMade || '89')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Experience
                        </span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {loadingStaffData ? '...' : (staffData?.experience || '3 Years')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Rating
                        </span>
                        <div className="flex items-center space-x-1">
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {loadingStaffData ? '...' : (staffData?.rating || '4.8')}
                          </span>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Account Actions
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          // Reset password form to empty state
                          setPasswordForm({
                            newPassword: '',
                            confirmPassword: ''
                          });
                          setShowPasswordModal(true);
                        }}
                        className="w-full flex items-center space-x-3 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Change Password</span>
                      </button>

                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Change Password
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setShowCurrentPassword(false);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Confirm your new password"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setShowCurrentPassword(false);
                  }}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                    darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Professional Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            className="fixed top-4 right-4 z-[9999] max-w-md"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className={`rounded-xl shadow-2xl border backdrop-blur-md p-4 ${
              notification.type === 'success'
                ? 'bg-green-50/95 border-green-200 text-green-800'
                : 'bg-red-50/95 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {notification.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-5">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                  className={`flex-shrink-0 ml-2 p-1 rounded-md transition-colors ${
                    notification.type === 'success'
                      ? 'text-green-400 hover:text-green-600 hover:bg-green-100'
                      : 'text-red-400 hover:text-red-600 hover:bg-red-100'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Image Upload Modal */}
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md shadow-xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Upload Profile Image
                </h3>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="text-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-green-500"
                    />
                  </div>
                )}

                {/* File Input */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImageModal(false);
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                      darkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImageUpload}
                    disabled={!selectedImage || imageUploading}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      !selectedImage || imageUploading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                  >
                    {imageUploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection Details Modal */}
      <AnimatePresence>
        {showCollectionDetailsModal && selectedCollection && (
          <motion.div
            key="collection-details-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCollectionDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-4 rounded-t-2xl`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Collection Details</h2>
                  <button
                    onClick={() => setShowCollectionDetailsModal(false)}
                    className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} text-2xl`}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Collection ID */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Collection #{selectedCollection.id}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCollection.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {selectedCollection.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Collection Information */}
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Collection Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Farm Location</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedCollection.farmLocation}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Farmer Name</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedCollection.farmer}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Collection Date</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedCollection.collectionDate}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Quality Grade</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedCollection.quality}</p>
                    </div>
                  </div>
                </div>

                {/* Collection Quantities */}
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Collection Quantities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Latex Quantity</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedCollection.latexQuantity} kg</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Rubber Sheet Quantity</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedCollection.rubberSheetQuantity} kg</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowCollectionDetailsModal(false)}
                    className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                      darkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Add edit functionality here
                      console.log('Edit collection:', selectedCollection.id);
                    }}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    Edit Collection
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attendance Marking Form Modal */}
      <AttendanceMarkingForm
        isOpen={showAttendanceForm}
        onClose={() => setShowAttendanceForm(false)}
        tasks={assignments}
        onSuccess={handleAttendanceSuccess}
        darkMode={darkMode}
      />
    </motion.div>
  );
};

export default StaffDashboard;
