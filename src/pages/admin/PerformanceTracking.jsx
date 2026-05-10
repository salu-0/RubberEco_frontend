import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  Users,
  Star,
  DollarSign,
  CheckCircle,
  Eye,
  Edit,
  Download,
  Filter,
  Calendar,
  BarChart3
} from 'lucide-react';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

const PerformanceTracking = ({ darkMode }) => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterRole, setFilterRole] = useState('all');
  
  const getAuthToken = () => localStorage.getItem('token') || 'dummy-token-for-testing';

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffInMin = Math.floor((now - date) / (1000 * 60));
    if (diffInMin < 1) return 'Just now';
    if (diffInMin < 60) return `${diffInMin} minutes ago`;
    const diffInHr = Math.floor(diffInMin / 60);
    if (diffInHr < 24) return `${diffInHr} hours ago`;
    return `${Math.floor(diffInHr / 24)} days ago`;
  };

  const normalizeRole = (role) => {
    const map = {
      tapper: 'Tapper',
      latex_collector: 'Latex Collector',
      field_officer: 'Field Officer',
      trainer: 'Trainer',
      supervisor: 'Supervisor',
      skilled_worker: 'Skilled Worker',
      manager: 'Manager',
      staff: 'Staff'
    };
    return map[String(role || '').toLowerCase()] || role || 'Staff';
  };

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/staff`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        setPerformanceData([]);
        return;
      }

      const result = await response.json();
      const staffList = Array.isArray(result?.data) ? result.data : [];

      const transformed = staffList.map((staff) => {
        const tasksAssigned = Number(staff.tasks_assigned || 0);
        const tasksCompleted = Number(staff.tasks_completed || 0);
        const completionRate = tasksAssigned > 0
          ? Math.round((tasksCompleted / tasksAssigned) * 100)
          : 0;

        return {
          id: staff._id || staff.id || `${staff.email}-${staff.name}`,
          name: staff.name || staff.fullName || 'Unknown Staff',
          role: normalizeRole(staff.role),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name || staff.fullName || 'Staff')}&background=10b981&color=ffffff`,
          tasksCompleted,
          tasksAssigned,
          completionRate,
          avgRating: Number(staff.performance_rating || 0).toFixed(1),
          totalEarnings: Number(staff.salary || 0),
          lastActive: getTimeAgo(staff.last_active || staff.updatedAt || staff.createdAt),
          status: String(staff.status || 'active').toLowerCase() === 'active' ? 'active' : 'inactive'
        };
      });

      setPerformanceData(transformed);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setPerformanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [filterPeriod]);

  // Filter performance data
  const filteredData = performanceData.filter(item => {
    const matchesRole = filterRole === 'all' || item.role.toLowerCase().includes(filterRole.toLowerCase());
    return matchesRole;
  });

  // Calculate overall statistics
  const overallStats = {
    avgCompletionRate: filteredData.length > 0 ? 
      (filteredData.reduce((sum, item) => sum + item.completionRate, 0) / filteredData.length).toFixed(1) : 0,
    avgRating: filteredData.length > 0 ? 
      (filteredData.reduce((sum, item) => sum + item.avgRating, 0) / filteredData.length).toFixed(1) : 0,
    activeStaff: filteredData.filter(item => item.status === 'active').length,
    totalEarnings: filteredData.reduce((sum, item) => sum + item.totalEarnings, 0)
  };

  const handleExportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Role,Completion Rate,Rating,Earnings,Status,Tasks Completed,Tasks Assigned\n"
      + filteredData.map(item => 
          `${item.name},${item.role},${item.completionRate}%,${item.avgRating},${item.totalEarnings},${item.status},${item.tasksCompleted},${item.tasksAssigned}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "performance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
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
                {overallStats.avgCompletionRate}%
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
                {overallStats.avgRating}
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
                Active Staff
              </p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {overallStats.activeStaff}/{filteredData.length}
              </p>
              <p className="text-sm text-yellow-500 font-medium">
                {filteredData.length - overallStats.activeStaff} inactive
              </p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-50">
              <Users className="h-8 w-8 text-yellow-600" />
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
                ${overallStats.totalEarnings.toLocaleString()}
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

      {/* Performance Table */}
      <motion.div
        className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${
          darkMode ? 'border-gray-700' : 'border-gray-100'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Staff Performance Overview
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Period Filter */}
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>

              {/* Role Filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
              >
                <option value="all">All Roles</option>
                <option value="field officer">Field Officers</option>
                <option value="tapper">Tappers</option>
                <option value="skilled worker">Skilled Workers</option>
                <option value="trainer">Trainers</option>
              </select>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={handleExportReport}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Report</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className={`ml-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading performance data...
            </span>
          </div>
        ) : (
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
                {filteredData.map((staff) => (
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
                        ${staff.totalEarnings.toLocaleString()}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PerformanceTracking;
