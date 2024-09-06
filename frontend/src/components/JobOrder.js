import React, { useState } from 'react';
import '../styles/JobOrder.css';
import UserPanel from './UserPanel';

const JobOrder = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCustomerDetails, setShowCustomerDetails] = useState(false);
    const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleToggleCustomer = () => {
        setShowCustomerDetails(!showCustomerDetails);
    };

    const handleToggleEmployee = () => {
        setShowEmployeeDetails(!showEmployeeDetails);
    };

    return (
        <UserPanel>
            <div className="jo-job-order">
                <div className="jo-header">
                    <h1>JOB ORDER</h1>
                    <button className="jo-clear-button">Clear</button>
                </div>

                <div className="jo-user-info">
                    <div className="jo-customer-section">
                        <h2>CUSTOMER</h2>
                        {!showCustomerDetails && (
                            <div className="jo-search-bar">
                                <span className="material-symbols-outlined jo-search-icon">search</span>
                                <input
                                    type="text"
                                    placeholder="Search Customer"
                                    className="jo-search-input"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        )}
                        <button 
                          className={`jo-add-customer-btn ${showCustomerDetails ? 'cancel' : ''}`} onClick={handleToggleCustomer}
                        >
                            {showCustomerDetails ? 'Cancel' : '+ Add New Customer'}
                        </button>

                        {showCustomerDetails && (
                            <div className="jo-customer-details">
                                <p><strong>Name:</strong></p>
                                <input className="jo-placeholder" type="text" placeholder="Enter name" required />

                                <p><strong>Car Model:</strong></p>
                                <input className="jo-placeholder" type="text" placeholder="Enter car model" required />
                                
                                <p><strong>Plate No:</strong></p>
                                <input className="jo-placeholder" type="text" placeholder="Enter plate number" required />
                                
                                <p><strong>Contact No:</strong></p>
                                <input className="jo-placeholder" type="text" placeholder="Enter contact number" required />

                                <p><strong>Email:</strong></p>
                                <input className="jo-placeholder" type="email" placeholder="Enter email" required />
                                
                                <p><strong>Address:</strong></p>
                                <input className="jo-placeholder" type="text" placeholder="Enter address" required />
                            </div>
                        )}
                    </div>

                    <div className="jo-employee-section">
                        <h2>EMPLOYEE</h2>

                        {!showEmployeeDetails && (
                            <div className="jo-search-bar">
                                <span className="material-symbols-outlined jo-search-icon">search</span>
                                <input
                                    type="text"
                                    placeholder="Search Employee"
                                    className="jo-search-input"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        )}
                        <button 
                          className={`jo-add-employee-btn ${showEmployeeDetails ? 'cancel' : ''}`} 
                          onClick={handleToggleEmployee}
                        >
                            {showEmployeeDetails ? 'Cancel' : '+ Add New Employee'}
                        </button>

                        {showEmployeeDetails && (
                            <div className="jo-employee-details">
                                <p><strong>Name:</strong></p>
                                <input className="jo-placeholder" type="text" placeholder="Enter name" required />
                                
                                <p><strong>Job Title:</strong></p>
                                <input className="jo-placeholder" type="text" placeholder="Enter job title" required />
                                
                                <p><strong>Contact No:</strong></p>
                                <input className="jo-placeholder" type="text" placeholder="Enter contact number" required />

                                <p><strong>Email</strong></p>
                                <input className="jo-placeholder" type="text" placeholder="Enter email" required />
                                
                                <p><strong>Address:</strong></p>
                                <input className="jo-placeholder" type="text" placeholder="Enter address" required />
                            </div>
                        )}
                    </div>
                </div>

                <div className="jo-parts-section">
                    <div className="jo-header-section">
                        <h3>Parts</h3>
                        <span className="material-symbols-outlined jo-info-icon" data-tooltip="Select the part(s) required to complete the outlined services.">info</span>
                    </div>
                    <div className="jo-search-bar">
                      <span className="material-symbols-outlined jo-search-icon">search</span>
                      <input
                          type="text"
                          placeholder="Search Inventory"
                          className="jo-search-input"
                          value={searchQuery}
                          onChange={handleSearchChange}
                      />
                    </div>
                </div>

                <div className="jo-services-section">
                    <div className="jo-header-section">
                        <h3>Services</h3>
                        <span className="material-symbols-outlined jo-info-icon" data-tooltip="These are the services performed on the client's vehicle.">info</span>
                    </div>
                    <textarea className="jo-services-textarea" placeholder="Enter service details here..."></textarea>
                </div>


                <div className="jo-remarks-section">
                    <div className="jo-header-section">
                        <h3>Remarks</h3>
                        <span className="material-symbols-outlined jo-info-icon" data-tooltip="Further details regarding the completed inspections.">info</span>
                    </div>
                    <textarea className="jo-remarks-textarea" placeholder="Enter remarks here..."></textarea>
                </div>

                <button className="jo-save-button">Save as .PDF</button>
            </div>
        </UserPanel>
    );
};

export default JobOrder;
