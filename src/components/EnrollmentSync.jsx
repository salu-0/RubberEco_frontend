import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  TrendingUp,
  Clock
} from 'lucide-react';
import enrollmentManager from '../utils/enrollmentManager';
import mockAPI from '../utils/mockAPI';
import SystemStatus from './SystemStatus';
import { getUserData } from '../utils/api';

const EnrollmentSync = () => {
  const [stats, setStats] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [mockStats, setMockStats] = useState(null);
  const [activeTab, setActiveTab] = useState('enrollments');

  useEffect(() => {
    loadEnrollmentData();
  }, []);

  const loadEnrollmentData = async () => {
    const { user } = getUserData();
    if (user && user.id) {
      const userEnrollments = enrollmentManager.getUserEnrollments(user.id);
      const userStats = enrollmentManager.getEnrollmentStats(user.id);

      setEnrollments(userEnrollments);
      setStats(userStats);

      // Load mock database stats
      try {
        const mockStatsData = await mockAPI.getDatabaseStats();
        setMockStats(mockStatsData.stats);
      } catch (error) {
        console.error('Error loading mock stats:', error);
      }
    }
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    setSyncStatus(null);
    
    try {
      const result = await enrollmentManager.manualSync();
      setSyncStatus(result);
      
      // Reload data after sync
      setTimeout(() => {
        loadEnrollmentData();
      }, 1000);
    } catch (error) {
      setSyncStatus({
        success: false,
        message: `Sync failed: ${error.message}`,
        errors: [error.message]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color = "blue" }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enrollment Management</h2>
        <p className="text-gray-600">Manage and sync your training enrollments</p>

        {/* Tabs */}
        <div className="flex space-x-1 mt-6">
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'enrollments'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            My Enrollments
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'status'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            System Status
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'enrollments' && (
        <>
          {/* Statistics Cards */}
          {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="Total Enrollments"
            value={stats.totalEnrollments}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            title="In Progress"
            value={stats.inProgressCourses}
            color="yellow"
          />
          <StatCard
            icon={CheckCircle}
            title="Completed"
            value={stats.completedCourses}
            color="green"
          />
          <StatCard
            icon={Database}
            title="Synced to DB"
            value={stats.syncedToDatabase}
            color="purple"
          />
        </div>
      )}

      {/* Sync Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Database Sync</h3>
            <p className="text-gray-600">Sync local enrollment data to the database</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleManualSync}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Manual Sync'}</span>
          </motion.button>
        </div>

        {/* Sync Status */}
        {syncStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              syncStatus.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {syncStatus.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                syncStatus.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {syncStatus.message}
              </span>
            </div>
            
            {syncStatus.errors && syncStatus.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-red-700 font-medium">Errors:</p>
                <ul className="text-sm text-red-600 list-disc list-inside">
                  {syncStatus.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Pending Sync Info */}
        {stats && stats.pendingSync > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {stats.pendingSync} enrollment(s) pending database sync
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mock Database Info */}
      {mockStats && (
        <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-8 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            🎭 Mock Database Status (Fallback System)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockStats.databaseEnrollments}</div>
              <div className="text-sm text-blue-700">Mock DB Enrollments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockStats.localEnrollments}</div>
              <div className="text-sm text-blue-700">Local Enrollments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockStats.totalUnique}</div>
              <div className="text-sm text-blue-700">Total Unique</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-blue-600">
            <strong>Last Sync:</strong> {mockStats.lastSync === 'Never' ? 'Never' : new Date(mockStats.lastSync).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-blue-500">
            💡 The mock database simulates real database operations when the backend API is unavailable.
          </div>
        </div>
      )}

      {/* Enrollments List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Enrollments</h3>
        
        {enrollments.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No enrollments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment, index) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{enrollment.moduleTitle}</h4>
                    <p className="text-sm text-gray-600">
                      Level: {enrollment.moduleLevel} • 
                      Amount: ₹{enrollment.paymentAmount?.toLocaleString()} • 
                      Status: {enrollment.paymentStatus}
                    </p>
                    <p className="text-xs text-gray-500">
                      Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {enrollment.syncedToDatabase ? (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">Synced</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-yellow-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">Pending</span>
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.progress?.progressPercentage || 0}%
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${enrollment.progress?.progressPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
        </>
      )}

      {/* System Status Tab */}
      {activeTab === 'status' && (
        <SystemStatus />
      )}
    </div>
  );
};

export default EnrollmentSync;
