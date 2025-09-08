// Notification Service for Admin Dashboard
class NotificationService {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    this.listeners = [];
  }

  // Add a new notification
  addNotification(notification) {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.notifyListeners();
    
    // Send email notification to admin if configured
    this.sendEmailNotification(newNotification);
    
    return newNotification;
  }

  // Add tapper request notification
  addTapperRequestNotification(requestData, farmerData) {
    const notification = {
      type: 'tapper_request',
      title: 'New Tapper Request',
      message: `${farmerData.name} has requested tapping services for ${requestData.numberOfTrees} trees`,
      priority: requestData.urgency === 'high' ? 'high' : 'normal',
      data: {
        requestId: requestData.id || `TR${Date.now()}`,
        farmerName: farmerData.name,
        farmerEmail: farmerData.email,
        farmerPhone: farmerData.phone,
        farmLocation: requestData.farmLocation,
        farmSize: requestData.farmSize,
        numberOfTrees: requestData.numberOfTrees,
        tappingType: requestData.tappingType,
        startDate: requestData.startDate,
        urgency: requestData.urgency,
        preferredTime: requestData.preferredTime,
        budgetRange: requestData.budgetRange,
        specialRequirements: requestData.specialRequirements,
        contactPreference: requestData.contactPreference,
        submittedAt: new Date().toISOString()
      },
      actions: [
        { label: 'View Details', action: 'view_details' },
        { label: 'Assign Tapper', action: 'assign_tapper' },
        { label: 'Contact Farmer', action: 'contact_farmer' }
      ]
    };

    return this.addNotification(notification);
  }

  // Add land lease application notification
  addLandLeaseNotification(applicationData, farmerData) {
    const notification = {
      type: 'land_lease',
      title: 'New Land Lease Application',
      message: `${farmerData.name} has applied for ${applicationData.landSize} land lease in ${applicationData.desiredLocation}`,
      priority: 'normal',
      data: {
        applicationId: applicationData.id || `LA${Date.now()}`,
        farmerName: farmerData.name,
        farmerEmail: farmerData.email,
        farmerPhone: farmerData.phone,
        desiredLocation: applicationData.desiredLocation,
        landSize: applicationData.landSize,
        leaseDuration: applicationData.leaseDuration,
        proposedRent: applicationData.proposedRent,
        intendedUse: applicationData.intendedUse,
        farmingExperience: applicationData.farmingExperience,
        submittedAt: new Date().toISOString()
      },
      actions: [
        { label: 'Review Application', action: 'review_application' },
        { label: 'Contact Applicant', action: 'contact_applicant' }
      ]
    };

    return this.addNotification(notification);
  }

  // Add fertilizer/rain guard service notification
  addServiceRequestNotification(requestData, farmerData) {
    const serviceType = requestData.serviceType === 'fertilizer' ? 'Fertilizer Application' : 'Rain Guard Installation';
    
    const notification = {
      type: 'service_request',
      title: `New ${serviceType} Request`,
      message: `${farmerData.name} has requested ${serviceType.toLowerCase()} for ${requestData.numberOfTrees} trees`,
      priority: requestData.urgency === 'high' ? 'high' : 'normal',
      data: {
        requestId: requestData.id || `SR${Date.now()}`,
        serviceType: requestData.serviceType,
        farmerName: farmerData.name,
        farmerEmail: farmerData.email,
        farmerPhone: farmerData.phone,
        farmLocation: requestData.farmLocation,
        farmSize: requestData.farmSize,
        numberOfTrees: requestData.numberOfTrees,
        preferredDate: requestData.preferredDate,
        urgency: requestData.urgency,
        budgetRange: requestData.budgetRange,
        specialRequirements: requestData.specialRequirements,
        submittedAt: new Date().toISOString()
      },
      actions: [
        { label: 'View Details', action: 'view_details' },
        { label: 'Assign Provider', action: 'assign_provider' },
        { label: 'Contact Farmer', action: 'contact_farmer' }
      ]
    };

    return this.addNotification(notification);
  }

  // Add land registration notification
  addLandRegistrationNotification(landData, farmerData) {
    const notification = {
      type: 'land_registration',
      title: 'New Land Registration',
      message: `${farmerData.name} has registered a new land: ${landData.landTitle} in ${landData.district}`,
      priority: 'normal',
      data: {
        registrationId: landData.registrationId || `LR${Date.now()}`,
        farmerName: farmerData.name,
        farmerEmail: farmerData.email,
        farmerPhone: farmerData.phone,
        landTitle: landData.landTitle,
        landLocation: landData.landLocation,
        district: landData.district,
        totalArea: landData.totalArea,
        surveyNumber: landData.surveyNumber,
        status: landData.status || 'pending_verification',
        submittedAt: new Date().toISOString()
      },
      actions: [
        { label: 'View Details', action: 'view_land_details' },
        { label: 'Verify Land', action: 'verify_land' },
        { label: 'Contact Farmer', action: 'contact_farmer' }
      ]
    };

    return this.addNotification(notification);
  }

  // Add tenancy offering notification
  addTenancyOfferingNotification(offeringData, landData, farmerData) {
    const notification = {
      type: 'tenancy_offering',
      title: 'New Tenancy Offering Available',
      message: `${farmerData.name} has offered ${landData.landTitle} for rubber tapping tenancy`,
      priority: 'high',
      data: {
        offeringId: offeringData.offeringId || `TO${Date.now()}`,
        farmerName: farmerData.name,
        farmerEmail: farmerData.email,
        farmerPhone: farmerData.phone,
        landTitle: landData.landTitle,
        landLocation: landData.landLocation,
        district: landData.district,
        totalArea: landData.totalArea,
        tenancyRate: offeringData.tenancyRate,
        rateType: offeringData.rateType,
        leaseDuration: offeringData.leaseDuration,
        availableFrom: offeringData.availableFrom,
        allowedActivities: offeringData.allowedActivities,
        status: 'available',
        submittedAt: new Date().toISOString()
      },
      actions: [
        { label: 'View Details', action: 'view_offering_details' },
        { label: 'Contact Owner', action: 'contact_owner' },
        { label: 'Apply for Tenancy', action: 'apply_tenancy' }
      ]
    };

    return this.addNotification(notification);
  }

  // Get all notifications
  getNotifications() {
    return this.notifications;
  }

  // Get unread notifications count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Delete notification
  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  // Subscribe to notification changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => {
      listener({
        notifications: this.notifications,
        unreadCount: this.getUnreadCount()
      });
    });
  }

  // Save notifications to localStorage
  saveNotifications() {
    localStorage.setItem('adminNotifications', JSON.stringify(this.notifications));
  }

  // Send email notification to admin
  async sendEmailNotification(notification) {
    try {
      // Check if backend is available
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/admin/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          timestamp: notification.timestamp
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email notification sent to admin:', result.message);
        return { success: true, message: result.message };
      } else {
        const error = await response.json();
        console.log('⚠️ Failed to send email notification to admin:', error.message);
        return { success: false, message: error.message };
      }
    } catch (error) {
      // Don't show error if it's just a network issue (backend not running)
      if (error.message.includes('fetch')) {
        console.log('ℹ️ Backend not available - email notification skipped');
      } else {
        console.log('⚠️ Email notification service error:', error.message);
      }
      return { success: false, message: 'Email service not available' };
    }
  }

  // Get notifications by type
  getNotificationsByType(type) {
    return this.notifications.filter(n => n.type === type);
  }

  // Get recent notifications (last 24 hours)
  getRecentNotifications() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return this.notifications.filter(n => 
      new Date(n.timestamp) > yesterday
    );
  }

  // Get high priority notifications
  getHighPriorityNotifications() {
    return this.notifications.filter(n => n.priority === 'high' && !n.read);
  }

  // Add staff leave request notification
  addStaffLeaveRequestNotification(leaveData, staffData) {
    const urgencyLevel = leaveData.urgency === 'emergency' ? 'high' :
                        leaveData.urgency === 'high' ? 'high' : 'normal';

    const notification = {
      type: 'leave_request',
      title: 'New Staff Leave Request',
      message: `${staffData.name} (${staffData.role}) has requested ${leaveData.leaveType} leave for ${leaveData.totalDays} day(s)`,
      priority: urgencyLevel,
      data: {
        requestId: leaveData.requestId,
        staffName: staffData.name,
        staffEmail: staffData.email,
        staffRole: staffData.role,
        staffDepartment: staffData.department,
        leaveType: leaveData.leaveType,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        totalDays: leaveData.totalDays,
        reason: leaveData.reason,
        urgency: leaveData.urgency,
        contactDuringLeave: leaveData.contactDuringLeave,
        submittedAt: leaveData.submittedAt || new Date().toISOString()
      },
      actions: [
        { label: 'Approve', action: 'approve_leave', primary: true },
        { label: 'Reject', action: 'reject_leave', primary: false },
        { label: 'View Details', action: 'view_leave_details', primary: false }
      ]
    };

    return this.addNotification(notification);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Get current farmer data from localStorage or session
const getCurrentFarmer = () => {
  try {
    // Try to get user data from localStorage (where login data is stored)
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return {
        id: user._id || user.id,
        name: user.name || 'Unknown Farmer',
        email: user.email || 'farmer@example.com',
        phone: user.phone || '+91 0000000000',
        location: user.location || 'Location not specified'
      };
    }

    // Fallback to mock data if no user data found
    console.warn('⚠️ No user data found in localStorage, using fallback data');
    return {
      id: '507f1f77bcf86cd799439011',
      name: 'Guest Farmer',
      email: 'guest@example.com',
      phone: '+91 0000000000',
      location: 'Location not specified'
    };
  } catch (error) {
    console.error('❌ Error getting current farmer:', error);
    return {
      id: '507f1f77bcf86cd799439011',
      name: 'Guest Farmer',
      email: 'guest@example.com',
      phone: '+91 0000000000',
      location: 'Location not specified'
    };
  }
};

export { notificationService, getCurrentFarmer };
export default notificationService;
