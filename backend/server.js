require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load models
require('./models/Register');
require('./models/TappingRequest');
require('./models/TrainingEnrollment');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const staffRoutes = require('./routes/staffRoutes');
const treeLotRoutes = require('./routes/treeLots');
const bidRoutes = require('./routes/bids');
const messageRoutes = require('./routes/messages');
const adminNotificationRoutes = require('./routes/adminNotifications');
const tappingRequestRoutes = require('./routes/tappingRequests');
const availableTappersRoutes = require('./routes/availableTappers');
const tappingSchedulesRoutes = require('./routes/tappingSchedules');
const trainingEnrollmentRoutes = require('./routes/trainingEnrollment');
console.log('🔍 Tapping schedules routes object:', typeof tappingSchedulesRoutes);
console.log('🔍 Tapping schedules routes stack length:', tappingSchedulesRoutes?.stack?.length);
const cors = require('cors');

const app = express();

// Database connection
connectDB();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman, file://)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:3000'
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow file:// protocol for testing
    if (origin && origin.startsWith('file://')) {
      return callback(null, true);
    }

    return callback(null, true); // Allow all origins for development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Increase body size limit to handle profile images (base64 encoded)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  // Log ALL requests to see what's happening
  console.log(`🌐 ${req.method} ${req.url} - ${new Date().toISOString()}`);

  if (req.url.includes('/api/auth/login') || (req.method === 'PUT' && req.url.includes('/api/users/'))) {
    console.log('📋 Origin:', req.headers.origin);
    console.log('📋 User-Agent:', req.headers['user-agent']);
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
console.log('🔗 Registering routes...');

// Basic health check route (test if routes work at all)
app.get('/api/health-check', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});
console.log('✅ Health check route registered');

// Direct training routes (added first to avoid conflicts)
app.get('/api/training/direct-test', (req, res) => {
  res.json({
    success: true,
    message: 'Direct training route working!',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/training/direct-demo-enroll', async (req, res) => {
  try {
    const TrainingEnrollment = require('./models/TrainingEnrollment');

    const enrollmentData = {
      userId: req.body.userId,
      moduleId: req.body.moduleId,
      moduleTitle: req.body.moduleTitle,
      moduleLevel: req.body.moduleLevel,
      paymentAmount: req.body.paymentAmount,
      paymentMethod: req.body.paymentMethod || 'stripe',
      paymentStatus: 'completed',
      paymentId: req.body.paymentId,
      userDetails: req.body.userDetails,
      progress: {
        completedLessons: [],
        totalLessons: 0,
        progressPercentage: 0,
        lastAccessedDate: new Date()
      }
    };

    const enrollment = new TrainingEnrollment(enrollmentData);
    await enrollment.save();

    res.json({
      success: true,
      message: 'Direct demo enrollment successful',
      enrollmentId: enrollment._id
    });
  } catch (error) {
    console.error('Direct demo enrollment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Direct demo enrollment failed'
    });
  }
});

app.get('/api/training/direct-user/:userId', async (req, res) => {
  try {
    const TrainingEnrollment = require('./models/TrainingEnrollment');
    const { userId } = req.params;

    const enrollments = await TrainingEnrollment.find({
      userId,
      isActive: true
    }).sort({ enrollmentDate: -1 });

    res.json({
      success: true,
      enrollments: enrollments.map(enrollment => ({
        id: enrollment._id,
        moduleId: enrollment.moduleId,
        moduleTitle: enrollment.moduleTitle,
        moduleLevel: enrollment.moduleLevel,
        paymentAmount: enrollment.paymentAmount,
        paymentMethod: enrollment.paymentMethod,
        paymentStatus: enrollment.paymentStatus,
        enrollmentDate: enrollment.enrollmentDate,
        progress: enrollment.progress,
        certificateIssued: enrollment.certificateIssued,
        certificateIssuedDate: enrollment.certificateIssuedDate
      }))
    });
  } catch (error) {
    console.error('Direct get user enrollments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user enrollments'
    });
  }
});

console.log('✅ Direct training routes registered');

app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered');
app.use('/api/users', userRoutes);
console.log('✅ User routes registered');
app.use('/api/staff', staffRoutes);
console.log('✅ Staff routes registered');
app.use('/api/tree-lots', treeLotRoutes);
console.log('✅ Tree lot routes registered');
app.use('/api/bids', bidRoutes);
console.log('✅ Bid routes registered');
app.use('/api/messages', messageRoutes);
console.log('✅ Message routes registered');
app.use('/api/admin/notifications', adminNotificationRoutes);
console.log('✅ Admin notification routes registered');

// Debug: Check if tappingRequestRoutes is loaded correctly
console.log('🔍 Tapping request routes object:', typeof tappingRequestRoutes);
console.log('🔍 Tapping request routes stack length:', tappingRequestRoutes?.stack?.length || 'undefined');

// Add request logging middleware specifically for tapping requests
// Debug middleware for farmer requests
app.use('/api/farmer-requests', (req, res, next) => {
  console.log(`🌐 FARMER REQUEST: ${req.method} ${req.originalUrl}`);
  console.log('📋 Headers:', req.headers.origin);
  console.log('📋 Body:', req.body);
  next();
});

// Tapping schedules route (moved up to avoid conflicts)
app.use('/api/tapping-schedules', tappingSchedulesRoutes);
console.log('✅ Tapping schedules routes registered at /api/tapping-schedules');

app.use('/api/farmer-requests', tappingRequestRoutes);
console.log('✅ Tapping request routes registered at /api/farmer-requests');

// Available tappers route (separate to avoid conflicts)
app.use('/api/available-tappers', availableTappersRoutes);
console.log('✅ Available tappers routes registered at /api/available-tappers');

// Training enrollment routes
app.use('/api/training', trainingEnrollmentRoutes);
console.log('✅ Training enrollment routes registered at /api/training');

// Debug: List all registered routes
console.log('🔍 Registered training routes:');
trainingEnrollmentRoutes.stack.forEach((layer) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
    console.log(`  ${methods} /api/training${layer.route.path}`);
  }
});

// Test route directly in server.js
app.get('/api/farmer-requests/server-test', (req, res) => {
  res.json({ message: 'Direct server route working!' });
});



// Direct test route for tapping schedules
app.get('/api/tapping-schedules/direct-test', (req, res) => {
  console.log('🎯 Direct tapping schedules test route hit!');
  res.json({ message: 'Direct tapping schedules route working!' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Test staff route directly
app.get('/api/staff/direct-test', (req, res) => {
  res.json({ message: 'Direct staff route works!' });
});

// Test tapping requests route directly
app.get('/api/tapping-requests/direct-test', (req, res) => {
  res.json({ message: 'Direct tapping requests route works!' });
});

// Test with different path
app.get('/api/tapping-test', (req, res) => {
  res.json({ message: 'Alternative tapping test route works!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB Collection: Register`);

  // Test email configuration on startup
  const { testEmailConfig } = require('./controllers/authController');
  if (testEmailConfig) {
    await testEmailConfig();
  }
});