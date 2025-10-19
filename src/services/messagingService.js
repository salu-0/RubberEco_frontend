// Messaging Service for Broker-Farmer Communication
// This service handles all messaging-related API calls

const API_BASE_URL = 'https://rubbereco-backend.onrender.com/api';

class MessagingService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Get all conversations for the current broker
  async getConversations() {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      return data.conversations || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Get messages for a specific conversation
  async getMessages(conversationId, page = 1, limit = 50) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send a new message
  async sendMessage(conversationId, content, replyTo = null, attachments = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          content,
          replyTo,
          attachments
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Create a new conversation with a farmer
  async createConversation(farmerId, lotId, initialMessage = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          farmerId,
          lotId,
          initialMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      return data.conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markAsRead(conversationId, messageIds) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          messageIds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }

      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Upload file attachment
  async uploadAttachment(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/messages/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      return data.attachment;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Get farmer profile for a conversation
  async getFarmerProfile(farmerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/farmers/${farmerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch farmer profile');
      }

      const data = await response.json();
      return data.farmer;
    } catch (error) {
      console.error('Error fetching farmer profile:', error);
      throw error;
    }
  }

  // Get lot details for a conversation
  async getLotDetails(lotId) {
    try {
      const response = await fetch(`${API_BASE_URL}/tree-lots/${lotId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lot details');
      }

      const data = await response.json();
      return data.lot;
    } catch (error) {
      console.error('Error fetching lot details:', error);
      throw error;
    }
  }

  // Search conversations
  async searchConversations(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search conversations');
      }

      const data = await response.json();
      return data.conversations || [];
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }
  }

  // Delete a message
  async deleteMessage(messageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/unread-count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // Get conversations for farmers (where farmer is the recipient)
  async getFarmerConversations() {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/farmer-conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch farmer conversations');
      }

      const data = await response.json();
      return data.conversations || [];
    } catch (error) {
      console.error('Error fetching farmer conversations:', error);
      throw error;
    }
  }

  // Create conversation from farmer side
  async createFarmerConversation(brokerId, lotId, bidId, initialMessage = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/farmer-conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brokerId,
          lotId,
          bidId,
          initialMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create farmer conversation');
      }

      const data = await response.json();
      return data.conversation;
    } catch (error) {
      console.error('Error creating farmer conversation:', error);
      throw error;
    }
  }

  // Get broker profile for a conversation
  async getBrokerProfile(brokerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/brokers/${brokerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch broker profile');
      }

      const data = await response.json();
      return data.broker;
    } catch (error) {
      console.error('Error fetching broker profile:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const messagingService = new MessagingService();
export default messagingService;
