import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TreePine,
  Gavel,
  MessageCircle,
  History,
  TrendingUp,
  User,
  LogOut,
  BarChart3
} from 'lucide-react';

import BrowseTreeLots from '../components/Broker/BrowseTreeLots';
import MyBids from '../components/Broker/MyBids';
import Messages from '../components/Broker/Messages';
import BidHistory from '../components/Broker/BidHistory';
import BrokerProfile from '../components/Broker/BrokerProfile';

const BrokerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [brokerName, setBrokerName] = useState('');
  const [stats, setStats] = useState({
    activeBids: 0,
    wonBids: 0,
    totalBids: 0,
    availableLots: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadBrokerName();
  }, []);

  const loadBrokerName = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setBrokerName(user.name || 'Broker');
    } catch (error) {
      console.error('Error loading broker name:', error);
      setBrokerName('Broker');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      // Fetch broker's bids data
      const bidsResponse = await fetch(`${API_BASE_URL}/bids/my-bids`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch available lots data
      const lotsResponse = await fetch(`${API_BASE_URL}/tree-lots`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      let bidsData = [];
      let lotsData = [];

      if (bidsResponse.ok) {
        const bidsResult = await bidsResponse.json();
        bidsData = bidsResult.data || [];
      }

      if (lotsResponse.ok) {
        const lotsResult = await lotsResponse.json();
        lotsData = lotsResult.data || [];
      }

      // Calculate stats from real data
      const activeBids = bidsData.filter(bid => bid.status === 'active' || bid.status === 'winning').length;
      const wonBids = bidsData.filter(bid => bid.status === 'won').length;
      const totalBids = bidsData.length;
      const availableLots = lotsData.length;

      setStats({
        activeBids,
        wonBids,
        totalBids,
        availableLots
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const tabs = [
    { id: 'browse', label: 'Browse Lots', icon: TreePine },
    { id: 'bids', label: 'My Bids', icon: Gavel },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'browse':
        return <BrowseTreeLots />;
      case 'bids':
        return <MyBids />;
      case 'messages':
        return <Messages />;
      case 'history':
        return <BidHistory />;
      case 'profile':
        return <BrokerProfile />;
      default:
        return <BrowseTreeLots />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Side Panel */}
          <motion.aside
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-4 ring-1 ring-black/5 sticky top-6 self-start min-h-[calc(100vh-3rem)] flex flex-col"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-3 px-2 py-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl">
                <Gavel className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">Broker</div>
                <div className="text-xs text-gray-600 truncate">{brokerName}</div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200/70 space-y-2">
              <motion.button
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('nurseryAdminToken');
                  localStorage.removeItem('nurseryAdminUser');
                  navigate('/login');
                }}
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm">Logout</span>
              </motion.button>
            </div>
          </motion.aside>

          {/* Main */}
          <div>
            {/* Header */}
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8 mb-6 ring-1 ring-black/5"
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
                    <p className="text-gray-600 mt-1">
                      Welcome, {brokerName}! Manage your rubber trading activities
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <motion.div
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ring-1 ring-black/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Bids</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeBids}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Gavel className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ring-1 ring-black/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Won Bids</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.wonBids}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ring-1 ring-black/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bids</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBids}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ring-1 ring-black/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available Lots</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.availableLots}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <TreePine className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8 ring-1 ring-black/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;




