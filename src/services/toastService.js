// Toast Notification Service
class ToastService {
  constructor() {
    this.toasts = [];
    this.listeners = [];
    this.nextId = 1;
  }

  // Add a new toast notification
  addToast(toast) {
    const newToast = {
      id: this.nextId++,
      timestamp: Date.now(),
      duration: 5000, // 5 seconds default
      ...toast
    };

    this.toasts.push(newToast);
    this.notifyListeners();

    // Auto-remove toast after duration
    setTimeout(() => {
      this.removeToast(newToast.id);
    }, newToast.duration);

    return newToast.id;
  }

  // Remove a toast by ID
  removeToast(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  // Clear all toasts
  clearAll() {
    this.toasts = [];
    this.notifyListeners();
  }

  // Subscribe to toast changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.toasts);
    });
  }

  // Convenience methods for different toast types
  success(message, options = {}) {
    return this.addToast({
      type: 'success',
      message,
      ...options
    });
  }

  error(message, options = {}) {
    return this.addToast({
      type: 'error',
      message,
      duration: 7000, // Longer duration for errors
      ...options
    });
  }

  info(message, options = {}) {
    return this.addToast({
      type: 'info',
      message,
      ...options
    });
  }

  warning(message, options = {}) {
    return this.addToast({
      type: 'warning',
      message,
      ...options
    });
  }

  // Specific notification methods for negotiation events
  farmerResponded(requestId, farmerName, responseType) {
    const message = responseType === 'accepted' 
      ? `🎉 ${farmerName} accepted your proposal for request ${requestId}!`
      : responseType === 'rejected'
      ? `❌ ${farmerName} rejected your proposal for request ${requestId}. You can submit a counter proposal.`
      : `💬 ${farmerName} responded to your proposal for request ${requestId}.`;

    return this.addToast({
      type: responseType === 'accepted' ? 'success' : responseType === 'rejected' ? 'warning' : 'info',
      message,
      duration: 8000,
      persistent: responseType === 'accepted', // Keep success notifications longer
      action: responseType === 'rejected' ? {
        label: 'View Negotiation',
        onClick: () => {
          // This could trigger opening the negotiation modal
          console.log('Opening negotiation for request:', requestId);
        }
      } : null
    });
  }

  negotiationStarted(requestId, farmerName) {
    return this.addToast({
      type: 'info',
      message: `🔄 Negotiation started with ${farmerName} for request ${requestId}`,
      duration: 6000
    });
  }

  proposalSubmitted(requestId, farmerName) {
    return this.addToast({
      type: 'success',
      message: `✅ Your proposal has been sent to ${farmerName} for request ${requestId}`,
      duration: 5000
    });
  }

  agreementReached(requestId, farmerName) {
    return this.addToast({
      type: 'success',
      message: `🎉 Agreement reached with ${farmerName} for request ${requestId}! The job is now confirmed.`,
      duration: 10000,
      persistent: true
    });
  }

  // Demo function for testing
  showDemoNotifications() {
    this.success('Demo: Success notification');
    setTimeout(() => this.info('Demo: Info notification'), 1000);
    setTimeout(() => this.warning('Demo: Warning notification'), 2000);
    setTimeout(() => this.error('Demo: Error notification'), 3000);
    setTimeout(() => this.farmerResponded('TR-2024-001', 'Rajesh Kumar', 'accepted'), 4000);
    setTimeout(() => this.negotiationStarted('TR-2024-002', 'Priya Nair'), 5000);
  }
}

// Create singleton instance
const toastService = new ToastService();

export default toastService;
