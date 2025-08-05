const express = require('express');
const router = express.Router();
const {
  enrollInTraining,
  getUserEnrollments,
  getModuleEnrollments,
  checkEnrollmentStatus,
  updateProgress,
  getAllEnrollments,
  getEnrollmentStats
} = require('../controllers/trainingEnrollmentController');
const { protect: verifyToken } = require('../middlewares/auth');

// POST /api/training/enroll - Enroll user in a training module
router.post('/enroll', verifyToken, enrollInTraining);

// GET /api/training/user/:userId - Get all enrollments for a user
router.get('/user/:userId', verifyToken, getUserEnrollments);

// GET /api/training/module/:moduleId - Get all enrollments for a module
router.get('/module/:moduleId', verifyToken, getModuleEnrollments);

// GET /api/training/check/:userId/:moduleId - Check if user is enrolled in module
router.get('/check/:userId/:moduleId', verifyToken, checkEnrollmentStatus);

// PUT /api/training/progress/:enrollmentId - Update progress for an enrollment
router.put('/progress/:enrollmentId', verifyToken, updateProgress);

// GET /api/training/all - Get all enrollments (admin only)
router.get('/all', verifyToken, getAllEnrollments);

// GET /api/training/stats - Get enrollment statistics (admin only)
router.get('/stats', verifyToken, getEnrollmentStats);

// Test route to verify training routes are working (no auth required)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Training routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Demo enrollment route (no auth required for testing)
router.post('/demo-enroll', async (req, res) => {
  try {
    const TrainingEnrollment = require('../models/TrainingEnrollment');

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
      message: 'Demo enrollment successful',
      enrollmentId: enrollment._id
    });
  } catch (error) {
    console.error('Demo enrollment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Demo enrollment failed'
    });
  }
});

module.exports = router;
