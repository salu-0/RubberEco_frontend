// WebSocket Service for Real-time Messaging using Socket.IO
// This service handles real-time communication between brokers and farmers

import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectInterval = 5000;
    this.listeners = new Map();
    this.token = localStorage.getItem('token');
  }

  // Connect to Socket.IO server
  connect() {
    if (this.socket && this.socket.connected) {
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

      // Connect to Socket.IO server
      const serverUrl = 'http://localhost:5000'; // Use local backend for development
      console.log(`Attempting Socket.IO connection (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      this.socket = io(serverUrl, {
        query: {
          token: this.token
        },
        transports: ['websocket', 'polling'],
        timeout: 5000,
        forceNew: true
      });

      this.socket.on('connect', this.handleOpen.bind(this));
      this.socket.on('disconnect', this.handleClose.bind(this));
      this.socket.on('connect_error', this.handleError.bind(this));
      this.socket.on('new_message', this.handleNewMessage.bind(this));
      this.socket.on('typing', this.handleTyping.bind(this));
      this.socket.on('message_status', this.handleMessageStatus.bind(this));
      this.socket.on('error', this.handleError.bind(this));

    } catch (error) {
      console.error('Socket.IO connection error:', error);
      this.emit('connectionError', error);
      this.scheduleReconnect();
    }
  }

  // Handle Socket.IO connection open
  handleOpen() {
    console.log('Socket.IO connected successfully');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.emit('connected');
  }

  // Handle new messages from Socket.IO
  handleNewMessage(message) {
    console.log('New message received via Socket.IO:', message);
    this.emit('newMessage', message);
  }

  // Handle typing indicators from Socket.IO
  handleTyping(typingData) {
    console.log('Typing indicator received:', typingData);
    this.emit('typing', typingData);
  }

  // Handle message status updates from Socket.IO
  handleMessageStatus(statusUpdate) {
    console.log('Message status update received:', statusUpdate);
    this.emit('messageStatus', statusUpdate);
  }

  // Handle Socket.IO connection close
  handleClose(reason) {
    console.log('Socket.IO disconnected:', reason);
    this.isConnected = false;
    this.emit('disconnected');
    
    // Only attempt to reconnect if we haven't exceeded max attempts
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      console.warn('Socket.IO reconnection failed after maximum attempts. Falling back to polling mode.');
      this.emit('reconnectFailed');
    }
  }

  // Handle Socket.IO errors
  handleError(error) {
    console.error('Socket.IO connection error:', error);
    this.emit('error', error);
    
    // Don't attempt to reconnect immediately on error
    // Let the disconnect handler manage reconnection
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

  // Send message through Socket.IO
  sendMessage(type, payload) {
    if (this.socket && this.socket.connected) {
      try {
        this.socket.emit(type, payload);
        return true;
      } catch (error) {
        console.error('Error sending Socket.IO message:', error);
        return false;
      }
    } else {
      console.warn('Socket.IO not connected, cannot send message');
      return false;
    }
  }

  // Check if Socket.IO is available and connected
  isAvailable() {
    return this.socket && this.socket.connected;
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      connected: this.socket ? this.socket.connected : false,
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

  // Disconnect Socket.IO
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      connected: this.socket ? this.socket.connected : false,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create and export a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
