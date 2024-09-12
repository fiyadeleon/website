import React, { useState, useEffect, useRef } from 'react';
import '../styles/ScopeOfWork.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../images/pdf-logo.png';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "https://q2tf3g5e4l.execute-api.ap-southeast-1.amazonaws.com/v1";
const API_KEY = process.env.REACT_APP_API_KEY || "XZSNV5hFIaaCJRBznp9mW2VPndBpD97V98E1irxs";

const ScopeOfWork = () => {
    const [customerQuery, setCustomerQuery] = useState('');
    const [employeeQuery, setEmployeeQuery] = useState('');
    const [inventoryQuery, setInventoryQuery] = useState('');
    const [pdfUrl, setPdfUrl] = useState(null); 
    const [showModal, setShowModal] = useState(false);

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
    
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch(`${API_ENDPOINT}/item?resource=customer`, {
                    method: 'GET',
                    headers: { 'x-api-key': API_KEY },
                });
                if (!response.ok) throw new Error('Failed to fetch customers');
                const data = await response.json();
                setCustomers(data);
            } catch (error) {
                console.error('Error fetching customers:', error);
                alert('Error fetching customers!');
            }
        };

        const fetchEmployees = async () => {
            try {
                const response = await fetch(`${API_ENDPOINT}/item?resource=employee`, {
                    method: 'GET',
                    headers: { 'x-api-key': API_KEY },
                });
                if (!response.ok) throw new Error('Failed to fetch employees');
                const data = await response.json();
                setEmployees(data);
            } catch (error) {
                console.error('Error fetching employees:', error);
                alert('Error fetching employees!');
            }
        };

        const fetchInventoryItems = async () => {
            try {
                const response = await fetch(`${API_ENDPOINT}/item?resource=inventory`, {
                    method: 'GET',
                    headers: { 'x-api-key': API_KEY },
                });
                if (!response.ok) throw new Error('Failed to fetch inventory items');
                const data = await response.json();
                setInventoryItems(data);
            } catch (error) {
                console.error('Error fetching inventory items:', error);
                alert('Error fetching inventory items!');
            }
        };

        fetchCustomers();
        fetchEmployees();
        fetchInventoryItems();
    }, []);

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

    const handleInventorySearch = (event) => {
        const query = event.target.value.toLowerCase();
        setInventoryQuery(query);
        const inventoryResults = inventoryItems.filter(item =>
            item.product_name.toLowerCase().includes(query) &&
            !selectedInventoryItems.some(selectedItem => selectedItem.id === item.id)
        );
        setFilteredInventory(inventoryResults.slice(0, 5));
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

    const handleInventorySelect = (item) => {
        setSelectedInventoryItems((prevSelectedItems) => [...prevSelectedItems, item]);
        setFilteredInventory([]);
        setInventoryQuery('');
        setIsInventoryInputFocused(false);
    };

    const handleRemoveInventoryItem = (itemId) => {
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
        }
    };

    const handleSaveNewEmployee = (e) => {
        e.preventDefault();
        if (validateEmployee()) {
            console.log('Employee validated and saved');
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
        document.querySelector('.sow-services-textarea').value = "";
        document.querySelector('.sow-remarks-textarea').value = "";
    };

    const generatePDF = () => {
        let errors = [];
        if (!selectedCustomer) {
            errors.push('Customer details are missing.');
        } else {
            if (!selectedCustomer.name) errors.push('Customer name is required.');
            if (!selectedCustomer.carModel) errors.push('Customer car model is required.');
            if (!selectedCustomer.plateNo) errors.push('Customer plate number is required.');
            if (!selectedCustomer.contact) errors.push('Customer contact is required.');
            if (!selectedCustomer.email) errors.push('Customer email is required.');
        }
        if (!selectedEmployee) {
            errors.push('Employee details are missing.');
        } else {
            if (!selectedEmployee.name) errors.push('Employee name is required.');
            if (!selectedEmployee.jobTitle) errors.push('Employee job title is required.');
            if (!selectedEmployee.contact) errors.push('Employee contact is required.');
            if (!selectedEmployee.email) errors.push('Employee email is required.');
        }
        const serviceDetails = document.querySelector('.sow-services-textarea').value;
        if (!serviceDetails) errors.push('Service details are required.');
        const remarks = document.querySelector('.sow-remarks-textarea').value;
        if (errors.length > 0) {
            alert('Please fix the following issues before generating the PDF:\n' + errors.join('\n'));
            return;
        }

        const doc = new jsPDF();
        const imgWidth = 80;
        const imgHeight = 30;
        const pageWidth = doc.internal.pageSize.getWidth();
        const xCenter = (pageWidth - imgWidth) / 2;
        
        doc.addImage(logo, 'PNG', xCenter, 10, imgWidth, imgHeight);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        doc.text("Compound, 1 Pascual, Parañaque, 1700 Metro Manila", pageWidth / 2, imgHeight + 12, { align: 'center' });
        doc.text("Contact no. 09978900746 | Email address: stanghero21@gmail.com", pageWidth / 2, imgHeight + 16, { align: 'center' });
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text("SCOPE OF WORK", pageWidth / 2, imgHeight + 26, { align: 'center' });
        
        const startY = imgHeight + 35;
        const columnWidth = pageWidth / 2;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("CUSTOMER DETAILS", 25, startY);
        const customerDetails = [
            selectedCustomer?.name || "",
            selectedCustomer?.carModel || "",
            selectedCustomer?.plateNo || "",
            selectedCustomer?.contact || "",
            selectedCustomer?.email || ""
        ];
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        customerDetails.forEach((detail, index) => {
            doc.text(detail, 25, startY + 8 + (index * 5));
        });
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("EMPLOYEE DETAILS", columnWidth + 25, startY);
        const employeeDetails = [
            selectedEmployee?.name || "",
            selectedEmployee?.jobTitle || "",
            selectedEmployee?.contact || "",
            selectedEmployee?.email || ""
        ];
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        employeeDetails.forEach((detail, index) => {
            doc.text(detail, columnWidth + 25, startY + 8 + (index * 5)); 
        });

        const serviceDetailsY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 40 : startY + 45; 
        let currentY = serviceDetailsY + 10;

        if (serviceDetails) {
            const serviceDetailsArray = typeof serviceDetails === 'string' ? serviceDetails.split("\n") : [];

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text("SERVICE DETAILS", 25, serviceDetailsY);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);

            serviceDetailsArray.forEach((line) => {
                if (line.startsWith("•")) {
                    doc.text(line, 30, currentY);
                } else {
                    doc.text(line, 25, currentY); 
                }

                currentY += 5;
            });
        }

        if (remarks) {
            const remarksY = currentY + 10;
            doc.setFont('helvetica', 'bold');
            doc.text("REMARKS", 25, remarksY);
            doc.setFont('helvetica', 'normal');
            doc.text(remarks, 25, remarksY + 10);
        }
        
        // // Optional: Add Inventory Items Table (If applicable)
        // if (selectedInventoryItems && selectedInventoryItems.length > 0) {
        //     const inventoryTableData = selectedInventoryItems.map((item, index) => [
        //         index + 1,
        //         item.product_name,
        //         item.unit,
        //         item.price
        //     ]);

        //     // Table with only border lines and no color
        //     doc.autoTable({
        //         head: [['#', 'Product Name', 'Unit', 'Price']],
        //         body: inventoryTableData,
        //         startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 40 : startY + 60, // Position inventory table after the details
        //         margin: { left: 20 },
        //         styles: {
        //             fillColor: null, // No background color
        //             textColor: [0, 0, 0], // Black text
        //             lineColor: [0, 0, 0], // Black borders
        //             lineWidth: 0.1, // Thin border lines
        //         },
        //         headStyles: {
        //             fillColor: null, // No background color for header
        //             textColor: [0, 0, 0], // Black text for header
        //             lineColor: [0, 0, 0], // Black border lines for header
        //             lineWidth: 0.1, // Thin border lines for header
        //         },
        //         columnStyles: {
        //             0: { cellWidth: 10 },  // Narrower column for '#'
        //             1: { cellWidth: 100 },  // Narrower column for 'Product Name'
        //             2: { cellWidth: 30 },  // Narrower column for 'Unit'
        //             3: { cellWidth: 30 },  // Narrower column for 'Price'
        //         }
        //     });
        // }
        
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        setPdfUrl(pdfUrl);
        setShowModal(true);             
    };

    const closeModal = () => {
        setShowModal(false); 
        setPdfUrl(null); 
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
    
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}${month}${day}`;
    
        let fileName = `SOW-${selectedCustomer?.name}-${selectedCustomer?.plateNo}-${formattedDate}.pdf`;
        fileName = fileName.replace(/\s+/g, '');
        
        doc.save(fileName);
    };

    return (
        <div className="sow-scope-of-work">
            <div className="sow-header">
                <h1>SCOPE OF WORK</h1>
                <button className="sow-clear-button" onClick={handleClear}>Clear</button>
            </div>

            <div className="sow-user-info">
                <form className="sow-customer-section" ref={customerSearchRef} onSubmit={handleSaveNewCustomer}>
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
                        type="button" 
                        className={`sow-add-customer-btn ${showCustomerDetails ? 'cancel' : ''}`} 
                        onClick={handleToggleCustomer}
                    >
                        {showCustomerDetails ? 'Cancel' : '+ Add New Customer'}
                    </button>

                    {showCustomerDetails && (
                        <div className="sow-customer-details">
                            <p><strong>Name:</strong></p>
                            <input
                                className="sow-placeholder"
                                type="text"
                                placeholder="Enter name"
                                value={newCustomer.name}
                                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                required
                            />
                            {errors.name && <span className="error">{errors.name}</span>}

                            <p><strong>Car Model:</strong></p>
                            <input
                                className="sow-placeholder"
                                type="text"
                                placeholder="Enter car model"
                                value={newCustomer.carModel}
                                onChange={(e) => setNewCustomer({ ...newCustomer, carModel: e.target.value })}
                                required
                            />
                            {errors.carModel && <span className="error">{errors.carModel}</span>}

                            <p><strong>Plate No:</strong></p>
                            <input
                                className="sow-placeholder"
                                type="text"
                                placeholder="Enter plate number"
                                value={newCustomer.plateNo}
                                onChange={(e) => setNewCustomer({ ...newCustomer, plateNo: e.target.value })}
                                required
                            />
                            {errors.plateNo && <span className="error">{errors.plateNo}</span>}

                            <p><strong>Contact No:</strong></p>
                            <input
                                className="sow-placeholder"
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
                                className="sow-placeholder"
                                type="email"
                                placeholder="Enter email"
                                value={newCustomer.email}
                                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                required
                            />
                            {errors.email && <span className="error">{errors.email}</span>}

                            <p><strong>Address:</strong></p>
                            <input
                                className="sow-placeholder"
                                type="text"
                                placeholder="Enter address"
                                value={newCustomer.address}
                                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                required
                            />
                            {errors.address && <span className="error">{errors.address}</span>}

                            <button
                                className="sow-submit-btn"
                                type="submit"
                            >
                                Submit
                            </button>
                        </div>
                    )}
                </form>

                <form className="sow-employee-section" ref={employeeSearchRef} onSubmit={handleSaveNewEmployee}>
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
                            <input
                                className="sow-placeholder"
                                type="text"
                                placeholder="Enter name"
                                value={newEmployee.name}
                                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                required
                            />
                            {errors.name && <span className="error">{errors.name}</span>}

                            <p><strong>Job Title:</strong></p>
                            <input
                                className="sow-placeholder"
                                type="text"
                                placeholder="Enter job title"
                                value={newEmployee.jobTitle}
                                onChange={(e) => setNewEmployee({ ...newEmployee, jobTitle: e.target.value })}
                                required
                            />
                            {errors.jobTitle && <span className="error">{errors.jobTitle}</span>}

                            <p><strong>Contact No:</strong></p>
                            <input
                                className="sow-placeholder"
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
                                className="sow-placeholder"
                                type="email"
                                placeholder="Enter email"
                                value={newEmployee.email}
                                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                required
                            />
                            {errors.email && <span className="error">{errors.email}</span>}

                            <button
                                className="sow-submit-btn"
                                type="submit"
                            >
                                Submit
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* <div className="sow-parts-section" ref={inventorySearchRef}>
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
            </div> */}

            <div className="sow-services-section">
                <div className="sow-header-section">
                    <h3>Services</h3>
                    <span className="material-symbols-outlined sow-info-icon" data-tooltip="These are the services performed on the client's vehicle.">info</span>
                </div>
                <textarea className="sow-services-textarea" placeholder="Enter service details here..." required></textarea>
            </div>

            <div className="sow-remarks-section">
                <div className="sow-header-section">
                    <h3>Remarks</h3>
                    <span className="material-symbols-outlined sow-info-icon" data-tooltip="Further details regarding the completed inspections.">info</span>
                </div>
                <textarea className="sow-remarks-textarea" placeholder="Enter remarks here..."></textarea>
            </div>

            <button className="sow-save-button" onClick={generatePDF}>Preview PDF</button>
            {showModal && (
                <div className="modal">
                    <span className="close" onClick={closeModal}>&times;</span>
                    <iframe
                        src={pdfUrl}
                        width="100%"
                        height="300px"
                        title="PDF Preview"
                    ></iframe>
                    <button onClick={downloadPDF} className="sow-download-button">Download PDF</button>
                </div>
            )}
        </div>
    );
};

export default ScopeOfWork;
