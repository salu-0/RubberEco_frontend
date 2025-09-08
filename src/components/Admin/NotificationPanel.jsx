import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TreePine,
  DollarSign,
  FileText,
  Users,
  Wrench,
  Home,
  Check,
  MoreHorizontal
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';

const NotificationPanel = ({ isOpen, onClose, darkMode, pendingStaffRequests = 0, pendingTappingRequests = 0, pendingLandRegistrations = 0 }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe(({ notifications, unreadCount }) => {
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    });

    // Load initial notifications
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());

    return unsubscribe;
  }, []);

  // Create pending request notifications
  const getPendingRequestNotifications = () => {
    const pendingNotifications = [];

    if (pendingStaffRequests > 0) {
      pendingNotifications.push({
        id: 'pending-staff-requests',
        type: 'staff_request',
        title: 'Staff Applications',
        message: `${pendingStaffRequests} new staff application${pendingStaffRequests > 1 ? 's' : ''} pending review`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high',
        actionable: true
      });
    }

    if (pendingTappingRequests > 0) {
      pendingNotifications.push({
        id: 'pending-tapping-requests',
        type: 'tapper_request',
        title: 'Tapping Requests',
        message: `${pendingTappingRequests} new tapping request${pendingTappingRequests > 1 ? 's' : ''} pending assignment`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high',
        actionable: true
      });
    }

    if (pendingLandRegistrations > 0) {
      pendingNotifications.push({
        id: 'pending-land-registrations',
        type: 'land_registration',
        title: 'Land Registration',
        message: `${pendingLandRegistrations} new land registration${pendingLandRegistrations > 1 ? 's' : ''} pending verification`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high',
        actionable: true
      });
    }

    return pendingNotifications;
  };

  const getFilteredNotifications = () => {
    const pendingRequestNotifications = getPendingRequestNotifications();

    switch (filter) {
      case 'unread':
        return [...pendingRequestNotifications, ...notifications.filter(n => !n.read)];
      case 'staff_request':
        return pendingRequestNotifications.filter(n => n.type === 'staff_request');
      case 'tapper_request':
        return [...pendingRequestNotifications.filter(n => n.type === 'tapper_request'), ...notifications.filter(n => n.type === 'tapper_request')];
      case 'land_lease':
        return notifications.filter(n => n.type === 'land_lease');
      case 'service_request':
        return notifications.filter(n => n.type === 'service_request');
      case 'high_priority':
        return [...pendingRequestNotifications.filter(n => n.priority === 'high'), ...notifications.filter(n => n.priority === 'high')];
      default:
        return [...pendingRequestNotifications, ...notifications];
    }
  };

  const handleMarkAsRead = (notificationId) => {
    notificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    setLoading(true);
    notificationService.markAllAsRead();
    setTimeout(() => setLoading(false), 500);
  };

  const handleDeleteNotification = (notificationId) => {
    notificationService.deleteNotification(notificationId);
  };

  const handleClearAll = () => {
    setLoading(true);
    notificationService.clearAll();
    setTimeout(() => setLoading(false), 500);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'tapper_request':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'staff_request':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'land_registration':
        return <TreePine className="h-5 w-5 text-green-600" />;
      case 'land_lease':
        return <Home className="h-5 w-5 text-green-500" />;
      case 'service_request':
        return <Wrench className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'high') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          High Priority
        </span>
      );
    }
    return null;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationAction = (notification, action) => {
    const requestData = notification.data;

    if (action.action === 'assign_tapper') {
      // Redirect to Assign Tasks tab where admin can assign tappers
      // First, store the request data in sessionStorage so the Assign Tasks component can access it
      sessionStorage.setItem('selectedTappingRequest', JSON.stringify(requestData));

      // Navigate to assign-tasks tab
      window.location.hash = '#assign-tasks';
      onClose(); // Close notification panel

      // Dispatch a custom event to notify the Assign Tasks component
      window.dispatchEvent(new CustomEvent('openAssignTapper', {
        detail: { requestData }
      }));

      console.log('Redirecting to Assign Tasks for:', requestData);

    } else if (action.action === 'contact_farmer') {
      // Open contact farmer options
      const farmerPhone = requestData.farmerPhone;
      const farmerEmail = requestData.farmerEmail;
      const farmerName = requestData.farmerName;
      const requestId = requestData.requestId;

      // Create contact options
      const contactOptions = [
        {
          label: 'Call Farmer',
          action: () => window.open(`tel:${farmerPhone}`, '_self')
        },
        {
          label: 'Send Email',
          action: () => {
            const subject = `Regarding your tapping request ${requestId}`;
            const body = `Dear ${farmerName},%0D%0A%0D%0ARegarding your rubber tapping request (${requestId}) for your farm at ${requestData.farmLocation}.%0D%0A%0D%0ABest regards,%0D%0ARubberEco Admin Team`;
            window.open(`mailto:${farmerEmail}?subject=${subject}&body=${body}`, '_self');
          }
        },
        {
          label: 'WhatsApp',
          action: () => {
            const message = `Hello ${farmerName}, regarding your tapping request ${requestId} for your farm at ${requestData.farmLocation}. We will get back to you soon.`;
            const whatsappUrl = `https://wa.me/${farmerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          }
        }
      ];

      // For now, show a simple prompt to choose contact method
      const choice = prompt(`Contact ${farmerName}:\n1. Call (${farmerPhone})\n2. Email (${farmerEmail})\n3. WhatsApp\n\nEnter 1, 2, or 3:`);

      if (choice === '1') contactOptions[0].action();
      else if (choice === '2') contactOptions[1].action();
      else if (choice === '3') contactOptions[2].action();
    }

    // Mark notification as read
    notificationService.markAsRead(notification.id);
  };

  const filteredNotifications = getFilteredNotifications();
  const allNotifications = filteredNotifications;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50 p-4">
      <motion.div
        className={`w-full max-w-md h-full ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } rounded-l-2xl shadow-2xl border-l border-t border-b overflow-hidden`}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Notifications
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {unreadCount + pendingStaffRequests + pendingTappingRequests} total notifications
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { key: 'all', label: 'All', count: allNotifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount + pendingStaffRequests + pendingTappingRequests },
              { key: 'staff_request', label: 'Staff', count: pendingStaffRequests },
              { key: 'tapper_request', label: 'Tapper', count: pendingTappingRequests + notifications.filter(n => n.type === 'tapper_request').length },
              { key: 'land_lease', label: 'Land', count: notifications.filter(n => n.type === 'land_lease').length },
              { key: 'service_request', label: 'Services', count: notifications.filter(n => n.type === 'service_request').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading || unreadCount === 0}
                className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Mark All Read
              </button>
              <button
                onClick={handleClearAll}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4 inline mr-1" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : allNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <Bell className={`h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
              <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
                No notifications
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'} text-center`}>
                {filter === 'all' 
                  ? "You're all caught up! No new notifications."
                  : `No ${filter.replace('_', ' ')} notifications found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              <AnimatePresence>
                {allNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                      notification.read
                        ? darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                        : darkMode
                        ? 'bg-gray-750 border-blue-500 shadow-lg'
                        : 'bg-blue-50 border-blue-200 shadow-lg'
                    }`}
                  >
                    {/* Notification Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`font-semibold text-sm ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          {getPriorityBadge(notification.priority)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <div className="flex space-x-1">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className={`p-1 rounded hover:bg-opacity-20 ${
                                darkMode ? 'hover:bg-white' : 'hover:bg-gray-500'
                              }`}
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className={`p-1 rounded hover:bg-opacity-20 ${
                              darkMode ? 'hover:bg-red-500' : 'hover:bg-red-500'
                            }`}
                            title="Delete notification"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Notification Message */}
                    <p className={`text-sm mb-3 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>

                    {/* Notification Details */}
                    {notification.data && (
                      <div className={`bg-opacity-50 rounded-lg p-3 mb-3 ${
                        darkMode ? 'bg-gray-600' : 'bg-white'
                      }`}>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                          {notification.type === 'tapper_request' && (
                            <>
                              <div className="flex items-center space-x-2">
                                <User className="h-3 w-3 text-gray-500" />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {notification.data.farmerName}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-3 w-3 text-gray-500" />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {notification.data.farmLocation}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <TreePine className="h-3 w-3 text-gray-500" />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {notification.data.numberOfTrees} trees • {notification.data.farmSize}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-3 w-3 text-gray-500" />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  Start: {notification.data.startDate} • {notification.data.duration}
                                </span>
                              </div>
                              {notification.data.budgetRange && (
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="h-3 w-3 text-gray-500" />
                                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    Budget: {notification.data.budgetRange}
                                  </span>
                                </div>
                              )}
                            </>
                          )}

                          {notification.type === 'land_lease' && (
                            <>
                              <div className="flex items-center space-x-2">
                                <User className="h-3 w-3 text-gray-500" />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {notification.data.farmerName}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-3 w-3 text-gray-500" />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {notification.data.desiredLocation}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Home className="h-3 w-3 text-gray-500" />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {notification.data.landSize} • {notification.data.leaseDuration}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-3 w-3 text-gray-500" />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {notification.data.proposedRent}
                                </span>
                              </div>
                            </>
                          )}

                          {notification.type === 'service_request' && (
                            <>
                              <div className="flex items-center space-x-2">
                                <User className="h-3 w-3 text-gray-500" />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {notification.data.farmerName}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Wrench className="h-3 w-3 text-gray-500" />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {notification.data.serviceType === 'fertilizer' ? 'Fertilizer Application' : 'Rain Guard Installation'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-3 w-3 text-gray-500" />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {notification.data.farmLocation}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-3 w-3 text-gray-500" />
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  Preferred: {notification.data.preferredDate}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {notification.actions
                          .filter(action => action.action !== 'view_details') // Remove View Details button
                          .map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => handleNotificationAction(notification, action)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              action.action === 'assign_tapper'
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : action.action === 'contact_farmer'
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : darkMode
                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationPanel;
