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
  FaPhone,
  FaVideo,
  FaInfoCircle,
  FaReply,
  FaForward,
  FaGavel
} from 'react-icons/fa';
import messagingService from '../../services/messagingService';
import websocketService from '../../services/websocketService';
import pollingService from '../../services/pollingService';
import './FarmerMessages.css';

const FarmerMessages = () => {
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
  const [replyTo, setReplyTo] = useState(null);
  const [websocketAvailable, setWebsocketAvailable] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [pollingInitialized, setPollingInitialized] = useState(false);

  useEffect(() => {
    loadConversations();
    initializeWebSocket();
    
    return () => {
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
    websocketService.connect();

    setTimeout(() => {
      if (!websocketAvailable && connectionStatus === 'disconnected' && !pollingInitialized) {
        console.log('WebSocket connection timeout, switching to polling mode');
        setConnectionStatus('failed');
        initializePolling();
      }
    }, 15000);

    websocketService.on('connected', () => {
      setWebsocketAvailable(true);
      setConnectionStatus('connected');
    });

    websocketService.on('disconnected', () => {
      setConnectionStatus('disconnected');
    });

    websocketService.on('reconnectFailed', () => {
      setWebsocketAvailable(false);
      setConnectionStatus('failed');
      if (!pollingInitialized) {
        initializePolling();
      }
    });

    websocketService.on('maxAttemptsReached', () => {
      setWebsocketAvailable(false);
      setConnectionStatus('failed');
      if (!pollingInitialized) {
        initializePolling();
      }
    });

    websocketService.on('websocketNotSupported', () => {
      setWebsocketAvailable(false);
      setConnectionStatus('not_supported');
      if (!pollingInitialized) {
        initializePolling();
      }
    });

    websocketService.on('newMessage', (message) => {
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages(prev => [...prev, message]);
      }
      
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

    websocketService.on('messageStatus', (statusUpdate) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === statusUpdate.messageId 
            ? { ...msg, status: statusUpdate.status }
            : msg
        )
      );
    });

    websocketService.on('typing', (typingData) => {
      if (selectedConversation && typingData.conversationId === selectedConversation.id) {
        setTyping(typingData.isTyping);
      }
    });
  };

  const initializePolling = () => {
    if (pollingInitialized) {
      return;
    }

    console.log('Initializing polling service for farmer...');
    setPollingInitialized(true);

    pollingService.on('newMessage', (message) => {
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages(prev => [...prev, message]);
      }
    });

    pollingService.on('conversationUpdated', (conversationData) => {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationData.id 
            ? { ...conv, ...conversationData }
            : conv
        )
      );
    });

    conversations.forEach(conv => {
      pollingService.startPolling(conv.id);
    });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Get conversations where farmer is the recipient
      const conversationsData = await messagingService.getFarmerConversations();
      
      const transformedConversations = conversationsData
        .filter(conv => conv.farmerId && conv.bidId) // Only bid-related conversations
        .map(conv => ({
          id: conv.id,
          brokerId: conv.brokerId,
          brokerName: conv.brokerName,
          brokerAvatar: conv.brokerAvatar || '',
          lotId: conv.lotId,
          bidId: conv.bidId,
          lotInfo: {
            location: conv.lotLocation,
            numberOfTrees: conv.lotTreeCount,
            status: conv.lotStatus,
            bidAmount: conv.bidAmount,
            bidStatus: conv.bidStatus
          },
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount || 0,
          isOnline: conv.brokerOnline || false
        }));
      
      setConversations(transformedConversations);
      if (transformedConversations.length > 0) {
        setSelectedConversation(transformedConversations[0]);
      }
    } catch (error) {
      console.error('Error loading farmer conversations:', error);
      // Fallback to mock data
      const mockConversations = [
        {
          id: 'C001',
          brokerId: 'B001',
          brokerName: 'Rajesh Kumar',
          brokerAvatar: '',
          lotId: 'RT001',
          bidId: 'B001',
          lotInfo: {
            location: 'Kottayam, Kerala',
            numberOfTrees: 150,
            status: 'active',
            bidAmount: 45000,
            bidStatus: 'active'
          },
          lastMessage: 'Hello! I\'m interested in your rubber plantation. Can we discuss the terms?',
          lastMessageTime: '2024-01-25 16:30:00',
          unreadCount: 1,
          isOnline: true
        }
      ];
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
      const messagesData = await messagingService.getMessages(conversationId);
      
      const transformedMessages = messagesData.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        senderType: msg.senderType,
        content: msg.content,
        timestamp: msg.timestamp,
        status: msg.status,
        replyTo: msg.replyTo
      }));
      
      setMessages(transformedMessages);
      
      // Mark messages as read
      const unreadMessageIds = transformedMessages
        .filter(msg => msg.senderType === 'broker' && msg.status !== 'read')
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        await messagingService.markAsRead(conversationId, unreadMessageIds);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    const tempMessageId = `temp_${Date.now()}`;
    const newMsg = {
      id: tempMessageId,
      senderId: 'F001', // Farmer ID
      senderType: 'farmer',
      content: messageContent,
      timestamp: new Date().toISOString(),
      status: 'sending',
      replyTo: replyTo
    };

    setMessages(prev => [...prev, newMsg]);
    setReplyTo(null);

    try {
      const sentMessage = await messagingService.sendMessage(
        selectedConversation.id,
        messageContent,
        replyTo?.id || null
      );

      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessageId 
            ? { ...sentMessage, status: 'sent' }
            : msg
        )
      );

      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: messageContent, lastMessageTime: new Date().toISOString() }
            : conv
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);
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
    
    if (selectedConversation && websocketAvailable) {
      websocketService.sendTyping(selectedConversation.id, true);
      
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

  const filteredConversations = conversations.filter(conv =>
    conv.brokerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lotInfo.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lotId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('farmerMessages.loadingConversations')}</p>
      </div>
    );
  }

  return (
    <div className="farmer-messages-container">
      <div className="messages-header">
        <h2>
          <FaComments className="section-icon" />
          {t('farmerMessages.title')}
        </h2>
        <p className="section-description">
          {t('farmerMessages.subtitle')}
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
            </div>
          )}
          {connectionStatus === 'disconnected' && (
            <span className="status-indicator disconnected">
              <FaCircle /> Connecting...
            </span>
          )}
        </div>
      </div>

      <div className="messages-content">
        <div className="conversations-sidebar">
          <div className="conversations-header">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder={t('farmerMessages.searchConversations')}
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
                    <img src={conversation.brokerAvatar} alt={conversation.brokerName} />
                    {conversation.isOnline && <div className="online-indicator"></div>}
                  </div>
                  
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h4>{conversation.brokerName}</h4>
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

        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <img src={selectedConversation.brokerAvatar} alt={selectedConversation.brokerName} />
                  <div>
                    <h3>{selectedConversation.brokerName}</h3>
                    <p>
                      <FaGavel /> Broker • {t('farmerMessages.lot')} #{selectedConversation.lotId}
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
                  <button className="action-btn" title={t('farmerMessages.call')}>
                    <FaPhone />
                  </button>
                  <button className="action-btn" title={t('farmerMessages.videoCall')}>
                    <FaVideo />
                  </button>
                  <button className="action-btn" title={t('farmerMessages.info')}>
                    <FaInfoCircle />
                  </button>
                </div>
                <div className="chat-status">
                  <FaCircle className={`status-dot ${selectedConversation.isOnline ? 'online' : 'offline'}`} />
                  <span>{selectedConversation.isOnline ? t('farmerMessages.online') : t('farmerMessages.offline')}</span>
                </div>
              </div>

              <div className="messages-area">
                <AnimatePresence>
                  {messages.map(message => (
                    <motion.div
                      key={message.id}
                      className={`message ${message.senderType === 'farmer' ? 'sent' : 'received'}`}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {message.replyTo && (
                        <div className="reply-preview">
                          <div className="reply-content">
                            <span className="reply-sender">{message.replyTo.senderType === 'farmer' ? t('farmerMessages.you') : selectedConversation.brokerName}</span>
                            <p>{message.replyTo.content}</p>
                          </div>
                        </div>
                      )}
                      <div className="message-content">
                        <p>{message.content}</p>
                        <div className="message-meta">
                          <span className="message-time">{formatTime(message.timestamp)}</span>
                          {message.senderType === 'farmer' && getMessageStatusIcon(message.status)}
                        </div>
                      </div>
                      {message.senderType === 'broker' && (
                        <div className="message-actions">
                          <button onClick={() => handleReply(message)} title={t('farmerMessages.reply')}>
                            <FaReply />
                          </button>
                          <button title={t('farmerMessages.forward')}>
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
                    <span className="typing-text">{selectedConversation.brokerName} is typing...</span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-area">
                {replyTo && (
                  <div className="reply-indicator">
                    <div className="reply-info">
                      <span>{t('farmerMessages.replyingTo')} {replyTo.senderType === 'farmer' ? t('farmerMessages.you') : selectedConversation.brokerName}</span>
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
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload" className="action-btn" title={t('farmerMessages.attachFile')}>
                      <FaFile />
                    </label>
                    <button className="action-btn" title={t('farmerMessages.attachImage')}>
                      <FaImage />
                    </button>
                  </div>
                  <textarea
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder={t('farmerMessages.typeMessage')}
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
              <h3>{t('farmerMessages.selectConversation')}</h3>
              <p>{t('farmerMessages.chooseConversation')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerMessages;
