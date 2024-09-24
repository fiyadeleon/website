import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import '../styles/Settings.css';
import user from '../images/user.png';
import editIcon from '../images/edit.png';
import awsconfig from '../aws-exports';

const cognito = new AWS.CognitoIdentityServiceProvider();
let USER_POOL_ID = process.env.REACT_APP_COGNITO_USER_POOL_ID || awsconfig.aws_user_pools_id;
let CLIENT_ID = process.env.REACT_APP_COGNITO_CLIENT_ID || awsconfig.aws_user_pools_web_client_id;
let API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
let API_KEY = process.env.REACT_APP_API_KEY;

const Settings = () => {
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
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        setError('');
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSubmitClick = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
    
        if (isPasswordRequired && (password !== confirmPassword || password.length < 6)) {
            setError('Passwords do not match or password is too short.');
            setIsLoading(false);
            return;
        }
    
        try {
            // Update other profile data
            const updatedData = {
                id: localStorage.getItem('id'),
                contact,
                email,
                password: isPasswordRequired ? password : undefined
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
                // Update Cognito password
                if (isPasswordRequired) {
                    console.log(email, currentPassword, password);
                    await updateCognitoPassword(email, currentPassword, password);
                }

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

    const updateCognitoPassword = async (email, currentPassword, newPassword) => {
        try {
            const authResult = await cognito.adminInitiateAuth({
                AuthFlow: 'ADMIN_NO_SRP_AUTH',
                UserPoolId: USER_POOL_ID,
                ClientId: CLIENT_ID,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: currentPassword, 
                },
            }).promise();

            let accessToken = authResult['AuthenticationResult']['AccessToken']

            const changePasswordResult = await cognito.changePassword({
                AccessToken: accessToken, 
                PreviousPassword: currentPassword,
                ProposedPassword: newPassword, 
            }).promise();
            console.log(changePasswordResult)

        } catch (error) {
            console.error('Incorrect current password:', error);
            throw new Error('Incorrect current password.');
        }
    };

    const handlePasswordToggle = () => {
        setIsPasswordRequired(!isPasswordRequired);
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
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
                                        required
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
                                        required
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
