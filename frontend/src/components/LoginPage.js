// src/components/LoginPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import '../styles/LoginPage.css'; 
import logo8 from '../images/logo8-cropped.png';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Simulate login process
    try {
      await simulateLogin(); 
      login(); 
      // alert('Login successful!');
      navigate("/userHomepage");
    } catch (error) {
      alert('Login failed!');
    } finally {
      setLoading(false);
    }
  };

  const simulateLogin = () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 2000); // Simulate network delay
    });
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="logo">
          <img src={logo8} alt="Stanghero Logo" />
        </div>
        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="text" id="username" className="input-field" placeholder="Username" required />
          </div>
          <div className="input-group">
            <input type="password" id="password" className="input-field" placeholder="Password" required />
          </div>
          <a href="google.com" className="forgot-password">Forgot Password?</a>
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        {loading && <div className="loading-indicator">Loading...</div>}
      </div>
    </div>
  );
};

export default LoginPage;
