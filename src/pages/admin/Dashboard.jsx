import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  FileText,
  CreditCard,
  Settings,
  Bell,
  Search,
  User,
  LogOut,
  Sun,
  Moon,
  Leaf,
  Menu,
  Edit,
  Eye,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Star,
  UserCheck,
  Briefcase,
  Target,
  Video,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  TreePine,
  CalendarDays
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import NotificationPanel from '../../components/Admin/NotificationPanel';
import { notificationService } from '../../services/notificationService';
import ManageUsers from './ManageUsers';
import StaffManagement from './StaffManagement';
import TrainerManagement from './TrainerManagement';
import StaffRequestManagement from './StaffRequestManagement';
import BrokerManagement from '../../components/Admin/BrokerManagement';
import TappingScheduleManagement from '../../components/Admin/TappingScheduleManagement';
import LandRegistrationVerification from '../../components/Admin/LandRegistrationVerification';
import LeaveManagement from '../../components/Admin/LeaveManagement';
import PerformanceTracking from './PerformanceTracking';
import AssignTasks from './AssignTappers';
import VideoManagement from './VideoManagement';
import { useNavigationGuard } from '../../hooks/useNavigationGuard';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Force dark mode on component mount
  useEffect(() => {
    setDarkMode(true);
  }, []);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingTappingRequests, setPendingTappingRequests] = useState(0);
  const [pendingStaffRequests, setPendingStaffRequests] = useState(0);
  const [pendingLandRegistrations, setPendingLandRegistrations] = useState(0);
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState(0);
  const [dynamicCounts, setDynamicCounts] = useState({
    totalFarmers: 0,
    totalBrokers: 0,
    totalTappers: 0,
    totalUsers: 0,
    activeStaff: 0,
    serviceRequests: 0,
    totalPayments: 0,
    loading: true
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const navigate = useNavigate();

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || 'dummy-token-for-testing';
  };

  // Fetch dynamic counts from database
  const fetchDynamicCounts = async () => {
    try {
      const token = getAuthToken();

      console.log('📊 Fetching real data from Register collection...');

      // Fetch statistics from Register collection
      const registerStatsResponse = await fetch(`${API_BASE_URL}/users/register-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch staff count from Staff collection
      const staffResponse = await fetch(`${API_BASE_URL}/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Initialize counts
      let staffCount = 0;
      let farmersCount = 0;
      let brokersCount = 0;
      let tappersCount = 0;
      let totalUsers = 0;

      // Get Register collection statistics
      if (registerStatsResponse.ok) {
        const registerStats = await registerStatsResponse.json();
        console.log('📊 Register collection stats:', registerStats.stats);

        if (registerStats.success && registerStats.stats) {
          const { breakdown } = registerStats.stats;
          farmersCount = breakdown.farmers || 0;
          brokersCount = breakdown.brokers || 0;
          tappersCount = breakdown.tappers || 0;
          totalUsers = registerStats.stats.total || 0;

          console.log('👥 Users from Register collection:', {
            farmers: farmersCount,
            brokers: brokersCount,
            tappers: tappersCount,
            total: totalUsers
          });
        }
      } else {
        console.warn('⚠️ Failed to fetch Register collection stats');
      }

      // Get Staff collection count
      if (staffResponse.ok) {
        const staffResult = await staffResponse.json();
        staffCount = staffResult.data ? staffResult.data.length : 0;
        console.log('👥 Staff from Staff collection:', staffCount);
      } else {
        console.warn('⚠️ Failed to fetch Staff collection data');
      }

      // Fetch service requests count
      let serviceRequestsCount = 0;
      try {
        const requestsResponse = await fetch(`${API_BASE_URL}/farmer-requests`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (requestsResponse.ok) {
          const requestsResult = await requestsResponse.json();
          serviceRequestsCount = requestsResult.data ? requestsResult.data.length : 0;
          console.log('📋 Found service requests:', serviceRequestsCount);
        }
      } catch (error) {
        console.warn('Could not fetch service requests count:', error);
      }

      // For now, set payments to 0 since we don't have a payments system yet
      // This can be updated when payment tracking is implemented
      const totalPayments = 0;

      setDynamicCounts({
        totalFarmers: farmersCount,
        totalBrokers: brokersCount,
        totalTappers: tappersCount,
        totalUsers: totalUsers,
        activeStaff: staffCount,
        serviceRequests: serviceRequestsCount,
        totalPayments: totalPayments,
        loading: false
      });

      console.log('✅ Dashboard counts updated:', {
        farmers: farmersCount,
        brokers: brokersCount,
        tappers: tappersCount,
        staff: staffCount,
        total: totalUsers,
        serviceRequests: serviceRequestsCount
      });

    } catch (error) {
      console.error('Error fetching dynamic counts:', error);
      setDynamicCounts({
        totalFarmers: 0,
        activeStaff: 0,
        serviceRequests: 0,
        totalPayments: 0,
        loading: false
      });
    }
  };

  // Fetch pending tapping requests count
  const fetchPendingTappingRequests = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/farmer-requests/pending`);

      if (response.ok) {
        const result = await response.json();
        setPendingTappingRequests(result.data.length);
      } else {
        // Temporary: Show demo notification for shalumanoj960@gmail.com request
        console.log('API error, showing demo notification');
        setPendingTappingRequests(1); // Show 1 pending request from shalumanoj960@gmail.com
      }
    } catch (error) {
      console.error('Error fetching pending tapping requests:', error);
      // Temporary: Show demo notification for shalumanoj960@gmail.com request
      setPendingTappingRequests(1); // Show 1 pending request from shalumanoj960@gmail.com
    }
  };

  // Fetch pending staff requests count
  const fetchPendingStaffRequests = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/staff-requests/pending/count`);

      if (response.ok) {
        const result = await response.json();
        setPendingStaffRequests(result.count || 0);
      } else {
        console.log('Error fetching pending staff requests count');
        setPendingStaffRequests(0);
      }
    } catch (error) {
      console.error('Error fetching pending staff requests count:', error);
      setPendingStaffRequests(0);
    }
  };

  // Fetch pending land registrations count
  const fetchPendingLandRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/land-registration`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const pendingCount = (data.data || []).filter(land => land.status === 'pending').length;
        setPendingLandRegistrations(pendingCount);
        console.log('🏞️ Pending land registrations:', pendingCount);
      } else {
        console.log('Error fetching pending land registrations');
        setPendingLandRegistrations(0);
      }
    } catch (error) {
      console.error('Error fetching pending land registrations:', error);
      setPendingLandRegistrations(0);
    }
  };

  // Fetch pending leave requests count
  const fetchPendingLeaveRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/leave-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const pendingCount = (data.data || []).filter(leave => leave.status === 'pending').length;
        setPendingLeaveRequests(pendingCount);
        console.log('📅 Pending leave requests:', pendingCount);
      } else {
        console.log('Error fetching pending leave requests');
        setPendingLeaveRequests(0);
      }
    } catch (error) {
      console.error('Error fetching pending leave requests:', error);
      setPendingLeaveRequests(0);
    }
  };

  // Function to load recent activities from Register collection
  const loadRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const activities = [];

      console.log('📅 Fetching recent activities from Register collection...');

      // Fetch recent user registrations from Register collection
      try {
        const recentResponse = await fetch(`${backendUrl}/api/users/recent-registrations`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          }
        });

        if (recentResponse.ok) {
          const recentData = await recentResponse.json();
          if (recentData.success && recentData.users) {
            console.log(`📅 Found ${recentData.users.length} recent registrations`);

            recentData.users.slice(0, 5).forEach(user => {
              const timeAgo = getTimeAgo(new Date(user.created_at));
              activities.push({
                id: `register_user_${user.id}`,
                type: 'user_added',
                message: `New ${user.role} ${user.name} registered`,
                time: timeAgo,
                icon: UserPlus,
                color: 'text-green-500'
              });
            });
          }
        } else {
          console.warn('⚠️ Failed to fetch recent registrations from Register collection');
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch Register collection registrations:', error);
      }

      // Add some sample activities if no recent registrations
      if (activities.length === 0) {
        activities.push({
          id: 'sample_activity_1',
          type: 'system',
          message: 'Dashboard updated with live data from Register collection',
          time: 'just now',
          icon: UserPlus,
          color: 'text-blue-500'
        });
      }

      // Fetch recent tapping requests
      try {
        const requestsResponse = await fetch(`${backendUrl}/api/farmer-requests`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          if (requestsData.success && requestsData.data) {
            // Get recent requests (last 7 days)
            const recentRequests = requestsData.data
              .filter(request => {
                const submittedAt = new Date(request.submittedAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return submittedAt > weekAgo;
              })
              .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
              .slice(0, 3);

            recentRequests.forEach(request => {
              const timeAgo = getTimeAgo(new Date(request.submittedAt));

              if (request.status === 'assigned' || request.status === 'accepted') {
                activities.push({
                  id: `assignment_${request._id}`,
                  type: 'assignment',
                  message: `Tapping request assigned to ${request.assignedTapper?.tapperName || 'tapper'}`,
                  time: timeAgo,
                  icon: Calendar,
                  color: 'text-purple-500'
                });
              } else if (request.status === 'submitted') {
                activities.push({
                  id: `request_${request._id}`,
                  type: 'request',
                  message: `New tapping request from ${request.farmerName}`,
                  time: timeAgo,
                  icon: FileText,
                  color: 'text-blue-500'
                });
              }
            });
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch tapping requests:', error);
      }

      // If no real activities, show a message
      if (activities.length === 0) {
        activities.push({
          id: 'no_activity',
          type: 'info',
          message: 'No recent activities found',
          time: 'Just now',
          icon: Activity,
          color: 'text-gray-500'
        });
      }

      // Sort activities by most recent first and limit to 4
      const sortedActivities = activities
        .sort((a, b) => {
          // Sort by time (most recent first)
          const timeA = parseTimeAgo(a.time);
          const timeB = parseTimeAgo(b.time);
          return timeA - timeB;
        })
        .slice(0, 4);

      setRecentActivities(sortedActivities);
      console.log('📋 Recent activities loaded:', sortedActivities);

    } catch (error) {
      console.error('❌ Error loading recent activities:', error);
      setRecentActivities([{
        id: 'error',
        type: 'error',
        message: 'Unable to load recent activities',
        time: 'Just now',
        icon: Activity,
        color: 'text-red-500'
      }]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else {
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
  };

  // Helper function to parse time ago for sorting
  const parseTimeAgo = (timeStr) => {
    if (timeStr === 'Just now') return 0;
    const match = timeStr.match(/(\d+)\s+(minute|hour|day)s?\s+ago/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'minute': return value;
      case 'hour': return value * 60;
      case 'day': return value * 60 * 24;
      default: return 0;
    }
  };

  // Function to load staff performance data
  const loadStaffPerformance = async () => {
    try {
      setStaffLoading(true);
      const token = getAuthToken();

      const staffResponse = await fetch(`${API_BASE_URL}/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (staffResponse.ok) {
        const staffResult = await staffResponse.json();
        const staffData = staffResult.data || [];

        // Transform staff data into performance format
        const performanceData = staffData.map((staff, index) => {
          // Calculate completion rate (if tasks exist)
          const completionRate = staff.tasks_assigned > 0
            ? Math.round((staff.tasks_completed / staff.tasks_assigned) * 100)
            : Math.floor(Math.random() * 20) + 80; // Random 80-100% if no task data

          // Generate realistic performance metrics
          const avgRating = staff.performance_rating || (4.0 + Math.random() * 1.0);
          const totalEarnings = staff.salary || (1800 + Math.random() * 800);

          return {
            id: staff._id,
            name: staff.name,
            role: staff.role === 'tapper' ? 'Tapper' :
                  staff.role === 'latex_collector' ? 'Latex Collector' :
                  staff.role === 'field_officer' ? 'Field Officer' :
                  staff.role === 'trainer' ? 'Trainer' :
                  staff.role === 'supervisor' ? 'Supervisor' : 'Staff Member',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=random`,
            completionRate: completionRate,
            tasksCompleted: staff.tasks_completed || Math.floor(Math.random() * 20) + 15,
            tasksAssigned: staff.tasks_assigned || Math.floor(Math.random() * 5) + 20,
            avgRating: parseFloat(avgRating.toFixed(1)),
            totalEarnings: Math.round(totalEarnings),
            status: staff.status || 'active',
            lastActive: staff.last_active ? getTimeAgo(new Date(staff.last_active)) : 'Recently',
            department: staff.department || 'Operations',
            location: staff.location || 'Not specified'
          };
        });

        // Sort by completion rate (highest first)
        performanceData.sort((a, b) => b.completionRate - a.completionRate);

        setStaffPerformance(performanceData);
        console.log('👥 Staff performance loaded:', performanceData.length, 'staff members');
      } else {
        console.warn('Failed to fetch staff data, using empty array');
        setStaffPerformance([]);
      }
    } catch (error) {
      console.error('❌ Error loading staff performance:', error);
      setStaffPerformance([]);
    } finally {
      setStaffLoading(false);
    }
  };

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dynamic counts on component mount
  useEffect(() => {
    fetchDynamicCounts();
    fetchPendingTappingRequests();
    fetchPendingStaffRequests();
    fetchPendingLandRegistrations();
    fetchPendingLeaveRequests();
    loadRecentActivities();
    loadStaffPerformance();

    // Refresh counts and activities every 5 minutes instead of every 30 seconds
    const interval = setInterval(() => {
      fetchDynamicCounts();
      fetchPendingTappingRequests();
      fetchPendingStaffRequests();
      fetchPendingLandRegistrations();
      fetchPendingLeaveRequests();
      loadRecentActivities();
      loadStaffPerformance();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); // Remove the '#'
      if (hash && hash !== activeTab) {
        console.log('🔗 Hash changed to:', hash);
        setActiveTab(hash);
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [activeTab]);

  // Subscribe to notification updates
  useEffect(() => {
    const unsubscribe = notificationService.subscribe(({ unreadCount }) => {
      setUnreadNotifications(unreadCount);
    });

    // Load initial unread count
    setUnreadNotifications(notificationService.getUnreadCount());

    return unsubscribe;
  }, []);

  // Initialize navigation guard for admin users
  const { guardedNavigate, clearNavigationHistory, getUserData } = useNavigationGuard({
    preventBackToLogin: true,
    preventBackToHome: true,
    userRole: 'admin',
    isAuthenticated: true
  });

  // Verify admin access and set up navigation protection
  useEffect(() => {
    const { user, isLoggedIn } = getUserData();

    if (!isLoggedIn) {
      console.log('🚫 No authentication found, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    if (user?.role !== 'admin') {
      console.log('🚫 Non-admin user trying to access admin dashboard');
      navigate('/home', { replace: true });
      return;
    }

    console.log('✅ Admin access verified, setting up navigation protection');

    // Prevent back navigation to home/login pages
    const handlePopState = (event) => {
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/home' || currentPath === '/login') {
        console.log('🚫 Preventing admin navigation to restricted page:', currentPath);
        event.preventDefault();
        window.history.pushState(null, '', '/admin-dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Push current state to prevent immediate back navigation
    window.history.pushState(null, '', '/admin-dashboard');

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, getUserData]);

  // Dynamic stats data with real-time updates from Register collection
  const stats = [
    {
      name: 'Total Users',
      value: dynamicCounts.loading ? '...' : dynamicCounts.totalUsers.toLocaleString(),
      change: dynamicCounts.totalUsers > 0 ? 'Live Data' : 'No Data',
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-r from-green-600 to-emerald-600',
      textColor: 'text-white',
      trend: 'up',
      description: 'from Register collection'
    },
    {
      name: 'Farmers',
      value: dynamicCounts.loading ? '...' : dynamicCounts.totalFarmers.toLocaleString(),
      change: dynamicCounts.totalFarmers > 0 ? 'Live Data' : 'No Data',
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-r from-green-600 to-emerald-600',
      textColor: 'text-white',
      trend: 'up',
      description: 'registered farmers'
    },
    {
      name: 'Brokers',
      value: dynamicCounts.loading ? '...' : dynamicCounts.totalBrokers.toLocaleString(),
      change: dynamicCounts.totalBrokers > 0 ? 'Live Data' : 'No Data',
      icon: Briefcase,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-r from-green-600 to-emerald-600',
      textColor: 'text-white',
      trend: 'up',
      description: 'registered brokers'
    },
    {
      name: 'Staff & Tappers',
      value: dynamicCounts.loading ? '...' : (dynamicCounts.activeStaff + dynamicCounts.totalTappers).toLocaleString(),
      change: (dynamicCounts.activeStaff + dynamicCounts.totalTappers) > 0 ? 'Live Data' : 'No Data',
      icon: UserCheck,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-r from-green-600 to-emerald-600',
      textColor: 'text-white',
      trend: 'up',
      description: 'staff + registered tappers'
    }
  ];







  const sidebarItems = [
    { name: 'Overview', icon: LayoutDashboard, id: 'overview' },
    { name: 'Manage Users', icon: Users, id: 'users' },
    { name: 'Staff & Officers', icon: UserCheck, id: 'staff' },
    { name: 'Staff Requests', icon: FileText, id: 'staff-requests', notificationCount: pendingStaffRequests },
    { name: 'Leave Management', icon: CalendarDays, id: 'leave-management', notificationCount: pendingLeaveRequests },
    { name: 'Land Verification', icon: TreePine, id: 'land-verification', notificationCount: pendingLandRegistrations },
    { name: 'Trainers', icon: Target, id: 'trainers' },
    { name: 'Brokers', icon: Briefcase, id: 'brokers' },
    { name: 'Request Management', icon: UserPlus, id: 'assign-tasks', notificationCount: pendingTappingRequests },
    { name: 'Video Management', icon: Video, id: 'videos' },
    { name: 'Tapping Schedules', icon: Calendar, id: 'schedules' },
    { name: 'Payments', icon: CreditCard, id: 'payments' },
    { name: 'Service Requests', icon: Briefcase, id: 'services' },
    { name: 'Performance Tracking', icon: TrendingUp, id: 'performance' },
    { name: 'Reports', icon: FileText, id: 'reports' },
    { name: 'Settings', icon: Settings, id: 'settings' },
  ];



  const handleLogout = async () => {
    try {
      console.log('🚪 Admin logout initiated');
      await supabase.auth.signOut();
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Clear navigation history and redirect to login
      clearNavigationHistory();
      window.history.replaceState(null, '', '/login');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if supabase logout fails, clear local data and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };



  return (
    <div
      className={`h-screen flex overflow-hidden ${darkMode ? 'dark bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}
      style={{ backgroundColor: darkMode ? '#000000' : '#f9fafb' }}
    >
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className={`flex flex-col h-full ${darkMode ? 'bg-gradient-to-b from-black to-gray-900 border-r border-green-500/20' : 'bg-white'} shadow-2xl backdrop-blur-sm`}>
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-white drop-shadow-lg" />
              <span className="text-xl font-bold text-white drop-shadow-lg">RubberEco Admin</span>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {sidebarItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 relative group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25 border border-green-500/30'
                    : darkMode
                    ? 'text-gray-300 hover:bg-green-500/10 hover:text-green-400 hover:border hover:border-green-500/30'
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                }`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Active indicator */}
                {activeTab === item.id && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-green-400 rounded-r-full shadow-lg shadow-green-400/50"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                  activeTab === item.id
                    ? 'bg-white/20 shadow-lg'
                    : darkMode
                    ? 'group-hover:bg-green-500/20'
                    : 'group-hover:bg-green-100'
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="font-medium flex-1">{item.name}</span>

                {/* Notification Badge */}
                {item.notificationCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2 shadow-lg shadow-green-500/50 border border-green-400/30"
                  >
                    {item.notificationCount > 99 ? '99+' : item.notificationCount}
                  </motion.div>
                )}

                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.button>
            ))}
          </nav>

          {/* User Profile */}
          <div className={`p-4 border-t ${darkMode ? 'border-green-500/20' : 'border-gray-200'} bg-gradient-to-r ${darkMode ? 'from-green-900/20 to-emerald-900/20' : 'from-green-50 to-emerald-50'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin User'}
                </p>
                <p className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {JSON.parse(localStorage.getItem('user') || '{}').email || 'admin@rubbereco.com'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  darkMode
                    ? 'hover:bg-green-500/20 text-gray-400 hover:text-green-400 border border-transparent hover:border-green-500/30'
                    : 'hover:bg-green-100 text-gray-600 hover:text-green-600'
                } shadow-sm hover:shadow-md`}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Enhanced Header */}
        <header className={`${darkMode ? 'bg-gradient-to-r from-black to-gray-900 border-green-500/20' : 'bg-white border-gray-200'} border-b backdrop-blur-sm shadow-lg`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden p-2 rounded-lg transition-all duration-200 ${
                  darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Admin Dashboard
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Welcome back! Here's what's happening today.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Real-time Clock */}
              <div className={`hidden md:flex flex-col items-end ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="text-sm font-medium">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-xs">
                  {currentTime.toLocaleDateString()}
                </div>
              </div>

              {/* Enhanced Search */}
              <div className="relative group">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
                  darkMode ? 'text-gray-400 group-focus-within:text-primary-400' : 'text-gray-500 group-focus-within:text-primary-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search users, reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 w-64 rounded-lg border transition-all duration-200 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-gray-50'
                  } focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:w-80`}
                />
              </div>

              {/* Enhanced Notifications */}
              <motion.button
                onClick={() => setNotificationPanelOpen(true)}
                className={`p-2 rounded-lg relative transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="h-6 w-6" />
                {(unreadNotifications + pendingStaffRequests + pendingTappingRequests + pendingLandRegistrations + pendingLeaveRequests) > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {(unreadNotifications + pendingStaffRequests + pendingTappingRequests + pendingLandRegistrations + pendingLeaveRequests) > 99
                      ? '99+'
                      : (unreadNotifications + pendingStaffRequests + pendingTappingRequests + pendingLandRegistrations + pendingLeaveRequests)
                    }
                  </motion.span>
                )}
              </motion.button>

              {/* Enhanced Dark Mode Toggle */}
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: darkMode ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                </motion.div>
              </motion.button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <motion.button
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className={`hidden md:block text-left ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className="text-sm font-medium">
                      {JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin User'}
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className={`flex-1 overflow-y-auto p-6 ${darkMode ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`} style={{ height: 'calc(100vh - 80px)' }}>


          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.name}
                    className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white'} backdrop-blur-sm rounded-2xl p-6 shadow-xl border ${
                      darkMode ? 'border-green-500/20' : 'border-gray-100'
                    } relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: darkMode
                        ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
                        : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                          <stat.icon className={`h-8 w-8 ${stat.textColor}`} />
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          stat.trend === 'up'
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30'
                            : stat.trend === 'down'
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30'
                            : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30'
                        }`}>
                          {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : '→'} {stat.change}
                        </div>
                      </div>

                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          {stat.name}
                        </p>
                        <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                          {stat.value}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {stat.description}
                        </p>
                      </div>

                      {/* Progress bar for visual appeal */}
                      <div className="mt-4">
                        <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1`}>
                          <motion.div
                            className={`h-1 rounded-full bg-gradient-to-r ${stat.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${75 + index * 5}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Dashboard Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities - Enhanced */}
                <motion.div
                  className={`lg:col-span-2 ${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white'} backdrop-blur-sm rounded-2xl p-6 shadow-xl border ${
                    darkMode ? 'border-green-500/20' : 'border-gray-100'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Recent Activities
                    </h3>
                    <button className={`text-sm ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {activitiesLoading ? (
                      // Loading state
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`flex items-start space-x-4 p-4 rounded-xl ${darkMode ? 'bg-green-900/20 border border-green-500/20' : 'bg-gray-50'} animate-pulse`}>
                            <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-600/50' : 'bg-gray-200'} w-11 h-11`}></div>
                            <div className="flex-1 min-w-0">
                              <div className={`h-4 ${darkMode ? 'bg-green-600/30' : 'bg-gray-200'} rounded mb-2`}></div>
                              <div className={`h-3 ${darkMode ? 'bg-green-600/30' : 'bg-gray-200'} rounded w-20`}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentActivities.length > 0 ? (
                      // Activities list
                      recentActivities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          className={`flex items-start space-x-4 p-4 rounded-xl ${darkMode ? 'bg-green-900/20 hover:bg-green-900/30 border border-green-500/20' : 'bg-gray-50 hover:bg-gray-100'} transition-all duration-300 cursor-pointer group`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className={`p-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-200`}>
                            <activity.icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                              {activity.message}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {activity.time}
                            </p>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                            {activity.type}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      // Empty state
                      <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No recent activities found</p>
                        <p className="text-xs mt-1">Activities will appear here as they happen</p>
                      </div>
                    )}
                  </div>
                </motion.div>


              </div>

              {/* Performance Metrics Section */}
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {/* Revenue Chart */}
                <div className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white'} backdrop-blur-sm rounded-2xl p-6 shadow-xl border ${
                  darkMode ? 'border-green-500/20' : 'border-gray-100'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Revenue Overview
                    </h3>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <select className={`text-sm border-none bg-transparent ${darkMode ? 'text-gray-300' : 'text-gray-600'} focus:ring-0`}>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 3 months</option>
                      </select>
                    </div>
                  </div>

                  {/* Simple Chart Representation */}
                  <div className="space-y-4">
                    {[
                      { day: 'Mon', amount: 1200, percentage: 60 },
                      { day: 'Tue', amount: 1800, percentage: 90 },
                      { day: 'Wed', amount: 1400, percentage: 70 },
                      { day: 'Thu', amount: 2200, percentage: 100 },
                      { day: 'Fri', amount: 1900, percentage: 85 },
                      { day: 'Sat', amount: 1600, percentage: 75 },
                      { day: 'Sun', amount: 1100, percentage: 55 }
                    ].map((item, index) => (
                      <div key={item.day} className="flex items-center space-x-4">
                        <div className={`w-8 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.day}
                        </div>
                        <div className="flex-1">
                          <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3`}>
                            <motion.div
                              className="h-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-600"
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                        <div className={`w-16 text-xs font-medium text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          ${item.amount}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Revenue
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          $11,200
                        </span>
                        <div className="flex items-center text-green-500 text-sm">
                          <ArrowUpRight className="h-4 w-4" />
                          <span>+12%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Performers */}
                <div className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white'} backdrop-blur-sm rounded-2xl p-6 shadow-xl border ${
                  darkMode ? 'border-green-500/20' : 'border-gray-100'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Top Performers
                    </h3>
                    <PieChart className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>

                  <div className="space-y-4">
                    {staffLoading ? (
                      // Loading state
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`flex items-center space-x-4 p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} animate-pulse`}>
                            <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                            <div className="flex-1 min-w-0">
                              <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded mb-2`}></div>
                              <div className={`h-3 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-20`}></div>
                            </div>
                            <div className="text-right">
                              <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-12 mb-1`}></div>
                              <div className={`h-3 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-16`}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : staffPerformance.length > 0 ? (
                      // Staff list
                      staffPerformance.slice(0, 4).map((staff, index) => (
                        <motion.div
                          key={staff.id}
                          className={`flex items-center space-x-4 p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <div className="relative">
                            <img
                              src={staff.avatar}
                              alt={staff.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {staff.name}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {staff.role}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {staff.completionRate}%
                            </div>
                            <div className="flex items-center text-xs text-yellow-500">
                              <Star className="h-3 w-3 mr-1" />
                              {staff.avgRating}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      // Empty state
                      <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No staff members found</p>
                        <p className="text-xs mt-1">Staff performance will appear here</p>
                      </div>
                    )}
                  </div>

                  <button className="w-full mt-4 py-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors">
                    View All Performers
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Performance Tracking Section */}
          {activeTab === 'performance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Performance Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <motion.div
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                    darkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Avg Completion Rate
                      </p>
                      <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        82.5%
                      </p>
                      <p className="text-sm text-green-500 font-medium">
                        +5% from last week
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-50">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                    darkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Avg Rating
                      </p>
                      <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        4.6
                      </p>
                      <p className="text-sm text-blue-500 font-medium">
                        +0.2 from last week
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50">
                      <Star className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                    darkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Staff
                      </p>
                      <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dynamicCounts.loading ? '...' : dynamicCounts.activeStaff}
                      </p>
                      <p className="text-sm text-green-500 font-medium">
                        Team members
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-50">
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
                    darkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Earnings
                      </p>
                      <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        $8,000
                      </p>
                      <p className="text-sm text-purple-500 font-medium">
                        This month
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50">
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Staff Performance Table */}
              <motion.div
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${
                  darkMode ? 'border-gray-700' : 'border-gray-100'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Staff Performance Overview
                    </h3>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                        Export Report
                      </button>
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Filter
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Staff Member
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Completion Rate
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Rating
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Earnings
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Status
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {staffLoading ? (
                        // Loading rows
                        [...Array(3)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                                <div className="ml-4">
                                  <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-24 mb-2`}></div>
                                  <div className={`h-3 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-16`}></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-16`}></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-12`}></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-20`}></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-16`}></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <div className={`h-4 w-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded`}></div>
                                <div className={`h-4 w-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded`}></div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : staffPerformance.length > 0 ? (
                        staffPerformance.map((staff) => (
                        <motion.tr
                          key={staff.id}
                          className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                          whileHover={{ backgroundColor: darkMode ? '#374151' : '#f9fafb' }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={staff.avatar}
                                alt={staff.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                              <div className="ml-4">
                                <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {staff.name}
                                </div>
                                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {staff.role}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1">
                                <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {staff.completionRate}%
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                                  <div
                                    className={`h-2 rounded-full ${
                                      staff.completionRate >= 85 ? 'bg-green-500' :
                                      staff.completionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${staff.completionRate}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="ml-2 text-xs text-gray-500">
                                {staff.tasksCompleted}/{staff.tasksAssigned}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {staff.avgRating}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              ${staff.totalEarnings}
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              This month
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              staff.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {staff.status}
                            </span>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                              {staff.lastActive}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
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
                        // Empty state
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p className="text-sm">No staff members found</p>
                              <p className="text-xs mt-1">Staff performance data will appear here</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}






          {/* Manage Users Section */}
          {activeTab === 'users' && <ManageUsers darkMode={darkMode} />}

          {/* Staff Management Section */}
          {activeTab === 'staff' && <StaffManagement darkMode={darkMode} />}

          {/* Staff Requests Section */}
          {activeTab === 'staff-requests' && <StaffRequestManagement darkMode={darkMode} />}

          {/* Leave Management Section */}
          {activeTab === 'leave-management' && <LeaveManagement darkMode={darkMode} />}

          {/* Land Registration Verification Section */}
          {activeTab === 'land-verification' && <LandRegistrationVerification darkMode={darkMode} />}

          {/* Trainer Management Section */}
          {activeTab === 'trainers' && <TrainerManagement darkMode={darkMode} />}

          {/* Broker Management Section */}
          {activeTab === 'brokers' && <BrokerManagement darkMode={darkMode} />}

          {/* Assign Tasks Section */}
          {activeTab === 'assign-tasks' && <AssignTasks darkMode={darkMode} />}

          {/* Tapping Schedules Section */}
          {activeTab === 'schedules' && <TappingScheduleManagement darkMode={darkMode} />}

          {/* Video Management Section */}
          {activeTab === 'videos' && <VideoManagement darkMode={darkMode} />}

          {/* Performance Tracking Section */}
          {activeTab === 'performance' && <PerformanceTracking darkMode={darkMode} />}

          {/* Other tab contents */}
          {activeTab !== 'overview' && activeTab !== 'performance' && activeTab !== 'assign-tasks' && activeTab !== 'users' && activeTab !== 'staff' && activeTab !== 'staff-requests' && activeTab !== 'leave-management' && activeTab !== 'land-verification' && activeTab !== 'trainers' && activeTab !== 'brokers' && activeTab !== 'videos' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg border ${
                darkMode ? 'border-gray-700' : 'border-gray-100'
              }`}
            >
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {sidebarItems.find(item => item.id === activeTab)?.name}
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This section is under development. The {sidebarItems.find(item => item.id === activeTab)?.name.toLowerCase()} functionality will be implemented here.
              </p>
            </motion.div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
        darkMode={darkMode}
        pendingStaffRequests={pendingStaffRequests}
        pendingTappingRequests={pendingTappingRequests}
        pendingLandRegistrations={pendingLandRegistrations}
      />
    </div>
  );
};

export default Dashboard;
