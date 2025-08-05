import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  MapPin,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  MessageSquare,
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
  Send,
  Filter,
  Search,
  MoreVertical,
  LogOut,
  ChevronDown,
  X,
  EyeOff,
  Camera
} from 'lucide-react';

const StaffDashboard = ({ darkMode }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [collections, setCollections] = useState([]);
  const [assignments, setAssignments] = useState([]);
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

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api';
  console.log('🔧 API_BASE_URL configured as:', API_BASE_URL);

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

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('New passwords do not match!', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showNotification('New password must be at least 6 characters long!', 'error');
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

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectAfterLogin');

    // Clear any other stored data
    setUser(null);
    setStaffData(null);
    setNotifications([]);
    setPendingRequests([]);
    setCollections([]);
    setAssignments([]);

    // Navigate to login page
    navigate('/login', { replace: true });
  };

  // Load user data and fetch staff data on component mount
  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
    console.log('👤 Staff dashboard loaded for user:', userData?.name);

    // Fetch detailed staff data from backend
    fetchStaffData();
  }, []);

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
    // Initialize sample data
    setNotifications([
      {
        id: 1,
        type: 'assignment',
        title: 'New Tapping Assignment',
        message: 'You have been assigned to Farm Block A-12',
        time: '10 minutes ago',
        read: false
      },
      {
        id: 2,
        type: 'alert',
        title: 'Weather Alert',
        message: 'Heavy rain expected tomorrow. Adjust collection schedule.',
        time: '1 hour ago',
        read: false
      },
      {
        id: 3,
        type: 'update',
        title: 'Equipment Maintenance',
        message: 'Tapping tools maintenance scheduled for Friday',
        time: '2 hours ago',
        read: true
      }
    ]);

    setPendingRequests([
      {
        id: 1,
        farmer: 'Rajesh Kumar',
        type: 'fertilizer',
        description: 'Fertilizer application needed for 2 acres',
        priority: 'high',
        location: 'Farm Block B-15',
        requestedDate: '2024-07-25',
        status: 'pending'
      },
      {
        id: 2,
        farmer: 'Priya Nair',
        type: 'rain_guard',
        description: 'Rain guard installation for new plantation',
        priority: 'medium',
        location: 'Farm Block C-08',
        requestedDate: '2024-07-26',
        status: 'in_progress'
      }
    ]);

    setCollections([
      {
        id: 1,
        farmLocation: 'Farm Block A-12',
        farmer: 'Suresh Menon',
        latexQuantity: 25.5,
        rubberSheetQuantity: 12.3,
        quality: 'Grade A',
        collectionDate: '2024-07-24',
        status: 'completed'
      },
      {
        id: 2,
        farmLocation: 'Farm Block B-07',
        farmer: 'Maya Pillai',
        latexQuantity: 18.2,
        rubberSheetQuantity: 8.7,
        quality: 'Grade B',
        collectionDate: '2024-07-24',
        status: 'pending'
      }
    ]);

    setAssignments([
      {
        id: 1,
        task: 'Latex Collection',
        location: 'Farm Block A-12',
        assignedTappers: ['Ravi Kumar', 'Anil Varma'],
        startTime: '06:00 AM',
        endTime: '12:00 PM',
        status: 'in_progress',
        attendance: { present: 2, total: 2 }
      },
      {
        id: 2,
        task: 'Fertilizer Application',
        location: 'Farm Block C-15',
        assignedTappers: ['Deepak Singh'],
        startTime: '08:00 AM',
        endTime: '04:00 PM',
        status: 'scheduled',
        attendance: { present: 0, total: 1 }
      }
    ]);
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
      value: collections.filter(c => c.collectionDate === '2024-07-24').length,
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
    {
      title: 'Unread Notifications',
      value: notifications.filter(n => !n.read).length,
      icon: Bell,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'collections', label: 'Collections', icon: Droplets },
    { id: 'requests', label: 'Service Requests', icon: Wrench },
    { id: 'assignments', label: 'Assignments', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <motion.div
      className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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

              {/* Notifications Badge */}
              <div className="relative">
                <Bell className={`h-6 w-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'} cursor-pointer hover:text-green-600 transition-colors`} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
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
                <span>{tab.label}</span>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Notifications */}
                <motion.div
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                    darkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Recent Notifications
                  </h3>
                  <div className="space-y-4">
                    {notifications.slice(0, 3).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl border ${
                          darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'
                        } ${!notification.read ? 'border-l-4 border-l-green-500' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {notification.title}
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              {notification.message}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-green-500 rounded-full ml-2 mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="w-full mt-4 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    View All Notifications
                  </button>
                </motion.div>

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
                    {assignments.slice(0, 3).map((assignment) => (
                      <div
                        key={assignment.id}
                        className={`p-4 rounded-xl border ${
                          darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {assignment.task}
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {assignment.location}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                              {assignment.startTime} - {assignment.endTime}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            assignment.status === 'in_progress'
                              ? 'bg-green-100 text-green-800'
                              : assignment.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
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
                              <button className="text-blue-600 hover:text-blue-900 transition-colors">
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
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Service Requests Management
                </h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search requests..."
                      className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <button className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              {/* Request Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Pending
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {pendingRequests.filter(r => r.status === 'pending').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-50">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        In Progress
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {pendingRequests.filter(r => r.status === 'in_progress').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        High Priority
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {pendingRequests.filter(r => r.priority === 'high').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-50">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        This Week
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {pendingRequests.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-50">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Requests List */}
              <div className="space-y-6">
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    } ${request.priority === 'high' ? 'border-l-4 border-l-red-500' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            request.type === 'fertilizer' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {request.type === 'fertilizer' ? (
                              <Droplets className={`h-5 w-5 ${
                                request.type === 'fertilizer' ? 'text-green-600' : 'text-blue-600'
                              }`} />
                            ) : (
                              <Shield className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {request.type === 'fertilizer' ? 'Fertilizer Application' : 'Rain Guard Installation'}
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Requested by {request.farmer}
                            </p>
                          </div>
                        </div>

                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                          {request.description}
                        </p>

                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPin className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {request.location}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {request.requestedDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : request.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {request.priority.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending'
                            ? 'bg-orange-100 text-orange-800'
                            : request.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">View Details</span>
                        </button>
                        <button className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm">Contact Farmer</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        {request.status === 'pending' && (
                          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            Accept Request
                          </button>
                        )}
                        {request.status === 'in_progress' && (
                          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            Mark Complete
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
                <button className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
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
                        {assignments.filter(a => a.status === 'in_progress').length}
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
                        Total Tappers
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {assignments.reduce((total, a) => total + a.assignedTappers.length, 0)}
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
                        Present Today
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {assignments.reduce((total, a) => total + a.attendance.present, 0)}
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
                {assignments.map((assignment) => (
                  <motion.div
                    key={assignment.id}
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
                              {assignment.task}
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {assignment.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 text-sm mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {assignment.startTime} - {assignment.endTime}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {assignment.assignedTappers.length} Tappers
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <UserCheck className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {assignment.attendance.present}/{assignment.attendance.total} Present
                            </span>
                          </div>
                        </div>

                        {/* Assigned Tappers */}
                        <div className="mb-4">
                          <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Assigned Tappers:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {assignment.assignedTappers.map((tapper, index) => (
                              <span
                                key={index}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {tapper}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          assignment.status === 'in_progress'
                            ? 'bg-green-100 text-green-800'
                            : assignment.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {assignment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
                          <UserCheck className="h-4 w-4" />
                          <span className="text-sm">Mark Attendance</span>
                        </button>
                        <button className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Field Report</span>
                        </button>
                        <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm">Send Update</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        {assignment.status === 'scheduled' && (
                          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            Start Task
                          </button>
                        )}
                        {assignment.status === 'in_progress' && (
                          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            Complete Task
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions Panel */}
              <motion.div
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                  darkMode ? 'border-gray-700' : 'border-gray-100'
                } mt-8`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center space-x-3 p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Report Issue</span>
                  </button>
                  <button className="flex items-center space-x-3 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
                    <Send className="h-5 w-5" />
                    <span>Request Resources</span>
                  </button>
                  <button className="flex items-center space-x-3 p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors">
                    <MessageSquare className="h-5 w-5" />
                    <span>Contact Admin</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Notifications Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Notifications & Messages
                </h2>
                <button className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <CheckCircle className="h-5 w-5" />
                  <span>Mark All Read</span>
                </button>
              </div>

              {/* Notification Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Unread
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {notifications.filter(n => !n.read).length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-50">
                      <Bell className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Today
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {notifications.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Alerts
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {notifications.filter(n => n.type === 'alert').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-50">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    } ${!notification.read ? 'border-l-4 border-l-green-500' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-2 rounded-lg ${
                          notification.type === 'assignment' ? 'bg-green-100' :
                          notification.type === 'alert' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {notification.type === 'assignment' ? (
                            <Target className={`h-5 w-5 ${
                              notification.type === 'assignment' ? 'text-green-600' :
                              notification.type === 'alert' ? 'text-red-600' : 'text-blue-600'
                            }`} />
                          ) : notification.type === 'alert' ? (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          ) : (
                            <Bell className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                            {notification.message}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
                            {notification.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
                <button className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <Edit className="h-5 w-5" />
                  <span>Edit Profile</span>
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
                          value={staffData?.fullName || user?.name || 'Loading...'}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                          readOnly
                        />
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
                          value={staffData?.phone || user?.phone || 'Loading...'}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                          readOnly
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
                          value={staffData?.assignedRegion || user?.location || 'Loading...'}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                          readOnly
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
    </motion.div>
  );
};

export default StaffDashboard;
