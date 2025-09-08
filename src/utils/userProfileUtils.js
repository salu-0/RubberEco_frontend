/**
 * Utility functions for handling user profile data in forms
 */

/**
 * Fetches user profile data from localStorage and optionally from the server
 * @param {boolean} fetchFromServer - Whether to fetch fresh data from server
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfileData = async (fetchFromServer = false) => {
  try {
    // Get user data from localStorage first
    const localUserData = JSON.parse(localStorage.getItem('user') || '{}');
    
    // If we don't need fresh data or don't have a token, return local data
    if (!fetchFromServer || !localStorage.getItem('token')) {
      return {
        name: localUserData.name || '',
        email: localUserData.email || '',
        phone: localUserData.phone || '',
        location: localUserData.location || '',
        bio: localUserData.bio || '',
        hasCompleteProfile: !!(localUserData.name && localUserData.email && localUserData.phone)
      };
    }

    // Fetch fresh data from server if requested
    try {
      const userId = localUserData.id || localUserData._id;
      if (!userId) {
        console.log('No user ID found, using local data');
        return {
          name: localUserData.name || '',
          email: localUserData.email || '',
          phone: localUserData.phone || '',
          location: localUserData.location || '',
          bio: localUserData.bio || '',
          hasCompleteProfile: !!(localUserData.name && localUserData.email && localUserData.phone)
        };
      }

      // Determine API endpoint based on user ID format
      const isValidMongoId = userId.match(/^[0-9a-fA-F]{24}$/);
      const isValidUUID = userId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i);
      
      let apiEndpoint;
      if (isValidUUID) {
        apiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/users/supabase/${userId}`;
      } else if (isValidMongoId) {
        apiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/users/${userId}`;
      } else {
        console.log('Invalid user ID format, using local data');
        return {
          name: localUserData.name || '',
          email: localUserData.email || '',
          phone: localUserData.phone || '',
          location: localUserData.location || '',
          bio: localUserData.bio || '',
          hasCompleteProfile: !!(localUserData.name && localUserData.email && localUserData.phone)
        };
      }

      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const freshUserData = data.user;
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(freshUserData));
          
          return {
            name: freshUserData.name || '',
            email: freshUserData.email || '',
            phone: freshUserData.phone || '',
            location: freshUserData.location || '',
            bio: freshUserData.bio || '',
            hasCompleteProfile: !!(freshUserData.name && freshUserData.email && freshUserData.phone)
          };
        }
      }
      
      // If server fetch fails, fall back to local data
      console.log('Server fetch failed, using local data');
      return {
        name: localUserData.name || '',
        email: localUserData.email || '',
        phone: localUserData.phone || '',
        location: localUserData.location || '',
        bio: localUserData.bio || '',
        hasCompleteProfile: !!(localUserData.name && localUserData.email && localUserData.phone)
      };
      
    } catch (serverError) {
      console.error('Error fetching from server:', serverError);
      // Fall back to local data
      return {
        name: localUserData.name || '',
        email: localUserData.email || '',
        phone: localUserData.phone || '',
        location: localUserData.location || '',
        bio: localUserData.bio || '',
        hasCompleteProfile: !!(localUserData.name && localUserData.email && localUserData.phone)
      };
    }
    
  } catch (error) {
    console.error('Error getting user profile data:', error);
    return {
      name: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      hasCompleteProfile: false
    };
  }
};

/**
 * Checks if user has a complete profile (name, email, phone)
 * @returns {boolean} Whether user has complete profile
 */
export const hasCompleteProfile = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return !!(userData.name && userData.email && userData.phone);
  } catch (error) {
    console.error('Error checking profile completeness:', error);
    return false;
  }
};

/**
 * Gets user's basic contact information
 * @returns {Object} Basic contact info (name, email, phone)
 */
export const getUserContactInfo = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || ''
    };
  } catch (error) {
    console.error('Error getting user contact info:', error);
    return {
      name: '',
      email: '',
      phone: ''
    };
  }
};

/**
 * Auto-populates form fields with user profile data
 * @param {Function} setFormState - State setter function for the form
 * @param {Object} currentForm - Current form state
 * @param {Object} fieldMapping - Mapping of profile fields to form fields
 * @param {boolean} fetchFromServer - Whether to fetch fresh data from server
 */
export const autoPopulateForm = async (setFormState, currentForm, fieldMapping, fetchFromServer = false) => {
  try {
    const profileData = await getUserProfileData(fetchFromServer);
    
    // Create updated form object
    const updatedForm = { ...currentForm };
    
    // Map profile data to form fields based on provided mapping
    Object.keys(fieldMapping).forEach(profileField => {
      const formField = fieldMapping[profileField];
      if (profileData[profileField] && !updatedForm[formField]) {
        // Only populate if the form field is empty
        updatedForm[formField] = profileData[profileField];
      }
    });
    
    setFormState(updatedForm);
    
    return {
      success: true,
      hasCompleteProfile: profileData.hasCompleteProfile,
      populatedFields: Object.keys(fieldMapping).filter(field => profileData[field])
    };
    
  } catch (error) {
    console.error('Error auto-populating form:', error);
    return {
      success: false,
      hasCompleteProfile: false,
      populatedFields: []
    };
  }
};

/**
 * Shows a notification about profile auto-population
 * @param {Function} showNotification - Notification function
 * @param {Object} populationResult - Result from autoPopulateForm
 */
export const showProfilePopulationNotification = (showNotification, populationResult) => {
  if (populationResult.success && populationResult.populatedFields.length > 0) {
    if (populationResult.hasCompleteProfile) {
      showNotification(
        `Profile information auto-filled from your account (${populationResult.populatedFields.join(', ')})`,
        'success'
      );
    } else {
      showNotification(
        `Some fields auto-filled from your profile. Please complete any missing information.`,
        'info'
      );
    }
  } else if (!populationResult.hasCompleteProfile) {
    showNotification(
      'Please fill in your contact details. You can update your profile to auto-fill these fields in future forms.',
      'info'
    );
  }
};
