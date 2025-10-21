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
  FaGavel,
  FaTimes
} from 'react-icons/fa';
import messagingService from '../../services/messagingService';
import websocketService from '../../services/websocketService';
import pollingService from '../../services/pollingService';
import './FarmerMessages.css';

const FarmerMessages = ({ isOpen, onClose }) => {
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
    console.log('🚀 FarmerMessages component mounted, loading conversations...');
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
      console.log('🔄 Loading farmer conversations...');
      
      // Debug: Test the debug endpoint first
      try {
        const debugResponse = await fetch('https://rubbereco-backend.onrender.com/api/messages/debug', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        const debugData = await debugResponse.json();
        console.log('🔍 Debug database info:', debugData);
      } catch (debugError) {
        console.log('🔍 Debug endpoint not available:', debugError.message);
      }
      
      // Get conversations where farmer is the recipient
      const conversationsData = await messagingService.getFarmerConversations();
      console.log('📊 Raw conversations data:', conversationsData);
      
      // If no conversations found, try direct approach
      if (conversationsData.length === 0) {
        console.log('🔍 No conversations found, trying direct approach...');
        try {
          // Get farmer's lots directly
          const lotsResponse = await fetch('https://rubbereco-backend.onrender.com/api/tree-lots', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (lotsResponse.ok) {
            const lotsData = await lotsResponse.json();
            console.log('🏞️ Farmer lots:', lotsData);
            
            // For each lot, try to find bids and messages
            const directConversations = [];
            for (const lot of lotsData.lots || []) {
              try {
                // Get bids for this lot
                const bidsResponse = await fetch(`https://rubbereco-backend.onrender.com/api/bids?lotId=${lot.lotId}`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (bidsResponse.ok) {
                  const bidsData = await bidsResponse.json();
                  console.log(`💰 Bids for lot ${lot.lotId}:`, bidsData);
                  
                  // For each bid, check if there are messages
                  for (const bid of bidsData.bids || []) {
                    try {
                      const messagesResponse = await fetch(`https://rubbereco-backend.onrender.com/api/messages/conversation/${bid._id}`, {
                        method: 'GET',
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                          'Content-Type': 'application/json'
                        }
                      });
                    
                      if (messagesResponse.ok) {
                        const messagesData = await messagesResponse.json();
                        console.log(`💬 Messages for bid ${bid._id}:`, messagesData);
                        
                        if (messagesData.messages && messagesData.messages.length > 0) {
                          // Found a conversation with messages
                          const lastMessage = messagesData.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                          directConversations.push({
                            _id: bid._id,
                            brokerId: bid.bidderId,
                            brokerName: bid.bidderName || 'Unknown Broker',
                            brokerAvatar: bid.bidderAvatar || '',
                            lotId: lot._id,
                            bidId: bid._id,
                            lotInfo: {
                              location: lot.location || 'Location not specified',
                              numberOfTrees: lot.numberOfTrees || 0,
                              status: lot.status || 'active',
                              bidAmount: bid.amount,
                              bidStatus: bid.status
                            },
                            lastMessage: lastMessage ? lastMessage.content : 'No messages yet',
                            lastMessageTime: lastMessage ? lastMessage.createdAt : bid.createdAt,
                            unreadCount: messagesData.messages.filter(m => m.senderType === 'broker' && m.status !== 'read').length,
                            isOnline: Math.random() > 0.5
                          });
                        }
                      }
                    } catch (messageError) {
                      console.log(`Error checking messages for bid ${bid._id}:`, messageError);
                    }
                  }
                }
              } catch (error) {
                console.log(`Error checking lot ${lot.lotId}:`, error);
              }
            }
            
            console.log('💬 Direct conversations found:', directConversations.length);
            if (directConversations.length > 0) {
              // Use the direct conversations instead
              const transformedDirectConversations = directConversations.map(conv => ({
                id: conv._id,
                brokerId: conv.brokerId,
                brokerName: conv.brokerName,
                brokerAvatar: conv.brokerAvatar || '',
                lotId: conv.lotId,
                bidId: conv.bidId,
                lotInfo: conv.lotInfo,
                lastMessage: conv.lastMessage,
                lastMessageTime: conv.lastMessageTime,
                unreadCount: conv.unreadCount || 0,
                isOnline: conv.isOnline || false
              }));
              
              console.log('✅ Direct transformed conversations:', transformedDirectConversations);
              setConversations(transformedDirectConversations);
              if (transformedDirectConversations.length > 0) {
                setSelectedConversation(transformedDirectConversations[0]);
              }
              return; // Exit early with direct conversations
            }
          }
        } catch (directError) {
          console.log('🔍 Direct approach failed:', directError);
        }
      }
      
      const transformedConversations = conversationsData
        .filter(conv => conv.brokerId && conv.bidId) // Only bid-related conversations
        .map(conv => ({
          id: conv._id,
          brokerId: conv.brokerId,
          brokerName: conv.brokerName,
          brokerAvatar: conv.brokerAvatar || '',
          lotId: conv.lotId,
          bidId: conv.bidId,
          lotInfo: {
            location: conv.lotInfo?.location,
            numberOfTrees: conv.lotInfo?.numberOfTrees,
            status: conv.lotInfo?.status,
            bidAmount: conv.lotInfo?.bidAmount,
            bidStatus: conv.lotInfo?.bidStatus
          },
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount || 0,
          isOnline: conv.isOnline || false
        }));
      
      console.log('✅ Transformed conversations:', transformedConversations);
      setConversations(transformedConversations);
      if (transformedConversations.length > 0) {
        setSelectedConversation(transformedConversations[0]);
      }
    } catch (error) {
      console.error('❌ Error loading farmer conversations:', error);
      
      // Temporary fallback: Show a message about the issue
      console.log('🔍 Debugging info:');
      console.log('- API call successful but returned empty array');
      console.log('- This suggests the backend is not finding conversations');
      console.log('- Possible causes:');
      console.log('  1. No bids on farmer lots');
      console.log('  2. No messages for existing bids');
      console.log('  3. Data structure mismatch');
      console.log('  4. Backend debugging not deployed');
      
      // Show empty state instead of mock data
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const messagesData = await messagingService.getMessages(conversationId);
      
      const transformedMessages = messagesData.map(msg => ({
        id: msg._id,
        senderId: msg.senderId,
        senderType: msg.senderType,
        content: msg.content,
        timestamp: msg.createdAt,
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

  if (!isOpen) return null;

  console.log('📱 FarmerMessages modal is open, conversations:', conversations.length);

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FaComments className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('farmerMessages.title')}</h2>
              <p className="text-green-100">{t('farmerMessages.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FaTimes className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Connection Status */}
        <div className="px-6 py-2 bg-gray-50 border-b">
          {connectionStatus === 'connected' && (
            <div className="flex items-center text-green-600 text-sm">
              <FaCircle className="h-3 w-3 mr-2" />
              Real-time messaging active
            </div>
          )}
          {connectionStatus === 'failed' && (
            <div className="flex items-center text-red-600 text-sm">
              <FaCircle className="h-3 w-3 mr-2" />
              Using polling mode (checking for new messages every 5 seconds)
            </div>
          )}
          {connectionStatus === 'disconnected' && (
            <div className="flex items-center text-yellow-600 text-sm">
              <FaCircle className="h-3 w-3 mr-2" />
              Connecting...
            </div>
          )}
        </div>

        <div className="farmer-messages-container h-full">
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
                  {conversations.length === 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Debug Info:</strong> No conversations found. 
                        This could mean:
                      </p>
                      <ul className="text-xs text-yellow-700 mt-2 ml-4 list-disc">
                        <li>No brokers have bid on your lots</li>
                        <li>No messages have been sent yet</li>
                        <li>Backend data structure mismatch</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FarmerMessages;
