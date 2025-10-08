import React, { useState, useEffect } from 'react';

const AuthDebug = () => {
  const [authInfo, setAuthInfo] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    let parsedUser = null;
    try {
      parsedUser = user ? JSON.parse(user) : null;
    } catch (e) {
      parsedUser = { error: 'Invalid JSON in user data' };
    }

    // Decode JWT token if present
    let decodedToken = null;
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        decodedToken = decoded;
      } catch (e) {
        decodedToken = { error: 'Invalid token format' };
      }
    }

    setAuthInfo({
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 50) + '...' : null,
      hasUser: !!user,
      user: parsedUser,
      decodedToken,
      isExpired: decodedToken && decodedToken.exp ? Date.now() / 1000 > decodedToken.exp : null
    });
  }, []);

  const clearAuth = () => {
    // Clear all authentication tokens and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('nurseryAdminToken');
    localStorage.removeItem('nurseryAdminUser');
    window.location.reload();
  };

  const setTestAuth = () => {
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OTg3MDU2NGM3Yjk0NDVhMmU0ZjgzMiIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU1NTI3OTExLCJleHAiOjE3NTU2MTQzMTF9.JpyEknTjSbXWSE1MtgZI6KX3EagEf3rv1pEMValngY4';
    const testUser = '{"id":"689870564c7b9445a2e4f832","email":"admin@gmail.com","role":"admin"}';
    
    localStorage.setItem('token', testToken);
    localStorage.setItem('user', testUser);
    window.location.reload();
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #ccc', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔍 Auth Debug Info</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Token:</strong> {authInfo.hasToken ? '✅ Present' : '❌ Missing'}
        {authInfo.tokenPreview && <div style={{ fontSize: '10px', color: '#666' }}>{authInfo.tokenPreview}</div>}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>User Data:</strong> {authInfo.hasUser ? '✅ Present' : '❌ Missing'}
        {authInfo.user && (
          <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '5px', borderRadius: '3px' }}>
            {JSON.stringify(authInfo.user, null, 2)}
          </pre>
        )}
      </div>

      {authInfo.decodedToken && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Token Info:</strong>
          <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '5px', borderRadius: '3px' }}>
            {JSON.stringify(authInfo.decodedToken, null, 2)}
          </pre>
          {authInfo.isExpired !== null && (
            <div style={{ color: authInfo.isExpired ? 'red' : 'green' }}>
              {authInfo.isExpired ? '❌ Token Expired' : '✅ Token Valid'}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button 
          onClick={clearAuth}
          style={{ 
            padding: '5px 10px', 
            background: '#ff4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Clear Auth
        </button>
        <button 
          onClick={setTestAuth}
          style={{ 
            padding: '5px 10px', 
            background: '#44ff44', 
            color: 'black', 
            border: 'none', 
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Set Test Auth
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;