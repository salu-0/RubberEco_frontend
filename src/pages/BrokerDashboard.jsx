import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TreePine,
  Gavel,
  Eye,
  MessageCircle,
  History,
  Bell,
  TrendingUp,
  MapPin,
  DollarSign,
  Clock,
  User,
  LogOut,
  Settings,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

import BrowseTreeLots from '../components/Broker/BrowseTreeLots';
import MyBids from '../components/Broker/MyBids';
import Messages from '../components/Broker/Messages';
import BidHistory from '../components/Broker/BidHistory';
import BrokerProfile from '../components/Broker/BrokerProfile';

const BrokerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    activeBids: 0,
    wonBids: 0,
    totalBids: 0,
    availableLots: 0
  });

  useEffect(() => {
    // Load broker dashboard data
    loadDashboardData();
    loadNotifications();
  }, []);

  const loadDashboardData = async () => {
    try {
      // TODO: Replace with actual API call
      setStats({
        activeBids: 5,
        wonBids: 12,
        totalBids: 28,
        availableLots: 15
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      // TODO: Replace with actual API call
      setNotifications([
        {
          id: 1,
          type: 'outbid',
          message: 'You have been outbid on Lot #RT001',
          time: '2 hours ago',
          read: false
        },
        {
          id: 2,
          type: 'won',
          message: 'Congratulations! You won the bid for Lot #RT003',
          time: '1 day ago',
          read: false
        }
      ]);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'browse':
        return <BrowseTreeLots />;
      case 'mybids':
        return <MyBids />;
      case 'history':
        return <BidHistory />;
      case 'messages':
        return <Messages />;
      case 'profile':
        return <BrokerProfile />;
      default:
        return <BrowseTreeLots />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 relative">

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary-300 to-primary-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-gradient-to-r from-accent-300 to-accent-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-88 h-88 bg-gradient-to-r from-secondary-300 to-secondary-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-primary-200 to-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>

        {/* Geometric patterns */}
        <div className="absolute top-32 right-32 w-32 h-32 border border-primary-200 rounded-lg rotate-45 opacity-30 animate-spin-slow"></div>
        <div className="absolute bottom-32 left-32 w-24 h-24 border border-accent-200 rounded-full opacity-40 animate-bounce-slow"></div>

        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
      </div>

      <div className="relative z-10 pt-8 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <motion.div
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 mb-8 ring-1 ring-black/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl">
                  <Gavel className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    Broker Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">Manage your rubber trading activities</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <motion.button
                  className="relative p-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </motion.button>

                <motion.button
                  className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="h-5 w-5" />
                </motion.button>

                <motion.button
                  className="flex items-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ring-1 ring-black/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <Gavel className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Bids</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeBids}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ring-1 ring-black/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Won Bids</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.wonBids}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ring-1 ring-black/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <History className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bids</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBids}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ring-1 ring-black/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <TreePine className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Lots</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.availableLots}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Tabs */}
          <motion.div
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-2 mb-8 ring-1 ring-black/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <motion.button
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'browse'
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('browse')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <TreePine className="h-5 w-5" />
                <span>Browse Lots</span>
              </motion.button>

              <motion.button
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'mybids'
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('mybids')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Eye className="h-5 w-5" />
                <span>My Bids</span>
              </motion.button>

              <motion.button
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('history')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <History className="h-5 w-5" />
                <span>Bid History</span>
              </motion.button>

              <motion.button
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'messages'
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('messages')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="h-5 w-5" />
                <span>Messages</span>
              </motion.button>

              <motion.button
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('profile')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8 ring-1 ring-black/5 min-h-[600px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for each tab







export default BrokerDashboard;
