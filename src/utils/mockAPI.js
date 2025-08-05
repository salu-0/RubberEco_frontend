// Mock API service to simulate backend operations when API is not available
// This provides a seamless fallback experience

class MockAPI {
  constructor() {
    this.baseDelay = 500; // Simulate network delay
  }

  // Simulate network delay
  delay(ms = this.baseDelay) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Mock enrollment API
  async enrollInTraining(enrollmentData) {
    await this.delay();
    
    try {
      // Simulate successful enrollment
      const mockResponse = {
        success: true,
        message: 'Enrollment successful (Mock API)',
        enrollmentId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        enrollment: {
          ...enrollmentData,
          id: `mock_${Date.now()}`,
          enrollmentDate: new Date().toISOString(),
          paymentStatus: 'completed'
        }
      };

      console.log('🎭 Mock API: Enrollment successful', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('🎭 Mock API: Enrollment failed', error);
      throw new Error('Mock enrollment failed');
    }
  }

  // Mock check enrollment status
  async checkEnrollmentStatus(userId, moduleId) {
    await this.delay(200);
    
    // Check local storage for enrollment
    const enrollments = JSON.parse(localStorage.getItem('training_enrollments') || '[]');
    const isEnrolled = enrollments.some(
      enrollment => enrollment.userId === userId && 
                   enrollment.moduleId === parseInt(moduleId) &&
                   enrollment.paymentStatus === 'completed'
    );

    const response = {
      success: true,
      isEnrolled: isEnrolled,
      message: isEnrolled ? 'User is enrolled' : 'User is not enrolled'
    };

    console.log('🎭 Mock API: Check enrollment status', response);
    return response;
  }

  // Mock get user enrollments
  async getUserEnrollments(userId) {
    await this.delay(300);
    
    const enrollments = JSON.parse(localStorage.getItem('training_enrollments') || '[]');
    const userEnrollments = enrollments.filter(enrollment => enrollment.userId === userId);

    const response = {
      success: true,
      enrollments: userEnrollments,
      count: userEnrollments.length,
      message: `Found ${userEnrollments.length} enrollments`
    };

    console.log('🎭 Mock API: Get user enrollments', response);
    return response;
  }

  // Mock demo enrollment (simulates database storage)
  async demoEnrollInTraining(enrollmentData) {
    await this.delay(800); // Longer delay to simulate database operation
    
    try {
      // Simulate database storage by adding to a separate "database" storage
      const dbEnrollments = JSON.parse(localStorage.getItem('mock_database_enrollments') || '[]');
      
      // Check for duplicates
      const existingIndex = dbEnrollments.findIndex(
        e => e.userId === enrollmentData.userId && e.moduleId === enrollmentData.moduleId
      );

      const newEnrollment = {
        ...enrollmentData,
        id: `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        enrollmentDate: enrollmentData.enrollmentDate || new Date().toISOString(),
        syncedToDatabase: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        dbEnrollments[existingIndex] = newEnrollment;
      } else {
        dbEnrollments.push(newEnrollment);
      }

      localStorage.setItem('mock_database_enrollments', JSON.stringify(dbEnrollments));

      const response = {
        success: true,
        message: 'Demo enrollment successful (Mock Database)',
        enrollmentId: newEnrollment.id,
        enrollment: newEnrollment
      };

      console.log('🎭 Mock API: Demo enrollment to database', response);
      return response;
    } catch (error) {
      console.error('🎭 Mock API: Demo enrollment failed', error);
      throw new Error('Mock demo enrollment failed');
    }
  }

  // Get mock database statistics
  async getDatabaseStats() {
    await this.delay(200);
    
    const dbEnrollments = JSON.parse(localStorage.getItem('mock_database_enrollments') || '[]');
    const localEnrollments = JSON.parse(localStorage.getItem('training_enrollments') || '[]');
    
    const stats = {
      databaseEnrollments: dbEnrollments.length,
      localEnrollments: localEnrollments.length,
      totalUnique: new Set([
        ...dbEnrollments.map(e => `${e.userId}_${e.moduleId}`),
        ...localEnrollments.map(e => `${e.userId}_${e.moduleId}`)
      ]).size,
      lastSync: localStorage.getItem('last_mock_sync') || 'Never'
    };

    console.log('🎭 Mock API: Database stats', stats);
    return { success: true, stats };
  }

  // Simulate batch sync operation
  async batchSync(enrollments) {
    await this.delay(1000); // Longer delay for batch operation
    
    try {
      const dbEnrollments = JSON.parse(localStorage.getItem('mock_database_enrollments') || '[]');
      let syncedCount = 0;
      const errors = [];

      for (const enrollment of enrollments) {
        try {
          // Check if already exists
          const existingIndex = dbEnrollments.findIndex(
            e => e.userId === enrollment.userId && e.moduleId === enrollment.moduleId
          );

          const syncedEnrollment = {
            ...enrollment,
            syncedToDatabase: true,
            syncedAt: new Date().toISOString()
          };

          if (existingIndex >= 0) {
            dbEnrollments[existingIndex] = syncedEnrollment;
          } else {
            dbEnrollments.push(syncedEnrollment);
          }
          
          syncedCount++;
        } catch (error) {
          errors.push(`Failed to sync ${enrollment.moduleTitle}: ${error.message}`);
        }
      }

      localStorage.setItem('mock_database_enrollments', JSON.stringify(dbEnrollments));
      localStorage.setItem('last_mock_sync', new Date().toISOString());

      const response = {
        success: syncedCount > 0,
        synced: syncedCount,
        total: enrollments.length,
        errors: errors,
        message: `Mock sync: ${syncedCount}/${enrollments.length} enrollments synced`
      };

      console.log('🎭 Mock API: Batch sync completed', response);
      return response;
    } catch (error) {
      console.error('🎭 Mock API: Batch sync failed', error);
      throw new Error('Mock batch sync failed');
    }
  }

  // Clear mock database (for testing)
  clearMockDatabase() {
    localStorage.removeItem('mock_database_enrollments');
    localStorage.removeItem('last_mock_sync');
    console.log('🎭 Mock API: Database cleared');
  }

  // Get all mock database enrollments (for debugging)
  getMockDatabaseEnrollments() {
    return JSON.parse(localStorage.getItem('mock_database_enrollments') || '[]');
  }
}

// Create singleton instance
const mockAPI = new MockAPI();

export default mockAPI;
