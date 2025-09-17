import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  Download,
  Filter,
  RefreshCw,
  Database
} from 'lucide-react';
import { adminTheme } from '../../utils/adminTheme';
// import { supabase } from '../../supabaseClient'; // Commented out for now

const ManageUsers = ({ darkMode }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', location: '', bio: '' });

  // Fetch users from both MongoDB and Supabase
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users from MongoDB (Register collection)
      let mongoUsers = [];
      try {
        const mongoResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
          }
        });

        if (mongoResponse.ok) {
          const mongoData = await mongoResponse.json();
          if (mongoData.success) {
            mongoUsers = mongoData.users || [];
            console.log('Fetched MongoDB users:', mongoUsers.length);
          }
        } else {
          console.warn('MongoDB API response not OK:', mongoResponse.status);
        }
      } catch (mongoError) {
        console.warn('Error fetching MongoDB users:', mongoError.message);
      }

      // Fetch users from Supabase (Google OAuth users)
      let googleUsers = [];
      try {
        // Create a backend endpoint to fetch Supabase users with roles
        const supabaseResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/supabase`);
        if (supabaseResponse.ok) {
          const supabaseData = await supabaseResponse.json();
          googleUsers = supabaseData.users || [];
          console.log('Fetched real Supabase users:', googleUsers.length);
        } else {
          // Fallback to sample data if backend endpoint doesn't exist yet
          googleUsers = [
            {
              id: 'salu0f05-f0ef-4fe6-9d5b-3b65a0d6e143',
              name: 'SALU MANOJ',
              email: 'salumanoj2026@mca.ajce.in',
              role: 'farmer',
              provider: 'google',
              avatar: 'https://ui-avatars.com/api/?name=SALU+MANOJ&background=random',
              created_at: new Date().toISOString(),
              last_sign_in: new Date().toISOString(),
              email_verified: true,
              isVerified: true
            },
            {
              id: 'aleena-a574-4fe6-9d5b-3b65a0d6e173',
              name: 'DR ALEENA ANNA ALEX',
              email: 'aleenaannaalex2026@mca.ajce.in',
              role: 'admin',
              provider: 'google',
              avatar: 'https://ui-avatars.com/api/?name=DR+ALEENA+ANNA+ALEX&background=random',
              created_at: new Date().toISOString(),
              last_sign_in: new Date().toISOString(),
              email_verified: true,
              isVerified: true
            },
            {
              id: 'salu-a890-4fe6-9d5b-3b65a0d6e203',
              name: 'Salu Manoj',
              email: 'salumanoj2026@gmail.com',
              role: 'farmer',
              provider: 'google',
              avatar: 'https://ui-avatars.com/api/?name=Salu+Manoj&background=random',
              created_at: new Date().toISOString(),
              last_sign_in: new Date().toISOString(),
              email_verified: true,
              isVerified: true
            }
          ];
          console.log('Using sample Google users:', googleUsers.length);
        }
      } catch (supabaseError) {
        console.warn('Error fetching Supabase users:', supabaseError.message);
        googleUsers = [];
      }

      // Combine all users
      const allUsers = [...mongoUsers, ...googleUsers];

      if (allUsers.length === 0) {
        console.log('No users found from APIs, using fallback data');
        // Fallback data will be set in catch block
        throw new Error('No users found from APIs');
      }

      setUsers(allUsers);
      console.log('Total users loaded:', allUsers.length);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to sample data if API fails
      setUsers([
        {
          id: '1',
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@email.com',
          role: 'farmer',
          provider: 'email',
          avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=random',
          created_at: '2024-01-10T10:00:00Z',
          last_sign_in: '2024-01-15T14:30:00Z',
          email_verified: true
        },
        {
          id: '2',
          name: 'Priya Nair',
          email: 'priya.nair@gmail.com',
          role: 'broker',
          provider: 'google',
          avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          created_at: '2024-01-12T09:15:00Z',
          last_sign_in: '2024-01-15T16:45:00Z',
          email_verified: true
        },
        {
          id: '3',
          name: 'Suresh Menon',
          email: 'suresh.menon@email.com',
          role: 'field_officer',
          provider: 'email',
          avatar: 'https://ui-avatars.com/api/?name=Suresh+Menon&background=random',
          created_at: '2024-01-08T11:20:00Z',
          last_sign_in: '2024-01-14T13:10:00Z',
          email_verified: true
        },
        {
          id: '4',
          name: 'Lakshmi Devi',
          email: 'lakshmi.devi@gmail.com',
          role: 'farmer',
          provider: 'google',
          avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          created_at: '2024-01-05T08:30:00Z',
          last_sign_in: '2024-01-15T12:20:00Z',
          email_verified: true
        },
        {
          id: '5',
          name: 'Arun Das',
          email: 'arun.das@email.com',
          role: 'field_officer',
          provider: 'email',
          avatar: 'https://ui-avatars.com/api/?name=Arun+Das&background=random',
          created_at: '2024-01-07T15:45:00Z',
          last_sign_in: '2024-01-14T18:20:00Z',
          email_verified: true
        },
        {
          id: '6',
          name: 'Meera Krishnan',
          email: 'meera.krishnan@gmail.com',
          role: 'broker',
          provider: 'google',
          avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          created_at: '2024-01-09T12:30:00Z',
          last_sign_in: '2024-01-15T10:15:00Z',
          email_verified: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term and role, and exclude admins from this view
  const filteredUsers = users.filter(user => {
    const userRole = (user.role || '').toLowerCase();
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || userRole === filterRole;
    const excludeAdmins = userRole !== 'admin';
    return matchesSearch && matchesRole && excludeAdmins;
  });

  // Handle user actions
  const handleViewUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  // Edit flow kept for potential future use; no button in UI

  const isMongoId = (id) => !!(id && id.match(/^[0-9a-fA-F]{24}$/));
  const isUuid = (id) => !!(id && id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i));

  const saveEdit = async () => {
    if (!selectedUser) return;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      let endpoint = '';
      if (isMongoId(selectedUser.id)) {
        endpoint = `${baseUrl}/users/${selectedUser.id}`;
      } else if (isUuid(selectedUser.id)) {
        endpoint = `${baseUrl}/users/supabase/${selectedUser.id}`;
      } else {
        alert('Unknown user ID format. Cannot update.');
        return;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to update user');
      }

      const updated = data.user || { ...selectedUser, ...editForm };
      setUsers(prev => prev.map(u => (u.id === selectedUser.id ? { ...u, ...updated } : u)));
      setIsEditOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      alert(err.message || 'Update failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    // Prevent deleting Supabase (Google) users from here
    if (user.provider === 'google' || isUuid(userId)) {
      alert('Supabase (Google) users cannot be deleted from here. Manage them in Supabase.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Remove user from local state
          setUsers(users.filter(user => user.id !== userId));
          console.log('User deleted successfully');
        } else {
          alert('Failed to delete user: ' + data.message);
        }
      } else {
        alert('Failed to delete user. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  // Removed Add User functionality from this view

  const handleExportUsers = () => {
    console.log('Export users');
    // Implement export functionality
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Role,Provider,Verified,Joined,Last Active\n"
      + filteredUsers.map(user => 
          `${user.name},${user.email},${user.role},${user.provider},${user.email_verified},${new Date(user.created_at).toLocaleDateString()},${user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : 'Never'}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen ${adminTheme.backgrounds.main(darkMode)} p-6`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Modern Header */}
        <div className="relative overflow-hidden">
          <div className={`absolute inset-0 ${adminTheme.utils.getGradientBackground(darkMode)} rounded-3xl blur-3xl`}></div>
          <div className={`relative ${adminTheme.components.card.header(darkMode)}`}>
            <div className="flex items-center space-x-6">
              <div className={`p-4 rounded-2xl ${adminTheme.colors.primary.gradient} shadow-lg shadow-green-500/25`}>
                <Users className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className={`text-4xl font-bold bg-gradient-to-r ${darkMode ? 'from-green-400 to-emerald-300' : 'from-gray-900 to-gray-600'} bg-clip-text text-transparent mb-2`}>
                  Manage Users
                </h1>
                <p className={`text-lg ${adminTheme.utils.getTextColor(darkMode, 'primary')}`}>
                  Comprehensive user management and analytics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            className={adminTheme.components.card.content(darkMode)}
            whileHover={{ y: -4, scale: 1.02 }}
            {...adminTheme.animations.fadeInUp}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${adminTheme.utils.getTextColor(darkMode, 'secondary')}`}>
                  Total Users
                </p>
                <p className={`text-3xl font-bold ${adminTheme.utils.getTextColor(darkMode)}`}>
                  {users.length}
                </p>
                <p className={`text-sm font-medium ${adminTheme.utils.getTextColor(darkMode, 'primary')}`}>
                  All registered users
                </p>
              </div>
              <div className={`p-3 rounded-xl ${adminTheme.colors.primary.gradient} shadow-lg shadow-green-500/25`}>
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
        </motion.div>

          <motion.div
            className={adminTheme.components.card.content(darkMode)}
            whileHover={{ y: -4, scale: 1.02 }}
            {...adminTheme.animations.fadeInUp}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${adminTheme.utils.getTextColor(darkMode, 'secondary')}`}>
                  Email Users
                </p>
                <p className={`text-3xl font-bold ${adminTheme.utils.getTextColor(darkMode)}`}>
                  {users.filter(u => u.provider === 'email').length}
                </p>
                <p className={`text-sm font-medium ${adminTheme.utils.getTextColor(darkMode, 'primary')}`}>
                  MongoDB registered
                </p>
              </div>
              <div className={`p-3 rounded-xl ${adminTheme.colors.primary.gradient} shadow-lg shadow-green-500/25`}>
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className={adminTheme.components.card.content(darkMode)}
            whileHover={{ y: -4, scale: 1.02 }}
            {...adminTheme.animations.fadeInUp}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${adminTheme.utils.getTextColor(darkMode, 'secondary')}`}>
                  Google Users
                </p>
                <p className={`text-3xl font-bold ${adminTheme.utils.getTextColor(darkMode)}`}>
                  {users.filter(u => u.provider === 'google').length}
                </p>
                <p className={`text-sm font-medium ${adminTheme.utils.getTextColor(darkMode, 'primary')}`}>
                  Supabase OAuth
                </p>
              </div>
              <div className={`p-3 rounded-xl ${adminTheme.colors.primary.gradient} shadow-lg shadow-green-500/25`}>
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className={adminTheme.components.card.content(darkMode)}
            whileHover={{ y: -4, scale: 1.02 }}
            {...adminTheme.animations.fadeInUp}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${adminTheme.utils.getTextColor(darkMode, 'secondary')}`}>
                  Verified Users
                </p>
                <p className={`text-3xl font-bold ${adminTheme.utils.getTextColor(darkMode)}`}>
                  {users.filter(u => u.email_verified).length}
                </p>
                <p className={`text-sm font-medium ${adminTheme.utils.getTextColor(darkMode, 'primary')}`}>
                  Email verified
                </p>
              </div>
              <div className={`p-3 rounded-xl ${adminTheme.colors.primary.gradient} shadow-lg shadow-green-500/25`}>
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Users Management Table */}
        <motion.div
          className={adminTheme.components.card.content(darkMode)}
          {...adminTheme.animations.fadeInUp}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className={`p-6 border-b ${adminTheme.utils.getBorderColor(darkMode)}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                All Users ({filteredUsers.length})
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    MongoDB
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Supabase
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative group">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
                  darkMode ? 'text-gray-400 group-focus-within:text-green-400' : 'text-gray-400 group-focus-within:text-green-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={adminTheme.components.input.search(darkMode)}
                />
              </div>

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
                <option value="farmer">Farmers</option>
                <option value="broker">Brokers</option>
                <option value="field_officer">Field Officers</option>
                <option value="admin">Admins</option>
              </select>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={fetchUsers}
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl disabled:opacity-50 transition-all duration-300 flex items-center space-x-2 ${adminTheme.components.button.primary(darkMode)}`}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleExportUsers}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 ${adminTheme.components.button.secondary(darkMode)}`}
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className={`ml-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading users...
            </span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className={`h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
            <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No users found
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    User
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Role
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Provider
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Joined
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Last Active
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                    whileHover={{ backgroundColor: darkMode ? '#374151' : '#f9fafb' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.name}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : user.role === 'field_officer'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : user.role === 'broker'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.provider === 'google' ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full mr-2 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">G</span>
                            </div>
                            <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Google
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-blue-500 mr-2" />
                            <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              MongoDB
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.email_verified ? (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-600 dark:text-green-400">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                            <span className="text-sm text-yellow-600 dark:text-yellow-400">Pending</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(user.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : 'Never'}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user.last_sign_in ? new Date(user.last_sign_in).toLocaleTimeString() : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewUser(user.id)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title="View User"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {/* Edit button removed */}
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
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

        {/* View Modal */}
        {isViewOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className={`w-full max-w-md rounded-2xl p-6 ${adminTheme.components.card.content(darkMode)}`}>
              <div className="flex items-center mb-4">
                <img src={selectedUser.avatar} alt={selectedUser.name} className="h-12 w-12 rounded-full mr-3" />
                <div>
                  <div className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.name}</div>
                  <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedUser.email}</div>
                </div>
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Provider:</strong> {selectedUser.provider}</p>
                {selectedUser.phone && <p><strong>Phone:</strong> {selectedUser.phone}</p>}
                {selectedUser.location && <p><strong>Location:</strong> {selectedUser.location}</p>}
                {selectedUser.bio && <p className="mt-2">{selectedUser.bio}</p>}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => { setIsViewOpen(false); setSelectedUser(null); }} className={adminTheme.components.button.secondary(darkMode)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className={`w-full max-w-lg rounded-2xl p-6 ${adminTheme.components.card.content(darkMode)}`}>
              <div className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Edit User</div>
              <div className="grid grid-cols-1 gap-3">
                <input className={adminTheme.components.input.search(darkMode)} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" />
                <input className={adminTheme.components.input.search(darkMode)} value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" />
                <input className={adminTheme.components.input.search(darkMode)} value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Phone" />
                <input className={adminTheme.components.input.search(darkMode)} value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} placeholder="Location" />
                <textarea className={adminTheme.components.input.search(darkMode)} value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Bio" />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setIsEditOpen(false); setSelectedUser(null); }} className={adminTheme.components.button.secondary(darkMode)}>Cancel</button>
                <button onClick={saveEdit} className={adminTheme.components.button.primary(darkMode)}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
