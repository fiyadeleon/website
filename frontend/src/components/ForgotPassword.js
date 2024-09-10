import React, { useState } from 'react';
import '../styles/ForgotPassword.css';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import awsconfig from '../aws-exports';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [username, setUsername] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const userPool = new CognitoUserPool({
        UserPoolId: awsconfig.aws_user_pools_id,
        ClientId: awsconfig.aws_user_pools_web_client_id,
    });

    const handleForgotPasswordSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        const cognitoUser = new CognitoUser({
            Username: username,
            Pool: userPool,
        });

        cognitoUser.forgotPassword({
            onSuccess: (result) => {
                console.log('Forgot Password Success:', result);
                alert('Code sent to your email address!');
                setStep(2); 
                setLoading(false);
            },
            onFailure: (err) => {
                console.error('Forgot Password Error:', err);
                alert(err.message || JSON.stringify(err));
                setLoading(false);
            },
        });
    };

    const handleConfirmPasswordSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        const cognitoUser = new CognitoUser({
            Username: username,
            Pool: userPool,
        });

        cognitoUser.confirmPassword(code, newPassword, {
            onSuccess: () => {
                alert('Password reset successful! Please log in.');
                navigate('/login');
                setLoading(false);
            },
            onFailure: (err) => {
                alert(err.message || JSON.stringify(err));
                setLoading(false);
            },
        });
    };

    return (
        <div className="forgot-password-page">
            <div className="container">
                {step === 1 ? (
                    <form onSubmit={handleForgotPasswordSubmit}>
                        <div className="input-group">
                            <input
                                className="input-field" 
                                type="username"
                                placeholder="Username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <button className="submit-button" type="submit" disabled={loading}>
                            {loading ? 'Sending Code...' : 'Send Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleConfirmPasswordSubmit}>
                        <div className="input-group">
                            <input
                                className="input-field"
                                placeholder="Verification Code"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                className="input-field" 
                                type="password"
                                placeholder="New Password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <button className="submit-button" type="submit" disabled={loading}>
                            {loading ? 'Resetting Password...' : 'Confirm Password'}
                        </button>
                    </form>
                )}
                {loading && <div className="loading-indicator">Loading...</div>}
            </div>
        </div>
    );
};

export default ForgotPassword;
