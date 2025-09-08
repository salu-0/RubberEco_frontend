import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';

const StaffManagement = ({ darkMode }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success',
    title: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'tapper',
    department: '',
    location: '',
    salary: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    emergency_contact: {
      name: '',
      phone: '',
      relationship: ''
    },
    skills: [],
    notes: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Sample staff data
  const sampleStaff = [
    {
      id: '1',
      name: 'Ravi Kumar',
      email: 'ravi.kumar@rubbereco.com',
      phone: '+91 9876543210',
      role: 'field_officer',
      department: 'Operations',
      location: 'Kerala District 1',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      hire_date: '2023-06-15T00:00:00Z',
      status: 'active',
      performance_rating: 4.8,
      tasks_completed: 45,
      tasks_assigned: 50,
      last_active: '2024-01-15T14:30:00Z'
    },
    {
      id: '2',
      name: 'Priya Nair',
      email: 'priya.nair@rubbereco.com',
      phone: '+91 9876543211',
      role: 'tapper',
      department: 'Field Operations',
      location: 'Kerala District 2',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      hire_date: '2023-08-20T00:00:00Z',
      status: 'active',
      performance_rating: 4.6,
      tasks_completed: 38,
      tasks_assigned: 42,
      last_active: '2024-01-15T16:45:00Z'
    },
    {
      id: '3',
      name: 'Suresh Menon',
      email: 'suresh.menon@rubbereco.com',
      phone: '+91 9876543212',
      role: 'skilled_worker',
      department: 'Maintenance',
      location: 'Kerala District 1',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      hire_date: '2023-04-10T00:00:00Z',
      status: 'active',
      performance_rating: 4.4,
      tasks_completed: 32,
      tasks_assigned: 40,
      last_active: '2024-01-14T13:10:00Z'
    },
    {
      id: '4',
      name: 'Lakshmi Devi',
      email: 'lakshmi.devi@rubbereco.com',
      phone: '+91 9876543213',
      role: 'trainer',
      department: 'Training & Development',
      location: 'Kerala District 3',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      hire_date: '2023-03-05T00:00:00Z',
      status: 'inactive',
      performance_rating: 4.7,
      tasks_completed: 28,
      tasks_assigned: 35,
      last_active: '2024-01-12T10:20:00Z'
    },
    {
      id: '5',
      name: 'Arun Das',
      email: 'arun.das@rubbereco.com',
      phone: '+91 9876543214',
      role: 'field_officer',
      department: 'Operations',
      location: 'Kerala District 2',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      hire_date: '2023-07-12T00:00:00Z',
      status: 'active',
      performance_rating: 4.5,
      tasks_completed: 41,
      tasks_assigned: 48,
      last_active: '2024-01-15T18:20:00Z'
    }
  ];

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || 'dummy-token-for-testing';
  };

  // Show notification function
  const showNotification = (title, message, type = 'success') => {
    setNotification({ show: true, title, message, type });
    setTimeout(() => {
      setNotification({ show: false, title: '', message: '', type: 'success' });
    }, 5000);
  };

  // Load staff data from API
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStaff(result.data || []);
      } else {
        console.error('Failed to fetch staff:', response.statusText);
        // Fallback to sample data if API fails
        setStaff(sampleStaff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      // Fallback to sample data if API fails
      setStaff(sampleStaff);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Filter staff based on search term and role
  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateForm = (data) => {
    const errors = {};

    // Required field validation
    if (!data.name.trim()) {
      errors.name = 'Full name is required';
    } else if (data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!data.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!data.role) {
      errors.role = 'Role is required';
    }

    if (!data.department.trim()) {
      errors.department = 'Department is required';
    }

    if (!data.location.trim()) {
      errors.location = 'Location is required';
    }

    // Optional field validation
    if (data.salary && (isNaN(data.salary) || data.salary < 0)) {
      errors.salary = 'Salary must be a valid positive number';
    }

    if (data.emergency_contact.phone && !validatePhone(data.emergency_contact.phone)) {
      errors.emergency_phone = 'Please enter a valid emergency contact phone';
    }

    return errors;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    let updatedData;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      updatedData = {
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      };
    } else {
      updatedData = {
        ...formData,
        [name]: value
      };
    }

    setFormData(updatedData);

    // Real-time validation
    const errors = validateForm(updatedData);
    setFormErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'tapper',
      department: '',
      location: '',
      salary: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      emergency_contact: {
        name: '',
        phone: '',
        relationship: ''
      },
      skills: [],
      notes: ''
    });
    setFormErrors({});
    setIsFormValid(false);
  };

  // Handle staff actions
  const handleViewStaff = (staffId) => {
    const staffMember = staff.find(s => s._id === staffId || s.id === staffId);
    setSelectedStaff(staffMember);
    setShowViewModal(true);
    console.log('View staff:', staffMember);
  };

  const handleEditStaff = (staffId) => {
    const staffMember = staff.find(s => s._id === staffId || s.id === staffId);
    if (staffMember) {
      setFormData({
        name: staffMember.name || '',
        email: staffMember.email || '',
        phone: staffMember.phone || '',
        role: staffMember.role || 'tapper',
        department: staffMember.department || '',
        location: staffMember.location || '',
        salary: staffMember.salary || '',
        address: staffMember.address || {
          street: '',
          city: '',
          state: '',
          pincode: ''
        },
        emergency_contact: staffMember.emergency_contact || {
          name: '',
          phone: '',
          relationship: ''
        },
        skills: staffMember.skills || [],
        notes: staffMember.notes || ''
      });
      setSelectedStaff(staffMember);
      setShowEditModal(true);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setStaff(staff.filter(member => member._id !== staffId && member.id !== staffId));
          showNotification('Removed! 🗑️', 'Staff member has been removed from the team.', 'success');
        } else {
          const error = await response.json();
          showNotification('Error', error.message || 'Failed to delete staff member', 'error');
        }
      } catch (error) {
        console.error('Error deleting staff:', error);
        showNotification('Error', 'Error deleting staff member. Please try again.', 'error');
      }
    }
  };

  const handleAddStaff = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Handle form submission for adding staff
  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    // Validate form before submission
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      showNotification('Validation Error', 'Please fix the validation errors before submitting.', 'error');
      return;
    }

    setSubmitLoading(true);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/staff`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setStaff(prev => [result.data, ...prev]);
        setShowAddModal(false);
        resetForm();
        showNotification(
          'Success! 🎉',
          `${result.data.name} has been added to the team and will receive a welcome email shortly!`,
          'success'
        );
      } else {
        showNotification('Error', result.message || 'Failed to add staff member', 'error');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      showNotification('Error', 'Error adding staff member. Please try again.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle form submission for editing staff
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const token = getAuthToken();
      const staffId = selectedStaff._id || selectedStaff.id;
      const response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setStaff(prev => prev.map(member =>
          (member._id === staffId || member.id === staffId) ? result.data : member
        ));
        setShowEditModal(false);
        setSelectedStaff(null);
        resetForm();
        showNotification('Updated! ✨', `${result.data.name}'s information has been updated successfully!`, 'success');
      } else {
        showNotification('Error', result.message || 'Failed to update staff member', 'error');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      showNotification('Error', 'Error updating staff member. Please try again.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleExportStaff = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Phone,Role,Department,Location,Status,Rating,Performance\n"
      + filteredStaff.map(member => 
          `${member.name},${member.email},${member.phone},${member.role},${member.department},${member.location},${member.status},${member.performance_rating},${member.tasks_completed}/${member.tasks_assigned}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "staff_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'field_officer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'tapper':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'latex_collector':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      case 'skilled_worker':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'trainer':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Staff Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                {staff.length}
              </p>
              <p className="text-sm text-blue-500 font-medium">
                All staff members
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <UserCheck className="h-8 w-8 text-blue-600" />
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
                {staff.filter(s => s.status === 'active').length}
              </p>
              <p className="text-sm text-green-500 font-medium">
                Currently working
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-50">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </motion.div>


      </div>

      {/* Staff Management Table */}
      <motion.div
        className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white'} backdrop-blur-sm rounded-2xl shadow-xl border ${
          darkMode ? 'border-green-500/20' : 'border-gray-100'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className={`p-6 border-b ${darkMode ? 'border-green-500/20' : 'border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Staff Members ({filteredStaff.length})
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
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
                <option value="field_officer">Field Officers</option>
                <option value="tapper">Tappers</option>
                <option value="latex_collector">Latex Collectors</option>
                <option value="skilled_worker">Skilled Workers</option>
                <option value="trainer">Trainers</option>
              </select>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  onClick={handleAddStaff}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-green-500/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Add Staff</span>
                </motion.button>
                <motion.button
                  onClick={handleExportStaff}
                  className={`px-6 py-3 border rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                    darkMode
                      ? 'border-green-500/30 hover:bg-green-500/10 text-green-400'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="h-5 w-5" />
                  <span>Export</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className={`ml-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading staff...
            </span>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <UserCheck className={`h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
            <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No staff members found
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className={`${darkMode ? 'bg-gray-700/50 border-b border-green-500/20' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`} style={{width: '40%'}}>
                    Staff Member
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`} style={{width: '25%'}}>
                    Role & Department
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`} style={{width: '20%'}}>
                    Location
                  </th>
                  <th className={`px-6 py-4 text-right text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`} style={{width: '15%'}}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredStaff.map((member) => (
                  <motion.tr
                    key={member._id || member.id}
                    className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                    whileHover={{ backgroundColor: darkMode ? '#374151' : '#f9fafb' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {member.name}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                            <Mail className="h-3 w-3 mr-1" />
                            {member.email}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                            <Phone className="h-3 w-3 mr-1" />
                            {member.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                        {member.role.replace('_', ' ')}
                      </span>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                        {member.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {member.location}
                        </span>
                      </div>
                    </td>


                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <motion.button
                          onClick={() => handleViewStaff(member._id || member.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            darkMode
                              ? 'text-green-400 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40'
                              : 'text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 hover:border-green-300'
                          }`}
                          title="View Details"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => handleEditStaff(member._id || member.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            darkMode
                              ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40'
                              : 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                          }`}
                          title="Edit Staff"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => handleDeleteStaff(member._id || member.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            darkMode
                              ? 'text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40'
                              : 'text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300'
                          }`}
                          title="Remove Staff"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-[2rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 ${
              darkMode ? 'border-gray-600' : 'border-gray-200'
            } relative`}
            style={{
              borderRadius: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Add New Staff Member
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-8">
              {/* Form Validation Summary */}
              {Object.keys(formErrors).length > 0 && (
                <div className={`p-4 rounded-xl border-l-4 border-red-500 ${
                  darkMode ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-500'
                }`}>
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">⚠️</span>
                    <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                      Please fix the following errors:
                    </h4>
                  </div>
                  <ul className={`mt-2 text-sm ${darkMode ? 'text-red-300' : 'text-red-700'} list-disc list-inside`}>
                    {Object.values(formErrors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-6">
                <div className={`pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Basic Information
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    Enter the staff member's personal and contact details
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      formErrors.name
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}`}
                  />
                  {formErrors.name && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      formErrors.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}`}
                  />
                  {formErrors.email && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+91 9876543210"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      formErrors.phone
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}`}
                  />
                  {formErrors.phone && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="tapper">Tapper</option>
                    <option value="latex_collector">Latex Collector</option>
                    <option value="field_officer">Field Officer</option>
                    <option value="skilled_worker">Skilled Worker</option>
                    <option value="trainer">Trainer</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Department *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Operations, Field Operations"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      formErrors.department
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}`}
                  />
                  {formErrors.department && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {formErrors.department}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Kerala District 1"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      formErrors.location
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}`}
                  />
                  {formErrors.location && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {formErrors.location}
                    </p>
                  )}
                </div>
              </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-6">
                <div className={`pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Employment Details
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    Salary and other employment information
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Salary (Monthly)
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="25000"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      formErrors.salary
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}`}
                  />
                  {formErrors.salary && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {formErrors.salary}
                    </p>
                  )}
                </div>
              </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-6">
                <div className={`pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Emergency Contact
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    Contact person in case of emergency
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergency_contact.name"
                      value={formData.emergency_contact.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="emergency_contact.phone"
                      value={formData.emergency_contact.phone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        formErrors.emergency_phone
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}`}
                    />
                    {formErrors.emergency_phone && (
                      <p className="mt-2 text-sm text-red-500 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {formErrors.emergency_phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Relationship
                    </label>
                    <input
                      type="text"
                      name="emergency_contact.relationship"
                      value={formData.emergency_contact.relationship}
                      onChange={handleInputChange}
                      placeholder="e.g., Spouse, Parent"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-6">
                <div className={`pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Additional Notes
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    Any additional information about the staff member
                  </p>
                </div>
              <div>
                <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Additional notes about the staff member..."
                />
              </div>
              </div>

              {/* Form Actions */}
              <div className={`flex space-x-4 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  type="submit"
                  disabled={submitLoading || !isFormValid}
                  className={`flex-1 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                    submitLoading || !isFormValid
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg'
                  }`}
                >
                  {submitLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    'Add Staff Member'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-6 py-3 border rounded-xl transition-all duration-200 font-medium ${
                    darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Staff Modal */}
      {showViewModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-[2rem] p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 ${
              darkMode ? 'border-gray-600' : 'border-gray-200'
            } relative`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Staff Details
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStaff(null);
                }}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Staff Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Section */}
              <div className="lg:col-span-1">
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-2xl p-6 text-center`}>
                  <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="h-12 w-12 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    {selectedStaff.name}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {selectedStaff.role?.replace('_', ' ').toUpperCase()}
                  </p>
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(selectedStaff.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedStaff.rating || 'N/A'}
                    </span>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    selectedStaff.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      selectedStaff.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    {selectedStaff.status || 'Active'}
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-3" />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {selectedStaff.email || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-3" />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {selectedStaff.phone || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {selectedStaff.location || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Joined: {selectedStaff.joinDate || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Work Information */}
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                      Work Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Department</span>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {selectedStaff.department || 'Not assigned'}
                        </p>
                      </div>
                      <div>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Salary</span>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          ₹{selectedStaff.salary || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Skills</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedStaff.skills?.length > 0 ? (
                            selectedStaff.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              No skills listed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  {selectedStaff.address && (
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 md:col-span-2`}>
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                        Address
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {[
                          selectedStaff.address?.street,
                          selectedStaff.address?.city,
                          selectedStaff.address?.state,
                          selectedStaff.address?.pincode
                        ].filter(Boolean).join(', ') || 'Address not provided'}
                      </p>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  {selectedStaff.emergency_contact && (
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 md:col-span-2`}>
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                        Emergency Contact
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</span>
                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {selectedStaff.emergency_contact?.name || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</span>
                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {selectedStaff.emergency_contact?.phone || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Relationship</span>
                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {selectedStaff.emergency_contact?.relationship || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedStaff.notes && (
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 md:col-span-2`}>
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                        Notes
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {selectedStaff.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditStaff(selectedStaff._id || selectedStaff.id);
                }}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Details</span>
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStaff(null);
                }}
                className={`px-6 py-3 border rounded-xl transition-colors ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-[2rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 ${
              darkMode ? 'border-gray-600' : 'border-gray-200'
            } relative`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit Staff Member
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStaff(null);
                  resetForm();
                }}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmitEdit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } ${formErrors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter full name"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } ${formErrors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter email address"
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } ${formErrors.phone ? 'border-red-500' : ''}`}
                    placeholder="Enter phone number"
                    required
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } ${formErrors.role ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="tapper">Tapper</option>
                    <option value="latex_collector">Latex Collector</option>
                    <option value="field_officer">Field Officer</option>
                    <option value="quality_inspector">Quality Inspector</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="manager">Manager</option>
                  </select>
                  {formErrors.role && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter department"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter work location"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Salary
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter salary amount"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address?.street || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter street address"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address?.city || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      State
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address?.state || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      PIN Code
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address?.pincode || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter PIN code"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergency_contact.name"
                      value={formData.emergency_contact?.name || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Emergency contact name"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="emergency_contact.phone"
                      value={formData.emergency_contact?.phone || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Emergency contact phone"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Relationship
                    </label>
                    <input
                      type="text"
                      name="emergency_contact.relationship"
                      value={formData.emergency_contact?.relationship || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Relationship"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Additional notes about the staff member"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={submitLoading || !isFormValid}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                    submitLoading || !isFormValid
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600 transform hover:scale-105'
                  } text-white shadow-lg`}
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Update Staff Member</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedStaff(null);
                    resetForm();
                  }}
                  className={`px-6 py-3 border rounded-xl transition-all duration-200 font-medium ${
                    darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Enhanced Success/Error Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            className="fixed top-6 right-6 z-[70] max-w-md"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
                duration: 0.6
              }
            }}
            exit={{
              opacity: 0,
              x: 100,
              scale: 0.8,
              transition: { duration: 0.3 }
            }}
          >
            <div className={`relative overflow-hidden rounded-2xl shadow-2xl backdrop-blur-md border-2 ${
              notification.type === 'success'
                ? 'bg-gradient-to-br from-green-500/95 to-emerald-600/95 border-green-300/50 shadow-green-500/25'
                : 'bg-gradient-to-br from-red-500/95 to-rose-600/95 border-red-300/50 shadow-red-500/25'
            }`}>
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className={`absolute inset-0 ${
                  notification.type === 'success' ? 'bg-green-200' : 'bg-red-200'
                } animate-pulse`}></div>
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className={`absolute top-2 left-2 w-3 h-3 rounded-full ${
                    notification.type === 'success' ? 'bg-green-300' : 'bg-red-300'
                  } animate-ping`}></div>
                  <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                    notification.type === 'success' ? 'bg-green-300' : 'bg-red-300'
                  } animate-ping delay-75`}></div>
                  <div className={`absolute bottom-3 left-6 w-1 h-1 rounded-full ${
                    notification.type === 'success' ? 'bg-green-300' : 'bg-red-300'
                  } animate-ping delay-150`}></div>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-6">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <motion.div
                    className="flex-shrink-0"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                      transition: { delay: 0.2, type: "spring", stiffness: 300 }
                    }}
                  >
                    <div className={`p-2 rounded-full ${
                      notification.type === 'success' ? 'bg-green-400/30' : 'bg-red-400/30'
                    }`}>
                      {notification.type === 'success' ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </motion.div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <motion.h4
                      className="text-lg font-bold text-white mb-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: 0.3 }
                      }}
                    >
                      {notification.title}
                    </motion.h4>
                    <motion.p
                      className="text-white/90 text-sm leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: 0.4 }
                      }}
                    >
                      {notification.message}
                    </motion.p>
                  </div>

                  {/* Close Button */}
                  <motion.button
                    onClick={() => setNotification({ show: false, title: '', message: '', type: 'success' })}
                    className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { delay: 0.5 }
                    }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Progress bar */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
                  initial={{ width: "100%" }}
                  animate={{
                    width: "0%",
                    transition: { duration: 5, ease: "linear" }
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StaffManagement;
