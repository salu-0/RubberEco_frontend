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

const PerformanceTracking = ({ darkMode }) => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterRole, setFilterRole] = useState('all');

  // Sample performance data
  const samplePerformanceData = [
    {
      id: 1,
      name: 'Ravi Kumar',
      role: 'Field Officer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      tasksCompleted: 45,
      tasksAssigned: 50,
      completionRate: 90,
      avgRating: 4.8,
      totalEarnings: 2400,
      lastActive: '2 hours ago',
      status: 'active',
      recentTasks: [
        { task: 'Tapping Service - Farm A', status: 'completed', date: '2024-01-15' },
        { task: 'Fertilizer Application', status: 'completed', date: '2024-01-14' },
        { task: 'Training Session', status: 'in-progress', date: '2024-01-13' }
      ],
      monthlyProgress: [85, 88, 90, 92, 90, 88, 90]
    },
    {
      id: 2,
      name: 'Priya Nair',
      role: 'Tapper',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      tasksCompleted: 38,
      tasksAssigned: 42,
      completionRate: 85,
      avgRating: 4.6,
      totalEarnings: 1900,
      lastActive: '1 hour ago',
      status: 'active',
      recentTasks: [
        { task: 'Latex Collection - Zone B', status: 'completed', date: '2024-01-15' },
        { task: 'Quality Check', status: 'completed', date: '2024-01-14' },
        { task: 'Equipment Maintenance', status: 'pending', date: '2024-01-13' }
      ],
      monthlyProgress: [80, 82, 85, 87, 85, 83, 85]
    },
    {
      id: 3,
      name: 'Suresh Menon',
      role: 'Skilled Worker',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      tasksCompleted: 32,
      tasksAssigned: 40,
      completionRate: 80,
      avgRating: 4.4,
      totalEarnings: 1600,
      lastActive: '3 hours ago',
      status: 'active',
      recentTasks: [
        { task: 'Rain Guard Installation', status: 'completed', date: '2024-01-15' },
        { task: 'Tree Health Assessment', status: 'in-progress', date: '2024-01-14' },
        { task: 'Irrigation Setup', status: 'completed', date: '2024-01-12' }
      ],
      monthlyProgress: [75, 78, 80, 82, 80, 78, 80]
    },
    {
      id: 4,
      name: 'Lakshmi Devi',
      role: 'Trainer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      tasksCompleted: 28,
      tasksAssigned: 35,
      completionRate: 75,
      avgRating: 4.7,
      totalEarnings: 2100,
      lastActive: '5 hours ago',
      status: 'inactive',
      recentTasks: [
        { task: 'Tapping Training Program', status: 'completed', date: '2024-01-14' },
        { task: 'Safety Workshop', status: 'completed', date: '2024-01-13' },
        { task: 'Certification Exam', status: 'scheduled', date: '2024-01-16' }
      ],
      monthlyProgress: [70, 72, 75, 77, 75, 73, 75]
    }
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPerformanceData(samplePerformanceData);
      setLoading(false);
    }, 1000);
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
                <option value="field">Field Officers</option>
                <option value="tapper">Tappers</option>
                <option value="skilled">Skilled Workers</option>
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
