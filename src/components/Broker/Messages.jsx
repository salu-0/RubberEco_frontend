import React, { useState, useEffect } from 'react';
import { 
  FaComments, 
  FaUser, 
  FaPaperPlane, 
  FaSearch,
  FaTree,
  FaMapMarkerAlt,
  FaClock,
  FaCheck,
  FaCheckDouble,
  FaCircle
} from 'react-icons/fa';
import './Messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      // TODO: Replace with actual API call
      const mockConversations = [
        {
          id: 'C001',
          farmerId: 'F001',
          farmerName: 'John Doe',
          farmerAvatar: '',
          lotId: 'RT001',
          lotInfo: {
            location: 'Kottayam, Kerala',
            numberOfTrees: 150,
            status: 'active'
          },
          lastMessage: 'Thank you for your interest in my rubber plantation.',
          lastMessageTime: '2024-01-25 16:30:00',
          unreadCount: 2,
          isOnline: true
        },
        {
          id: 'C002',
          farmerId: 'F003',
          farmerName: 'Ravi Kumar',
          farmerAvatar: '',
          lotId: 'RT003',
          lotInfo: {
            location: 'Wayanad, Kerala',
            numberOfTrees: 100,
            status: 'active'
          },
          lastMessage: 'The trees are in excellent condition for tapping.',
          lastMessageTime: '2024-01-24 14:20:00',
          unreadCount: 0,
          isOnline: false
        },
        {
          id: 'C003',
          farmerId: 'F002',
          farmerName: 'Maria Sebastian',
          farmerAvatar: '',
          lotId: 'RT002',
          lotInfo: {
            location: 'Idukki, Kerala',
            numberOfTrees: 200,
            status: 'won'
          },
          lastMessage: 'Congratulations on winning the bid! When can we meet?',
          lastMessageTime: '2024-01-23 11:45:00',
          unreadCount: 1,
          isOnline: true
        }
      ];
      
      setConversations(mockConversations);
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      // TODO: Replace with actual API call
      const mockMessages = [
        {
          id: 'M001',
          senderId: 'F001',
          senderType: 'farmer',
          content: 'Hello! I see you\'re interested in my rubber plantation. Do you have any specific questions?',
          timestamp: '2024-01-25 14:00:00',
          status: 'read'
        },
        {
          id: 'M002',
          senderId: 'B001',
          senderType: 'broker',
          content: 'Hi John! Yes, I\'m very interested. Could you tell me more about the tapping schedule and the current yield per tree?',
          timestamp: '2024-01-25 14:15:00',
          status: 'read'
        },
        {
          id: 'M003',
          senderId: 'F001',
          senderType: 'farmer',
          content: 'The trees are tapped every alternate day, and we get approximately 16-17kg per tree annually. The trees are 18 years old and in prime condition.',
          timestamp: '2024-01-25 15:30:00',
          status: 'read'
        },
        {
          id: 'M004',
          senderId: 'B001',
          senderType: 'broker',
          content: 'That sounds excellent! What about the accessibility for transportation? Is the plantation easily accessible by trucks?',
          timestamp: '2024-01-25 15:45:00',
          status: 'read'
        },
        {
          id: 'M005',
          senderId: 'F001',
          senderType: 'farmer',
          content: 'Yes, we have a paved road directly to the plantation. Large trucks can easily access the collection point.',
          timestamp: '2024-01-25 16:00:00',
          status: 'delivered'
        },
        {
          id: 'M006',
          senderId: 'F001',
          senderType: 'farmer',
          content: 'Thank you for your interest in my rubber plantation.',
          timestamp: '2024-01-25 16:30:00',
          status: 'sent'
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData = {
        conversationId: selectedConversation.id,
        content: newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      // TODO: Replace with actual API call
      const newMsg = {
        id: `M${Date.now()}`,
        senderId: 'B001',
        senderType: 'broker',
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');

      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: newMessage.trim(), lastMessageTime: new Date().toISOString() }
            : conv
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <FaCheck className="status-icon sent" />;
      case 'delivered':
        return <FaCheckDouble className="status-icon delivered" />;
      case 'read':
        return <FaCheckDouble className="status-icon read" />;
      default:
        return null;
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lotInfo.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lotId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h2>
          <FaComments className="section-icon" />
          Messages & Communications
        </h2>
        <p className="section-description">
          Communicate with farmers about lot details and negotiations
        </p>
      </div>

      <div className="messages-content">
        {/* Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="conversations-header">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="conversations-list">
            {filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="conversation-avatar">
                  <img src={conversation.farmerAvatar} alt={conversation.farmerName} />
                  {conversation.isOnline && <div className="online-indicator"></div>}
                </div>
                
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4>{conversation.farmerName}</h4>
                    <span className="conversation-time">
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  
                  <div className="lot-info">
                    <span className="lot-id">#{conversation.lotId}</span>
                    <span className="lot-location">
                      <FaMapMarkerAlt />
                      {conversation.lotInfo.location}
                    </span>
                  </div>
                  
                  <div className="last-message">
                    <p>{conversation.lastMessage}</p>
                    {conversation.unreadCount > 0 && (
                      <span className="unread-badge">{conversation.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <img src={selectedConversation.farmerAvatar} alt={selectedConversation.farmerName} />
                  <div>
                    <h3>{selectedConversation.farmerName}</h3>
                    <p>
                      <FaTree /> Lot #{selectedConversation.lotId} • {selectedConversation.lotInfo.numberOfTrees} trees
                    </p>
                  </div>
                </div>
                <div className="chat-status">
                  <FaCircle className={`status-dot ${selectedConversation.isOnline ? 'online' : 'offline'}`} />
                  <span>{selectedConversation.isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>

              <div className="messages-area">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`message ${message.senderType === 'broker' ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.content}</p>
                      <div className="message-meta">
                        <span className="message-time">{formatTime(message.timestamp)}</span>
                        {message.senderType === 'broker' && getMessageStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="message-input-area">
                <div className="message-input">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows="2"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="send-button"
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <FaComments className="no-chat-icon" />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
