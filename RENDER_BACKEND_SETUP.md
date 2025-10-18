# Backend & Frontend Deployment Configuration

## ✅ Production Deployment Complete!

Your application is now fully deployed and configured:

### Backend (Render)
**Production URL**: https://rubbereco-backend.onrender.com

**API Base URL**: https://rubbereco-backend.onrender.com/api

### Frontend (Vercel)
**Production URL**: https://rubber-eco-frontend.vercel.app

---

## Environment Configuration

### Frontend (.env file location: `d:\RubberEco\RubberEco\.env`)

```env
# Backend API Configuration
VITE_API_BASE_URL=https://rubbereco-backend.onrender.com/api
VITE_BACKEND_URL=https://rubbereco-backend.onrender.com
```

---

## What Was Changed

### 1. Frontend Environment Variables
**File**: `d:\RubberEco\RubberEco\.env`

**Changed from**:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
```

**Changed to**:
```env
VITE_API_BASE_URL=https://rubbereco-backend.onrender.com/api
VITE_BACKEND_URL=https://rubbereco-backend.onrender.com
```

### 2. Backend CORS Configuration
**File**: `d:\RubberEco\backend\server.js`

**Added Vercel frontend to allowed origins**:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  // ... other localhost origins
  'https://rubber-eco-frontend.vercel.app'  // ✅ Vercel production frontend
];
```

### 3. Updated .env.example
**File**: `d:\RubberEco\RubberEco\.env.example`

Added comments showing both local and production configurations.

---

## Important Notes

### 🔄 Restart Required
After changing environment variables, you **MUST restart your Vite development server**:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd d:\RubberEco\RubberEco
npm run dev
```

### 🌐 API Endpoints Now Point To:

All API calls in your application now use the Render backend:

- **Land Registration**: `https://rubbereco-backend.onrender.com/api/land-registration`
- **Tenancy Offerings**: `https://rubbereco-backend.onrender.com/api/tenancy-offerings`
- **User Authentication**: `https://rubbereco-backend.onrender.com/api/auth`
- **Staff Management**: `https://rubbereco-backend.onrender.com/api/staff`
- **Tapping Requests**: `https://rubbereco-backend.onrender.com/api/tapping-requests`
- **Nursery**: `https://rubbereco-backend.onrender.com/api/nursery`
- And all other endpoints...

### 🔐 CORS Configuration

Make sure your Render backend has CORS properly configured to accept requests from your frontend domain. 

In your `backend/server.js`, ensure you have:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',  // Local development
    'http://localhost:5174',
    'https://your-frontend-domain.com'  // Add your frontend domain
  ],
  credentials: true
}));
```

### ⚠️ Render Free Tier Limitations

If you're using Render's free tier:
- **Cold starts**: Backend sleeps after 15 minutes of inactivity
- **First request**: May take 30-60 seconds to wake up
- **Consider**: Keep-alive services or upgrade to paid tier for production

### 🧪 Testing the Configuration

Test if the backend is accessible:

```bash
# Test backend health
curl https://rubbereco-backend.onrender.com/health

# Test API endpoint
curl https://rubbereco-backend.onrender.com/api/health
```

### 📱 Frontend Components Updated

All these components now use the Render backend:

- ✅ `LandRegistration.jsx` - Land registration API calls
- ✅ `LandLeaseOffering.jsx` - Tenancy offering API calls
- ✅ `LandRegistrationVerification.jsx` - Admin verification API calls
- ✅ `Profile.jsx` - User profile API calls
- ✅ `Nursery.jsx` - Nursery booking API calls
- ✅ All other components using `import.meta.env.VITE_API_BASE_URL`

---

## Switching Between Local and Production

### For Local Development:
Edit `.env` and change back to localhost:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
```

### For Production:
Keep current settings:
```env
VITE_API_BASE_URL=https://rubbereco-backend.onrender.com/api
VITE_BACKEND_URL=https://rubbereco-backend.onrender.com
```

---

## Deployment Checklist

- [x] Backend deployed to Render
- [x] Frontend .env updated with Render URL
- [x] .env.example updated for reference
- [ ] Restart Vite dev server
- [ ] Test API connectivity
- [ ] Verify CORS configuration
- [ ] Test authentication flow
- [ ] Test all major features (land registration, offerings, etc.)
- [ ] Deploy frontend to hosting service (Vercel, Netlify, etc.)

---

## Troubleshooting

### Issue: "Network Error" or "Failed to fetch"
**Solution**: 
1. Check if backend is running: Visit https://rubbereco-backend.onrender.com
2. Verify CORS settings in backend
3. Check browser console for detailed error messages

### Issue: "401 Unauthorized" errors
**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Login again to get fresh token
3. Verify token is being sent in Authorization header

### Issue: Slow response times
**Solution**:
1. This is normal on Render free tier (cold starts)
2. Wait 30-60 seconds for first request
3. Consider implementing loading states in frontend
4. Consider upgrading to Render paid tier

### Issue: Environment variables not updating
**Solution**:
1. Restart Vite dev server completely
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## Next Steps

1. **Restart your frontend development server**:
   ```bash
   cd d:\RubberEco\RubberEco
   npm run dev
   ```

2. **Test the connection**:
   - Open your frontend
   - Try logging in
   - Test land registration
   - Test tenancy offerings
   - Check browser console for any errors

3. **Deploy frontend** (if not already done):
   - Vercel: `vercel deploy`
   - Netlify: `netlify deploy`
   - Or your preferred hosting service

4. **Update frontend domain in backend CORS** (if frontend is deployed)

---

## Support

If you encounter any issues:
1. Check Render logs: https://dashboard.render.com
2. Check browser console for errors
3. Verify all environment variables are correct
4. Ensure backend is awake and responding
