import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/LoginPage.css'; 
import logo8 from '../images/logo8-cropped.png';

const LoginPage = () => {
    const API_ENDPOINT = process.env.API_ENDPOINT;
    const API_KEY = process.env.API_KEY;
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_ENDPOINT}/login`, {
                method: 'POST',
                headers: {
                    'x-api-key': `${API_KEY}`,
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });
            
            const data = await response.json();
            
            const { token, role } = data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            if (role === 'admin') {
                navigate('/reports');
            } else {
                navigate('/userHomepage');
            }
        } catch (error) {
            alert('Login failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
        <div className="container">
            <div className="logo">
            <img src={logo8} alt="Logo" />
            </div>
            <form id="loginForm" onSubmit={handleSubmit}>
            <div className="input-group">
                <input
                type="text"
                id="username"
                className="input-field"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="input-group">
                <input
                type="password"
                id="password"
                className="input-field"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
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
