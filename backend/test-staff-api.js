const mongoose = require('mongoose');
const Staff = require('./models/Staff');
require('dotenv').config();

// Test script to verify staff API endpoints
async function testStaffAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/RubberEco');
    console.log('✅ Connected to MongoDB');

    // Get all staff members
    const staffMembers = await Staff.find().limit(5);
    
    console.log(`\n📋 Found ${staffMembers.length} staff members:\n`);

    for (const staff of staffMembers) {
      console.log(`👤 Staff: ${staff.name} (${staff.email})`);
      console.log(`🆔 ID: ${staff._id}`);
      console.log(`📧 Email: ${staff.email}`);
      console.log(`🔒 Has Avatar: ${!!staff.avatar}`);
      
      // Test the API endpoint URL that would be called
      console.log(`🌐 API URL would be: http://localhost:5000/api/staff/${staff._id}`);
      console.log('─'.repeat(50));
    }

    // Test a specific staff member fetch
    if (staffMembers.length > 0) {
      const testStaff = staffMembers[0];
      console.log(`\n🧪 Testing fetch for staff: ${testStaff.name}`);
      console.log(`🆔 Staff ID: ${testStaff._id}`);
      console.log(`🌐 Full API URL: http://localhost:5000/api/staff/${testStaff._id}`);
      
      // Simulate what the frontend would send
      console.log('\n📤 Frontend would send:');
      console.log(`- Method: GET`);
      console.log(`- URL: http://localhost:5000/api/staff/${testStaff._id}`);
      console.log(`- Headers: Authorization: Bearer [token], Content-Type: application/json`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testStaffAPI();
