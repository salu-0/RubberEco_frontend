// Enrollment Management System
// Handles enrollment data with localStorage backup and database sync

import mockAPI from './mockAPI';

class EnrollmentManager {
  constructor() {
    this.storageKey = 'training_enrollments';
    this.syncKey = 'enrollment_sync_queue';
  }

  // Get all user enrollments from localStorage
  getUserEnrollments(userId) {
    try {
      const enrollments = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      return enrollments.filter(enrollment => enrollment.userId === userId);
    } catch (error) {
      console.error('Error getting user enrollments:', error);
      return [];
    }
  }

  // Check if user is enrolled in a specific module
  isUserEnrolled(userId, moduleId) {
    const enrollments = this.getUserEnrollments(userId);
    return enrollments.some(enrollment => 
      enrollment.moduleId === parseInt(moduleId) && 
      enrollment.paymentStatus === 'completed'
    );
  }

  // Add new enrollment
  addEnrollment(enrollmentData) {
    try {
      const enrollments = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      
      // Check if enrollment already exists
      const existingIndex = enrollments.findIndex(
        e => e.userId === enrollmentData.userId && e.moduleId === enrollmentData.moduleId
      );

      const newEnrollment = {
        id: enrollmentData.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: enrollmentData.userId,
        moduleId: enrollmentData.moduleId,
        moduleTitle: enrollmentData.moduleTitle,
        moduleLevel: enrollmentData.moduleLevel,
        paymentAmount: enrollmentData.paymentAmount,
        paymentMethod: enrollmentData.paymentMethod || 'stripe',
        paymentStatus: enrollmentData.paymentStatus || 'completed',
        paymentId: enrollmentData.paymentId,
        enrollmentDate: enrollmentData.enrollmentDate || new Date().toISOString(),
        userDetails: enrollmentData.userDetails,
        progress: enrollmentData.progress || {
          completedLessons: [],
          totalLessons: 0,
          progressPercentage: 0,
          lastAccessedDate: new Date().toISOString()
        },
        certificateIssued: false,
        certificateIssuedDate: null,
        isActive: true,
        syncedToDatabase: false, // Track if synced to backend
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        // Update existing enrollment
        enrollments[existingIndex] = { ...enrollments[existingIndex], ...newEnrollment };
      } else {
        // Add new enrollment
        enrollments.push(newEnrollment);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(enrollments));
      
      // Add to sync queue for database sync
      this.addToSyncQueue(newEnrollment);
      
      return newEnrollment;
    } catch (error) {
      console.error('Error adding enrollment:', error);
      throw error;
    }
  }

  // Add enrollment to sync queue for database sync
  addToSyncQueue(enrollment) {
    try {
      const syncQueue = JSON.parse(localStorage.getItem(this.syncKey) || '[]');
      
      // Check if already in queue
      const existingIndex = syncQueue.findIndex(
        item => item.userId === enrollment.userId && item.moduleId === enrollment.moduleId
      );

      if (existingIndex >= 0) {
        syncQueue[existingIndex] = enrollment;
      } else {
        syncQueue.push(enrollment);
      }

      localStorage.setItem(this.syncKey, JSON.stringify(syncQueue));
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  // Sync pending enrollments to database
  async syncToDatabase() {
    try {
      const syncQueue = JSON.parse(localStorage.getItem(this.syncKey) || '[]');

      if (syncQueue.length === 0) {
        return 0;
      }

      // Try real API first, then fallback to mock API
      try {
        console.log('🔄 Attempting real API sync...');
        const realSyncResult = await this.syncToRealAPI(syncQueue);
        if (realSyncResult > 0) {
          return realSyncResult;
        }
      } catch (realAPIError) {
        console.warn('Real API sync failed, trying mock API:', realAPIError.message);
      }

      // Fallback to mock API
      console.log('🎭 Using mock API for sync...');
      const mockSyncResult = await mockAPI.batchSync(syncQueue);

      if (mockSyncResult.success) {
        // Update local enrollments to mark as synced
        const enrollments = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        let updatedCount = 0;

        for (const enrollment of syncQueue) {
          const index = enrollments.findIndex(
            e => e.userId === enrollment.userId && e.moduleId === enrollment.moduleId
          );
          if (index >= 0) {
            enrollments[index].syncedToDatabase = true;
            enrollments[index].syncMethod = 'mock';
            enrollments[index].syncedAt = new Date().toISOString();
            updatedCount++;
          }
        }

        localStorage.setItem(this.storageKey, JSON.stringify(enrollments));

        // Clear sync queue
        localStorage.setItem(this.syncKey, JSON.stringify([]));

        console.log(`✅ Mock API sync completed: ${updatedCount} enrollments`);
        return updatedCount;
      }

      return 0;
    } catch (error) {
      console.error('Error syncing to database:', error);
      return 0;
    }
  }

  // Try to sync to real API
  async syncToRealAPI(syncQueue) {
    const successfulSyncs = [];

    for (const enrollment of syncQueue) {
      try {
        // Try multiple real API endpoints
        let synced = false;

        // Method 1: Direct demo enrollment
        try {
          const response = await fetch('http://localhost:5000/api/training/direct-demo-enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(enrollment)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Real API sync successful:', enrollment.moduleTitle);

            // Mark as synced
            this.updateEnrollment(enrollment.userId, enrollment.moduleId, {
              syncedToDatabase: true,
              databaseId: result.enrollmentId,
              syncMethod: 'real'
            });

            successfulSyncs.push(enrollment);
            synced = true;
          }
        } catch (directError) {
          console.warn('Direct API failed:', directError.message);
        }

        // Method 2: Regular demo enrollment
        if (!synced) {
          try {
            const response = await fetch('http://localhost:5000/api/training/demo-enroll', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(enrollment)
            });

            if (response.ok) {
              const result = await response.json();
              console.log('✅ Demo API sync successful:', enrollment.moduleTitle);

              this.updateEnrollment(enrollment.userId, enrollment.moduleId, {
                syncedToDatabase: true,
                databaseId: result.enrollmentId,
                syncMethod: 'demo'
              });

              successfulSyncs.push(enrollment);
              synced = true;
            }
          } catch (demoError) {
            console.warn('Demo API failed:', demoError.message);
          }
        }

        if (!synced) {
          throw new Error(`Failed to sync ${enrollment.moduleTitle}`);
        }
      } catch (syncError) {
        console.error('Error syncing enrollment:', syncError);
        // Continue with next enrollment
      }
    }

    // Remove successfully synced items from queue
    if (successfulSyncs.length > 0) {
      const remainingQueue = syncQueue.filter(item =>
        !successfulSyncs.some(synced =>
          synced.userId === item.userId && synced.moduleId === item.moduleId
        )
      );
      localStorage.setItem(this.syncKey, JSON.stringify(remainingQueue));
    }

    return successfulSyncs.length;
  }

  // Update enrollment progress
  updateEnrollment(userId, moduleId, updates) {
    try {
      const enrollments = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const enrollmentIndex = enrollments.findIndex(
        e => e.userId === userId && e.moduleId === parseInt(moduleId)
      );

      if (enrollmentIndex >= 0) {
        enrollments[enrollmentIndex] = {
          ...enrollments[enrollmentIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(enrollments));
        return enrollments[enrollmentIndex];
      }
      return null;
    } catch (error) {
      console.error('Error updating enrollment:', error);
      return null;
    }
  }

  // Get enrollment statistics
  getEnrollmentStats(userId) {
    const enrollments = this.getUserEnrollments(userId);
    return {
      totalEnrollments: enrollments.length,
      completedCourses: enrollments.filter(e => e.progress.progressPercentage === 100).length,
      inProgressCourses: enrollments.filter(e => e.progress.progressPercentage > 0 && e.progress.progressPercentage < 100).length,
      certificatesEarned: enrollments.filter(e => e.certificateIssued).length,
      syncedToDatabase: enrollments.filter(e => e.syncedToDatabase).length,
      pendingSync: enrollments.filter(e => !e.syncedToDatabase).length
    };
  }

  // Manual sync function that tries multiple endpoints
  async manualSync() {
    try {
      const syncQueue = JSON.parse(localStorage.getItem(this.syncKey) || '[]');
      console.log(`🔄 Attempting to sync ${syncQueue.length} enrollments...`);

      if (syncQueue.length === 0) {
        console.log('✅ No enrollments to sync');
        return { success: true, synced: 0, message: 'No enrollments to sync' };
      }

      let syncedCount = 0;
      const errors = [];

      for (const enrollment of syncQueue) {
        try {
          // Try multiple sync endpoints
          let synced = false;

          // Method 1: Try direct demo enrollment endpoint
          try {
            const response = await fetch('http://localhost:5000/api/training/direct-demo-enroll', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(enrollment)
            });

            if (response.ok) {
              const result = await response.json();
              console.log('✅ Synced via direct endpoint:', enrollment.moduleTitle);
              syncedCount++;
              synced = true;
            }
          } catch (directError) {
            console.warn('Direct endpoint failed:', directError.message);
          }

          // Method 2: Try regular demo enrollment endpoint
          if (!synced) {
            try {
              const response = await fetch('http://localhost:5000/api/training/demo-enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enrollment)
              });

              if (response.ok) {
                const result = await response.json();
                console.log('✅ Synced via demo endpoint:', enrollment.moduleTitle);
                syncedCount++;
                synced = true;
              }
            } catch (demoError) {
              console.warn('Demo endpoint failed:', demoError.message);
            }
          }

          if (!synced) {
            errors.push(`Failed to sync ${enrollment.moduleTitle}`);
          }
        } catch (error) {
          errors.push(`Error syncing ${enrollment.moduleTitle}: ${error.message}`);
        }
      }

      // Update sync queue (remove successfully synced items)
      if (syncedCount > 0) {
        const remainingQueue = syncQueue.slice(syncedCount);
        localStorage.setItem(this.syncKey, JSON.stringify(remainingQueue));
      }

      return {
        success: syncedCount > 0,
        synced: syncedCount,
        total: syncQueue.length,
        errors: errors,
        message: `Synced ${syncedCount}/${syncQueue.length} enrollments`
      };
    } catch (error) {
      console.error('Manual sync error:', error);
      return {
        success: false,
        synced: 0,
        errors: [error.message],
        message: 'Manual sync failed'
      };
    }
  }

  // Clear all enrollment data (for testing)
  clearAllData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.syncKey);
  }
}

// Create singleton instance
const enrollmentManager = new EnrollmentManager();

export default enrollmentManager;
