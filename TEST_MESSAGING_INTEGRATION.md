# Testing Real Data Messaging Integration

## 🧪 **Test Plan**

### **Prerequisites:**
1. Backend server running with new message routes
2. MongoDB database with sample bids, land registrations, and user data
3. Frontend updated with real data integration
4. Valid broker and farmer accounts

## 🔍 **Test Steps**

### **Step 1: Backend API Testing**

#### **Test Broker Bids Endpoint:**
```bash
# Get broker's bids
curl -X GET "http://localhost:5000/api/bids/broker/YOUR_BROKER_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "bids": [
    {
      "_id": "68c5b0268a3bf7f2a52dff20",
      "lotId": "RT002",
      "bidderId": "68bf73f65c5757230a4a88f6",
      "amount": 201000,
      "status": "active",
      "createdAt": "2025-09-13T17:55:50.527+00:00"
    }
  ]
}
```

#### **Test Message Endpoints:**
```bash
# Get broker conversations
curl -X GET "http://localhost:5000/api/messages/broker/YOUR_BROKER_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Send a message
curl -X POST "http://localhost:5000/api/messages/send" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "BID_ID",
    "content": "Hello! I am interested in your rubber plantation.",
    "senderType": "broker"
  }'
```

### **Step 2: Frontend Testing**

#### **Broker Dashboard Test:**
1. **Login** as a broker who has placed bids
2. **Navigate** to Messages tab
3. **Verify** conversations list shows real farmers
4. **Check** bid details are accurate (amounts, lot info)
5. **Send** a test message
6. **Verify** message appears in chat

#### **Expected UI Behavior:**
- ✅ Conversations list shows real farmers from database
- ✅ Bid amounts match database values
- ✅ Lot information is accurate
- ✅ Messages can be sent and received
- ✅ Real-time updates work (or polling fallback)

### **Step 3: Database Verification**

#### **Check Messages Collection:**
```javascript
// In MongoDB Compass or shell
db.messages.find().pretty()

// Expected structure:
{
  "_id": ObjectId("..."),
  "conversationId": ObjectId("68c5b0268a3bf7f2a52dff20"), // Bid ID
  "senderId": ObjectId("..."), // User ID
  "senderType": "broker",
  "content": "Hello! I am interested in your rubber plantation.",
  "status": "sent",
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **1. No Conversations Showing:**
- **Check**: Broker has placed bids in database
- **Check**: Bids are linked to valid lots
- **Check**: Lots have valid owners (farmers)
- **Check**: API endpoints are working

#### **2. API Errors:**
- **Check**: JWT token is valid
- **Check**: User ID is correct
- **Check**: Database connection is working
- **Check**: Routes are properly mounted

#### **3. WebSocket Errors:**
- **Expected**: WebSocket will fail (backend not implemented)
- **Expected**: System falls back to polling mode
- **Check**: Polling is working (checking every 5 seconds)

### **Debug Console Logs:**
Look for these in browser console:
```
✅ "Messages component mounted, loading conversations..."
✅ "Loading conversations from real data: [array]"
✅ "Loaded conversations from real data: [array]"
⚠️ "WebSocket connection failed, using polling fallback" (expected)
✅ "Using fallback mock messages for conversation: [id]"
```

## 📊 **Test Data Requirements**

### **Sample Database Data Needed:**

#### **Bids Collection:**
```javascript
{
  "_id": ObjectId("68c5b0268a3bf7f2a52dff20"),
  "lotId": "RT002",
  "bidderId": ObjectId("68bf73f65c5757230a4a88f6"), // Broker ID
  "amount": 201000,
  "status": "active",
  "createdAt": "2025-09-13T17:55:50.527+00:00"
}
```

#### **Land Registrations Collection:**
```javascript
{
  "_id": ObjectId("..."),
  "lotId": "RT002",
  "ownerId": ObjectId("..."), // Farmer ID
  "location": "Kottayam, Kerala",
  "numberOfTrees": 150,
  "status": "active"
}
```

#### **Register Collection:**
```javascript
{
  "_id": ObjectId("..."), // Farmer ID
  "fullName": "John Doe",
  "email": "farmer@example.com",
  "userType": "farmer"
}
```

## ✅ **Success Criteria**

### **Backend Tests:**
- ✅ API endpoints return correct data
- ✅ Messages are stored in database
- ✅ Authentication works
- ✅ Error handling works

### **Frontend Tests:**
- ✅ Conversations load from real data
- ✅ Bid details are accurate
- ✅ Messages can be sent
- ✅ UI is responsive
- ✅ Fallback systems work

### **Integration Tests:**
- ✅ Broker sees conversations with real farmers
- ✅ Bid amounts match database
- ✅ Lot information is accurate
- ✅ Messages are linked to correct bids
- ✅ Real-time updates work (or polling)

## 🚀 **Next Steps After Testing**

1. **Fix any issues** found during testing
2. **Deploy** updated backend with message routes
3. **Deploy** updated frontend
4. **Monitor** system performance
5. **Add** farmer messaging interface
6. **Implement** WebSocket server for real-time updates

## 📞 **Support**

If you encounter issues:
1. Check browser console for errors
2. Check backend logs for API errors
3. Verify database data is correct
4. Test API endpoints directly
5. Check authentication tokens

This test plan ensures the messaging system works correctly with your real database data.
