const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Staff = require('./models/Staff');
require('dotenv').config();

// Test script to verify password change functionality
async function testPasswordChange() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/RubberEco');
    console.log('✅ Connected to MongoDB');

    // Find a staff member to test with
    const staff = await Staff.findOne().select('+password');
    if (!staff) {
      console.log('❌ No staff members found in database');
      return;
    }

    console.log(`🔍 Testing with staff: ${staff.name} (${staff.email})`);
    console.log(`🔍 Staff ID: ${staff._id}`);
    console.log(`🔍 Current password hash: ${staff.password.substring(0, 20)}...`);

    // Test password change
    const newPassword = 'testpassword123';
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    console.log(`🔄 Changing password to: ${newPassword}`);
    console.log(`🔍 New password hash: ${hashedNewPassword.substring(0, 20)}...`);

    // Update password
    staff.password = hashedNewPassword;
    const savedStaff = await staff.save();

    console.log(`✅ Password updated successfully`);
    console.log(`🔍 Updated timestamp: ${savedStaff.updatedAt}`);

    // Verify the password was actually updated
    const verifyStaff = await Staff.findById(staff._id).select('+password');
    const isNewPasswordSet = await bcrypt.compare(newPassword, verifyStaff.password);
    
    console.log(`🔍 Password verification - New password correctly set: ${isNewPasswordSet}`);
    console.log(`🔍 Verified password hash: ${verifyStaff.password.substring(0, 20)}...`);

    if (isNewPasswordSet) {
      console.log('🎉 PASSWORD CHANGE TEST PASSED - Database is being updated permanently!');
    } else {
      console.log('❌ PASSWORD CHANGE TEST FAILED - Database update issue');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testPasswordChange();
