const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Staff = require('./models/Staff');
require('dotenv').config();

// Test script to verify staff passwords
async function verifyStaffPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/RubberEco');
    console.log('✅ Connected to MongoDB');

    // Get all staff members
    const staffMembers = await Staff.find().select('+password');
    
    console.log(`\n📋 Found ${staffMembers.length} staff members:\n`);

    for (const staff of staffMembers) {
      console.log(`👤 Staff: ${staff.name} (${staff.email})`);
      console.log(`🆔 ID: ${staff._id}`);
      console.log(`📧 Email: ${staff.email}`);
      
      // Test known passwords
      const testPasswords = ['staff123', 'deepak123', 'maya123'];
      
      for (const testPassword of testPasswords) {
        const isMatch = await bcrypt.compare(testPassword, staff.password);
        if (isMatch) {
          console.log(`✅ Current Password: ${testPassword}`);
          break;
        }
      }
      
      // Also test auto-generated password format
      if (staff.phone) {
        const firstName = staff.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
        const phoneDigits = staff.phone.replace(/[^0-9]/g, '').substring(0, 2);
        const autoPassword = `${firstName}${phoneDigits}eco`;
        
        const isAutoMatch = await bcrypt.compare(autoPassword, staff.password);
        if (isAutoMatch) {
          console.log(`✅ Auto-generated Password: ${autoPassword}`);
        }
      }
      
      console.log(`🔒 Password Hash: ${staff.password.substring(0, 30)}...`);
      console.log('─'.repeat(50));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the verification
verifyStaffPasswords();
