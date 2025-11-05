// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Access the AuthContext

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Get state and function from the global context
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // If the user is already logged in (token exists), redirect them immediately.
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Call the login function from AuthContext. 
      // This sends a request to the API Gateway -> User Service.
      await login(username, password);
      
      // 2. If successful (token received), navigate to the main feed
      navigate('/', { replace: true });
      
    } catch (err) {
      // 3. Handle and display errors (e.g., Invalid Credentials)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h2>User Login</h2>
      <form onSubmit={handleSubmit}>
        
        {/* Username/Email Input */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc' }}
          />
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc' }}
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>

        {/* Error Message Display */}
        {error && <p style={{ color: 'red', marginTop: '15px', textAlign: 'center' }}>{error}</p>}
        
      </form>
    </div>
  );
};

export default LoginPage;