const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Staff = require('./models/Staff');
require('dotenv').config();

// Reset password for a specific staff member
async function resetStaffPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/RubberEco');
    console.log('✅ Connected to MongoDB');

    // Find Helan Antony
    const staffId = '688a3f1653e5439819a84275';
    const staff = await Staff.findById(staffId).select('+password');
    
    if (!staff) {
      console.log('❌ Staff member not found');
      return;
    }

    console.log(`👤 Found staff: ${staff.name} (${staff.email})`);

    // Set a known password
    const newPassword = 'helan123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    staff.password = hashedPassword;
    await staff.save();

    console.log(`✅ Password reset successfully!`);
    console.log(`📧 Email: ${staff.email}`);
    console.log(`🔑 New Password: ${newPassword}`);
    console.log(`🆔 Staff ID: ${staff._id}`);

    // Verify the password was set correctly
    const isMatch = await bcrypt.compare(newPassword, staff.password);
    console.log(`🔍 Password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the reset
resetStaffPassword();
