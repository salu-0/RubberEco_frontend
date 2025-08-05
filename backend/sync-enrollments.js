// Standalone script to sync enrollment data from localStorage to MongoDB
// This can be run manually to sync data when API routes are not working

const mongoose = require('mongoose');
const TrainingEnrollment = require('./models/TrainingEnrollment');
const readline = require('readline');

// Sample enrollment data that would come from localStorage
const sampleEnrollments = [
  {
    userId: '688cddaa5587f9435c6739b1',
    moduleId: 2,
    moduleTitle: 'Advanced Rubber Tapping Techniques',
    moduleLevel: 'Advanced',
    paymentAmount: 15000,
    paymentMethod: 'stripe',
    paymentStatus: 'completed',
    paymentId: 'DEMO_1735689600000_abc123',
    userDetails: {
      name: 'Salu Manoj',
      email: 'salu@example.com',
      phone: '9876543210',
      experience: 'intermediate',
      motivation: 'Want to improve rubber tapping skills'
    },
    progress: {
      completedLessons: [],
      totalLessons: 8,
      progressPercentage: 0,
      lastAccessedDate: new Date()
    }
  },
  {
    userId: '688cddaa5587f9435c6739b1',
    moduleId: 3,
    moduleTitle: 'Sustainable Rubber Farming',
    moduleLevel: 'Intermediate',
    paymentAmount: 10000,
    paymentMethod: 'stripe',
    paymentStatus: 'completed',
    paymentId: 'DEMO_1735689700000_def456',
    userDetails: {
      name: 'Salu Manoj',
      email: 'salu@example.com',
      phone: '9876543210',
      experience: 'intermediate',
      motivation: 'Learn sustainable farming practices'
    },
    progress: {
      completedLessons: [],
      totalLessons: 6,
      progressPercentage: 0,
      lastAccessedDate: new Date()
    }
  }
];

async function syncEnrollments() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/RubberEco');
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Current database status:');
    const existingEnrollments = await TrainingEnrollment.find({});
    console.log(`   Existing enrollments: ${existingEnrollments.length}`);

    if (existingEnrollments.length > 0) {
      console.log('\n📋 Existing enrollments:');
      existingEnrollments.forEach((enrollment, index) => {
        console.log(`   ${index + 1}. ${enrollment.moduleTitle} (User: ${enrollment.userId})`);
      });
    }

    console.log('\n📝 Sample enrollments to sync:');
    sampleEnrollments.forEach((enrollment, index) => {
      console.log(`   ${index + 1}. ${enrollment.moduleTitle} (Module ${enrollment.moduleId})`);
    });

    // Ask user if they want to proceed
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question('\n❓ Do you want to sync these sample enrollments to the database? (y/n): ', resolve);
    });

    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Sync cancelled by user');
      process.exit(0);
    }

    console.log('\n🔄 Syncing enrollments...');
    let syncedCount = 0;
    let skippedCount = 0;

    for (const enrollmentData of sampleEnrollments) {
      try {
        // Check if enrollment already exists
        const existingEnrollment = await TrainingEnrollment.findOne({
          userId: enrollmentData.userId,
          moduleId: enrollmentData.moduleId
        });

        if (existingEnrollment) {
          console.log(`   ⏭️  Skipped: ${enrollmentData.moduleTitle} (already exists)`);
          skippedCount++;
          continue;
        }

        // Create new enrollment
        const enrollment = new TrainingEnrollment(enrollmentData);
        await enrollment.save();
        
        console.log(`   ✅ Synced: ${enrollmentData.moduleTitle}`);
        syncedCount++;
      } catch (error) {
        console.log(`   ❌ Error syncing ${enrollmentData.moduleTitle}: ${error.message}`);
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`   ✅ Successfully synced: ${syncedCount}`);
    console.log(`   ⏭️  Skipped (already exists): ${skippedCount}`);
    console.log(`   ❌ Errors: ${sampleEnrollments.length - syncedCount - skippedCount}`);

    // Verify final count
    const finalCount = await TrainingEnrollment.find({}).countDocuments();
    console.log(`   📊 Total enrollments in database: ${finalCount}`);

    console.log('\n🎉 Sync completed!');
    console.log('💡 You can now check the training_enrolled collection in MongoDB Compass');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during sync:', error);
    process.exit(1);
  }
}

// Run the sync
console.log('🚀 Starting enrollment sync utility...');
console.log('📝 This script will sync sample enrollment data to the training_enrolled collection');
syncEnrollments();
