const express = require('express');
const router = express.Router();
const TappingRequest = require('../models/TappingRequest');
const Register = require('../models/Register');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send assignment notification email
const sendAssignmentNotification = async (farmerEmail, farmerName, requestId, tapperName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: farmerEmail,
      subject: '✅ Your Tapping Request Has Been Accepted - RubberEco',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Request Accepted!</h1>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #22c55e; margin-top: 0;">Dear ${farmerName},</h2>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Great news! Your tapping request <strong>#${requestId}</strong> has been <strong>verified and accepted</strong> by our team.
            </p>

            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #22c55e; margin-top: 0;">Assignment Details:</h3>
              <p style="margin: 5px 0;"><strong>Assigned Tapper:</strong> ${tapperName}</p>
              <p style="margin: 5px 0;"><strong>Request ID:</strong> #${requestId}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">Accepted & Assigned</span></p>
            </div>

            <h3 style="color: #333;">What happens next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Our assigned tapper will contact you within 24 hours</li>
              <li>They will coordinate the tapping schedule with you</li>
              <li>You can track the progress in your farmer dashboard</li>
              <li>Our team will monitor the service quality</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5174/profile" style="background-color: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View in Dashboard
              </a>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              If you have any questions, please contact us at support@rubbereco.com or call +91 9876543210.
            </p>

            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #999; font-size: 12px;">
                © 2024 RubberEco. All rights reserved.<br>
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Assignment notification email sent to:', farmerEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending assignment notification email:', error);
    return false;
  }
};
const { sendAdminNotificationEmail } = require('../utils/emailService');

// Test route to verify the router is working
router.get('/test', (req, res) => {
  console.log('🎯 Test route hit!');
  res.json({ message: 'Tapping request routes are working!' });
});

console.log('🔧 Tapping request routes file loaded successfully');

// POST /api/tapping-requests - Create a new tapping request
router.post('/', async (req, res) => {
  try {
    console.log('🚀 POST route hit! Creating new tapping request:', req.body);

    const {
      farmerId,
      farmerName,
      farmerEmail,
      farmerPhone,
      farmLocation,
      farmSize,
      numberOfTrees,
      soilType,
      tappingType,
      startDate,
      duration,
      preferredTime,
      urgency,
      budgetRange,
      specialRequirements,
      contactPreference,
      documents
    } = req.body;

    // Validate required fields
    console.log('🔍 Validating fields...');
    if (!farmerId || !farmerName || !farmerEmail || !farmerPhone ||
        !farmLocation || !farmSize || !numberOfTrees || !tappingType ||
        !startDate || !duration || !preferredTime || !contactPreference) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    console.log('✅ All required fields present');

    // Generate requestId manually
    console.log('🔢 About to generate requestId...');
    const count = await TappingRequest.countDocuments();
    const requestId = `TR${String(count + 1).padStart(6, '0')}`;
    console.log('🔢 Generated requestId:', requestId);

    // Create new tapping request
    const tappingRequest = new TappingRequest({
      requestId,
      farmerId,
      farmerName,
      farmerEmail,
      farmerPhone,
      farmLocation,
      farmSize,
      numberOfTrees,
      soilType,
      tappingType,
      startDate: new Date(startDate),
      duration,
      preferredTime,
      urgency: urgency || 'normal',
      budgetRange,
      specialRequirements,
      contactPreference,
      documents: documents || []
    });

    // Save to database
    const savedRequest = await tappingRequest.save();
    console.log('✅ Tapping request saved with ID:', savedRequest.requestId);

    // Send email notification to admin
    try {
      const notificationData = {
        type: 'tapper_request',
        title: 'New Tapper Request',
        message: `${farmerName} has requested tapping services for ${numberOfTrees} trees`,
        data: {
          requestId: savedRequest.requestId,
          farmerName,
          farmerEmail,
          farmerPhone,
          farmLocation,
          farmSize,
          numberOfTrees,
          tappingType,
          startDate,
          duration,
          urgency,
          preferredTime,
          budgetRange,
          specialRequirements,
          contactPreference,
          submittedAt: savedRequest.submittedAt.toISOString()
        }
      };

      const emailResult = await sendAdminNotificationEmail(notificationData);
      if (emailResult.success) {
        savedRequest.emailNotificationSent = true;
        await savedRequest.save();
        console.log('✅ Admin email notification sent for request:', savedRequest.requestId);
      }
    } catch (emailError) {
      console.log('⚠️ Failed to send admin email notification:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Tapping request submitted successfully',
      data: savedRequest
    });

  } catch (error) {
    console.error('❌ Error creating tapping request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tapping request',
      error: error.message
    });
  }
});

// GET /api/tapping-requests - Get all tapping requests (admin)
router.get('/', async (req, res) => {
  try {
    const { status, urgency, farmerId, page = 1, limit = 10 } = req.query;
    
    // Build query
    let query = {};
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (farmerId) query.farmerId = farmerId;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get requests with pagination (without populate to avoid schema issues)
    const requests = await TappingRequest.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await TappingRequest.countDocuments(query);

    console.log(`📋 Retrieved ${requests.length} tapping requests`);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: requests.length,
        totalRecords: total
      }
    });

  } catch (error) {
    console.error('❌ Error fetching tapping requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tapping requests',
      error: error.message
    });
  }
});

// GET /api/tapping-requests/farmer/:farmerId - Get requests by farmer
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;

    const requests = await TappingRequest.getByFarmer(farmerId);

    console.log(`📋 Retrieved ${requests.length} requests for farmer:`, farmerId);

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('❌ Error fetching farmer requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch farmer requests',
      error: error.message
    });
  }
});

// GET /api/tapping-requests/farmer/:farmerId/schedules - Get tapping schedules for farmer
router.get('/farmer/:farmerId/schedules', async (req, res) => {
  try {
    const { farmerId } = req.params;
    console.log('🗓️ Fetching tapping schedules for farmer:', farmerId);

    // Get assigned/accepted requests that can be converted to schedules
    const assignedRequests = await TappingRequest.find({
      farmerId: farmerId,
      status: { $in: ['assigned', 'accepted', 'in_progress', 'completed'] },
      assignedTapper: { $exists: true }
    })
    .sort({ startDate: -1 });

    // Convert requests to schedule format
    const schedules = assignedRequests.map(request => {
      const startDate = new Date(request.startDate);
      const durationDays = parseInt(request.duration) || 30;
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + durationDays);

      // Calculate progress
      const today = new Date();
      const totalDays = durationDays;
      let completedDays = 0;
      let status = 'upcoming';

      if (today >= startDate) {
        if (request.status === 'completed') {
          completedDays = totalDays;
          status = 'completed';
        } else if (request.status === 'in_progress') {
          completedDays = Math.min(Math.floor((today - startDate) / (1000 * 60 * 60 * 24)), totalDays);
          status = 'active';
        } else if (today <= endDate) {
          status = 'active';
        }
      }

      // Calculate next tapping date
      let nextTapping = null;
      if (status === 'active' && request.tappingType === 'daily') {
        nextTapping = new Date(today);
        nextTapping.setDate(today.getDate() + 1);
      } else if (status === 'active' && request.tappingType === 'alternate_day') {
        nextTapping = new Date(today);
        nextTapping.setDate(today.getDate() + 2);
      }

      return {
        id: request.requestId,
        requestId: request._id,
        tapperName: request.assignedTapper.tapperName,
        tapperPhone: request.assignedTapper.tapperPhone,
        tapperEmail: request.assignedTapper.tapperEmail,
        tapperRating: request.assignedTapper.tapperId?.rating || 4.5,
        farmLocation: request.farmLocation,
        numberOfTrees: request.numberOfTrees,
        scheduleType: request.tappingType,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        timeSlot: request.preferredTime,
        status: status,
        completedDays: completedDays,
        totalDays: totalDays,
        lastTapped: status === 'active' ? today.toISOString().split('T')[0] : null,
        nextTapping: nextTapping ? nextTapping.toISOString().split('T')[0] : null,
        notes: request.serviceDetails?.notes || `${request.tappingType} tapping schedule`,
        estimatedCost: request.serviceDetails?.estimatedCost,
        actualCost: request.serviceDetails?.actualCost,
        assignedAt: request.assignedTapper.assignedAt,
        urgency: request.urgency,
        budgetRange: request.budgetRange
      };
    });

    console.log(`📅 Generated ${schedules.length} schedules for farmer:`, farmerId);

    res.status(200).json({
      success: true,
      data: schedules
    });

  } catch (error) {
    console.error('❌ Error fetching tapping schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tapping schedules',
      error: error.message
    });
  }
});

// GET /api/tapping-requests/pending - Get pending requests for admin
router.get('/pending', async (req, res) => {
  try {
    console.log('🔍 Fetching pending requests...');

    // Simple query without populate to avoid schema issues
    const requests = await TappingRequest.find({
      status: { $in: ['submitted', 'under_review'] }
    }).sort({ urgency: -1, submittedAt: 1 });

    console.log(`📋 Retrieved ${requests.length} pending requests`);

    // Log first request for debugging
    if (requests.length > 0) {
      console.log('📋 Sample request:', {
        id: requests[0]._id,
        requestId: requests[0].requestId,
        farmerName: requests[0].farmerName,
        farmerEmail: requests[0].farmerEmail,
        status: requests[0].status,
        urgency: requests[0].urgency
      });
    }

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('❌ Error fetching pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests',
      error: error.message
    });
  }
});

// Get available tappers (registered users with role 'tapper' who are not currently assigned)
router.get('/available-tappers', async (req, res) => {
  try {
    console.log('🔍 Fetching available tappers...');

    // Get all registered tappers
    const tappers = await Register.find({
      role: 'tapper',
      status: { $ne: 'blocked' } // Exclude blocked tappers
    }).select('name email phone location experience rating profileImage createdAt');

    console.log(`📋 Found ${tappers.length} registered tappers`);

    // Get currently assigned tapper IDs from active tapping requests
    const activeTappingRequests = await TappingRequest.find({
      status: { $in: ['assigned', 'accepted', 'in_progress'] },
      assignedTapper: { $exists: true, $ne: null }
    }).select('assignedTapper');

    const assignedTapperIds = activeTappingRequests.map(req => req.assignedTapper?.toString()).filter(Boolean);
    console.log(`🔒 Found ${assignedTapperIds.length} assigned tappers`);

    // Filter out assigned tappers
    const availableTappers = tappers.filter(tapper =>
      !assignedTapperIds.includes(tapper._id.toString())
    );

    console.log(`✅ ${availableTappers.length} tappers available for assignment`);

    // Format the response with additional info
    const formattedTappers = availableTappers.map(tapper => ({
      id: tapper._id,
      name: tapper.name,
      email: tapper.email,
      phone: tapper.phone,
      location: tapper.location || 'Location not specified',
      experience: tapper.experience || 'Experience not specified',
      rating: tapper.rating || 4.0,
      profileImage: tapper.profileImage,
      joinedDate: tapper.createdAt,
      status: 'available'
    }));

    res.json({
      success: true,
      tappers: formattedTappers,
      count: formattedTappers.length
    });
  } catch (error) {
    console.error('❌ Error fetching available tappers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available tappers',
      error: error.message
    });
  }
});

// GET /api/tapping-requests/stats/summary - Get request statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await TappingRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      total: 0,
      submitted: 0,
      under_review: 0,
      assigned: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      summary[stat._id] = stat.count;
      summary.total += stat.count;
    });

    console.log('📊 Request statistics:', summary);

    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('❌ Error fetching request statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request statistics',
      error: error.message
    });
  }
});

// GET /api/tapping-requests/stats/farmer - Get farmer-specific statistics (using query parameter)
router.get('/stats/farmer', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Farmer email is required as query parameter'
      });
    }

    console.log('📊 Fetching statistics for farmer:', email);

    const stats = await TappingRequest.aggregate([
      {
        $match: { farmerEmail: email }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      total: 0,
      submitted: 0,
      under_review: 0,
      assigned: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      summary[stat._id] = stat.count;
      summary.total += stat.count;
    });

    console.log('📊 Farmer statistics for', email, ':', summary);

    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('❌ Error fetching farmer statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch farmer statistics',
      error: error.message
    });
  }
});

// GET /api/tapping-requests/:id - Get specific request
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await TappingRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Tapping request not found'
      });
    }

    console.log('📋 Retrieved request:', request.requestId);

    res.status(200).json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('❌ Error fetching request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request',
      error: error.message
    });
  }
});

// PUT /api/tapping-requests/:id - Update request details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.requestId;
    delete updateData.submittedAt;
    delete updateData.status; // Status should be updated via separate endpoint

    const request = await TappingRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Tapping request not found'
      });
    }

    // Only allow updates if request is in editable state
    if (!['submitted', 'under_review'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Request cannot be edited in current status'
      });
    }

    // Update the request
    const updatedRequest = await TappingRequest.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    console.log('✅ Updated request:', updatedRequest.requestId);

    res.status(200).json({
      success: true,
      message: 'Request updated successfully',
      data: updatedRequest
    });

  } catch (error) {
    console.error('❌ Error updating request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request',
      error: error.message
    });
  }
});

// PUT /api/tapping-requests/:id/status - Update request status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminId, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const request = await TappingRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Tapping request not found'
      });
    }

    // Update status
    request.status = status;

    // Add admin note if provided
    if (note && adminId) {
      request.adminNotes.push({
        note,
        addedBy: adminId
      });
    }

    const updatedRequest = await request.save();
    console.log('✅ Updated request status:', updatedRequest.requestId, 'to', status);

    res.status(200).json({
      success: true,
      message: 'Request status updated successfully',
      data: updatedRequest
    });

  } catch (error) {
    console.error('❌ Error updating request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request status',
      error: error.message
    });
  }
});

// PUT /api/tapping-requests/:id/assign - Assign tapper to request
router.put('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { tapperId, tapperName, tapperPhone, tapperEmail, assignedBy, estimatedCost } = req.body;

    if (!tapperId) {
      return res.status(400).json({
        success: false,
        message: 'Tapper ID is required'
      });
    }

    // Get complete tapper information from Staff collection
    const Staff = require('../models/Staff');
    const tapperInfo = await Staff.findById(tapperId);

    if (!tapperInfo) {
      return res.status(404).json({
        success: false,
        message: 'Tapper not found in staff records'
      });
    }

    const request = await TappingRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Tapping request not found'
      });
    }

    // Get system admin ID for assignment tracking
    const Register = require('../models/Register');
    let assignedByObjectId = null;

    if (assignedBy && assignedBy !== 'admin') {
      // If a specific user ID is provided
      assignedByObjectId = assignedBy;
    } else {
      // Use system admin as default
      const systemAdmin = await Register.findOne({ email: 'admin@rubbereco.com' });
      if (systemAdmin) {
        assignedByObjectId = systemAdmin._id;
      }
    }

    // Assign tapper with complete information
    request.assignedTapper = {
      tapperId,
      tapperName: tapperName || tapperInfo.name, // Use provided name or fetch from staff
      tapperPhone: tapperPhone || tapperInfo.phone, // Use actual phone from staff
      tapperEmail: tapperEmail || tapperInfo.email, // Use actual email from staff
      assignedAt: new Date(),
      assignedBy: assignedByObjectId
    };

    console.log('📞 Assigned tapper with phone:', tapperInfo.phone);

    // Update status to 'accepted' and service details
    request.status = 'accepted';
    if (estimatedCost) {
      request.serviceDetails.estimatedCost = estimatedCost;
    }

    const updatedRequest = await request.save();
    console.log('✅ Assigned tapper to request:', updatedRequest.requestId);

    // Send email notification to farmer
    const emailSent = await sendAssignmentNotification(
      request.farmerEmail,
      request.farmerName,
      request.requestId,
      tapperName
    );

    res.status(200).json({
      success: true,
      message: 'Tapper assigned successfully' + (emailSent ? ' and notification sent' : ''),
      data: updatedRequest,
      emailSent
    });

  } catch (error) {
    console.error('❌ Error assigning tapper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign tapper',
      error: error.message
    });
  }
});

// DELETE /api/tapping-requests/:id - Delete request (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await TappingRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Tapping request not found'
      });
    }

    await TappingRequest.findByIdAndDelete(id);
    console.log('🗑️ Deleted request:', request.requestId);

    res.status(200).json({
      success: true,
      message: 'Request deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete request',
      error: error.message
    });
  }
});



module.exports = router;
