// API utility functions for training enrollment

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';

// Get auth headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Handle API response
const handleResponse = async (response) => {
  let data;

  try {
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, get text content
      const text = await response.text();
      data = { message: text || `HTTP error! status: ${response.status}` };
    }
  } catch (parseError) {
    // If JSON parsing fails, create error object
    data = { message: `Failed to parse response: ${parseError.message}` };
  }

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
};

// Training Enrollment API functions
export const trainingAPI = {
  // Enroll user in a training module
  enrollInTraining: async (enrollmentData) => {
    const response = await fetch(`${API_BASE_URL}/training/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(enrollmentData)
    });
    
    return handleResponse(response);
  },

  // Check if user is enrolled in a module
  checkEnrollmentStatus: async (userId, moduleId) => {
    const response = await fetch(`${API_BASE_URL}/training/check/${userId}/${moduleId}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  // Get user's enrollments
  getUserEnrollments: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/training/user/${userId}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  // Update progress for an enrollment
  updateProgress: async (enrollmentId, progressData) => {
    const response = await fetch(`${API_BASE_URL}/training/progress/${enrollmentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData)
    });
    
    return handleResponse(response);
  },

  // Get all enrollments (admin only)
  getAllEnrollments: async () => {
    const response = await fetch(`${API_BASE_URL}/training/all`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  // Get enrollment statistics (admin only)
  getEnrollmentStats: async () => {
    const response = await fetch(`${API_BASE_URL}/training/stats`, {
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  },

  // Demo enrollment (no auth required)
  demoEnrollInTraining: async (enrollmentData) => {
    const response = await fetch(`${API_BASE_URL}/training/demo-enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(enrollmentData)
    });

    return handleResponse(response);
  },

  // Razorpay helpers for training
  createRazorpayOrder: async ({ amount, moduleId, moduleTitle }) => {
    const response = await fetch(`${API_BASE_URL}/training/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, moduleId, moduleTitle })
    });
    return handleResponse(response);
  },

  verifyRazorpayAndEnroll: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/training/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  }
};

// Certificate API functions
export const certificateAPI = {
  // Generate certificate for completed training
  generateCertificate: async (enrollmentId) => {
    const response = await fetch(`${API_BASE_URL}/certificates/generate/${enrollmentId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  },

  // Get user's certificates
  getUserCertificates: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/certificates/user/${userId}`, {
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  },

  // Verify certificate
  verifyCertificate: async (certificateNumber, verificationCode) => {
    const response = await fetch(`${API_BASE_URL}/certificates/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ certificateNumber, verificationCode })
    });

    return handleResponse(response);
  },

  // Get certificate by ID
  getCertificateById: async (certificateId) => {
    const response = await fetch(`${API_BASE_URL}/certificates/${certificateId}`, {
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  }
};

// Weather / rainfall forecast API
export const weatherAPI = {
  // Get forecast for a specific month (or next month if not specified)
  // month: 1-12, year: e.g., 2026
  getNextMonthForecast: async (month = null, year = null) => {
    let url = `${API_BASE_URL}/weather/next-month`;
    const params = new URLSearchParams();
    
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// User utility functions
export const getUserData = () => {
  try {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      return { user: null, isLoggedIn: false };
    }
    
    const user = JSON.parse(userData);
    return { user, isLoggedIn: true };
  } catch (error) {
    console.error('Error parsing user data:', error);
    return { user: null, isLoggedIn: false };
  }
};

export default trainingAPI;
