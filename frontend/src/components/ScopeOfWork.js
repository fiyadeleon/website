import React, { useState } from 'react';
import '../styles/ScopeOfWork.css';
import UserPanel from './UserPanel';

const ScopeOfWork = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCustomerDetails, setShowCustomerDetails] = useState(false);
    const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleToggleCustomer = () => {
        setShowCustomerDetails(!showCustomerDetails);  // Toggle between true and false
    };

    const handleToggleEmployee = () => {
        setShowEmployeeDetails(!showEmployeeDetails);  // Toggle between true and false
    };

    return (
        <UserPanel>
            <div className="sow-scope-of-work">
                <div className="sow-header">
                    <h1>SCOPE OF WORK</h1>
                    <button className="sow-clear-button">Clear</button>
                </div>

                <div className="sow-user-info">
                    <div className="sow-customer-section">
                        <h2>CUSTOMER</h2>
                        {!showCustomerDetails && (
                            <div className="sow-search-bar">
                                <span className="material-symbols-outlined sow-search-icon">search</span>
                                <input
                                    type="text"
                                    placeholder="Search Customer"
                                    className="sow-search-input"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        )}
                        <button 
                          className={`sow-add-customer-btn ${showCustomerDetails ? 'cancel' : ''}`} onClick={handleToggleCustomer}
                        >
                            {showCustomerDetails ? 'Cancel' : '+ Add New Customer'}
                        </button>

                        {showCustomerDetails && (
                            <div className="sow-customer-details">
                                <p><strong>Name:</strong></p>
                                <input className="sow-placeholder" type="text" placeholder="Enter name" required />

                                <p><strong>Car Model:</strong></p>
                                <input className="sow-placeholder" type="text" placeholder="Enter car model" required />
                                
                                <p><strong>Plate No:</strong></p>
                                <input className="sow-placeholder" type="text" placeholder="Enter plate number" required />
                                
                                <p><strong>Contact No:</strong></p>
                                <input className="sow-placeholder" type="text" placeholder="Enter contact number" required />

                                <p><strong>Email:</strong></p>
                                <input className="sow-placeholder" type="email" placeholder="Enter email" required />
                                
                                <p><strong>Address:</strong></p>
                                <input className="sow-placeholder" type="text" placeholder="Enter address" required />
                            </div>
                        )}
                    </div>

                    <div className="sow-employee-section">
                        <h2>EMPLOYEE</h2>

                        {!showEmployeeDetails && (
                            <div className="sow-search-bar">
                                <span className="material-symbols-outlined sow-search-icon">search</span>
                                <input
                                    type="text"
                                    placeholder="Search Employee"
                                    className="sow-search-input"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        )}
                        <button 
                          className={`sow-add-employee-btn ${showEmployeeDetails ? 'cancel' : ''}`} 
                          onClick={handleToggleEmployee}
                        >
                            {showEmployeeDetails ? 'Cancel' : '+ Add New Employee'}
                        </button>

                        {showEmployeeDetails && (
                            <div className="sow-employee-details">
                                <p><strong>Name:</strong></p>
                                <input className="sow-placeholder" type="text" placeholder="Enter name" required />
                                
                                <p><strong>Job Title:</strong></p>
                                <input className="sow-placeholder" type="text" placeholder="Enter job title" required />
                                
                                <p><strong>Contact No:</strong></p>
                                <input className="sow-placeholder" type="text" placeholder="Enter contact number" required />

                                <p><strong>Email</strong></p>
                                <input className="sow-placeholder" type="text" placeholder="Enter email" required />
                                
                                <p><strong>Address:</strong></p>
                                <input className="sow-placeholder" type="text" placeholder="Enter address" required />
                            </div>
                        )}
                    </div>
                </div>

                <div className="sow-parts-section">
                    <div className="sow-header-section">
                        <h3>Parts</h3>
                        <span className="material-symbols-outlined sow-info-icon" data-tooltip="Select the part(s) required to complete the outlined services.">info</span>
                    </div>
                    <div className="sow-search-bar">
                      <span className="material-symbols-outlined sow-search-icon">search</span>
                      <input
                          type="text"
                          placeholder="Search Inventory"
                          className="sow-search-input"
                          value={searchQuery}
                          onChange={handleSearchChange}
                      />
                    </div>
                </div>

                <div className="sow-services-section">
                    <div className="sow-header-section">
                        <h3>Services</h3>
                        <span className="material-symbols-outlined sow-info-icon" data-tooltip="These are the services performed on the client's vehicle.">info</span>
                    </div>
                    <textarea className="sow-services-textarea" placeholder="Enter service details here..."></textarea>
                </div>


                <div className="sow-remarks-section">
                    <div className="sow-header-section">
                        <h3>Remarks</h3>
                        <span className="material-symbols-outlined sow-info-icon" data-tooltip="Further details regarding the completed inspections.">info</span>
                    </div>
                    <textarea className="sow-remarks-textarea" placeholder="Enter remarks here..."></textarea>
                </div>

                <button className="sow-save-button">Save as .PDF</button>
            </div>
        </UserPanel>
    );
};

export default ScopeOfWork;
