# API Configuration Guide

## 🔧 **Fix API Endpoint Issues**

### **Problem:**
The frontend is calling `localhost:5174` (frontend port) instead of your backend port.

### **Solution:**

#### **Option 1: Set Environment Variable**
Create a `.env` file in your `RubberEco` folder:

```env
REACT_APP_API_URL=http://localhost:5000
```

#### **Option 2: Update Vite Config**
In your `vite.config.js`, add proxy configuration:

```javascript
export default defineConfig({
  // ... other config
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

#### **Option 3: Check Your Backend Port**
Make sure your backend is running on port 5000. If it's on a different port, update the environment variable accordingly.

## 🚀 **Quick Fix Steps:**

1. **Create `.env` file** in `RubberEco` folder:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

2. **Restart your frontend server**:
   ```bash
   npm run dev
   ```

3. **Start your backend server**:
   ```bash
   cd backend
   npm start
   ```

4. **Test the messaging system** - it should now call the correct backend URLs.

## 🔍 **Verify Backend is Running:**

Test your backend API directly:
```bash
curl http://localhost:5000/api/bids
```

## 📊 **Expected Behavior After Fix:**

- ✅ API calls go to `localhost:5000` instead of `localhost:5174`
- ✅ Conversations load from real database data
- ✅ Messages can be sent and stored
- ✅ WebSocket errors are expected (backend WebSocket server not implemented)
- ✅ System falls back to polling mode gracefully

## 🐛 **If Still Getting 404 Errors:**

1. **Check backend routes** are properly mounted in `server.js`
2. **Verify message routes** are imported correctly
3. **Check backend console** for any startup errors
4. **Test API endpoints** directly with curl or Postman

This should resolve the API endpoint issues you're experiencing!



