import React, { useState, useEffect, useRef } from 'react';
import '../styles/ScopeOfWork.css';
import UserPanel from './UserPanel';

const ScopeOfWork = () => {
    const [customerQuery, setCustomerQuery] = useState('');
    const [employeeQuery, setEmployeeQuery] = useState('');
    const [inventoryQuery, setInventoryQuery] = useState('');

    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedInventoryItems, setSelectedInventoryItems] = useState([]);

    const [showCustomerDetails, setShowCustomerDetails] = useState(false);
    const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

    const [isInventoryInputFocused, setIsInventoryInputFocused] = useState(false);

    const customerSearchRef = useRef();
    const employeeSearchRef = useRef();
    const inventorySearchRef = useRef();
    
    const customers = [
        { id: 'CUST001', name: 'John Doe', contact: '1234567890', email: 'john@example.com', address: '123 Main St', plateNo: 'ABC123', carModel: 'Ford Mustang GT' },
        { id: 'CUST002', name: 'Jane Smith', contact: '0987654321', email: 'jane@example.com', address: '456 Elm St', plateNo: 'XYZ456', carModel: 'Ford Mustang EcoBoost' },
        { id: 'CUST003', name: 'Michael Brown', contact: '5555555555', email: 'michael@example.com', address: '789 Oak St', plateNo: 'LMN789', carModel: 'Ford Mustang Shelby GT500' },
        { id: 'CUST004', name: 'Alice Johnson', contact: '1112223333', email: 'alice@example.com', address: '321 Pine St', plateNo: 'QRS234', carModel: 'Ford Mustang Mach 1' },
        { id: 'CUST005', name: 'Bob Williams', contact: '4445556666', email: 'bob@example.com', address: '654 Cedar St', plateNo: 'TUV678', carModel: 'Ford Mustang GT Convertible' },
        { id: 'CUST006', name: 'David Martin', contact: '9998887777', email: 'david@example.com', address: '101 Maple Ave', plateNo: 'JKL012', carModel: 'Tesla Model 3' },
        { id: 'CUST007', name: 'Sarah Lee', contact: '8887776666', email: 'sarah@example.com', address: '202 Birch Ave', plateNo: 'PQR789', carModel: 'Toyota Prius' },
        { id: 'CUST008', name: 'Chris Evans', contact: '7776665555', email: 'chris@example.com', address: '303 Spruce St', plateNo: 'STU123', carModel: 'Chevrolet Corvette' },
        { id: 'CUST009', name: 'Laura Green', contact: '6665554444', email: 'laura@example.com', address: '404 Oak St', plateNo: 'VWX987', carModel: 'BMW X5' },
        { id: 'CUST010', name: 'Kevin White', contact: '5554443333', email: 'kevin@example.com', address: '505 Pine St', plateNo: 'ZAB456', carModel: 'Mercedes-Benz C-Class' }
    ];
    
    const employees = [
        { id: 'EMP001', jobTitle: 'Senior Mechanic', name: 'Liam Jackson', contact: '1234567890', email: 'liam@example.com', salary: 55000 },
        { id: 'EMP002', jobTitle: 'Engine Specialist', name: 'Olivia Parker', contact: '0987654321', email: 'olivia@example.com', salary: 60000 },
        { id: 'EMP003', jobTitle: 'Transmission Technician', name: 'Noah Miller', contact: '5555555555', email: 'noah@example.com', salary: 58000 },
        { id: 'EMP004', jobTitle: 'Brake and Suspension Specialist', name: 'Emma Davis', contact: '1112223333', email: 'emma@example.com', salary: 57000 },
        { id: 'EMP005', jobTitle: 'Diagnostic Technician', name: 'James Wilson', contact: '4445556666', email: 'james@example.com', salary: 62000 },
        { id: 'EMP006', jobTitle: 'Electric Vehicle Specialist', name: 'Sophia Carter', contact: '3332221111', email: 'sophia@example.com', salary: 63000 },
        { id: 'EMP007', jobTitle: 'Body Shop Technician', name: 'William Taylor', contact: '2221110000', email: 'william@example.com', salary: 59000 },
        { id: 'EMP008', jobTitle: 'Air Conditioning Technician', name: 'Isabella Moore', contact: '1110009999', email: 'isabella@example.com', salary: 61000 },
        { id: 'EMP009', jobTitle: 'Painter', name: 'Benjamin Harris', contact: '9991118888', email: 'benjamin@example.com', salary: 56000 },
        { id: 'EMP010', jobTitle: 'Tire Specialist', name: 'Charlotte Thompson', contact: '8887776666', email: 'charlotte@example.com', salary: 54000 }
    ];        
    
    const inventoryItems = [
        { id: "PROD-CA1234-20240101", product_name: "Engine Oil", category: "Lubricants", stock: 120, unit: "box", price: 450.00},
        { id: "PROD-BR5678-20240101", product_name: "Brake Pads", category: "Brakes", stock: 75, unit: "box", price: 1500.50},
        { id: "PROD-TY9101-20240101", product_name: "All-Season Tires", category: "Tires", stock: 40, unit: "piece", price: 5500.00},
        { id: "PROD-BT2345-20240101", product_name: "Car Battery", category: "Batteries", stock: 65, unit: "piece", price: 3200.00},
        { id: "PROD-FL6789-20240101", product_name: "Fuel Filter", category: "Filters", stock: 200, unit: "piece", price: 300.00},
        { id: "PROD-WP2345-20240102", product_name: "Windshield Wiper", category: "Accessories", stock: 150, unit: "box", price: 600.00},
        { id: "PROD-OF5678-20240102", product_name: "Oil Filter", category: "Filters", stock: 95, unit: "piece", price: 350.00},
        { id: "PROD-RB6789-20240103", product_name: "Radiator Belt", category: "Belts", stock: 50, unit: "piece", price: 1200.00},
        { id: "PROD-EX7890-20240103", product_name: "Exhaust Pipe", category: "Exhaust", stock: 30, unit: "piece", price: 8000.00},
        { id: "PROD-BR2345-20240104", product_name: "Brake Fluid", category: "Fluids", stock: 250, unit: "box", price: 400.00},
        { id: "PROD-LB1234-20240105", product_name: "LED Headlights", category: "Lighting", stock: 80, unit: "box", price: 7000.00},
        { id: "PROD-AC5678-20240105", product_name: "Air Conditioning Filter", category: "Filters", stock: 100, unit: "piece", price: 1200.00},
        { id: "PROD-TR6789-20240106", product_name: "Transmission Fluid", category: "Fluids", stock: 60, unit: "box", price: 1600.00},
        { id: "PROD-SP8901-20240106", product_name: "Spark Plug", category: "Engine Parts", stock: 220, unit: "piece", price: 300.00},
        { id: "PROD-TB9012-20240107", product_name: "Timing Belt", category: "Belts", stock: 35, unit: "piece", price: 2500.00}
    ]; 

    useEffect(() => {
        // Event listener to close dropdowns when clicking outside
        const handleClickOutside = (event) => {
            if (
                customerSearchRef.current && !customerSearchRef.current.contains(event.target) &&
                employeeSearchRef.current && !employeeSearchRef.current.contains(event.target) &&
                inventorySearchRef.current && !inventorySearchRef.current.contains(event.target)
            ) {
                setFilteredCustomers([]);
                setFilteredEmployees([]);
                setFilteredInventory([]);
                setIsInventoryInputFocused(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Customer search handler
    const handleCustomerSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setCustomerQuery(query);

        const customerResults = customers.filter(customer => 
            customer.name.toLowerCase().includes(query) || 
            customer.plateNo.toLowerCase().includes(query)
        );

        setFilteredCustomers(customerResults.slice(0, 5)); // Show max 5 results
    };

    // Employee search handler
    const handleEmployeeSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setEmployeeQuery(query);

        const employeeResults = employees.filter(employee =>
            employee.name.toLowerCase().includes(query) ||
            employee.jobTitle.toLowerCase().includes(query)
        );

        setFilteredEmployees(employeeResults.slice(0, 5)); // Show max 5 results
    };

    // Display selected customer details
    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setFilteredCustomers([]);  // Clear dropdown options
        setShowCustomerDetails(false); // Hide add new form
    };

    // Display selected employee details
    const handleEmployeeSelect = (employee) => {
        setSelectedEmployee(employee);
        setFilteredEmployees([]);  // Clear dropdown options
        setShowEmployeeDetails(false); // Hide add new form
    };

    const handleInventorySearch = (event) => {
        const query = event.target.value.toLowerCase();
        setInventoryQuery(query);

        const inventoryResults = inventoryItems.filter(item =>
            item.product_name.toLowerCase().includes(query) &&
            !selectedInventoryItems.some(selectedItem => selectedItem.id === item.id)
        );

        setFilteredInventory(inventoryResults.slice(0, 5)); // Show max 5 results
    };

    const handleInventorySelect = (item) => {
        setSelectedInventoryItems((prevSelectedItems) => [...prevSelectedItems, item]);
        setFilteredInventory([]);  // Clear dropdown options
        setInventoryQuery('');     // Clear search input
        setIsInventoryInputFocused(false);
    };

    const handleRemoveInventoryItem = (itemId) => {
        setSelectedInventoryItems((prevSelectedItems) =>
            prevSelectedItems.filter(item => item.id !== itemId)
        );
    };

    const handleInventoryFocus = () => {
        // Show max 5 inventory items, excluding already selected items
        const availableInventory = inventoryItems.filter(item =>
            !selectedInventoryItems.some(selectedItem => selectedItem.id === item.id) // Exclude selected items
        );
        setFilteredInventory(availableInventory.slice(0, 5)); // Default dropdown on focus
        setIsInventoryInputFocused(true); // Show dropdown when focused
    };

    // Toggle Add New Customer
    const handleToggleCustomer = () => {
        setShowCustomerDetails(!showCustomerDetails);
        if (showCustomerDetails) {
            // If toggling off, reset customer selection and query
            setSelectedCustomer(null);
            setCustomerQuery('');
        }
    };

    // Toggle Add New Employee
    const handleToggleEmployee = () => {
        setShowEmployeeDetails(!showEmployeeDetails);
        if (showEmployeeDetails) {
            // If toggling off, reset employee selection and query
            setSelectedEmployee(null);
            setEmployeeQuery('');
        }
    };

    const handleClear = () => {
        // Reset all states to initial values
        setCustomerQuery('');
        setEmployeeQuery('');
        setInventoryQuery('');
        setFilteredCustomers([]);
        setFilteredEmployees([]);
        setFilteredInventory([]);
        setSelectedCustomer(null);
        setSelectedEmployee(null);
        setSelectedInventoryItems([]);
        setShowCustomerDetails(false);
        setShowEmployeeDetails(false);
    };    

    return (
        <UserPanel>
            <div className="sow-scope-of-work">
                <div className="sow-header">
                    <h1>SCOPE OF WORK</h1>
                    <button className="sow-clear-button" onClick={handleClear}>Clear</button>
                </div>

                <div className="sow-user-info">
                    <div className="sow-customer-section" ref={customerSearchRef}>
                        <h2>CUSTOMER</h2>
                        {!showCustomerDetails && (
                            <div className="sow-search-bar">
                                <span className="material-symbols-outlined sow-search-icon">search</span>
                                <input
                                    type="text"
                                    placeholder="Search Customer"
                                    className="sow-search-input"
                                    value={customerQuery}
                                    onChange={handleCustomerSearch}
                                    onFocus={() => setFilteredCustomers(customers.slice(0, 5))}
                                />
                            </div>
                        )}
                        {filteredCustomers.length > 0 && (
                            <div className="sow-dropdown">
                                {filteredCustomers.map((customer, index) => (
                                    <div className="sow-dropdown-option" key={index} onClick={() => handleCustomerSelect(customer)}>
                                        <span className="sow-dropdown-text">{customer.name}</span>
                                        <span className="sow-dropdown-actions">{customer.plateNo}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {selectedCustomer && !showCustomerDetails && (
                            <div className="sow-customer-details">
                                <p><strong>Name:</strong> {selectedCustomer.name}</p>
                                <p><strong>Car Model:</strong> {selectedCustomer.carModel}</p>
                                <p><strong>Plate No:</strong> {selectedCustomer.plateNo}</p>
                                <p><strong>Contact:</strong> {selectedCustomer.contact}</p>
                                <p><strong>Email:</strong> {selectedCustomer.email}</p>
                                <p><strong>Address:</strong> {selectedCustomer.address}</p>
                            </div>
                        )}
                        <button 
                            className={`sow-add-customer-btn ${showCustomerDetails ? 'cancel' : ''}`} 
                            onClick={handleToggleCustomer}
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

                    <div className="sow-employee-section" ref={employeeSearchRef}>
                        <h2>EMPLOYEE</h2>
                        {!showEmployeeDetails && (
                            <div className="sow-search-bar">
                                <span className="material-symbols-outlined sow-search-icon">search</span>
                                <input
                                    type="text"
                                    placeholder="Search Employee"
                                    className="sow-search-input"
                                    value={employeeQuery}
                                    onChange={handleEmployeeSearch}
                                    onFocus={() => setFilteredEmployees(employees.slice(0, 5))}
                                />
                            </div>
                        )}
                        {filteredEmployees.length > 0 && (
                            <div className="sow-dropdown">
                                {filteredEmployees.map((employee, index) => (
                                    <div className="sow-dropdown-option" key={index} onClick={() => handleEmployeeSelect(employee)}>
                                        <span className="sow-dropdown-text">{employee.name}</span>
                                        <span className="sow-dropdown-actions">{employee.jobTitle}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {selectedEmployee && !showEmployeeDetails && (
                            <div className="sow-employee-details">
                                <p><strong>Name:</strong> {selectedEmployee.name}</p>
                                <p><strong>Job Title:</strong> {selectedEmployee.jobTitle}</p>
                                <p><strong>Contact:</strong> {selectedEmployee.contact}</p>
                                <p><strong>Email:</strong> {selectedEmployee.email}</p>
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

                                <p><strong>Email:</strong></p>
                                <input className="sow-placeholder" type="text" placeholder="Enter email" required />
                                
                                <p><strong>Address:</strong></p>
                                <input className="sow-placeholder" type="text" placeholder="Enter address" required />
                            </div>
                        )}
                    </div>
                </div>

                <div className="sow-parts-section" ref={inventorySearchRef}>
                    <div className="sow-header-section">
                        <h3>Inventory</h3>
                        <span className="material-symbols-outlined sow-info-icon" data-tooltip="Select the part(s) or item(s) required to complete the outlined services.">info</span>
                    </div>
                    <div className="sow-search-bar">
                        <span className="material-symbols-outlined sow-search-icon">search</span>
                        <input
                            type="text"
                            placeholder="Search for parts or items"
                            className="sow-search-input"
                            value={inventoryQuery}
                            onChange={handleInventorySearch}
                            onFocus={handleInventoryFocus}
                        />
                    </div>
                    {isInventoryInputFocused && filteredInventory.length > 0 && (
                        <div className="sow-dropdown">
                            {filteredInventory.map((item, index) => (
                                <div className="sow-dropdown-option" key={index} onClick={() => handleInventorySelect(item)}>
                                    <span className="sow-dropdown-text">{item.product_name}</span>
                                    <span className="sow-dropdown-actions">
                                        {item.stock} {item.unit}{item.unit === 'box' ? 'es' : 's'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="sow-selected-items">
                        {selectedInventoryItems.map((item) => (
                            <div key={item.id} className="sow-selected-item">
                                <span>{item.product_name}</span>
                                <button
                                    className="remove-item-btn"
                                    onClick={() => handleRemoveInventoryItem(item.id)}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
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
