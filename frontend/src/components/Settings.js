import React, { useState } from 'react';
import UserPanel from './UserPanel';
import '../styles/Settings.css';
import user from '../images/user.png';
import editIcon from '../images/edit.png';

const Settings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [contactNo, setContactNo] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);

  const handleBackClick = () => {
    setIsEditing(false);
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();

    if (isPasswordRequired && password !== confirmPassword) {
      console.log('if')
      console.log(isPasswordRequired, password, confirmPassword);
      setError('Passwords do not match');
    } else {
      console.log('else')
      console.log(isPasswordRequired, password, confirmPassword);
      setError('');
      // Add the logic to submit the form data here
    }
  };

  const handlePasswordToggle = () => {
    setIsPasswordRequired(!isPasswordRequired);
    document.getElementById('passwordFields').classList.toggle('hidden');
  };

  return (
    <div className="settings-container-wrapper">
      <UserPanel>
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
              <label htmlFor="contactNo">Contact No.</label>
              <input 
                type="tel" 
                id="contactNo" 
                name="contactNo" 
                pattern="\d{11}" 
                maxLength="11"
                value={contactNo} 
                onChange={(e) => setContactNo(e.target.value)} 
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
                <p className="detail-value">EMP001</p>
              </div>
              <div className="user-detail">
                <p className="detail-title">Full Name</p>
                <p className="detail-value">John Doe</p>
              </div>
              <div className="user-detail">
                <p className="detail-title">Job Title</p>
                <p className="detail-value">Senior Mechanic</p>
              </div>
              <div className="user-detail">
                <p className="detail-title">Contact No.</p>
                <p className="detail-value">12803813899021</p>
              </div>
              <div className="user-detail">
                <p className="detail-title">Email Address</p>
                <p className="detail-value">john@example.com</p>
              </div>
            </div>
          )}
        </div>
      </UserPanel>
    </div>
  );
};

export default Settings;
