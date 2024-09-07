import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css'; 
import logo8 from '../images/logo8-cropped.png';

const LoginPage = () => {
    const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "https://q2tf3g5e4l.execute-api.ap-southeast-1.amazonaws.com/v1";
    const API_KEY = process.env.REACT_APP_API_KEY || "XZSNV5hFIaaCJRBznp9mW2VPndBpD97V98E1irxs";
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
            
            if (!response.ok) {
                throw new Error('Login failed');
            }

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
            alert('Login failed! Please check your credentials.');
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
