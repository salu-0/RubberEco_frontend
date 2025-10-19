# Messaging API Documentation

This document outlines the API endpoints required for the broker-farmer messaging system.

## Base URL
```
https://rubbereco-backend.onrender.com/api
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Get Conversations
**GET** `/messages/conversations`

Returns all conversations for the authenticated broker.

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv_123",
      "farmerId": "farmer_456",
      "farmerName": "John Doe",
      "farmerAvatar": "https://example.com/avatar.jpg",
      "lotId": "RT001",
      "lotLocation": "Kottayam, Kerala",
      "lotTreeCount": 150,
      "lotStatus": "active",
      "lastMessage": "Thank you for your interest...",
      "lastMessageTime": "2024-01-25T16:30:00Z",
      "unreadCount": 2,
      "farmerOnline": true
    }
  ]
}
```

### 2. Get Messages
**GET** `/messages/conversations/{conversationId}/messages`

Returns messages for a specific conversation.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg_789",
      "senderId": "farmer_456",
      "senderType": "farmer",
      "content": "Hello! I see you're interested...",
      "timestamp": "2024-01-25T14:00:00Z",
      "status": "read",
      "replyTo": null
    }
  ]
}
```

### 3. Send Message
**POST** `/messages/send`

Send a new message in a conversation.

**Request Body:**
```json
{
  "conversationId": "conv_123",
  "content": "Hello, I'm interested in your lot",
  "replyTo": "msg_789",
  "attachments": []
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "msg_790",
    "senderId": "broker_123",
    "senderType": "broker",
    "content": "Hello, I'm interested in your lot",
    "timestamp": "2024-01-25T14:15:00Z",
    "status": "sent",
    "replyTo": "msg_789"
  }
}
```

### 4. Create Conversation
**POST** `/messages/conversations`

Create a new conversation with a farmer.

**Request Body:**
```json
{
  "farmerId": "farmer_456",
  "lotId": "RT001",
  "initialMessage": "Hello, I'm interested in your rubber plantation"
}
```

**Response:**
```json
{
  "success": true,
  "conversation": {
    "id": "conv_124",
    "farmerId": "farmer_456",
    "farmerName": "John Doe",
    "lotId": "RT001",
    "createdAt": "2024-01-25T14:00:00Z"
  }
}
```

### 5. Mark Messages as Read
**POST** `/messages/mark-read`

Mark specific messages as read.

**Request Body:**
```json
{
  "conversationId": "conv_123",
  "messageIds": ["msg_789", "msg_790"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

### 6. Upload Attachment
**POST** `/messages/upload`

Upload a file attachment for messages.

**Request:** Multipart form data with `file` field

**Response:**
```json
{
  "success": true,
  "attachment": {
    "id": "att_123",
    "filename": "document.pdf",
    "url": "https://example.com/uploads/document.pdf",
    "type": "application/pdf",
    "size": 1024000
  }
}
```

### 7. Get Farmer Profile
**GET** `/farmers/{farmerId}`

Get farmer profile information.

**Response:**
```json
{
  "success": true,
  "farmer": {
    "id": "farmer_456",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "location": "Kottayam, Kerala",
    "avatar": "https://example.com/avatar.jpg",
    "isOnline": true
  }
}
```

### 8. Get Lot Details
**GET** `/tree-lots/{lotId}`

Get detailed information about a tree lot.

**Response:**
```json
{
  "success": true,
  "lot": {
    "id": "RT001",
    "farmerId": "farmer_456",
    "location": "Kottayam, Kerala",
    "treeCount": 150,
    "status": "active",
    "description": "Prime rubber plantation...",
    "images": ["https://example.com/lot1.jpg"]
  }
}
```

### 9. Search Conversations
**GET** `/messages/search`

Search conversations by farmer name, lot ID, or location.

**Query Parameters:**
- `q`: Search query

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv_123",
      "farmerName": "John Doe",
      "lotId": "RT001",
      "lastMessage": "Thank you for your interest...",
      "relevanceScore": 0.95
    }
  ]
}
```

### 10. Delete Message
**DELETE** `/messages/{messageId}`

Delete a specific message.

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

### 11. Get Unread Count
**GET** `/messages/unread-count`

Get total unread message count for the broker.

**Response:**
```json
{
  "success": true,
  "count": 5
}
```

## WebSocket Events

### Connection
Connect to WebSocket at: `wss://rubbereco-backend.onrender.com/ws?token=<token>`

### Event Types

#### 1. New Message
```json
{
  "type": "new_message",
  "payload": {
    "id": "msg_790",
    "conversationId": "conv_123",
    "senderId": "farmer_456",
    "senderType": "farmer",
    "content": "Hello! How are you?",
    "timestamp": "2024-01-25T14:15:00Z",
    "status": "sent"
  }
}
```

#### 2. Message Status Update
```json
{
  "type": "message_status",
  "payload": {
    "messageId": "msg_790",
    "status": "read"
  }
}
```

#### 3. Typing Indicator
```json
{
  "type": "typing",
  "payload": {
    "conversationId": "conv_123",
    "userId": "farmer_456",
    "isTyping": true
  }
}
```

#### 4. User Online/Offline
```json
{
  "type": "user_online",
  "payload": {
    "userId": "farmer_456",
    "timestamp": "2024-01-25T14:15:00Z"
  }
}
```

#### 5. Conversation Updated
```json
{
  "type": "conversation_updated",
  "payload": {
    "id": "conv_123",
    "lastMessage": "New message content",
    "lastMessageTime": "2024-01-25T14:15:00Z",
    "unreadCount": 3
  }
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "content",
      "message": "Message content is required"
    }
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- Message sending: 60 messages per minute per user
- File uploads: 10 uploads per minute per user
- API calls: 1000 requests per hour per user
