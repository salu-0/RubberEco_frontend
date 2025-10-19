// Polling Service for Messaging Fallback
// This service provides polling-based real-time updates when WebSocket is not available

class PollingService {
  constructor() {
    this.intervals = new Map();
    this.isActive = false;
    this.pollingInterval = 5000; // 5 seconds
    this.listeners = new Map();
  }

  // Start polling for new messages
  startPolling(conversationId) {
    if (this.intervals.has(conversationId)) {
      return; // Already polling this conversation
    }

    const intervalId = setInterval(async () => {
      await this.checkForNewMessages(conversationId);
    }, this.pollingInterval);

    this.intervals.set(conversationId, intervalId);
    this.isActive = true;
  }

  // Stop polling for a specific conversation
  stopPolling(conversationId) {
    if (this.intervals.has(conversationId)) {
      clearInterval(this.intervals.get(conversationId));
      this.intervals.delete(conversationId);
    }
  }

  // Stop all polling
  stopAllPolling() {
    this.intervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.intervals.clear();
    this.isActive = false;
  }

  // Check for new messages in a conversation
  async checkForNewMessages(conversationId) {
    try {
      // Import messagingService dynamically to avoid circular dependencies
      const messagingService = (await import('./messagingService')).default;
      
      const messages = await messagingService.getMessages(conversationId);
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage) {
        // Check if this is a new message
        const lastKnownMessageId = this.getLastKnownMessageId(conversationId);
        
        if (lastKnownMessageId !== lastMessage.id) {
          this.setLastKnownMessageId(conversationId, lastMessage.id);
          
          // Emit new message event
          this.emit('newMessage', lastMessage);
          
          // Update conversation list
          this.emit('conversationUpdated', {
            id: conversationId,
            lastMessage: lastMessage.content,
            lastMessageTime: lastMessage.timestamp,
            unreadCount: 1 // This would need to be calculated properly
          });
        }
      }
    } catch (error) {
      console.error('Error polling for new messages:', error);
    }
  }

  // Get last known message ID for a conversation
  getLastKnownMessageId(conversationId) {
    return localStorage.getItem(`lastMessage_${conversationId}`);
  }

  // Set last known message ID for a conversation
  setLastKnownMessageId(conversationId, messageId) {
    localStorage.setItem(`lastMessage_${conversationId}`, messageId);
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Unsubscribe from events
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit events to listeners
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in polling event listener:', error);
        }
      });
    }
  }

  // Get polling status
  getStatus() {
    return {
      isActive: this.isActive,
      activeConversations: Array.from(this.intervals.keys()),
      pollingInterval: this.pollingInterval
    };
  }

  // Update polling interval
  setPollingInterval(interval) {
    this.pollingInterval = interval;
    
    // Restart all active polling with new interval
    if (this.isActive) {
      this.stopAllPolling();
      this.intervals.forEach((_, conversationId) => {
        this.startPolling(conversationId);
      });
    }
  }
}

// Create and export a singleton instance
const pollingService = new PollingService();
export default pollingService;
