import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import awsconfig from '../aws-exports';
import '../styles/LoginPage.css';

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [requireNewPassword, setRequireNewPassword] = useState(false);
    const navigate = useNavigate();

    const userPool = new CognitoUserPool({
        UserPoolId: awsconfig.aws_user_pools_id,
        ClientId: awsconfig.aws_user_pools_web_client_id,
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true);
    
        const authenticationDetails = new AuthenticationDetails({
            Username: username,
            Password: password,
        });
    
        const userData = {
            Username: username,
            Pool: userPool,
        };
    
        const cognitoUser = new CognitoUser(userData);
    
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                const idToken = result.getIdToken().getJwtToken();
                const accessToken = result.getAccessToken().getJwtToken();
                const decodedToken = result.getIdToken().decodePayload();
    
                const groups = decodedToken['cognito:groups'] || [];
    
                localStorage.setItem('email', username);
                localStorage.setItem('token', idToken);
    
                if (groups.includes('stanghero-admin-group')) {
                    localStorage.setItem('role', 'admin');
                    navigate('/reports'); 
                } else if (groups.includes('stanghero-user-group')) {
                    localStorage.setItem('role', 'user');
                    navigate('/userHomepage'); 
                } else {
                    localStorage.setItem('role', 'none');
                    alert('You do not have the permission to log in.');
                }
    
                setLoading(false);
            },
            onFailure: (err) => {
                alert(err.message || JSON.stringify(err));
                setLoading(false);
            },
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                setRequireNewPassword(true);
                setLoading(false);
                delete userAttributes.email_verified;
                delete userAttributes.phone_number_verified;
            },
        });
    };    

    const handleNewPasswordSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        const userData = {
            Username: username,
            Pool: userPool,
        };

        const cognitoUser = new CognitoUser(userData);

        const authenticationDetails = new AuthenticationDetails({
            Username: username,
            Password: password,
        });

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                const idToken = result.getIdToken().getJwtToken();
                const role = result.idToken.payload['custom:role'];
                console.log(result)
                console.log(role)

                localStorage.setItem('email', result.idToken.payload.sub);
                localStorage.setItem('role', role);
                localStorage.setItem('token', idToken);

                if (role === 'admin') {
                    navigate('/reports');
                } else {
                    navigate('/userHomepage');
                }

                setLoading(false);
            },
            onFailure: (err) => {
                alert(err.message || JSON.stringify(err));
                setLoading(false);
            },
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
                    onSuccess: (result) => {
                        const idToken = result.getIdToken().getJwtToken();
                        const role = result.idToken.payload['custom:role'];

                        localStorage.setItem('email', result.idToken.payload.sub);
                        localStorage.setItem('role', role);
                        localStorage.setItem('token', idToken);

                        if (role === 'admin') {
                            navigate('/reports');
                        } else {
                            navigate('/userHomepage');
                        }

                        setLoading(false);
                    },
                    onFailure: (err) => {
                        alert(err.message || JSON.stringify(err));
                        setLoading(false);
                    },
                });
            },
        });
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    return (
        <div className="login-page">
            <div className="container">
                <div className="logo">
                    <img src="/logo8-cropped.png" alt="Logo" />
                </div>
                {!requireNewPassword ? (
                    <form id="loginForm" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="text"
                                id="username"
                                className="input-field"
                                placeholder="Email address"
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
                ) : (
                    <form id="newPasswordForm" onSubmit={handleNewPasswordSubmit}>
                        <div className="input-group">
                            <input
                                type="password"
                                id="newPassword"
                                className="input-field"
                                placeholder="Enter New Password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? 'Setting New Password...' : 'Submit New Password'}
                        </button>
                    </form>
                )}
                {loading && <div className="loading-indicator">Loading...</div>}
            </div>
        </div>
    );
};

export default LoginPage;
