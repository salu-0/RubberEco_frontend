import React, { useState, useEffect } from 'react';

const MessagesDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    brokerId: null,
    token: null,
    backendAvailable: false,
    brokerBids: null,
    error: null
  });

  useEffect(() => {
    const checkSystem = async () => {
      const brokerId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      setDebugInfo(prev => ({
        ...prev,
        brokerId,
        token: token ? 'Token exists' : 'No token'
      }));

      // Test backend connection
      try {
        const apiUrl = 'https://rubbereco-backend.onrender.com'; // Use production backend
        const response = await fetch(`${apiUrl}/api/bids`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        setDebugInfo(prev => ({
          ...prev,
          backendAvailable: response.ok
        }));

        // If backend is available and we have broker ID, test broker bids
        if (response.ok && brokerId && token) {
          try {
            const bidsResponse = await fetch(`${apiUrl}/api/bids/broker/${brokerId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (bidsResponse.ok) {
              const bidsData = await bidsResponse.json();
              setDebugInfo(prev => ({
                ...prev,
                brokerBids: bidsData
              }));
            } else {
              setDebugInfo(prev => ({
                ...prev,
                error: `Broker bids API failed: ${bidsResponse.status}`
              }));
            }
          } catch (error) {
            setDebugInfo(prev => ({
              ...prev,
              error: `Broker bids API error: ${error.message}`
            }));
          }
        }
      } catch (error) {
        setDebugInfo(prev => ({
          ...prev,
          backendAvailable: false,
          error: `Backend connection failed: ${error.message}`
        }));
      }
    };

    checkSystem();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '15px', 
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      maxWidth: '300px',
      fontSize: '12px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Messages Debug Info</h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Broker ID:</strong> {debugInfo.brokerId || 'Not found'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Token:</strong> {debugInfo.token || 'Not found'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Backend:</strong> 
        <span style={{ 
          color: debugInfo.backendAvailable ? 'green' : 'red',
          marginLeft: '5px'
        }}>
          {debugInfo.backendAvailable ? '✅ Available' : '❌ Not Available'}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Broker Bids:</strong> 
        {debugInfo.brokerBids ? (
          <span style={{ color: 'green' }}>
            ✅ {debugInfo.brokerBids.bids?.length || 0} bids found
          </span>
        ) : (
          <span style={{ color: 'red' }}>❌ None</span>
        )}
      </div>
      
      {debugInfo.error && (
        <div style={{ 
          color: 'red', 
          fontSize: '11px',
          marginTop: '8px',
          padding: '5px',
          background: '#ffe6e6',
          borderRadius: '4px'
        }}>
          <strong>Error:</strong> {debugInfo.error}
        </div>
      )}
      
      <div style={{ 
        marginTop: '10px', 
        fontSize: '10px', 
        color: '#666',
        borderTop: '1px solid #eee',
        paddingTop: '8px'
      }}>
        <strong>API URL:</strong> https://rubbereco-backend.onrender.com
      </div>
    </div>
  );
};

export default MessagesDebug;