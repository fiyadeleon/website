import React, { useState, useEffect } from 'react';
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import '../styles/Settings.css';
import user from '../images/user.png';
import editIcon from '../images/edit.png';
import awsconfig from '../aws-exports';

const Settings = () => {
    const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "https://q2tf3g5e4l.execute-api.ap-southeast-1.amazonaws.com/v1";
    const API_KEY = process.env.REACT_APP_API_KEY || "XZSNV5hFIaaCJRBznp9mW2VPndBpD97V98E1irxs";

    const [isEditing, setIsEditing] = useState(false);
    const [employeeData, setEmployeeData] = useState(null);
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isPasswordRequired, setIsPasswordRequired] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const localEmail = localStorage.getItem('email');

    const userPool = new CognitoUserPool({
        UserPoolId: awsconfig.aws_user_pools_id,
        ClientId: awsconfig.aws_user_pools_web_client_id,
    });

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const response = await fetch(`${API_ENDPOINT}/item?resource=employee&email=${localEmail}`, {
                    method: 'GET',
                    headers: {
                        'x-api-key': API_KEY
                    },
                });
                const data = await response.json();
                localStorage.setItem('id', data['id'])

                setEmployeeData(data);
                setContact(data.contact);
                setEmail(data.email);
            } catch (error) {
                console.error('Error fetching employee data:', error);
            }
        };

        if (localEmail) {
            fetchEmployeeData();
        }
    }, [localEmail]);

    const handleBackClick = () => {
        setIsEditing(false);
        setIsPasswordRequired(false);
        setPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
        setError('');
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const authenticateUser = () => {
        return new Promise((resolve, reject) => {
            const authenticationDetails = new AuthenticationDetails({
                Username: localEmail,
                Password: currentPassword,
            });

            const cognitoUser = new CognitoUser({
                Username: localEmail,
                Pool: userPool,
            });

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    resolve(result);
                },
                onFailure: (err) => {
                    reject(err);
                },
            });
        });
    };

    const getCurrentUser = () => {
        return userPool.getCurrentUser();
    };

    const handleSubmitClick = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (isPasswordRequired && password !== confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            if (isPasswordRequired) {
                const cognitoUser = getCurrentUser();
                if (!cognitoUser) {
                    throw new Error("No current user available");
                }

                const response = await authenticateUser(cognitoUser);
                console.log(response)

                cognitoUser.changePassword(currentPassword, password, (err, result) => {
                    if (err) {
                        setError(err.message);
                        setIsLoading(false);
                        return;
                    }
                    alert("Password changed successfully.");
                });
            }

            const updatedData = {
                id: localStorage.getItem('id'),
                contact,
                email,
            };

            const response = await fetch(`${API_ENDPOINT}/item/?resource=employee&id=${encodeURIComponent(localStorage.getItem('id'))}`, {
                method: 'PUT',
                headers: {
                    'x-api-key': API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                const result = await response.json();
                let updatedFields = [];
                if (email !== employeeData.email) updatedFields.push('Email');
                if (contact !== employeeData.contact) updatedFields.push('Contact');
                if (isPasswordRequired) updatedFields.push('Password');

                alert(`${updatedFields.join(', ')} successfully updated!`);
                setEmployeeData({ ...employeeData, contact, email });
                handleBackClick();
            } else {
                throw new Error('Error updating employee data.');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordToggle = () => {
        setIsPasswordRequired(!isPasswordRequired);
        setPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
    };

    if (!employeeData) {
        return (
            <div className="loading-icon">
                <i className="fas fa-spinner fa-spin fa-3x"></i>
            </div>
        );
    }

    return (
        <div className="settings-container-wrapper">
            <div className="settings-container">
                <div className="avatar-container">
                    <img src={user} alt="User Avatar" className="avatar" />
                    {!isEditing && (
                        <img src={editIcon} alt="Edit Icon" className="edit-profile" onClick={handleEditClick} />
                    )}
                </div>

                {isEditing ? (
                    <form className="form-container" onSubmit={handleSubmitClick}>
                        <div className="form-group form-group-half">
                            <label htmlFor="contact">Contact No.</label>
                            <input
                                type="tel"
                                id="contact"
                                name="contact"
                                pattern="[0-9]{11}"
                                maxLength="11"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                required
                                placeholder="e.g., 09123456789"
                            />
                        </div>
                        <div className="form-group form-group-half">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="e.g., john@example.com"
                            />
                        </div>
                        <div className="form-group form-group-half">
                            <label htmlFor="changePasswordToggle">Change Password</label>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    id="changePasswordToggle"
                                    onClick={handlePasswordToggle}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        {isPasswordRequired && (
                            <div id="passwordFields" className="form-group-half">
                                <div className="form-group form-group-full">
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        placeholder="Current Password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group form-group-full">
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="New Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required={isPasswordRequired}
                                    />
                                </div>
                                <div className="form-group form-group-full confirmPassword">
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required={isPasswordRequired}
                                    />
                                </div>
                                {error && <p className="error-message">{error}</p>}
                            </div>
                        )}

                        <div className="settings-button-container">
                            <button type="button" onClick={handleBackClick} className="back-button">Back</button>
                            <button type="submit" className="submit-button" disabled={isLoading}>
                                {isLoading ? 'Updating profile...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="user-details">
                        <div className="user-detail">
                            <p className="detail-title">Employee No.</p>
                            <p className="detail-value">{employeeData.id}</p>
                        </div>
                        <div className="user-detail">
                            <p className="detail-title">Full Name</p>
                            <p className="detail-value">{employeeData.name}</p>
                        </div>
                        <div className="user-detail">
                            <p className="detail-title">Job Title</p>
                            <p className="detail-value">{employeeData.jobTitle}</p>
                        </div>
                        <div className="user-detail">
                            <p className="detail-title">Contact No.</p>
                            <p className="detail-value">{employeeData.contact}</p>
                        </div>
                        <div className="user-detail">
                            <p className="detail-title">Email Address</p>
                            <p className="detail-value">{employeeData.email}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
