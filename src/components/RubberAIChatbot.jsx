import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RubberAIChatbot.css';
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
  RefreshCw,
  Leaf,
  TreePine,
  Droplets,
  Bug,
  DollarSign,
  FileText,
  Lightbulb,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const RubberAIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "🌱 Hello! I'm your Rubber Plantation AI Assistant.\n\nI specialize in:\n• Land preparation and planting\n• Irrigation and fertilization\n• Pest and disease management\n• Harvesting techniques\n• Market information\n• Government schemes\n\nChoose a topic above or ask me anything about rubber farming!",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showTopicQuestions, setShowTopicQuestions] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Gemini API configuration
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  // Rubber plantation context and system prompt
  const SYSTEM_CONTEXT = `You are a specialized AI assistant for rubber plantation farming. You have extensive knowledge about:

1. Land Preparation and Planting Techniques
2. Ideal Climate and Soil Conditions
3. Irrigation and Fertilization Practices
4. Pest and Disease Identification and Management
5. Harvesting and Latex Collection Methods
6. Post-Harvest Handling and Storage
7. Market Prices and Selling Options
8. Government Subsidies or Schemes
9. Organic vs. Conventional Rubber Farming
10. Sustainability and Environmental Impact

Guidelines for responses:
- Provide practical, actionable advice
- Use simple, farmer-friendly language
- Include specific measurements, timings, and procedures when relevant
- Mention safety precautions when discussing chemicals or equipment
- Suggest cost-effective solutions
- Consider both small-scale and large-scale farming contexts
- Include information about Indian rubber farming practices when relevant
- Be encouraging and supportive to farmers

Always respond in a helpful, professional manner. If asked about topics outside rubber farming, politely redirect to rubber plantation topics.`;

  // Organized topic-based questions
  const topicQuestions = {
    "Land Preparation & Planting": {
      icon: TreePine,
      color: "green",
      questions: [
        "How to prepare land for rubber planting?",
        "What is the ideal spacing between rubber trees?",
        "Best time of year to plant rubber seedlings?",
        "Soil preparation techniques for rubber cultivation?",
        "How to select quality rubber seedlings?",
        "Land clearing methods for rubber plantation?",
        "Drainage requirements for rubber farms?",
        "Slope considerations for rubber planting?"
      ]
    },
    "Irrigation & Fertilization": {
      icon: Droplets,
      color: "blue",
      questions: [
        "Best irrigation practices for rubber trees?",
        "Water requirements for different growth stages?",
        "Fertilizer schedule for young rubber plants?",
        "Organic fertilizer options for rubber trees?",
        "NPK ratio recommendations for rubber cultivation?",
        "Drip irrigation setup for rubber plantation?",
        "Seasonal fertilization calendar?",
        "Micronutrient deficiency symptoms in rubber trees?"
      ]
    },
    "Pest & Disease Management": {
      icon: Bug,
      color: "red",
      questions: [
        "Common rubber tree diseases and treatment?",
        "How to identify pink disease in rubber trees?",
        "Pest control methods for rubber trees?",
        "Organic pest management strategies?",
        "Fungal disease prevention in rubber plantation?",
        "Insect pest identification guide?",
        "Integrated pest management for rubber?",
        "Chemical spray schedule for disease control?"
      ]
    },
    "Harvesting Techniques": {
      icon: Leaf,
      color: "amber",
      questions: [
        "When is the best time to harvest latex?",
        "Proper tapping techniques for rubber trees?",
        "How often should rubber trees be tapped?",
        "Latex collection and storage methods?",
        "Tapping panel management practices?",
        "Yield optimization techniques?",
        "Seasonal tapping considerations?",
        "Equipment needed for latex harvesting?"
      ]
    },
    "Market Information": {
      icon: DollarSign,
      color: "emerald",
      questions: [
        "Current rubber market prices and trends?",
        "Best time to sell rubber in the market?",
        "Quality grading standards for rubber?",
        "Export opportunities for rubber farmers?",
        "Price forecasting for rubber commodity?",
        "Value addition techniques for rubber?",
        "Marketing channels for small rubber farmers?",
        "Contract farming opportunities in rubber?"
      ]
    },
    "Government Schemes": {
      icon: FileText,
      color: "purple",
      questions: [
        "Government subsidies for rubber farmers?",
        "Rubber plantation development schemes?",
        "Financial assistance for new rubber farmers?",
        "Insurance schemes for rubber cultivation?",
        "Technology adoption support programs?",
        "Training programs for rubber farmers?",
        "Loan facilities for rubber plantation?",
        "Export promotion schemes for rubber?"
      ]
    }
  };

  // Quick access suggestions (top 3 from each category)
  const quickSuggestions = [
    { icon: TreePine, text: "Land preparation techniques", category: "Land Prep", topicKey: "Land Preparation & Planting" },
    { icon: Droplets, text: "Irrigation best practices", category: "Irrigation", topicKey: "Irrigation & Fertilization" },
    { icon: Bug, text: "Disease management", category: "Disease", topicKey: "Pest & Disease Management" },
    { icon: Leaf, text: "Harvesting techniques", category: "Harvesting", topicKey: "Harvesting Techniques" },
    { icon: DollarSign, text: "Market information", category: "Market", topicKey: "Market Information" },
    { icon: FileText, text: "Government schemes", category: "Schemes", topicKey: "Government Schemes" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Attempt local knowledge first for critical topics
  const callGeminiAPI = async (userMessage) => {
    try {
      // Local knowledge fallback for schemes/subsidies
      try {
        const { getSchemeAnswer, getSchemeContext } = await import('../services/aiKnowledge.js');
        const local = getSchemeAnswer(userMessage);
        if (local) {
          return local; // Serve authoritative local content immediately
        }
      } catch (_) {
        // ignore local import errors and continue with API
      }

      // Check if API key is available
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
      }

      // Optionally enrich with local context (if relevant keywords detected)
      let enrichedPrompt = `${SYSTEM_CONTEXT}\n\nUser Question: ${userMessage}`;
      try {
        const { getSchemeContext } = await import('../services/aiKnowledge.js');
        const ctx = getSchemeContext(userMessage);
        if (ctx) {
          enrichedPrompt += `\n\nUse the following verified Kerala schemes context to answer precisely. If quoting amounts/names, align with this context.\n---\n${ctx}\n---`;
        }
      } catch (_) {}

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${enrichedPrompt}\n\nPlease provide a helpful, practical response about rubber plantation farming. Include specific steps, measurements, or recommendations where applicable.`
            }]
          }],
          generationConfig: {
            temperature: 0.5,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let message = 'Unknown error';
        try {
          const errorData = JSON.parse(errorText);
          message = errorData.error?.message || errorText;
        } catch (_) {
          message = errorText;
        }
        // Map common issues to clearer hints
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Gemini authentication failed. Check VITE_GEMINI_API_KEY and model access. Details: ${message}`);
        }
        if (response.status === 404) {
          throw new Error(`Gemini model not found. Current model: ${GEMINI_MODEL}. Update VITE_GEMINI_MODEL or use a valid model.`);
        }
        throw new Error(`Gemini API request failed: ${response.status} - ${message}`);
      }

      const data = await response.json();

      // Newer responses may return text at candidates[0].content.parts[0].text or candidates[0].content[0].text
      const candidate = data.candidates?.[0];
      const partText = candidate?.content?.parts?.[0]?.text || candidate?.content?.[0]?.text;
      if (partText) {
        return partText;
      }
      if (candidate?.finishReason === 'SAFETY') {
        return "I understand you're asking about rubber farming, but I need to be careful with my response. Could you please rephrase your question or ask about a specific aspect of rubber cultivation like planting techniques, disease management, or harvesting methods?";
      }
      throw new Error('Invalid response format from Gemini API');
    } catch (error) {
      console.error('Gemini API Error:', error);

      // Provide more specific error messages with hard fallback for schemes
      try {
        const { getSchemeAnswer } = await import('../services/aiKnowledge.js');
        const local = getSchemeAnswer(userMessage);
        if (local) return local;
      } catch (_) {}

      if (error.message.includes('API key')) {
        return "I'm sorry, but the AI service is not properly configured. Please contact support for assistance with rubber farming questions.";
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        return "I'm currently experiencing high demand. Please try again in a few minutes. In the meantime, I can suggest checking our rubber farming guides or contacting our agricultural experts directly.";
      } else {
        return "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment, or feel free to ask about specific rubber farming topics like:\n\n• Land preparation and planting\n• Irrigation and fertilization\n• Pest and disease management\n• Harvesting techniques\n• Market information\n• Government schemes";
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);

    // Get AI response
    const aiResponse = await callGeminiAPI(userMessage);

    // Add AI response
    const newAIMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newAIMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.topicKey) {
      // Show topic questions instead of setting input
      setSelectedTopic(suggestion.topicKey);
      setShowTopicQuestions(true);
    } else {
      setInputMessage(suggestion.text);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleTopicQuestionClick = (question) => {
    setInputMessage(question);
    setShowTopicQuestions(false);
    setSelectedTopic(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleBackToTopics = () => {
    setShowTopicQuestions(false);
    setSelectedTopic(null);
  };

  const getColorClasses = (color) => {
    const colorMap = {
      green: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
      red: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
      amber: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
      emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: "🌱 Hello! I'm your Rubber Plantation AI Assistant.\n\nI specialize in:\n• Land preparation and planting\n• Irrigation and fertilization\n• Pest and disease management\n• Harvesting techniques\n• Market information\n• Government schemes\n\nChoose a topic above or ask me anything about rubber farming!",
        timestamp: new Date()
      }
    ]);
    setShowTopicQuestions(false);
    setSelectedTopic(null);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group chatbot-button animate-pulse-green"
          >
            <MessageCircle className="h-6 w-6" />
            <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              AI
            </div>
            <div className="absolute bottom-full right-0 mb-2 bg-black text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Ask Rubber Farming Questions
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '600px'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200"
            style={{ width: '400px', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Rubber AI Assistant</h3>
                  <p className="text-xs opacity-90">Specialized in rubber farming</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={clearChat}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Topic Selection */}
                <div className="p-3 bg-gray-50 border-b">
                  {!showTopicQuestions ? (
                    <>
                      <p className="text-xs text-gray-600 mb-2 flex items-center">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Choose a topic to explore:
                      </p>
                      <div className="grid grid-cols-2 gap-2 topic-grid">
                        {quickSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="flex items-center space-x-2 bg-white text-xs px-3 py-2 rounded-lg border hover:bg-green-50 hover:border-green-300 transition-colors quick-suggestion"
                          >
                            <suggestion.icon className="h-4 w-4 text-green-600" />
                            <span className="truncate">{suggestion.category}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="topic-questions-list">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 flex items-center">
                          {selectedTopic && React.createElement(topicQuestions[selectedTopic].icon, { className: "h-3 w-3 mr-1" })}
                          {selectedTopic} Questions:
                        </p>
                        <button
                          onClick={handleBackToTopics}
                          className="text-xs text-green-600 hover:text-green-700 flex items-center space-x-1 transition-colors"
                        >
                          <ArrowRight className="h-3 w-3 rotate-180" />
                          <span>Back</span>
                        </button>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 topic-questions-scroll">
                        {selectedTopic && topicQuestions[selectedTopic]?.questions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleTopicQuestionClick(question)}
                            className={`w-full text-left text-xs px-2 py-1.5 rounded border transition-colors topic-question ${getColorClasses(topicQuestions[selectedTopic].color)}`}
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages" style={{ maxHeight: '400px' }}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {message.type === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div className={`p-3 rounded-2xl ${
                          message.type === 'user' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="p-2 rounded-full bg-gray-200">
                          <Bot className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-2xl">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about rubber farming..."
                      className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Powered by Gemini AI • Specialized for rubber farming
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RubberAIChatbot;