// WebSocket Service for Real-time Messaging
// This service handles real-time communication between brokers and farmers

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3; // Reduced from 5 to 3
    this.reconnectInterval = 5000; // Increased from 3000 to 5000ms
    this.listeners = new Map();
    this.token = localStorage.getItem('token');
  }

  // Connect to WebSocket server
  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    // Check if WebSocket is supported
    if (!window.WebSocket) {
      console.warn('WebSocket not supported in this browser');
      this.emit('websocketNotSupported');
      return;
    }

    // Check if we have a valid token
    if (!this.token) {
      console.warn('No authentication token available for WebSocket connection');
      this.emit('noToken');
      return;
    }

    try {
      // Check if we've exceeded max attempts
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('Max WebSocket reconnection attempts reached. Switching to polling mode.');
        this.emit('maxAttemptsReached');
        return;
      }

      // Replace with your actual WebSocket server URL
      const wsUrl = `wss://rubbereco-backend.onrender.com/ws?token=${this.token}`;
      console.log(`Attempting WebSocket connection (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);

      // Set a timeout to detect connection issues
      this.connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
          console.warn('WebSocket connection timeout');
          this.socket.close();
        }
      }, 8000); // Reduced from 10 to 8 seconds

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.emit('connectionError', error);
      this.scheduleReconnect();
    }
  }

  // Handle WebSocket connection open
  handleOpen() {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Clear connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    this.emit('connected');
  }

  // Handle incoming WebSocket messages
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      this.emit('message', data);
      
      // Handle specific message types
      switch (data.type) {
        case 'new_message':
          this.emit('newMessage', data.payload);
          break;
        case 'message_status':
          this.emit('messageStatus', data.payload);
          break;
        case 'typing':
          this.emit('typing', data.payload);
          break;
        case 'user_online':
          this.emit('userOnline', data.payload);
          break;
        case 'user_offline':
          this.emit('userOffline', data.payload);
          break;
        case 'conversation_updated':
          this.emit('conversationUpdated', data.payload);
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  // Handle WebSocket connection close
  handleClose(event) {
    console.log('WebSocket disconnected (expected - backend WebSocket server not implemented):', event.code);
    this.isConnected = false;
    
    // Clear connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    this.emit('disconnected');
    
    // Only attempt to reconnect if it's not a normal closure and not a manual disconnect
    if (event.code !== 1000 && event.code !== 1001 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('WebSocket reconnection failed after maximum attempts. Falling back to polling mode.');
      this.emit('reconnectFailed');
    }
  }

  // Handle WebSocket errors
  handleError(error) {
    console.log('WebSocket error (expected - backend WebSocket server not implemented):', error.type);
    this.emit('error', error);
    
    // If this is a connection error, don't attempt to reconnect immediately
    // Let the close handler manage reconnection
    if (this.socket) {
      this.socket.close();
    }
  }

  // Schedule reconnection attempt
  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      // Simpler backoff strategy - just use the base interval
      const delay = this.reconnectInterval;
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached. Switching to polling mode.');
      this.emit('reconnectFailed');
    }
  }

  // Send message through WebSocket
  sendMessage(type, payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type,
        payload,
        timestamp: new Date().toISOString()
      };
      
      try {
        this.socket.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('WebSocket not connected, cannot send message');
      return false;
    }
  }

  // Check if WebSocket is available and connected
  isAvailable() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.socket ? this.socket.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Manual retry connection
  retryConnection() {
    console.log('Manual WebSocket retry requested');
    this.reconnectAttempts = 0; // Reset attempts
    this.connect();
  }

  // Reset connection state
  resetConnection() {
    this.reconnectAttempts = 0;
    this.isConnected = false;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // Send typing indicator
  sendTyping(conversationId, isTyping) {
    return this.sendMessage('typing', {
      conversationId,
      isTyping
    });
  }

  // Send message status update
  sendMessageStatus(messageId, status) {
    return this.sendMessage('message_status', {
      messageId,
      status
    });
  }

  // Join conversation room
  joinConversation(conversationId) {
    return this.sendMessage('join_conversation', {
      conversationId
    });
  }

  // Leave conversation room
  leaveConversation(conversationId) {
    return this.sendMessage('leave_conversation', {
      conversationId
    });
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
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.socket ? this.socket.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create and export a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
