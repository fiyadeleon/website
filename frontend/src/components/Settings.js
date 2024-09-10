import React, { useState, useEffect } from 'react';
import '../styles/Settings.css';
import user from '../images/user.png';
import editIcon from '../images/edit.png';

const Settings = () => {
    const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "https://q2tf3g5e4l.execute-api.ap-southeast-1.amazonaws.com/v1";
    const API_KEY = process.env.REACT_APP_API_KEY || "XZSNV5hFIaaCJRBznp9mW2VPndBpD97V98E1irxs";
    const [isEditing, setIsEditing] = useState(false);
    const [employeeData, setEmployeeData] = useState(null);
    const [contact, setContact] = useState(''); 
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isPasswordRequired, setIsPasswordRequired] = useState(false);

    const id = localStorage.getItem('id');

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const response = await fetch(`${API_ENDPOINT}/item?resource=employee&id=${id}`, {
                    method: 'GET',
                    headers: {
                        'x-api-key': API_KEY
                    },
                });
                const data = await response.json();
                
                setEmployeeData(data);
                setContact(data.contact);
                setEmail(data.email);
            } catch (error) {
                console.error('Error fetching employee data:', error);
            }
        };

        if (id) {
            fetchEmployeeData();
        }
    }, [id]);

    const handleBackClick = () => {
        setIsEditing(false);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSubmitClick = async (e) => {
        e.preventDefault();

        if (isPasswordRequired && password !== confirmPassword) {
            setError('Passwords do not match');
        } else {
            setError('');

            const updatedData = {
                contact,
                email,
                ...(isPasswordRequired && { password }) 
            };

            try {
                const response = await fetch(`${API_ENDPOINT}/item/?resource=employee&id=${encodeURIComponent(localStorage.getItem('id'))}`, {
                    method: 'GET',
                    headers: {
                        'x-api-key': API_KEY
                    },
                });

                if (response.ok) {
                    const updatedEmployee = await response.json();
                    setEmployeeData(updatedEmployee);
                    setIsEditing(false);
                } else {
                    console.error('Error updating employee data');
                }
            } catch (error) {
                console.error('Error updating employee data:', error);
            }
        }
    };

    const handlePasswordToggle = () => {
        setIsPasswordRequired(!isPasswordRequired);
        document.getElementById('passwordFields').classList.toggle('hidden');
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
                        <div id="passwordFields" className="form-group-half hidden">
                            <div className="form-group form-group-full">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Password"
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
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required={isPasswordRequired}
                                />
                            </div>
                            {error && <p className="error-message">{error}</p>}
                        </div>
                        <div className="settings-button-container">
                            <button type="button" onClick={handleBackClick} className="back-button">Back</button>
                            <button type="submit" className="submit-button">Submit</button>
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
