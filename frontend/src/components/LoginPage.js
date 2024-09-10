import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import '../styles/LoginPage.css';
import logo8 from '../images/logo8-cropped.png';

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const user = await Auth.signIn(username, password);

            const { attributes, signInUserSession } = user;
            const token = signInUserSession.idToken.jwtToken;
            const role = attributes['custom:role']; 

            localStorage.setItem('id', attributes.sub);
            localStorage.setItem('role', role);
            localStorage.setItem('token', token);

            // Navigate based on the role
            if (role === 'admin') {
                navigate('/reports');
            } else {
                navigate('/userHomepage');
            }
        } catch (error) {
            console.error('Error signing in:', error);
            alert('Login failed! Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
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
                    <a className="forgot-password" onClick={handleForgotPassword}>
                        Forgot Password?
                    </a>
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
