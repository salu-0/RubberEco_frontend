const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
// const passport = require('passport'); // Temporarily disabled for debugging
const {
  registerUser,
  loginUser,
  googleAuthCallback,
  handleGoogleAuth,
  forgotPassword,
  resetPassword,
  testEmailConfig,
  sendTestEmail
} = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// GET /api/auth/test-email - Test email configuration
router.get('/test-email', async (req, res) => {
  try {
    const isValid = await testEmailConfig();
    res.json({
      success: true,
      emailConfigValid: isValid,
      message: isValid ? 'Email configuration is working' : 'Email configuration failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing email configuration',
      error: error.message
    });
  }
});

// POST /api/auth/send-test-email - Send a test email
router.post('/send-test-email', sendTestEmail);

// Google OAuth Routes (temporarily disabled for debugging)
// router.get('/google', (req, res, next) => {
//   passport.authenticate('google', {
//     scope: ['profile', 'email'],
//     prompt: 'select_account',
//     state: req.query.redirect || '/home' // Store redirect URL
//   })(req, res, next);
// });

// router.get('/google/callback',
//   passport.authenticate('google', {
//     session: false,
//     failureRedirect: '/login?error=google_auth_failed'
//   }),
//   googleAuthCallback
// );

// Alternative API endpoint for mobile apps
router.get('/google/api', handleGoogleAuth, googleAuthCallback);

// @route   POST /api/auth/register-broker
// @desc    Register a new broker
// @access  Public
router.post('/register-broker', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      location,
      bio,
      brokerProfile
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !location || !bio) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate broker-specific fields
    if (!brokerProfile || !brokerProfile.licenseNumber || !brokerProfile.experience ||
        !brokerProfile.specialization || brokerProfile.specialization.length === 0 ||
        !brokerProfile.companyName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required broker information'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if license number is already registered
    const existingBroker = await User.findOne({
      'brokerProfile.licenseNumber': brokerProfile.licenseNumber
    });
    if (existingBroker) {
      return res.status(400).json({
        success: false,
        message: 'Broker with this license number already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new broker user
    const newBroker = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      location: location.trim(),
      bio: bio.trim(),
      role: 'broker',
      brokerProfile: {
        licenseNumber: brokerProfile.licenseNumber.trim(),
        experience: brokerProfile.experience,
        specialization: brokerProfile.specialization,
        companyName: brokerProfile.companyName.trim(),
        companyAddress: brokerProfile.companyAddress?.trim() || '',
        education: brokerProfile.education?.trim() || '',
        previousWork: brokerProfile.previousWork?.trim() || '',
        verificationStatus: 'pending'
      }
    });

    await newBroker.save();

    // Send verification email (optional)
    try {
      const { sendWelcomeEmail } = require('../controllers/authController');
      await sendWelcomeEmail(newBroker.email, newBroker.name, 'broker');
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Broker registration successful! Your account is pending verification.',
      data: {
        id: newBroker._id,
        name: newBroker.name,
        email: newBroker.email,
        role: newBroker.role,
        verificationStatus: newBroker.brokerProfile.verificationStatus
      }
    });

  } catch (error) {
    console.error('Broker registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

module.exports = router;