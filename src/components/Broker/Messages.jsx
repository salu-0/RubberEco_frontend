import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  FaCircle,
  FaImage,
  FaFile,
  FaEllipsisV,
  FaPhone,
  FaVideo,
  FaInfoCircle,
  FaTrash,
  FaReply,
  FaForward
} from 'react-icons/fa';
import messagingService from '../../services/messagingService';
import websocketService from '../../services/websocketService';
import pollingService from '../../services/pollingService';
import { testBackendConnection, testBrokerBids } from '../../utils/apiTest';
import MessagesDebug from './MessagesDebug';
import './Messages.css';

const Messages = () => {
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [websocketAvailable, setWebsocketAvailable] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [pollingInitialized, setPollingInitialized] = useState(false);

  useEffect(() => {
    console.log('Messages component mounted, loading conversations...');
    loadConversations();
    initializeWebSocket();
    
    return () => {
      console.log('Messages component unmounting, cleaning up...');
      websocketService.disconnect();
      pollingService.stopAllPolling();
      setPollingInitialized(false);
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeWebSocket = () => {
    // Try to connect to WebSocket
    websocketService.connect();

    // Set a timeout to fallback to polling if WebSocket doesn't connect quickly
    setTimeout(() => {
      if (!websocketAvailable && connectionStatus === 'disconnected' && !pollingInitialized) {
        console.log('WebSocket connection timeout, switching to polling mode');
        setConnectionStatus('failed');
        initializePolling();
      }
    }, 15000); // 15 second timeout

    // Listen for connection events
    websocketService.on('connected', () => {
      setWebsocketAvailable(true);
      setConnectionStatus('connected');
      console.log('WebSocket connected successfully');
    });

    websocketService.on('disconnected', () => {
      setConnectionStatus('disconnected');
      console.log('WebSocket disconnected');
    });

    websocketService.on('reconnectFailed', () => {
      setWebsocketAvailable(false);
      setConnectionStatus('failed');
      console.log('WebSocket connection failed, using polling fallback');
      if (!pollingInitialized) {
        initializePolling();
      }
    });

    websocketService.on('maxAttemptsReached', () => {
      setWebsocketAvailable(false);
      setConnectionStatus('failed');
      console.log('Max WebSocket attempts reached, using polling fallback');
      if (!pollingInitialized) {
        initializePolling();
      }
    });

    websocketService.on('websocketNotSupported', () => {
      setWebsocketAvailable(false);
      setConnectionStatus('not_supported');
      console.log('WebSocket not supported, using polling fallback');
      if (!pollingInitialized) {
        initializePolling();
      }
    });

    // Listen for new messages (only if WebSocket is available)
    websocketService.on('newMessage', (message) => {
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages(prev => [...prev, message]);
      }
      
      // Update conversation list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === message.conversationId 
            ? { 
                ...conv, 
                lastMessage: message.content, 
                lastMessageTime: message.timestamp,
                unreadCount: conv.id === selectedConversation?.id ? conv.unreadCount : conv.unreadCount + 1
              }
            : conv
        )
      );
    });

    // Listen for message status updates
    websocketService.on('messageStatus', (statusUpdate) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === statusUpdate.messageId 
            ? { ...msg, status: statusUpdate.status }
            : msg
        )
      );
    });

    // Listen for typing indicators
    websocketService.on('typing', (typingData) => {
      if (selectedConversation && typingData.conversationId === selectedConversation.id) {
        setTyping(typingData.isTyping);
      }
    });

    // Listen for user online/offline status
    websocketService.on('userOnline', (userData) => {
      setConversations(prev => 
        prev.map(conv => 
          conv.farmerId === userData.userId 
            ? { ...conv, isOnline: true }
            : conv
        )
      );
    });

    websocketService.on('userOffline', (userData) => {
      setConversations(prev => 
        prev.map(conv => 
          conv.farmerId === userData.userId 
            ? { ...conv, isOnline: false }
            : conv
        )
      );
    });

    // Listen for conversation updates
    websocketService.on('conversationUpdated', (conversationData) => {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationData.id 
            ? { ...conv, ...conversationData }
            : conv
        )
      );
    });
  };

  const initializePolling = () => {
    if (pollingInitialized) {
      console.log('Polling already initialized, skipping...');
      return;
    }

    console.log('Initializing polling service...');
    setPollingInitialized(true);

    // Listen for new messages from polling service
    pollingService.on('newMessage', (message) => {
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages(prev => [...prev, message]);
      }
    });

    // Listen for conversation updates from polling service
    pollingService.on('conversationUpdated', (conversationData) => {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationData.id 
            ? { ...conv, ...conversationData }
            : conv
        )
      );
    });

    // Start polling for all conversations
    conversations.forEach(conv => {
      pollingService.startPolling(conv.id);
    });
  };

  const handleRetryConnection = () => {
    console.log('Retrying WebSocket connection...');
    setConnectionStatus('disconnected');
    setPollingInitialized(false); // Reset polling state for retry
    pollingService.stopAllPolling(); // Stop current polling
    websocketService.retryConnection();
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Get broker's bids from the database
      const brokerId = localStorage.getItem('userId'); // Assuming broker ID is stored here
      
      console.log('Broker ID from localStorage:', brokerId);
      
      if (!brokerId) {
        console.log('No broker ID found in localStorage, using demo data');
        throw new Error('Broker ID not found');
      }

      // Test broker bids API directly (since you're using production backend)
      const token = localStorage.getItem('token');
      const apiUrl = 'https://rubbereco-backend.onrender.com'; // Use your production backend
      
      console.log('Making API call to production backend:', `${apiUrl}/api/bids/broker/${brokerId}`);
      
      const response = await fetch(`${apiUrl}/api/bids/broker/${brokerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        console.log('Broker bids API failed (status:', response.status, '), using demo data');
        throw new Error('Failed to fetch broker bids');
      }

      const bidsData = await response.json();
      console.log('Broker bids loaded:', bidsData);
      
      // Transform bids into conversations with farmer information
      const conversations = await Promise.all(
        bidsData.bids.map(async (bid) => {
          try {
            // Get lot owner (farmer) information
            const lotResponse = await fetch(`https://rubbereco-backend.onrender.com/api/landregistrations/${bid.lotId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });
            
            const lotData = await lotResponse.json();
            
            // Get farmer profile information
            const farmerResponse = await fetch(`https://rubbereco-backend.onrender.com/api/register/${lotData.ownerId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });
            
            const farmerData = await farmerResponse.json();
            
            // Get last message from conversation (if exists)
            let lastMessage = 'No messages yet';
            let lastMessageTime = bid.createdAt;
            let unreadCount = 0;
            
            try {
              const messagesResponse = await fetch(`https://rubbereco-backend.onrender.com/api/messages/conversation/${bid._id}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (messagesResponse.ok) {
                const messagesData = await messagesResponse.json();
                if (messagesData.messages && messagesData.messages.length > 0) {
                  const lastMsg = messagesData.messages[messagesData.messages.length - 1];
                  lastMessage = lastMsg.content;
                  lastMessageTime = lastMsg.createdAt;
                  unreadCount = messagesData.messages.filter(msg => 
                    msg.senderType === 'farmer' && msg.status !== 'read'
                  ).length;
                }
              }
            } catch (msgError) {
              console.log('No existing conversation found, will create new one');
            }
            
            return {
              id: bid._id, // Use bid ID as conversation ID
              farmerId: lotData.ownerId,
              farmerName: farmerData.fullName || farmerData.name || 'Unknown Farmer',
              farmerAvatar: farmerData.profilePicture || '',
              lotId: bid.lotId,
              bidId: bid._id,
              lotInfo: {
                location: lotData.location || 'Location not specified',
                numberOfTrees: lotData.numberOfTrees || 0,
                status: lotData.status || 'active',
                bidAmount: bid.amount,
                bidStatus: bid.status
              },
              lastMessage: lastMessage,
              lastMessageTime: lastMessageTime,
              unreadCount: unreadCount,
              isOnline: Math.random() > 0.5 // TODO: Implement real online status
            };
          } catch (error) {
            console.error(`Error processing bid ${bid._id}:`, error);
            return null;
          }
        })
      );

      // Filter out null results
      const validConversations = conversations.filter(conv => conv !== null);
      
      console.log('Loaded conversations from real data:', validConversations);
      setConversations(validConversations);
      
      if (validConversations.length > 0) {
        setSelectedConversation(validConversations[0]);
      }
      
    } catch (error) {
      console.error('Error loading conversations:', error);
      console.log('Backend API not available or broker has no bids, using demo data');
      
      // Fallback to mock data if API fails
      const mockConversations = [
        {
          id: 'C001',
          farmerId: 'F001',
          farmerName: 'John Doe',
          farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          lotId: 'RT001',
          bidId: 'B001',
          lotInfo: {
            location: 'Kottayam, Kerala',
            numberOfTrees: 150,
            status: 'active',
            bidAmount: 45000,
            bidStatus: 'active'
          },
          lastMessage: 'Thank you for your bid on my rubber plantation. When can we discuss the terms?',
          lastMessageTime: '2024-01-25T16:30:00Z',
          unreadCount: 2,
          isOnline: true
        }
      ];
      
      console.log('Using fallback mock conversations:', mockConversations);
      setConversations(mockConversations);
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      console.log('Loading messages for conversation (bid):', conversationId);
      
      // Fetch messages for this conversation (bid)
      const response = await fetch(`https://rubbereco-backend.onrender.com/api/messages/conversation/${conversationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const messagesData = await response.json();
      
      // Transform API data to match component structure
      const transformedMessages = messagesData.messages.map(msg => ({
        id: msg._id,
        senderId: msg.senderId,
        senderType: msg.senderType,
        content: msg.content,
        timestamp: msg.createdAt,
        status: msg.status || 'delivered',
        replyTo: msg.replyTo
      }));
      
      setMessages(transformedMessages);
      
      // Mark messages as read
      const unreadMessageIds = transformedMessages
        .filter(msg => msg.senderType === 'farmer' && msg.status !== 'read')
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        await messagingService.markAsRead(conversationId, unreadMessageIds);
      }
      
    } catch (error) {
      console.error('Error loading messages:', error);
      
      // Fallback to mock data if API fails
      const mockMessages = [
        {
          id: 'M001',
          senderId: selectedConversation?.farmerId || 'F001',
          senderType: 'farmer',
          content: 'Hello! I see you\'re interested in my rubber plantation. Do you have any specific questions?',
          timestamp: '2024-01-25T14:00:00Z',
          status: 'read'
        },
        {
          id: 'M002',
          senderId: localStorage.getItem('userId') || 'B001',
          senderType: 'broker',
          content: 'Hi! Yes, I\'m very interested. Could you tell me more about the tapping schedule and the current yield per tree?',
          timestamp: '2024-01-25T14:15:00Z',
          status: 'read'
        },
        {
          id: 'M003',
          senderId: selectedConversation?.farmerId || 'F001',
          senderType: 'farmer',
          content: 'The trees are tapped every alternate day, and we get approximately 16-17kg per tree annually. The trees are in prime condition.',
          timestamp: '2024-01-25T15:30:00Z',
          status: 'read'
        }
      ];
      console.log('Using fallback mock messages for conversation:', conversationId);
      setMessages(mockMessages);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    // Optimistically add message to UI
    const tempMessageId = `temp_${Date.now()}`;
    const newMsg = {
      id: tempMessageId,
      senderId: 'B001',
      senderType: 'broker',
      content: messageContent,
      timestamp: new Date().toISOString(),
      status: 'sending',
      replyTo: replyTo
    };

    setMessages(prev => [...prev, newMsg]);
    setReplyTo(null);

    try {
      // Send message to the backend
      const response = await fetch(`https://rubbereco-backend.onrender.com/api/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id, // This is the bid ID
          content: messageContent,
          senderType: 'broker',
          replyTo: replyTo?.id || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessageData = await response.json();
      
      // Transform API response to match component structure
      const sentMessage = {
        id: sentMessageData._id,
        senderId: localStorage.getItem('userId'),
        senderType: 'broker',
        content: messageContent,
        timestamp: sentMessageData.createdAt,
        status: 'sent',
        replyTo: replyTo
      };

      // Replace temporary message with real message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessageId 
            ? sentMessage
            : msg
        )
      );

      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: messageContent, lastMessageTime: new Date().toISOString() }
            : conv
        )
      );

      // Demo: Auto-reply from farmer after 2 seconds
      setTimeout(() => {
        const autoReplyMessages = [
          "Thank you for your message! I'll get back to you soon.",
          "That's a great question. Let me check the details and respond.",
          "I appreciate your interest. We can discuss this further.",
          "Perfect! I'm looking forward to working with you.",
          "Sounds good! Let me know if you need any more information."
        ];
        
        const randomReply = autoReplyMessages[Math.floor(Math.random() * autoReplyMessages.length)];
        
        const autoReply = {
          id: `auto_${Date.now()}`,
          senderId: selectedConversation.farmerId,
          senderType: 'farmer',
          content: randomReply,
          timestamp: new Date().toISOString(),
          status: 'delivered'
        };

        setMessages(prev => [...prev, autoReply]);
        
        // Update conversation with auto-reply
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id 
              ? { ...conv, lastMessage: randomReply, lastMessageTime: new Date().toISOString() }
              : conv
          )
        );
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      // Revert optimistic update on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      setNewMessage(messageContent);
    } finally {
      setSending(false);
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
      case 'sending':
        return <div className="status-icon sending"><div className="sending-dot"></div></div>;
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

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator only if WebSocket is available
    if (selectedConversation && websocketAvailable) {
      websocketService.sendTyping(selectedConversation.id, true);
      
      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        if (websocketAvailable) {
          websocketService.sendTyping(selectedConversation.id, false);
        }
      }, 3000);
    }
  };

  const handleReply = (message) => {
    setReplyTo(message);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Implement file upload
      console.log('File selected:', file);
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
        <p>{t('messages.loadingConversations')}</p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <MessagesDebug />
      <div className="messages-header">
        <h2>
          <FaComments className="section-icon" />
          {t('messages.title')}
        </h2>
        <p className="section-description">
          {t('messages.subtitle')}
        </p>
        <div className="connection-status">
          {connectionStatus === 'connected' && (
            <span className="status-indicator connected">
              <FaCircle /> Real-time messaging active
            </span>
          )}
          {connectionStatus === 'failed' && (
            <div className="status-indicator failed">
              <span>
                <FaCircle /> Using polling mode (checking for new messages every 5 seconds)
              </span>
              <button 
                onClick={handleRetryConnection}
                className="retry-button"
                title="Retry real-time connection"
              >
                Retry
              </button>
            </div>
          )}
          {connectionStatus === 'disconnected' && (
            <span className="status-indicator disconnected">
              <FaCircle /> Connecting...
            </span>
          )}
          {connectionStatus === 'not_supported' && (
            <span className="status-indicator failed">
              <FaCircle /> WebSocket not supported, using polling mode
            </span>
          )}
        </div>
      </div>

      <div className="messages-content">
        {/* Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="conversations-header">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder={t('messages.searchConversations')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="conversations-list">
            <AnimatePresence>
              {filteredConversations.map(conversation => (
                <motion.div
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conversation)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ backgroundColor: '#f7fafc' }}
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
                    {conversation.bidId && (
                      <span className="bid-id">Bid #{conversation.bidId}</span>
                    )}
                    <span className="lot-location">
                      <FaMapMarkerAlt />
                      {conversation.lotInfo.location}
                    </span>
                    {conversation.lotInfo.bidAmount && (
                      <span className="bid-amount">₹{conversation.lotInfo.bidAmount.toLocaleString()}</span>
                    )}
                  </div>
                  
                  <div className="last-message">
                    <p>{conversation.lastMessage}</p>
                    {conversation.unreadCount > 0 && (
                      <span className="unread-badge">{conversation.unreadCount}</span>
                    )}
                  </div>
                </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
                      <FaTree /> {t('messages.lot')} #{selectedConversation.lotId} • {selectedConversation.lotInfo.numberOfTrees} {t('messages.trees')}
                      {selectedConversation.bidId && (
                        <> • Bid #{selectedConversation.bidId}</>
                      )}
                      {selectedConversation.lotInfo.bidAmount && (
                        <> • ₹{selectedConversation.lotInfo.bidAmount.toLocaleString()}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="action-btn" title={t('messages.call')}>
                    <FaPhone />
                  </button>
                  <button className="action-btn" title={t('messages.videoCall')}>
                    <FaVideo />
                  </button>
                  <button className="action-btn" title={t('messages.info')}>
                    <FaInfoCircle />
                  </button>
                </div>
                <div className="chat-status">
                  <FaCircle className={`status-dot ${selectedConversation.isOnline ? 'online' : 'offline'}`} />
                  <span>{selectedConversation.isOnline ? t('messages.online') : t('messages.offline')}</span>
                </div>
              </div>

              <div className="messages-area">
                <AnimatePresence>
                  {messages.map(message => (
                    <motion.div
                      key={message.id}
                      className={`message ${message.senderType === 'broker' ? 'sent' : 'received'}`}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {message.replyTo && (
                        <div className="reply-preview">
                          <div className="reply-content">
                            <span className="reply-sender">{message.replyTo.senderType === 'broker' ? t('messages.you') : selectedConversation.farmerName}</span>
                            <p>{message.replyTo.content}</p>
                          </div>
                        </div>
                      )}
                      <div className="message-content">
                        <p>{message.content}</p>
                        <div className="message-meta">
                          <span className="message-time">{formatTime(message.timestamp)}</span>
                          {message.senderType === 'broker' && getMessageStatusIcon(message.status)}
                        </div>
                      </div>
                      {message.senderType === 'farmer' && (
                        <div className="message-actions">
                          <button onClick={() => handleReply(message)} title={t('messages.reply')}>
                            <FaReply />
                          </button>
                          <button title={t('messages.forward')}>
                            <FaForward />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {typing && (
                  <motion.div
                    className="typing-indicator"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="typing-text">{selectedConversation.farmerName} is typing...</span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-area">
                {replyTo && (
                  <div className="reply-indicator">
                    <div className="reply-info">
                      <span>{t('messages.replyingTo')} {replyTo.senderType === 'broker' ? t('messages.you') : selectedConversation.farmerName}</span>
                      <p>{replyTo.content}</p>
                    </div>
                    <button onClick={() => setReplyTo(null)} className="cancel-reply">
                      ×
                    </button>
                  </div>
                )}
                <div className="message-input">
                  <div className="input-actions">
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload" className="action-btn" title={t('messages.attachFile')}>
                      <FaFile />
                    </label>
                    <button className="action-btn" title={t('messages.attachImage')}>
                      <FaImage />
                    </button>
                  </div>
                  <textarea
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder={t('messages.typeMessage')}
                    rows="2"
                    disabled={sending}
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="send-button"
                  >
                    {sending ? (
                      <div className="sending-spinner"></div>
                    ) : (
                      <FaPaperPlane />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <FaComments className="no-chat-icon" />
              <h3>{t('messages.selectConversation')}</h3>
              <p>{t('messages.chooseConversation')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
