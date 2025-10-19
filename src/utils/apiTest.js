// Simple API test utility
export const testBackendConnection = async () => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    console.log('Testing backend connection to:', apiUrl);
    
    // Test basic connectivity
    const response = await fetch(`${apiUrl}/api/bids`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Backend response status:', response.status);
    
    if (response.ok) {
      console.log('✅ Backend is accessible');
      return true;
    } else {
      console.log('❌ Backend returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    return false;
  }
};

export const testBrokerBids = async (brokerId, token) => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/bids/broker/${brokerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Broker bids API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Broker bids loaded:', data);
      return data;
    } else {
      console.log('❌ Broker bids API failed:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Broker bids API error:', error.message);
    return null;
  }
};
