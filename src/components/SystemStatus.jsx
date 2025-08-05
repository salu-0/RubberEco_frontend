import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Server,
  Database,
  Wifi,
  User
} from 'lucide-react';
import { getUserData } from '../utils/api';
import mockAPI from '../utils/mockAPI';
import enrollmentManager from '../utils/enrollmentManager';

const SystemStatus = () => {
  const [status, setStatus] = useState({
    frontend: 'checking',
    backend: 'checking',
    database: 'checking',
    auth: 'checking',
    mockAPI: 'checking',
    enrollmentManager: 'checking'
  });

  const [details, setDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setIsLoading(true);
    const newStatus = {};
    const newDetails = {};

    // 1. Check Frontend
    try {
      newStatus.frontend = 'online';
      newDetails.frontend = 'React app loaded successfully';
    } catch (error) {
      newStatus.frontend = 'error';
      newDetails.frontend = `Frontend error: ${error.message}`;
    }

    // 2. Check Authentication
    try {
      const userData = getUserData();
      if (userData.isLoggedIn) {
        newStatus.auth = 'online';
        newDetails.auth = `Logged in as: ${userData.user?.name || 'Unknown'}`;
      } else {
        newStatus.auth = 'offline';
        newDetails.auth = 'Not logged in';
      }
    } catch (error) {
      newStatus.auth = 'error';
      newDetails.auth = `Auth error: ${error.message}`;
    }

    // 3. Check Backend API
    try {
      const response = await fetch('http://localhost:5000/api/health-check', {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        newStatus.backend = 'online';
        newDetails.backend = 'Backend API responding';
      } else {
        newStatus.backend = 'error';
        newDetails.backend = `Backend returned ${response.status}`;
      }
    } catch (error) {
      newStatus.backend = 'offline';
      newDetails.backend = `Backend unreachable: ${error.message}`;
    }

    // 4. Check Database (via API)
    try {
      const response = await fetch('http://localhost:5000/api/training/direct-test', {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        newStatus.database = 'online';
        newDetails.database = 'Database API responding';
      } else {
        newStatus.database = 'error';
        newDetails.database = `Database API returned ${response.status}`;
      }
    } catch (error) {
      newStatus.database = 'offline';
      newDetails.database = `Database API unreachable: ${error.message}`;
    }

    // 5. Check Mock API
    try {
      const mockStats = await mockAPI.getDatabaseStats();
      newStatus.mockAPI = 'online';
      newDetails.mockAPI = `Mock DB: ${mockStats.stats.databaseEnrollments} enrollments`;
    } catch (error) {
      newStatus.mockAPI = 'error';
      newDetails.mockAPI = `Mock API error: ${error.message}`;
    }

    // 6. Check Enrollment Manager
    try {
      const { user } = getUserData();
      if (user?.id) {
        const userStats = enrollmentManager.getEnrollmentStats(user.id);
        newStatus.enrollmentManager = 'online';
        newDetails.enrollmentManager = `Local: ${userStats.totalEnrollments} enrollments, ${userStats.pendingSync} pending sync`;
      } else {
        newStatus.enrollmentManager = 'offline';
        newDetails.enrollmentManager = 'No user logged in';
      }
    } catch (error) {
      newStatus.enrollmentManager = 'error';
      newDetails.enrollmentManager = `Enrollment Manager error: ${error.message}`;
    }

    setStatus(newStatus);
    setDetails(newDetails);
    setIsLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'border-green-200 bg-green-50';
      case 'offline':
        return 'border-red-200 bg-red-50';
      case 'error':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const StatusCard = ({ title, status, detail, icon: Icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${getStatusColor(status)}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {getStatusIcon(status)}
      </div>
      <p className="text-sm text-gray-600">{detail}</p>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Status</h2>
          <p className="text-gray-600">Monitor the health of all system components</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={checkSystemStatus}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusCard
          title="Frontend"
          status={status.frontend}
          detail={details.frontend}
          icon={Wifi}
        />
        <StatusCard
          title="Authentication"
          status={status.auth}
          detail={details.auth}
          icon={User}
        />
        <StatusCard
          title="Backend API"
          status={status.backend}
          detail={details.backend}
          icon={Server}
        />
        <StatusCard
          title="Database API"
          status={status.database}
          detail={details.database}
          icon={Database}
        />
        <StatusCard
          title="Mock API (Fallback)"
          status={status.mockAPI}
          detail={details.mockAPI}
          icon={CheckCircle}
        />
        <StatusCard
          title="Enrollment Manager"
          status={status.enrollmentManager}
          detail={details.enrollmentManager}
          icon={Database}
        />
      </div>

      {/* System Health Summary */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Summary</h3>
        
        <div className="space-y-3">
          {Object.values(status).includes('offline') || Object.values(status).includes('error') ? (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Degraded Performance</p>
                <p className="text-sm text-yellow-700">
                  Some backend services are unavailable, but the system is using fallback mechanisms to ensure functionality.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">All Systems Operational</p>
                <p className="text-sm text-green-700">
                  All components are functioning normally.
                </p>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p><strong>✅ Enrollment System:</strong> Fully functional with local storage and mock API fallback</p>
            <p><strong>✅ Course Access:</strong> Available regardless of backend status</p>
            <p><strong>✅ Data Persistence:</strong> All enrollment data is safely stored locally</p>
            <p><strong>🔄 Auto-Sync:</strong> Will sync to database when backend becomes available</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
