import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Briefcase,
  LogOut,
  Settings,
  Bell,
  Eye,
  EyeOff,
  // Farmer module icons
  Users,
  FileText,
  Clock,
  GraduationCap,
  ShoppingCart,
  CreditCard,
  Wrench,
  UserCheck,
  CheckSquare,
  TreePine,
  Droplets,
  DollarSign,
  AlertCircle,
  Plus,
  ArrowRight,
  Menu,
  Upload,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import Navbar from '../components/Navbar';
import TapperRequest from '../components/Farmer/TapperRequest';
import TappingSchedule from '../components/Farmer/TappingSchedule';
import LandLeaseApplication from '../components/Farmer/LandLeaseApplication';
import ApplicationStatus from '../components/Farmer/ApplicationStatus';
import TrainingRegistration, { TrainingSchedule } from '../components/Farmer/TrainingRegistration';
import MarketList from '../components/Farmer/MarketList';
import PaymentStatus from '../components/Farmer/PaymentStatus';
import FertilizerRainGuardRequest from '../components/Farmer/FertilizerRainGuardRequest';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [profileImage, setProfileImage] = useState(null);
  const [isTapperRequestOpen, setIsTapperRequestOpen] = useState(false);
  const [isTappingScheduleOpen, setIsTappingScheduleOpen] = useState(false);
  const [isLandLeaseOpen, setIsLandLeaseOpen] = useState(false);
  const [isApplicationStatusOpen, setIsApplicationStatusOpen] = useState(false);
  const [isTrainingRegistrationOpen, setIsTrainingRegistrationOpen] = useState(false);
  const [isTrainingScheduleOpen, setIsTrainingScheduleOpen] = useState(false);
  const [isMarketListOpen, setIsMarketListOpen] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [isPaymentStatusOpen, setIsPaymentStatusOpen] = useState(false);
  const [isFertilizerRequestOpen, setIsFertilizerRequestOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [farmerStats, setFarmerStats] = useState({
    active: 0,
    pending: 0,
    complete: 0,
    loading: true
  });
  const navigate = useNavigate();

  // Profile image storage utilities
  const getProfileImageKey = (userId) => `profile_image_${userId}`;

  const saveProfileImage = (userId, imageData) => {
    localStorage.setItem(getProfileImageKey(userId), imageData);
  };

  const getProfileImage = (userId) => {
    return localStorage.getItem(getProfileImageKey(userId));
  };

  const removeProfileImage = (userId) => {
    localStorage.removeItem(getProfileImageKey(userId));
  };

  // Function to fetch fresh user data from server
  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const freshUser = data.user;
          console.log('✅ Fresh user data from server:', freshUser);

          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(freshUser));
          setUser(freshUser);
          setEditForm({
            name: freshUser.name || '',
            email: freshUser.email || '',
            phone: freshUser.phone || '',
            location: freshUser.location || '',
            bio: freshUser.bio || ''
          });

          // Load saved profile image if exists
          const savedProfileImage = getProfileImage(freshUser.id || freshUser._id);
          if (savedProfileImage) {
            setImagePreview(savedProfileImage);
            const updatedUser = { ...freshUser, profileImage: savedProfileImage };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }

          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Error fetching fresh user data:', error);
      return false;
    }
  };

  // Function to fetch farmer statistics
  const fetchFarmerStats = async (userEmail) => {
    try {
      setFarmerStats(prev => ({ ...prev, loading: true }));

      console.log('🔍 Fetching stats for user email:', userEmail);

      // Fetch all tapping requests and filter by user email on the frontend
      // This is a temporary solution to ensure we get the correct user's data
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/farmer-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 All requests response:', data);

        if (data.success && data.data) {
          // Filter requests by the current user's email
          const userRequests = data.data.filter(request =>
            request.farmerEmail === userEmail
          );

          console.log('📊 User-specific requests:', userRequests);
          console.log('📊 User email being filtered:', userEmail);

          // Calculate statistics from filtered requests
          const stats = {
            submitted: 0,
            assigned: 0,
            accepted: 0,
            in_progress: 0,
            completed: 0
          };

          userRequests.forEach(request => {
            if (stats.hasOwnProperty(request.status)) {
              stats[request.status]++;
            }
          });

          console.log('📊 Calculated user statistics:', stats);

          setFarmerStats({
            active: (stats.in_progress || 0) + (stats.assigned || 0) + (stats.accepted || 0), // Active = in_progress + assigned + accepted
            pending: stats.submitted || 0, // Pending = submitted requests
            complete: stats.completed || 0, // Complete = completed requests
            loading: false
          });

          return true;
        }
      } else {
        console.error('❌ API Error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error details:', errorText);
      }

      // Fallback: set default values if API fails or no data
      console.log('📊 Setting fallback values (all zeros)');
      setFarmerStats({
        active: 0,
        pending: 0,
        complete: 0,
        loading: false
      });

      return false;
    } catch (error) {
      console.error('❌ Error fetching farmer statistics:', error);
      setFarmerStats({
        active: 0,
        pending: 0,
        complete: 0,
        loading: false
      });
      return false;
    }
  };

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('📱 User data from localStorage:', parsedUser);

      // Set initial data from localStorage
      setUser(parsedUser);
      setEditForm({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        location: parsedUser.location || '',
        bio: parsedUser.bio || ''
      });

      // Load profile image from separate storage
      const savedProfileImage = getProfileImage(parsedUser.id || parsedUser._id);
      if (savedProfileImage) {
        setImagePreview(savedProfileImage);
        const updatedUser = { ...parsedUser, profileImage: savedProfileImage };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Fetch fresh data from server to ensure we have latest info
      const userId = parsedUser.id || parsedUser._id;
      if (userId) {
        fetchUserData(userId);
      }

      // Fetch farmer statistics if user is a farmer
      if (parsedUser.role === 'farmer' || parsedUser.role === 'user') {
        fetchFarmerStats(parsedUser.email);
      }

      // Fetch user activities after setting user data
      setTimeout(() => fetchUserActivities(), 100);
    } else {
      // Redirect to login if no user data
      navigate('/login');
    }
  }, [navigate]);

  // Fetch activities when user data changes
  useEffect(() => {
    if (user?.id) {
      fetchUserActivities();
    }
  }, [user?.id]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // Helper function to get time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Function to fetch user's recent activities
  const fetchUserActivities = async () => {
    if (!user?.id) return;

    try {
      setActivitiesLoading(true);
      const activities = [];
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      // Fetch user's tapping requests
      try {
        const tappingResponse = await fetch(`${backendUrl}/api/farmer-requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (tappingResponse.ok) {
          const tappingData = await tappingResponse.json();
          const userRequests = tappingData.data?.filter(request =>
            request.farmer_id === user.id || request.farmer_email === user.email
          ) || [];

          // Add recent tapping requests (last 7 days)
          userRequests
            .filter(request => {
              const requestDate = new Date(request.created_at || request.createdAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return requestDate > weekAgo;
            })
            .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
            .slice(0, 2)
            .forEach(request => {
              const timeAgo = getTimeAgo(new Date(request.created_at || request.createdAt));
              activities.push({
                id: `tapping_${request._id}`,
                type: 'tapping_request',
                message: `Tapping request ${request.status || 'submitted'}`,
                time: timeAgo,
                icon: 'CheckSquare',
                color: request.status === 'completed' ? 'green' :
                       request.status === 'approved' ? 'blue' : 'orange',
                details: `${request.location || 'Location not specified'}`
              });
            });
        }
      } catch (error) {
        console.warn('Could not fetch tapping requests:', error);
      }

      // Add profile updates as activity
      if (user.updatedAt || user.updated_at) {
        const updateDate = new Date(user.updatedAt || user.updated_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        if (updateDate > weekAgo) {
          activities.push({
            id: 'profile_update',
            type: 'profile_update',
            message: 'Profile information updated',
            time: getTimeAgo(updateDate),
            icon: 'AlertCircle',
            color: 'blue',
            details: 'Personal information modified'
          });
        }
      }

      // Add account creation as activity if recent
      if (user.createdAt || user.created_at) {
        const createdDate = new Date(user.createdAt || user.created_at);
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);

        if (createdDate > monthAgo) {
          activities.push({
            id: 'account_created',
            type: 'account_created',
            message: 'Welcome to RubberEco platform',
            time: getTimeAgo(createdDate),
            icon: 'DollarSign',
            color: 'green',
            details: 'Account created successfully'
          });
        }
      }

      // If no real activities, add contextual messages
      if (activities.length === 0) {
        activities.push({
          id: 'no_activity_1',
          type: 'info',
          message: 'No recent activities',
          time: 'Just now',
          icon: 'AlertCircle',
          color: 'gray',
          details: 'Start by submitting a tapping request'
        });
      }

      // Sort by most recent and limit to 3
      const sortedActivities = activities
        .sort((a, b) => {
          const timeA = a.time === 'Just now' ? 0 :
                      a.time.includes('minute') ? parseInt(a.time) :
                      a.time.includes('hour') ? parseInt(a.time) * 60 :
                      a.time.includes('day') ? parseInt(a.time) * 1440 : 999999;
          const timeB = b.time === 'Just now' ? 0 :
                      b.time.includes('minute') ? parseInt(b.time) :
                      b.time.includes('hour') ? parseInt(b.time) * 60 :
                      b.time.includes('day') ? parseInt(b.time) * 1440 : 999999;
          return timeA - timeB;
        })
        .slice(0, 3);

      setRecentActivities(sortedActivities);
      console.log('📋 User activities loaded:', sortedActivities);

    } catch (error) {
      console.error('❌ Error fetching user activities:', error);
      // Fallback activities
      setRecentActivities([{
        id: 'error',
        type: 'error',
        message: 'Unable to load recent activities',
        time: 'Just now',
        icon: 'AlertCircle',
        color: 'gray',
        details: 'Please try refreshing the page'
      }]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Handle profile image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        showNotification('Please select a valid image file (JPEG, PNG, or GIF)', 'error');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
      }

      setProfileImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async () => {
    if (!profileImage) return;

    setImageUploading(true);
    try {
      // Convert image to base64 for storage (in a real app, you'd upload to a server)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target.result;

        // Save profile image to separate storage (persists across sessions)
        const userId = user._id || user.id;

        // Validate MongoDB ObjectId format
        if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error(`Invalid user ID format: ${userId}. Expected MongoDB ObjectId format.`);
        }

        saveProfileImage(userId, base64Image);

        try {
          // Update profile in MongoDB via API
          const updateData = {
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            location: user.location || '',
            bio: user.bio || '',
            role: user.role,
            isVerified: user.isVerified,
            profileImage: base64Image
          };

          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
            },
            body: JSON.stringify(updateData)
          });

          const data = await response.json();

          if (data.success) {
            // Update localStorage with the response from server
            const updatedUser = data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            showNotification('Profile image updated successfully!', 'success');
          } else {
            throw new Error(data.message || 'Failed to update profile image');
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          // Still update locally if API fails
          const updatedUser = { ...user, profileImage: base64Image };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          showNotification('Profile image updated locally. Server sync may be delayed.', 'warning');
        }

        // Update UI state
        setImagePreview(base64Image);
        setProfileImage(null);

        // Force a page refresh to update navbar and other components
        window.dispatchEvent(new Event('storage'));

        setImageUploading(false);
      };
      reader.readAsDataURL(profileImage);
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('Failed to upload image. Please try again.', 'error');
      setImageUploading(false);
    }
  };

  // Remove profile image
  const handleImageRemove = async () => {
    const userId = user._id || user.id;

    // Validate MongoDB ObjectId format
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      showNotification(`Invalid user ID format: ${userId}. Cannot remove image.`, 'error');
      return;
    }

    try {
      // Remove from separate storage
      removeProfileImage(userId);

      // Update profile in MongoDB via API
      const updateData = {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        role: user.role,
        isVerified: user.isVerified,
        profileImage: '' // Remove profile image
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.success) {
        // Update localStorage with the response from server
        const updatedUser = data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        showNotification('Profile image removed successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to remove profile image');
      }
    } catch (apiError) {
      console.error('API Error:', apiError);
      // Still update locally if API fails
      const updatedUser = { ...user };
      delete updatedUser.profileImage;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      showNotification('Profile image removed locally. Server sync may be delayed.', 'warning');
    }

    // Update UI state
    setImagePreview(null);
    setProfileImage(null);

    // Force update other components
    window.dispatchEvent(new Event('storage'));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('🔍 User object:', user);
      console.log('🔍 User.id:', user.id);
      console.log('🔍 User._id:', user._id);

      // Use MongoDB ObjectId (_id) instead of UUID (id)
      let userId = user._id || user.id;

      // Check if we have a valid MongoDB ObjectId format (24 hex characters)
      if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
        console.warn('⚠️ Invalid user ID format:', userId);

        // Try to find user by email as fallback
        try {
          const usersResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/all`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
            }
          });

          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            const foundUser = usersData.users.find(u => u.email === user.email);

            if (foundUser) {
              userId = foundUser.id;
              console.log('✅ Found user by email, using ID:', userId);

              // Update localStorage with correct user data
              const updatedUserData = { ...user, id: foundUser.id, _id: foundUser.id };
              localStorage.setItem('user', JSON.stringify(updatedUserData));
              setUser(updatedUserData);
            } else {
              throw new Error('User not found in database. Please log in again.');
            }
          } else {
            throw new Error('Unable to verify user. Please log in again.');
          }
        } catch (fallbackError) {
          throw new Error(`Invalid user session. Please log in again. (${fallbackError.message})`);
        }
      }

      console.log('✅ Using valid MongoDB ObjectId:', userId);

      // Prepare the update data
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        location: editForm.location,
        bio: editForm.bio,
        role: user.role, // Include current role
        isVerified: user.isVerified, // Include current verification status
        profileImage: user.profileImage // Include current profile image
      };

      console.log('🔄 Updating profile for user:', userId);
      console.log('📝 Update data:', updateData);

      // Make API call to update profile in MongoDB
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      console.log('🔍 Server response status:', response.status);
      console.log('🔍 Server response data:', data);

      if (data.success) {
        // Update localStorage with the response from server
        const updatedUser = data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        showNotification('Profile updated successfully!', 'success');

        // Trigger storage event to update other components
        window.dispatchEvent(new Event('storage'));
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(error.message || 'Failed to update profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'farmer': return 'bg-green-100 text-green-800';
      case 'broker': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-purple-100 text-purple-800';
      case 'field_officer': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'farmer': return <User className="h-4 w-4" />;
      case 'broker': return <Briefcase className="h-4 w-4" />;
      case 'staff': return <User className="h-4 w-4" />;
      case 'field_officer': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100">
      <Navbar />



      {/* Notification */}
      {notification.show && (
        <motion.div
          className={`fixed top-20 right-4 z-[60] px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          {notification.message}
        </motion.div>
      )}

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex gap-8 ${user && (user.role === 'farmer' || user.role === 'user') ? 'lg:flex-row' : 'justify-center'}`}>

            {/* Left Sidebar - Farmer Functions */}
            {user && (user.role === 'farmer' || user.role === 'user') && (
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="sticky top-24">
                  {/* Farmer Dashboard Sidebar */}
                  <motion.div
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Sidebar Header */}
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
                        <TreePine className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <h2 className="text-lg font-bold text-gray-900">Farmer Dashboard</h2>
                        <p className="text-sm text-gray-500">Quick Actions</p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mb-6">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {farmerStats.loading ? '...' : farmerStats.active}
                          </div>
                          <div className="text-xs text-blue-500">Active</div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-yellow-600">
                            {farmerStats.loading ? '...' : farmerStats.pending}
                          </div>
                          <div className="text-xs text-yellow-500">Pending</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-green-600">
                            {farmerStats.loading ? '...' : farmerStats.complete}
                          </div>
                          <div className="text-xs text-green-500">Complete</div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="space-y-1">
                      {/* Tapping Services */}
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tapping Services</h3>
                        <button
                          className="w-full flex items-center p-3 text-left hover:bg-blue-50 rounded-lg transition-colors group"
                          onClick={() => setIsTapperRequestOpen(true)}
                        >
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Request Rubber Tapper</div>
                            <div className="text-xs text-gray-500">Submit new request</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
                        <button
                          className="w-full flex items-center p-3 text-left hover:bg-blue-50 rounded-lg transition-colors group"
                          onClick={() => setIsTappingScheduleOpen(true)}
                        >
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">View Tapping Schedule</div>
                            <div className="text-xs text-gray-500">Check schedules</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
                      </div>

                      {/* Applications */}
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Applications</h3>
                        <button
                          className="w-full flex items-center p-3 text-left hover:bg-green-50 rounded-lg transition-colors group"
                          onClick={() => setIsLandLeaseOpen(true)}
                        >
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <MapPin className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Apply for Land Lease</div>
                            <div className="text-xs text-gray-500">Submit application</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                        </button>
                        <button
                          className="w-full flex items-center p-3 text-left hover:bg-green-50 rounded-lg transition-colors group"
                          onClick={() => setIsApplicationStatusOpen(true)}
                        >
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <CheckSquare className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Check Application Status</div>
                            <div className="text-xs text-gray-500">Monitor progress</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                        </button>
                      </div>

                      {/* Training */}
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Training</h3>
                        <button
                          className="w-full flex items-center p-3 text-left hover:bg-purple-50 rounded-lg transition-colors group"
                          onClick={() => setIsTrainingRegistrationOpen(true)}
                        >
                          <div className="bg-purple-100 p-2 rounded-lg mr-3">
                            <GraduationCap className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Register for Training</div>
                            <div className="text-xs text-gray-500">Enroll in programs</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                        </button>
                        <button
                          className="w-full flex items-center p-3 text-left hover:bg-purple-50 rounded-lg transition-colors group"
                          onClick={() => setIsTrainingScheduleOpen(true)}
                        >
                          <div className="bg-purple-100 p-2 rounded-lg mr-3">
                            <Calendar className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Training Schedule</div>
                            <div className="text-xs text-gray-500">View sessions</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                        </button>
                      </div>

                      {/* Market & Finance */}
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Market & Finance</h3>
                        <button
                          className="w-full flex items-center p-3 text-left hover:bg-orange-50 rounded-lg transition-colors group"
                          onClick={() => setIsMarketListOpen(true)}
                        >
                          <div className="bg-orange-100 p-2 rounded-lg mr-3">
                            <ShoppingCart className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">View Local Market List</div>
                            <div className="text-xs text-gray-500">Browse markets</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600" />
                        </button>
                        <button
                          className="w-full flex items-center p-3 text-left hover:bg-orange-50 rounded-lg transition-colors group"
                          onClick={() => setIsPaymentStatusOpen(true)}
                        >
                          <div className="bg-orange-100 p-2 rounded-lg mr-3">
                            <CreditCard className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">View Payment Status</div>
                            <div className="text-xs text-gray-500">Check payments</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600" />
                        </button>
                      </div>

                      {/* Skilled Services */}
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skilled Services</h3>
                        <button
                          className="w-full flex items-center p-3 text-left hover:bg-red-50 rounded-lg transition-colors group"
                          onClick={() => setIsFertilizerRequestOpen(true)}
                        >
                          <div className="bg-red-100 p-2 rounded-lg mr-3">
                            <Wrench className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Request Fertilizer/Rain Guard</div>
                            <div className="text-xs text-gray-500">Request services</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
                        </button>
                        <button className="w-full flex items-center p-3 text-left hover:bg-red-50 rounded-lg transition-colors group">
                          <div className="bg-red-100 p-2 rounded-lg mr-3">
                            <UserCheck className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">View Assigned Workers</div>
                            <div className="text-xs text-gray-500">Check assignments</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
                        </button>
                      </div>
                    </nav>
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-600" />
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {activitiesLoading ? (
                        // Loading state
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
                              <div className="bg-gray-300 p-1 rounded-full w-6 h-6"></div>
                              <div className="ml-3 flex-1">
                                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                <div className="h-3 bg-gray-300 rounded w-20"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : recentActivities.length > 0 ? (
                        // Dynamic activities
                        recentActivities.map((activity) => {
                          const getActivityIcon = (iconName) => {
                            switch (iconName) {
                              case 'CheckSquare': return CheckSquare;
                              case 'AlertCircle': return AlertCircle;
                              case 'DollarSign': return DollarSign;
                              default: return AlertCircle;
                            }
                          };

                          const getActivityColor = (color) => {
                            switch (color) {
                              case 'green': return { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-500' };
                              case 'blue': return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-500' };
                              case 'orange': return { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-500' };
                              case 'gray': return { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'bg-gray-500' };
                              default: return { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'bg-gray-500' };
                            }
                          };

                          const IconComponent = getActivityIcon(activity.icon);
                          const colors = getActivityColor(activity.color);

                          return (
                            <div key={activity.id} className={`flex items-center p-3 ${colors.bg} rounded-lg border ${colors.border}`}>
                              <div className={`${colors.icon} p-1 rounded-full`}>
                                <IconComponent className="h-3 w-3 text-white" />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                <p className="text-xs text-gray-500">{activity.time}</p>
                                {activity.details && (
                                  <p className="text-xs text-gray-400 mt-1">{activity.details}</p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        // Empty state
                        <div className="text-center py-6">
                          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No recent activities</p>
                          <p className="text-xs text-gray-400 mt-1">Your activities will appear here</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
          {/* Profile Header */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-32 h-32 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name ? user.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <Camera className="h-4 w-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                    <p className="text-gray-600 mb-3">{user.email}</p>
                    <div className="flex items-center justify-center md:justify-start space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role?.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-4 md:mt-0">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          <span>{loading ? 'Saving...' : 'Save'}</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-8 p-6 bg-gray-50 rounded-xl">
              <div className="relative group">
                {/* Profile Image Display */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                  {imagePreview || user?.profileImage ? (
                    <img
                      src={imagePreview || user?.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-white" />
                  )}

                  {/* Upload Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Upload Button */}
                <label className="absolute -bottom-2 -right-2 bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Actions */}
              <div className="mt-4 flex gap-3">
                {profileImage && (
                  <motion.button
                    onClick={handleImageUpload}
                    disabled={imageUploading}
                    className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {imageUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {imageUploading ? 'Uploading...' : 'Save Image'}
                  </motion.button>
                )}

                {(imagePreview || user?.profileImage) && (
                  <motion.button
                    onClick={handleImageRemove}
                    className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </motion.button>
                )}
              </div>

              {/* Upload Instructions */}
              <p className="text-sm text-gray-500 mt-3 text-center">
                Click the camera icon to upload a new profile image
                <br />
                <span className="text-xs">Supported formats: JPEG, PNG, GIF (Max 5MB)</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{user.name || 'Not provided'}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address
                </label>
                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{user.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{user.phone || 'Not provided'}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                    placeholder="Enter your location"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{user.location || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Me
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg min-h-[100px]">
                  {user.bio || 'No bio provided yet.'}
                </p>
              )}
            </div>

            {/* Account Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <Settings className="h-4 w-4" />
                  <span>Account Settings</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <Bell className="h-4 w-4" />
                  <span>Notification Preferences</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>


            </div>
          </div>
        </div>
      </div>

      {/* All Modal Components */}
      <TapperRequest
        isOpen={isTapperRequestOpen}
        onClose={() => setIsTapperRequestOpen(false)}
      />

      <TappingSchedule
        isOpen={isTappingScheduleOpen}
        onClose={() => setIsTappingScheduleOpen(false)}
      />

      <LandLeaseApplication
        isOpen={isLandLeaseOpen}
        onClose={() => setIsLandLeaseOpen(false)}
      />

      <ApplicationStatus
        isOpen={isApplicationStatusOpen}
        onClose={() => setIsApplicationStatusOpen(false)}
      />

      <TrainingRegistration
        isOpen={isTrainingRegistrationOpen}
        onClose={() => setIsTrainingRegistrationOpen(false)}
      />

      <TrainingSchedule
        isOpen={isTrainingScheduleOpen}
        onClose={() => setIsTrainingScheduleOpen(false)}
      />

      <MarketList
        isOpen={isMarketListOpen}
        onClose={() => setIsMarketListOpen(false)}
      />

      <PaymentStatus
        isOpen={isPaymentStatusOpen}
        onClose={() => setIsPaymentStatusOpen(false)}
      />

      <FertilizerRainGuardRequest
        isOpen={isFertilizerRequestOpen}
        onClose={() => setIsFertilizerRequestOpen(false)}
      />
    </div>
  );
};

export default Profile;
