// Test script to manually insert enrollment data
const mongoose = require('mongoose');
const TrainingEnrollment = require('./models/TrainingEnrollment');

async function testEnrollment() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/RubberEco');
    console.log('✅ Connected to MongoDB');

    // Test enrollment data
    const testEnrollmentData = {
      userId: new mongoose.Types.ObjectId('688cddaa5587f9435c6739b1'), // Use a valid ObjectId
      moduleId: 2,
      moduleTitle: 'Advanced Rubber Tapping Techniques',
      moduleLevel: 'Advanced',
      paymentAmount: 15000,
      paymentMethod: 'stripe',
      paymentStatus: 'completed',
      paymentId: `TEST_${Date.now()}`,
      userDetails: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        experience: 'intermediate',
        motivation: 'Testing enrollment system'
      },
      progress: {
        completedLessons: [],
        totalLessons: 0,
        progressPercentage: 0,
        lastAccessedDate: new Date()
      }
    };

    console.log('📝 Creating test enrollment...');
    const enrollment = new TrainingEnrollment(testEnrollmentData);
    const savedEnrollment = await enrollment.save();
    
    console.log('✅ Test enrollment created successfully!');
    console.log('📄 Enrollment ID:', savedEnrollment._id);
    console.log('👤 User ID:', savedEnrollment.userId);
    console.log('📚 Module:', savedEnrollment.moduleTitle);

    // Verify it was saved
    const foundEnrollment = await TrainingEnrollment.findById(savedEnrollment._id);
    console.log('✅ Verification: Enrollment found in database');

    // List all enrollments
    const allEnrollments = await TrainingEnrollment.find({});
    console.log(`📊 Total enrollments in database: ${allEnrollments.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testEnrollment();
