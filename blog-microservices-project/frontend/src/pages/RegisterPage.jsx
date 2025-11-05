// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../api'; // Your authenticated Axios instance
import { useAuth } from '../context/AuthContext.jsx'; 

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Use login function and auth status from AuthContext
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Send registration data to the User Service via the Gateway
      const response = await api.post('/auth/register', { 
        username, 
        email, 
        password 
      });

      // 2. The backend usually logs the user in immediately after registration.
      // We rely on the successful response and call login to update the frontend state.
      localStorage.setItem('authToken', response.data.token);
      
      // Update the AuthContext state
      // (This is done simply by calling the existing login logic for state update)
      // Note: A real app might dispatch user data directly instead of simulating a login.
      await login(username, password); 
      
      // 3. Navigate to the main feed
      navigate('/', { replace: true });

    } catch (err) {
      // 4. Handle errors (e.g., 409 Conflict - User already exists)
      const msg = err.response?.data?.message || 'Registration failed due to a server error.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        
        {/* Username Input */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="reg-username" style={{ display: 'block' }}>Username:</label>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc' }}
          />
        </div>
        
        {/* Email Input */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="reg-email" style={{ display: 'block' }}>Email:</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="reg-password" style={{ display: 'block' }}>Password:</label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        {/* Link to Login */}
        <p style={{ textAlign: 'center', marginTop: '15px' }}>
            Already have an account? <Link to="/login">Log In</Link>
        </p>

        {/* Error Message Display */}
        {error && <p style={{ color: 'red', marginTop: '15px', textAlign: 'center' }}>{error}</p>}
        
      </form>
    </div>
  );
};

export default RegisterPage;