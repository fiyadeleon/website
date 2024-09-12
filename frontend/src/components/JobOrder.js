import React, { useState, useEffect, useRef } from 'react';
import '../styles/JobOrder.css';

const JobOrder = () => {
    const [customerQuery, setCustomerQuery] = useState('');
    const [employeeQuery, setEmployeeQuery] = useState('');
    const [inventoryQuery, setInventoryQuery] = useState('');

    const [newCustomer, setNewCustomer] = useState({
        name: '',
        carModel: '',
        plateNo: '',
        contact: '',
        email: '',
        address: ''
    });

    const [newEmployee, setNewEmployee] = useState({
        name: '',
        jobTitle: '',
        contact: '',
        email: '',
        address: ''
    });

    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedInventoryItems, setSelectedInventoryItems] = useState([]);

    const [showCustomerDetails, setShowCustomerDetails] = useState(false);
    const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

    const [isInventoryInputFocused, setIsInventoryInputFocused] = useState(false);
    const [errors, setErrors] = useState({});

    const customerSearchRef = useRef();
    const employeeSearchRef = useRef();
    const inventorySearchRef = useRef();
    
    const [customers, setCustomers] = useState([
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
    ]);
    
    const [employees, setEmployee] = useState([
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
    ]);        
    
    const [inventoryItems, setInventoryItems] = useState([
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
    ]); 

    useEffect(() => {
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

    const handleCustomerSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setCustomerQuery(query);
        const customerResults = customers.filter(customer => 
            customer.name.toLowerCase().includes(query) || 
            customer.plateNo.toLowerCase().includes(query)
        );
        setFilteredCustomers(customerResults.slice(0, 5));
    };

    const handleEmployeeSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setEmployeeQuery(query);
        const employeeResults = employees.filter(employee =>
            employee.name.toLowerCase().includes(query) ||
            employee.jobTitle.toLowerCase().includes(query)
        );
        setFilteredEmployees(employeeResults.slice(0, 5));
    };

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setFilteredCustomers([]);
        setShowCustomerDetails(false);
    };

    const handleEmployeeSelect = (employee) => {
        setSelectedEmployee(employee);
        setFilteredEmployees([]);
        setShowEmployeeDetails(false);
    };

    const handleInventorySearch = (event) => {
        const query = event.target.value.toLowerCase();
        setInventoryQuery(query);
        const inventoryResults = inventoryItems.filter(item =>
            item.product_name.toLowerCase().includes(query) &&
            !selectedInventoryItems.some(selectedItem => selectedItem.id === item.id)
        );
        setFilteredInventory(inventoryResults.slice(0, 5));
    };

    const handleInventorySelect = (item) => {
        setSelectedInventoryItems((prevSelectedItems) => [...prevSelectedItems, item]);
        setFilteredInventory([]);
        setInventoryQuery('');
        setIsInventoryInputFocused(false);
    };

    const handleRemoveInventoryItem = (itemId) => {
        const itemToRemove = selectedInventoryItems.find(item => item.id === itemId);

        setInventoryItems((prevItems) =>
            prevItems.map((invItem) =>
                invItem.id === itemId ? { ...invItem, stock: invItem.stock + itemToRemove.purchaseQuantity } : invItem
            )
        );

        setSelectedInventoryItems((prevSelectedItems) =>
            prevSelectedItems.filter(item => item.id !== itemId)
        );
    };

    const handleInventoryFocus = () => {
        const availableInventory = inventoryItems.filter(item =>
            !selectedInventoryItems.some(selectedItem => selectedItem.id === item.id)
        );
        setFilteredInventory(availableInventory.slice(0, 5));
        setIsInventoryInputFocused(true);
    };

    const handlePurchaseQuantityChange = (itemId, newQuantity) => {
        const quantity = parseInt(newQuantity, 10) || 0;

        setSelectedInventoryItems(prevItems =>
            prevItems.map(item => {
                if (item.id === itemId) {
                    const updatedQuantity = quantity > item.stock ? item.stock : quantity;
                    
                    return {
                        ...item,
                        purchaseQuantity: updatedQuantity
                    };
                }
                return item;
            })
        );
    };

    const handleToggleCustomer = () => {
        setShowCustomerDetails(!showCustomerDetails);
        if (showCustomerDetails) {
            setSelectedCustomer(null);
            setCustomerQuery('');
        }
    };

    const handleToggleEmployee = () => {
        setShowEmployeeDetails(!showEmployeeDetails);
        if (showEmployeeDetails) {
            setSelectedEmployee(null);
            setEmployeeQuery('');
        }
    };

    const validateCustomer = () => {
        let newErrors = {};
        if (!newCustomer.name) newErrors.name = 'Name is required';
        if (!newCustomer.carModel) newErrors.carModel = 'Car Model is required';
        if (!newCustomer.plateNo) newErrors.plateNo = 'Plate Number is required';
        if (!newCustomer.contact) newErrors.contact = 'Contact is required';
        if (!newCustomer.email) newErrors.email = 'Email is required';
        if (!newCustomer.address) newErrors.address = 'Address is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateEmployee = () => {
        let newErrors = {};
        if (!newEmployee.name) newErrors.name = 'Name is required';
        if (!newEmployee.jobTitle) newErrors.jobTitle = 'Job Title is required';
        if (!newEmployee.contact) newErrors.contact = 'Contact is required';
        if (!newEmployee.email) newErrors.email = 'Email is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveNewCustomer = (e) => {
        e.preventDefault();
        if (validateCustomer()) {
            console.log('Customer validated and saved');
            // Handle saving the customer
        }
    };

    const handleSaveNewEmployee = (e) => {
        e.preventDefault();
        if (validateEmployee()) {
            console.log('Employee validated and saved');
            // Handle saving the employee
        }
    };

    const handleClear = () => {
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
        document.querySelector('.jo-services-textarea').value = "";
        document.querySelector('.jo-remarks-textarea').value = "";
    };

    return (
        <div className="jo-job-order">
            <div className="jo-header">
                <h1>JOB ORDER</h1>
                <button className="jo-clear-button" onClick={handleClear}>Clear</button>
            </div>

            <div className="jo-user-info">
            <form className="jo-customer-section" ref={customerSearchRef} onSubmit={handleSaveNewCustomer}>
                <h2>CUSTOMER</h2>
                {!showCustomerDetails && (
                    <div className="jo-search-bar">
                        <span className="material-symbols-outlined jo-search-icon">search</span>
                        <input
                            type="text"
                            placeholder="Search Customer"
                            className="jo-search-input"
                            value={customerQuery}
                            onChange={handleCustomerSearch}
                            onFocus={() => setFilteredCustomers(customers.slice(0, 5))}
                        />
                    </div>
                )}
                {filteredCustomers.length > 0 && (
                    <div className="jo-dropdown">
                        {filteredCustomers.map((customer, index) => (
                            <div className="jo-dropdown-option" key={index} onClick={() => handleCustomerSelect(customer)}>
                                <span className="jo-dropdown-text">{customer.name}</span>
                                <span className="jo-dropdown-actions">{customer.plateNo}</span>
                            </div>
                        ))}
                    </div>
                )}
                {selectedCustomer && !showCustomerDetails && (
                    <div className="jo-customer-details">
                        <p><strong>Name:</strong> {selectedCustomer.name}</p>
                        <p><strong>Car Model:</strong> {selectedCustomer.carModel}</p>
                        <p><strong>Plate No:</strong> {selectedCustomer.plateNo}</p>
                        <p><strong>Contact:</strong> {selectedCustomer.contact}</p>
                        <p><strong>Email:</strong> {selectedCustomer.email}</p>
                        <p><strong>Address:</strong> {selectedCustomer.address}</p>
                    </div>
                )}
                <button 
                    type="button" // Changed to "button" to prevent triggering form submit on toggle
                    className={`jo-add-customer-btn ${showCustomerDetails ? 'cancel' : ''}`} 
                    onClick={handleToggleCustomer}
                >
                    {showCustomerDetails ? 'Cancel' : '+ Add New Customer'}
                </button>

                {showCustomerDetails && (
                    <div className="jo-customer-details">
                        <p><strong>Name:</strong></p>
                        <input
                            className="jo-placeholder"
                            type="text"
                            placeholder="Enter name"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            required
                        />
                        {errors.name && <span className="error">{errors.name}</span>}

                        <p><strong>Car Model:</strong></p>
                        <input
                            className="jo-placeholder"
                            type="text"
                            placeholder="Enter car model"
                            value={newCustomer.carModel}
                            onChange={(e) => setNewCustomer({ ...newCustomer, carModel: e.target.value })}
                            required
                        />
                        {errors.carModel && <span className="error">{errors.carModel}</span>}

                        <p><strong>Plate No:</strong></p>
                        <input
                            className="jo-placeholder"
                            type="text"
                            placeholder="Enter plate number"
                            value={newCustomer.plateNo}
                            onChange={(e) => setNewCustomer({ ...newCustomer, plateNo: e.target.value })}
                            required
                        />
                        {errors.plateNo && <span className="error">{errors.plateNo}</span>}

                        <p><strong>Contact No:</strong></p>
                        <input
                            className="jo-placeholder"
                            type="tel" 
                            pattern="[0-9]{11}" 
                            maxLength="11"
                            placeholder="Enter contact number"
                            value={newCustomer.contact}
                            onChange={(e) => setNewCustomer({ ...newCustomer, contact: e.target.value })}
                            required
                        />
                        {errors.contact && <span className="error">{errors.contact}</span>}

                        <p><strong>Email:</strong></p>
                        <input
                            className="jo-placeholder"
                            type="email"
                            placeholder="Enter email"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                            required
                        />
                        {errors.email && <span className="error">{errors.email}</span>}

                        <p><strong>Address:</strong></p>
                        <input
                            className="jo-placeholder"
                            type="text"
                            placeholder="Enter address"
                            value={newCustomer.address}
                            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                            required
                        />
                        {errors.address && <span className="error">{errors.address}</span>}

                        <button
                            className="jo-submit-btn"
                            type="submit" // Make this a submit button
                        >
                            Submit
                        </button>
                    </div>
                )}
            </form>

                <form className="jo-employee-section" ref={employeeSearchRef} onSubmit={handleSaveNewEmployee}>
                    <h2>EMPLOYEE</h2>
                    {!showEmployeeDetails && (
                        <div className="jo-search-bar">
                            <span className="material-symbols-outlined jo-search-icon">search</span>
                            <input
                                type="text"
                                placeholder="Search Employee"
                                className="jo-search-input"
                                value={employeeQuery}
                                onChange={handleEmployeeSearch}
                                onFocus={() => setFilteredEmployees(employees.slice(0, 5))}
                            />
                        </div>
                    )}
                    {filteredEmployees.length > 0 && (
                        <div className="jo-dropdown">
                            {filteredEmployees.map((employee, index) => (
                                <div className="jo-dropdown-option" key={index} onClick={() => handleEmployeeSelect(employee)}>
                                    <span className="jo-dropdown-text">{employee.name}</span>
                                    <span className="jo-dropdown-actions">{employee.jobTitle}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {selectedEmployee && !showEmployeeDetails && (
                        <div className="jo-employee-details">
                            <p><strong>Name:</strong> {selectedEmployee.name}</p>
                            <p><strong>Job Title:</strong> {selectedEmployee.jobTitle}</p>
                            <p><strong>Contact:</strong> {selectedEmployee.contact}</p>
                            <p><strong>Email:</strong> {selectedEmployee.email}</p>
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
                            <input
                                className="jo-placeholder"
                                type="text"
                                placeholder="Enter name"
                                value={newEmployee.name}
                                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                required
                            />
                            {errors.name && <span className="error">{errors.name}</span>}

                            <p><strong>Job Title:</strong></p>
                            <input
                                className="jo-placeholder"
                                type="text"
                                placeholder="Enter job title"
                                value={newEmployee.jobTitle}
                                onChange={(e) => setNewEmployee({ ...newEmployee, jobTitle: e.target.value })}
                                required
                            />
                            {errors.jobTitle && <span className="error">{errors.jobTitle}</span>}

                            <p><strong>Contact No:</strong></p>
                            <input
                                className="jo-placeholder"
                                type="tel" 
                                pattern="[0-9]{11}" 
                                maxLength="11"
                                placeholder="Enter contact number"
                                value={newEmployee.contact}
                                onChange={(e) => setNewEmployee({ ...newEmployee, contact: e.target.value })}
                                required
                            />
                            {errors.contact && <span className="error">{errors.contact}</span>}

                            <p><strong>Email:</strong></p>
                            <input
                                className="jo-placeholder"
                                type="email"
                                placeholder="Enter email"
                                value={newEmployee.email}
                                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                required
                            />
                            {errors.email && <span className="error">{errors.email}</span>}

                            <button
                                className="jo-submit-btn"
                                type="submit"
                            >
                                Submit
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <div className="jo-parts-section" ref={inventorySearchRef}>
                <div className="jo-header-section">
                    <h3>Inventory</h3>
                    <span className="material-symbols-outlined jo-info-icon" data-tooltip="Select the part(s) or item(s) required to complete the outlined services.">info</span>
                </div>
                <div className="jo-search-bar">
                    <span className="material-symbols-outlined jo-search-icon">search</span>
                    <input
                        type="text"
                        placeholder="Search for parts or items"
                        className="jo-search-input"
                        value={inventoryQuery}
                        onChange={handleInventorySearch}
                        onFocus={handleInventoryFocus}
                    />
                </div>
                {isInventoryInputFocused && filteredInventory.length > 0 && (
                    <div className="jo-dropdown">
                        {filteredInventory.map((item, index) => (
                            <div className="jo-dropdown-option" key={index} onClick={() => handleInventorySelect(item)}>
                                <span className="jo-dropdown-text">{item.product_name}</span>
                                <span className="jo-dropdown-actions">
                                    {item.stock} {item.unit}{item.unit === 'box' ? 'es' : 's'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="jo-inventory-table">
                    {selectedInventoryItems.length > 0 && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Stock</th>
                                    <th>Purchase Quantity</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedInventoryItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.product_name}</td>
                                        <td>{item.stock - (item.purchaseQuantity || 0)} {item.unit}{item.unit === 'box' ? 'es' : 's'}</td>
                                        <td>
                                            <input
                                                type="number"
                                                value={item.purchaseQuantity === 0 ? '' : item.purchaseQuantity}
                                                min="1"
                                                max={item.stock}
                                                onChange={(e) => handlePurchaseQuantityChange(item.id, e.target.value)}
                                                className="purchase-quantity-input"
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="remove-item-btn"
                                                onClick={() => handleRemoveInventoryItem(item.id)}
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="jo-services-section">
                <div className="jo-header-section">
                    <h3>Services</h3>
                    <span className="material-symbols-outlined jo-info-icon" data-tooltip="These are the services performed on the client's vehicle.">info</span>
                </div>
                <textarea className="jo-services-textarea" placeholder="Enter service details here..." required></textarea>
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
    );
};

export default JobOrder;
