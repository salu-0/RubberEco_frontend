import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Calendar,
  Eye,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Briefcase,
  Bell,
  TreePine,
  DollarSign,
  Phone,
  Mail,
  FileText,
  X,
  Zap
} from 'lucide-react';

const AssignTasks = ({ darkMode }) => {
  // Keep these for the assignment interface (still needed for the UI)
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [taskType, setTaskType] = useState('tapping');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');

  // Updated state for new workflow: Staff choose requests, Admin verifies
  const [pendingRequests, setPendingRequests] = useState([]); // Requests waiting for staff to apply
  const [staffApplications, setStaffApplications] = useState([]); // Staff applications to requests
  const [verifiedAssignments, setVerifiedAssignments] = useState([]); // Admin-verified assignments
  const [availableTappers, setAvailableTappers] = useState([]); // Keep this for the assignment interface
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('pending-requests'); // pending-requests, staff-applications, verified-assignments

  // Sample data
  const farmers = [
    { id: '1', name: 'Rajesh Kumar', farm: 'Farm A', hectares: 5, location: 'Kerala District 1' },
    { id: '2', name: 'Priya Nair', farm: 'Farm B', hectares: 3, location: 'Kerala District 2' },
    { id: '3', name: 'Suresh Menon', farm: 'Farm C', hectares: 7, location: 'Kerala District 1' },
    { id: '4', name: 'Lakshmi Devi', farm: 'Farm D', hectares: 4, location: 'Kerala District 3' }
  ];

  const staffMembers = [
    { id: '1', name: 'Ravi Kumar', role: 'tapper', status: 'available', rating: 4.8, location: 'Kerala District 1', experience: '5 years' },
    { id: '2', name: 'Priya Nair', role: 'field_officer', status: 'available', rating: 4.6, location: 'Kerala District 2', experience: '3 years' },
    { id: '3', name: 'Suresh Menon', role: 'tapper', status: 'busy', rating: 4.4, location: 'Kerala District 1', experience: '7 years' },
    { id: '4', name: 'Arun Das', role: 'supervisor', status: 'available', rating: 4.5, location: 'Kerala District 2', experience: '4 years' },
    { id: '5', name: 'Maya Pillai', role: 'quality_inspector', status: 'available', rating: 4.7, location: 'Kerala District 3', experience: '6 years' }
  ];

  const taskTypes = [
    { value: 'tapping', label: 'Rubber Tapping', roles: ['tapper'] },
    { value: 'inspection', label: 'Quality Inspection', roles: ['quality_inspector', 'supervisor'] },
    { value: 'collection', label: 'Latex Collection', roles: ['latex_collector', 'field_officer'] },
    { value: 'maintenance', label: 'Equipment Maintenance', roles: ['field_officer', 'supervisor'] },
    { value: 'training', label: 'Training & Support', roles: ['supervisor', 'field_officer'] },
    { value: 'monitoring', label: 'Farm Monitoring', roles: ['field_officer', 'supervisor'] }
  ];

  // Load available tappers from API
  const loadAvailableTappers = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/available-tappers`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAvailableTappers(result.tappers);
          console.log('✅ Loaded available tappers:', result.tappers);
        }
      } else {
        console.error('❌ Failed to load available tappers');
      }
    } catch (error) {
      console.error('❌ Error loading available tappers:', error);
    }
  };

  // Load all request data from API
  const loadAllRequestData = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      // Load all requests
      const allResponse = await fetch(`${backendUrl}/api/farmer-requests`);
      if (allResponse.ok) {
        const allResult = await allResponse.json();
        const allRequests = allResult.data || [];
        console.log('✅ Loaded all tapping requests:', allRequests.length || 0);

        // Use these to show current assignments table and counters
        const verifiableStatuses = ['assigned', 'accepted', 'in_progress', 'completed'];
        setVerifiedAssignments(allRequests.filter(r => verifiableStatuses.includes(r.status)));
      }

      // Load pending requests specifically
      const pendingResponse = await fetch(`${backendUrl}/api/farmer-requests/pending`);
      if (pendingResponse.ok) {
        const pendingResult = await pendingResponse.json();
        console.log('✅ Loaded pending requests:', pendingResult.data?.length || 0);
        setPendingRequests(pendingResult.data || []);
      } else {
        // Demo: Show the request from shalumanoj960@gmail.com
        const demoRequest = {
          _id: 'demo-001',
          requestId: 'TR000002',
          farmerName: 'Salu Manoj',
          farmerEmail: 'shalumanoj960@gmail.com',
          farmerPhone: '+91 9876543210',
          farmLocation: 'Kottayam, Kerala, India',
          farmSize: '5 acres',
          numberOfTrees: 150,
          soilType: 'Red soil',
          tappingType: 'daily',
          startDate: '2024-02-01',
          duration: '30 days',
          preferredTime: 'morning',
          urgency: 'high',
          budgetRange: '₹15,000 - ₹20,000',
          specialRequirements: 'Need experienced tapper for high-yield trees',
          contactPreference: 'phone',
          status: 'submitted',
          submittedAt: new Date().toISOString(),
          // Add staff applications to demonstrate the workflow
          staffApplications: [
            {
              id: 'app-001',
              staffName: 'Ravi Kumar',
              staffId: 'staff-001',
              email: 'ravi.kumar@rubberai.com',
              phone: '+91 9876543211',
              location: 'Kottayam District',
              rating: 4.8,
              experience: '5 years',
              status: 'pending',
              appliedAt: '2 hours ago',
              message: 'I have extensive experience with rubber tapping in this area and am available for the requested dates.'
            },
            {
              id: 'app-002',
              staffName: 'Suresh Menon',
              staffId: 'staff-002',
              email: 'suresh.menon@rubberai.com',
              phone: '+91 9876543212',
              location: 'Kottayam District',
              rating: 4.6,
              experience: '3 years',
              status: 'pending',
              appliedAt: '4 hours ago',
              message: 'I am familiar with the Manimala area and can provide quality tapping services.'
            }
          ]
        };
        setPendingRequests([]);
        console.log('❌ Failed to load pending requests from API');
      }

      console.log('✅ Loaded tapping requests');
    } catch (error) {
      console.error('❌ Error loading tapping requests:', error);
      // Demo: Show the request from shalumanoj960@gmail.com
      const demoRequest = {
        _id: 'demo-001',
        requestId: 'TR000002',
        farmerName: 'Salu Manoj',
        farmerEmail: 'shalumanoj960@gmail.com',
        farmerPhone: '+91 9876543210',
        farmLocation: 'Kottayam, Kerala, India',
        farmSize: '5 acres',
        numberOfTrees: 150,
        soilType: 'Red soil',
        tappingType: 'daily',
        startDate: '2024-02-01',
        preferredTime: 'morning',
        urgency: 'high',
        budgetPerTree: 3,
        specialRequirements: 'Need experienced tapper for high-yield trees',
        contactPreference: 'phone',
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        // Add staff applications to demonstrate the workflow
        staffApplications: [
          {
            id: 'app-001',
            staffName: 'Ravi Kumar',
            staffId: 'staff-001',
            email: 'ravi.kumar@rubberai.com',
            phone: '+91 9876543211',
            location: 'Kottayam District',
            rating: 4.8,
            experience: '5 years',
            status: 'pending',
            appliedAt: '2 hours ago',
            message: 'I have extensive experience with rubber tapping in this area and am available for the requested dates.'
          },
          {
            id: 'app-002',
            staffName: 'Suresh Menon',
            staffId: 'staff-002',
            email: 'suresh.menon@rubberai.com',
            phone: '+91 9876543212',
            location: 'Kottayam District',
            rating: 4.6,
            experience: '3 years',
            status: 'pending',
            appliedAt: '4 hours ago',
            message: 'I am familiar with the Manimala area and can provide quality tapping services.'
          }
        ]
      };
      setPendingRequests([]);
      showNotification('Failed to load tapping requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadAllRequestData();
    loadAvailableTappers();
  }, []);

  // Separate useEffect for handling notification events
  useEffect(() => {
    // Listen for notification-triggered assign tapper events
    const handleOpenAssignTapper = (event) => {
      const { requestData } = event.detail;
      console.log('📢 Received assign tapper event:', requestData);

      // Use the provided data directly
      setSelectedRequest(requestData);
      setShowRequestDetails(true);
      console.log('✅ Opening assign modal for request:', requestData.requestId);
    };

    // Add event listener
    window.addEventListener('openAssignTapper', handleOpenAssignTapper);

    // Cleanup
    return () => {
      window.removeEventListener('openAssignTapper', handleOpenAssignTapper);
    };
  }, []);

  // Check for stored request from notification after data loads
  useEffect(() => {
    if (pendingRequests.length > 0) {
      const storedRequest = sessionStorage.getItem('selectedTappingRequest');
      if (storedRequest) {
        try {
          const requestData = JSON.parse(storedRequest);
          console.log('📦 Found stored request from notification:', requestData);

          // Clear the stored data
          sessionStorage.removeItem('selectedTappingRequest');

          // Find the request in our current data or use the provided data
          const request = pendingRequests.find(req => req.requestId === requestData.requestId) || requestData;

          if (request) {
            setSelectedRequest(request);
            setShowRequestDetails(true);
            console.log('✅ Auto-opening assign modal for:', request.requestId);
          }
        } catch (error) {
          console.error('❌ Error parsing stored request:', error);
          sessionStorage.removeItem('selectedTappingRequest');
        }
      }
    }
  }, [pendingRequests]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Handle approving staff application
  const handleApproveApplication = async (applicationId) => {
    try {
      // TODO: API call to approve application
      showNotification('Staff application approved successfully!', 'success');
      // Reload data
      loadAllRequestData();
    } catch (error) {
      console.error('Error approving application:', error);
      showNotification('Failed to approve application. Please try again.', 'error');
    }
  };

  // Handle rejecting staff application
  const handleRejectApplication = async (applicationId) => {
    try {
      // TODO: API call to reject application
      showNotification('Staff application rejected.', 'success');
      // Reload data
      loadAllRequestData();
    } catch (error) {
      console.error('Error rejecting application:', error);
      showNotification('Failed to reject application. Please try again.', 'error');
    }
  };

  // Handle request assignment
  const handleAssignTapper = async (requestId, tapperId, tapperName) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      // First, assign the tapper and change status to 'accepted'
      const response = await fetch(`${backendUrl}/api/farmer-requests/${requestId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tapperId,
          tapperName,
          assignedBy: 'admin',
          status: 'accepted' // Change status to accepted
        })
      });

      if (response.ok) {
        const result = await response.json();

        showNotification(
          `✅ Tapper "${tapperName}" assigned successfully! Status changed to Accepted. 📅 Schedule will appear in Tapping Schedules. ${result.emailSent ? '📧 Email notification sent to farmer.' : ''}`,
          'success'
        );

        loadAllRequestData(); // Reload data
        loadAvailableTappers(); // Reload available tappers
        setSelectedRequest(null);
        setShowRequestDetails(false);
      } else {
        throw new Error('Failed to assign tapper');
      }
    } catch (error) {
      console.error('❌ Error assigning tapper:', error);
      // Demo: Show success message for demonstration
      if (requestId === 'demo-001') {
        showNotification(
          `✅ Demo: Tapper "${tapperName}" assigned to Salu Manoj's request! Status changed to Accepted. 📅 Schedule will appear in Tapping Schedules. 📧 Email notification sent to shalumanoj960@gmail.com`,
          'success'
        );
        // Update the demo request status to 'accepted'
        setPendingRequests(prev => prev.map(req =>
          req._id === requestId
            ? { ...req, status: 'accepted', assignedTapper: { tapperName, assignedAt: new Date() } }
            : req
        ));
        setSelectedRequest(null);
        setShowRequestDetails(false);
      } else {
        showNotification('Failed to assign tapper. Please try again.', 'error');
      }
    }
  };

  // Transform requests to current assignments (include verified + any pendingRequests that became accepted/in_progress)
  const assignmentsSource = [...verifiedAssignments, ...pendingRequests];
  const currentAssignments = assignmentsSource.filter(req =>
    req.status === 'assigned' || req.status === 'accepted' || req.status === 'in_progress'
  ).map(req => ({
    id: req._id,
    farmer: req.farmerName,
    farm: `${req.farmLocation} (${req.farmSize})`,
    staff: (
      req.assignedTapper?.tapperName ||
      req.assignedTapper?.name ||
      (typeof req.assignedTapper?.tapperId === 'object' ? req.assignedTapper?.tapperId?.name : undefined) ||
      (['assigned','accepted','in_progress','completed'].includes(req.status) ? 'Assigned' : 'Not assigned')
    ),
    staffRole: 'tapper',
    taskType: 'tapping',
    startDate: new Date(req.startDate).toISOString().split('T')[0],
    duration: req.duration,
    status: (req.status === 'assigned' || req.status === 'accepted') ? 'active' : req.status,
    progress: req.status === 'completed' ? 100 :
              req.status === 'in_progress' ? 65 :
              (req.status === 'assigned' || req.status === 'accepted') ? 85 : 0,
    location: req.farmLocation,
    requestId: req.requestId,
    urgency: req.urgency,
    numberOfTrees: req.numberOfTrees || req.farmerEstimatedTrees,
    tappingType: req.tappingType,
    farmerPhone: req.farmerPhone,
    farmerEmail: req.farmerEmail
  }));

  // Sample assignments for other task types (keeping existing structure)
  const sampleAssignments = [
    {
      id: 2,
      farmer: 'Priya Nair',
      farm: 'Farm B (3 hectares)',
      staff: 'Maya Pillai',
      staffRole: 'quality_inspector',
      taskType: 'inspection',
      startDate: '2024-01-12',
      duration: '5 days',
      status: 'active',
      progress: 60,
      location: 'Kerala District 2'
    },
    {
      id: 3,
      farmer: 'Suresh Menon',
      farm: 'Farm C (7 hectares)',
      staff: 'Arun Das',
      staffRole: 'supervisor',
      taskType: 'monitoring',
      startDate: '2024-01-08',
      duration: '10 days',
      status: 'completed',
      progress: 100,
      location: 'Kerala District 1'
    },
    {
      id: 4,
      farmer: 'Lakshmi Devi',
      farm: 'Farm D (4 hectares)',
      staff: 'Priya Nair',
      staffRole: 'field_officer',
      taskType: 'collection',
      startDate: '2024-01-14',
      duration: '6 days',
      status: 'active',
      progress: 30,
      location: 'Kerala District 3'
    }
  ];

  const handleAssignTask = () => {
    if (!selectedFarmer || !selectedStaff || !taskType || !startDate || !duration) {
      alert('Please fill in all fields');
      return;
    }

    const selectedStaffMember = staffMembers.find(s => s.id === selectedStaff);
    const selectedTaskType = taskTypes.find(t => t.value === taskType);

    console.log('Assigning task:', {
      farmer: selectedFarmer,
      staff: selectedStaffMember?.name,
      staffRole: selectedStaffMember?.role,
      taskType: selectedTaskType?.label,
      startDate,
      duration
    });

    // Reset form
    setSelectedFarmer('');
    setSelectedStaff('');
    setTaskType('tapping');
    setStartDate('');
    setDuration('');

    alert('Task assigned successfully!');
  };

  // Filter staff based on selected task type
  const getAvailableStaff = () => {
    const selectedTask = taskTypes.find(t => t.value === taskType);
    if (!selectedTask) return staffMembers;

    return staffMembers.filter(staff =>
      selectedTask.roles.includes(staff.role) && staff.status === 'available'
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Locate original request object for a given assignment
  const getRequestFromAssignment = (assignment) => {
    const byMongoId = assignmentsSource.find(r => r._id === assignment.id);
    if (byMongoId) return byMongoId;
    const byRequestId = assignmentsSource.find(r => r.requestId === assignment.requestId);
    if (byRequestId) return byRequestId;
    return null;
  };

  const openViewDetails = (assignment) => {
    const req = getRequestFromAssignment(assignment) || assignment;
    console.log('🔍 Opening view details for assignment:', assignment);
    console.log('🔍 Found request:', req);
    console.log('🔍 Request assignedTapper:', req.assignedTapper);
    console.log('🔍 Request negotiation fields:', {
      tapperProposedTrees: req.tapperProposedTrees,
      farmerCounterProposal: req.farmerCounterProposal,
      tapperCounterProposal: req.tapperCounterProposal,
      finalAgreedTrees: req.finalAgreedTrees,
      agreedTreeCount: req.agreedTreeCount
    });
    setSelectedRequest(req);
    setShowRequestDetails(true);
  };

  const openEditDetails = (assignment) => {
    const req = getRequestFromAssignment(assignment) || assignment;
    setSelectedRequest(req);
    setShowRequestDetails(true);
    setShowApplicationDetails(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Notification */}
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {notification.message}
        </motion.div>
      )}

      {/* Pending Tapping Requests */}
      <motion.div
        className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${
          darkMode ? 'border-gray-700' : 'border-gray-100'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Tapping Requests - Staff Self-Assignment
            </h2>
            {pendingRequests.length > 0 && (
              <div className="relative">
                <Bell className="h-6 w-6 text-orange-500" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <TreePine className="h-4 w-4" />
            <span>{pendingRequests.length} requests • Staff can self-assign</span>
          </div>
        </div>

        {/* Workflow banner removed as requested */}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading requests...</p>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <TreePine className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No pending tapping requests</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <motion.div
                key={request._id}
                className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                } hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => {
                  setSelectedRequest(request);
                  setShowRequestDetails(true);
                }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {request.farmerName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.urgency === 'high' ? 'bg-red-100 text-red-800' :
                        request.urgency === 'normal' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.urgency} priority
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {request.farmLocation}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TreePine className="h-4 w-4 text-gray-400" />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {request.numberOfTrees} trees
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {new Date(request.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {request.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.staffApplications?.length > 0
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {request.staffApplications?.length > 0
                          ? `${request.staffApplications.length} Staff Applied`
                          : 'Waiting for Staff'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(request);
                          setShowRequestDetails(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>




      {/* Current Assignments */}
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
              Current Assignments ({currentAssignments.length})
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {currentAssignments.filter(a => a.status === 'active').length} Active
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {currentAssignments.filter(a => a.status === 'completed').length} Completed
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Farmer & Farm
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Staff & Task
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Duration & Location
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
              {currentAssignments.map((assignment) => (
                <motion.tr
                  key={assignment.id}
                  className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                  whileHover={{ backgroundColor: darkMode ? '#374151' : '#f9fafb' }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {assignment.farmer}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {assignment.farm}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {assignment.staff}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {assignment.staffRole?.replace('_', ' ')} • {assignment.taskType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {assignment.duration}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                      <MapPin className="h-3 w-3 mr-1" />
                      {assignment.location}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Started: {assignment.startDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => openViewDetails(assignment)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Stats removed as requested */}

      {/* Request Details Modal */}
      {showRequestDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Request Details - {selectedRequest.farmerName}
              </h3>
              <button
                onClick={() => {
                  setShowRequestDetails(false);
                  setSelectedRequest(null);
                }}
                className={`p-2 rounded-lg hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Farmer Information
                  </label>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedRequest.farmerName}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      📞 {selectedRequest.farmerPhone}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      ✉️ {selectedRequest.farmerEmail}
                    </p>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Farm Details
                  </label>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      📍 {selectedRequest.farmLocation}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      🌳 {selectedRequest.numberOfTrees} trees
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      📏 {selectedRequest.farmSize}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tapping Requirements
                  </label>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      🔄 {selectedRequest.tappingType} tapping
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      📅 Start: {new Date(selectedRequest.startDate).toLocaleDateString()}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      🕐 Preferred time: {selectedRequest.preferredTime}
                    </p>
                  </div>
                </div>

                {(selectedRequest.budgetPerTree || selectedRequest.budgetRange) && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Rate Per Tree
                    </label>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        💰 ₹{selectedRequest.budgetPerTree || selectedRequest.budgetRange}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Staff */}
            {(selectedRequest.assignedTapper || ['assigned','accepted','in_progress','completed'].includes(selectedRequest.status)) && (
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Assigned Staff
                </label>
                <div className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedRequest.assignedTapper?.tapperName || 
                         selectedRequest.assignedTapper?.name || 
                         selectedRequest.assignedStaffName ||
                         selectedRequest.assignedTapper?.staffName ||
                         selectedRequest.assignedTapper?.staff?.name ||
                         (typeof selectedRequest.assignedTapper?.tapperId === 'object' ? selectedRequest.assignedTapper?.tapperId?.name : undefined) ||
                         'Assigned Staff'}
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {selectedRequest.assignedTapper?.tapperPhone || 
                         selectedRequest.assignedTapper?.phone || 
                         selectedRequest.assignedStaffPhone ||
                         'Phone not available'}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {selectedRequest.assignedTapper?.tapperEmail || 
                         selectedRequest.assignedTapper?.email || 
                         selectedRequest.assignedStaffEmail ||
                         'Email not available'}
                      </p>
                      {/* Debug info - remove this after fixing */}
                      {selectedRequest.assignedTapper && (
                        <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
                          <strong>Debug - assignedTapper keys:</strong> {Object.keys(selectedRequest.assignedTapper).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Negotiation Details */}
                  {(selectedRequest.tapperProposedTrees || 
                    selectedRequest.farmerCounterProposal || 
                    selectedRequest.tapperCounterProposal ||
                    selectedRequest.farmerEstimatedTrees ||
                    selectedRequest.numberOfTrees) && (
                    <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
                      <h5 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Negotiation Details
                      </h5>
                      <div className="space-y-2 text-sm">
                        {(selectedRequest.farmerEstimatedTrees || selectedRequest.numberOfTrees) && (
                          <div className="flex justify-between">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Farmer's estimate:</span>
                            <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                              {selectedRequest.farmerEstimatedTrees || selectedRequest.numberOfTrees} trees
                            </span>
                          </div>
                        )}
                        {selectedRequest.tapperProposedTrees && (
                          <div className="flex justify-between">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Staff proposed:</span>
                            <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedRequest.tapperProposedTrees} trees</span>
                          </div>
                        )}
                        {selectedRequest.farmerCounterProposal && (
                          <div className="flex justify-between">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Farmer counter:</span>
                            <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedRequest.farmerCounterProposal} trees</span>
                          </div>
                        )}
                        {selectedRequest.tapperCounterProposal && (
                          <div className="flex justify-between">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Staff counter:</span>
                            <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedRequest.tapperCounterProposal} trees</span>
                          </div>
                        )}
                        {(selectedRequest.finalAgreedTrees || selectedRequest.agreedTreeCount || selectedRequest.tapperCounterProposal) && (
                          <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                            <span className={`font-medium ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Final agreement:</span>
                            <span className={`font-medium ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                              {selectedRequest.finalAgreedTrees || selectedRequest.agreedTreeCount || selectedRequest.tapperCounterProposal} trees
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedRequest.specialRequirements && (
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Special Requirements
                </label>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedRequest.specialRequirements}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AssignTasks;
