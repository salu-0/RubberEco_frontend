// Land Registration and Tenancy Service
class LandService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';
  }

  // Get authorization headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Land Registration APIs
  async registerLand(landData) {
    try {
      const response = await fetch(`${this.baseURL}/land-registration`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(landData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register land');
      }

      return data;
    } catch (error) {
      console.error('Error registering land:', error);
      throw error;
    }
  }

  async getMyLands() {
    try {
      const response = await fetch(`${this.baseURL}/land-registration/my-lands`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch lands');
      }

      return data;
    } catch (error) {
      console.error('Error fetching my lands:', error);
      throw error;
    }
  }

  async getLandById(landId) {
    try {
      const response = await fetch(`${this.baseURL}/land-registration/${landId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch land details');
      }

      return data;
    } catch (error) {
      console.error('Error fetching land details:', error);
      throw error;
    }
  }

  // Tenancy Offering APIs
  async createTenancyOffering(offeringData) {
    try {
      const response = await fetch(`${this.baseURL}/tenancy-offerings`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(offeringData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create tenancy offering');
      }

      return data;
    } catch (error) {
      console.error('Error creating tenancy offering:', error);
      throw error;
    }
  }

  async getTenancyOfferings(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`${this.baseURL}/tenancy-offerings?${queryParams}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tenancy offerings');
      }

      return data;
    } catch (error) {
      console.error('Error fetching tenancy offerings:', error);
      throw error;
    }
  }

  async getMyTenancyOfferings() {
    try {
      const response = await fetch(`${this.baseURL}/tenancy-offerings/my-offerings`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch my offerings');
      }

      return data;
    } catch (error) {
      console.error('Error fetching my offerings:', error);
      throw error;
    }
  }

  async updateOfferingStatus(offeringId, statusData) {
    try {
      const response = await fetch(`${this.baseURL}/tenancy-offerings/${offeringId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(statusData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update offering status');
      }

      return data;
    } catch (error) {
      console.error('Error updating offering status:', error);
      throw error;
    }
  }

  async applyForTenancy(offeringId, applicationData) {
    try {
      const response = await fetch(`${this.baseURL}/tenancy-offerings/${offeringId}/apply`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(applicationData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply for tenancy');
      }

      return data;
    } catch (error) {
      console.error('Error applying for tenancy:', error);
      throw error;
    }
  }

  // Admin APIs
  async getAllLandRegistrations(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`${this.baseURL}/land-registration?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch land registrations');
      }

      return data;
    } catch (error) {
      console.error('Error fetching land registrations:', error);
      throw error;
    }
  }

  async verifyLandRegistration(landId, verificationData) {
    try {
      const response = await fetch(`${this.baseURL}/land-registration/${landId}/verify`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(verificationData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify land registration');
      }

      return data;
    } catch (error) {
      console.error('Error verifying land registration:', error);
      throw error;
    }
  }

  // Utility methods
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getRateTypeDisplay(rateType) {
    const rateTypeMap = {
      'per_hectare_per_year': 'per hectare per year',
      'per_hectare_per_month': 'per hectare per month',
      'per_tree_per_year': 'per tree per year',
      'per_tree_per_month': 'per tree per month',
      'lump_sum': 'lump sum'
    };
    return rateTypeMap[rateType] || rateType;
  }

  getStatusColor(status) {
    const statusColors = {
      'pending_verification': 'yellow',
      'verified': 'green',
      'rejected': 'red',
      'under_review': 'blue',
      'available': 'green',
      'under_negotiation': 'yellow',
      'leased': 'blue',
      'expired': 'gray',
      'withdrawn': 'red'
    };
    return statusColors[status] || 'gray';
  }
}

// Create and export singleton instance
export const landService = new LandService();
export default landService;
