import React, { useState, useEffect, useRef } from 'react';
import '../styles/ScopeOfWork.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../images/pdf-logo.png';
import { createUserInCognito, addEmployeeToAPI } from './employeeService';
import { addCustomerToAPI } from './customerService';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "https://q2tf3g5e4l.execute-api.ap-southeast-1.amazonaws.com/v1";
const API_KEY = process.env.REACT_APP_API_KEY || "XZSNV5hFIaaCJRBznp9mW2VPndBpD97V98E1irxs";

function generateCustomerId() {
    const randomString = Math.random().toString(36).substr(2, 6).toUpperCase();
    const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `CUST-${randomString}-${dateString}`;
}

function generateEmployeeId() {
    const randomString = Math.random().toString(36).substr(2, 6).toUpperCase();
    const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `EMP-${randomString}-${dateString}`;
}

const ScopeOfWork = () => {
    const [customerQuery, setCustomerQuery] = useState('');
    const [employeeQuery, setEmployeeQuery] = useState('');
    const [inventoryQuery, setInventoryQuery] = useState('');
    const [pdfUrl, setPdfUrl] = useState(null); 
    const [docInstance, setDocInstance] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState('');

    const initialCustomerState = {
        name: '',
        carModel: '',
        plateNo: '',
        contact: '',
        email: '',
        address: ''
    };

    const initialEmployeeState = {
        name: '',
        jobTitle: '',
        contact: '',
        email: '',
        address: '',
        role: '',
        salary: 0
    };

    const [newCustomer, setNewCustomer] = useState(initialCustomerState);
    const [newEmployee, setNewEmployee] = useState(initialEmployeeState);
    const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
    const [isSubmittingEmployee, setIsSubmittingEmployee] = useState(false);

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

    useEffect(() => {
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

    const handleSaveNewCustomer = async (e) => {
        e.preventDefault();
        try {
            setIsSubmittingCustomer(true);
            setIsLoading(true);
    
            const customerToAdd = {
                id: generateCustomerId(),
                ...newCustomer,
            };
    
            const response = await addCustomerToAPI(customerToAdd);
            if (response && response.item && response.message === "Item added successfully!") {
                alert('Customer created successfully!');
                handleToggleCustomer(); 
            } else {
                alert('Error adding customer!');
            }
        } catch (error) {
            console.error("Error adding customer:", error);
            alert('Error adding customer!');
        } finally {
            setNewCustomer(initialCustomerState);
            setIsLoading(false);
            setIsSubmittingCustomer(false);
            fetchCustomers();
        }
    };

    const handleSaveNewEmployee = async (e) => {
        e.preventDefault();
        try {
            setIsSubmittingEmployee(true);
            setIsLoading(true);

            const cognitoResponse = await createUserInCognito(newEmployee.email, newEmployee.role);
            if (cognitoResponse && cognitoResponse.User.Enabled) {
                const employeeToAdd = {
                    id: generateEmployeeId(),
                    ...newEmployee,
                };

                const response = await addEmployeeToAPI(employeeToAdd);
                if (response && response.item && response.message === "Item added successfully!") {
                    alert('Employee created successfully!');
                    handleToggleEmployee();
                }
            } else {
                alert('Error adding employee!');
            }
        } catch (error) {
            console.error("Error adding employee:", error);
            alert('Error adding employee!');
        } finally {
            setNewEmployee(initialEmployeeState);
            setIsLoading(false);
            setIsSubmittingEmployee(false);
            fetchEmployees();
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

    const generatePDF = async () => {
        let errors = [];

        if (!selectedCustomer) {
            errors.push('Customer details are missing.');
        } else {
            if (!selectedCustomer.name) errors.push('Customer name is required.');
            if (!selectedCustomer.carModel) errors.push('Customer car model is required.');
            if (!selectedCustomer.plateNo) errors.push('Customer plate number is required.');
            if (!selectedCustomer.contact) errors.push('Customer contact is required.');
            if (!selectedCustomer.email) errors.push('Customer email is required.');
            if (!selectedCustomer.address) errors.push('Customer address is required.');
        }

        setFileName(generateFileName());
        if (!fileName) {
            errors.push('Please retry to preview the PDF.');
            console.log("Error added:", errors);
        }

        if (!selectedEmployee) {
            errors.push('Employee details are missing.');
        } else {
            if (!selectedEmployee.name) errors.push('Employee name is required.');
            if (!selectedEmployee.jobTitle) errors.push('Employee job title is required.');
            if (!selectedEmployee.contact) errors.push('Employee contact is required.');
            if (!selectedEmployee.email) errors.push('Employee email is required.');
            if (!selectedEmployee.role) errors.push('Employee role is required.');
        }
        const serviceDetails = document.querySelector('.sow-services-textarea').value;
        if (!serviceDetails) errors.push('Service details are required.');
        const remarks = document.querySelector('.sow-remarks-textarea').value;

        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        const doc = new jsPDF();
        const imgWidth = 80;
        const imgHeight = 30;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const xCenter = (pageWidth - imgWidth) / 2;
        
        const lineHeight = 5;
        const maxWidth = pageWidth - 50;
        
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
        doc.setFontSize(10);
        doc.text("SOW No:", 25, startY);
        doc.setFont('helvetica', 'normal');
        doc.text(fileName, 41, startY);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("CUSTOMER DETAILS", 25, startY + 10);
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
            doc.text(detail, 25, startY + 18 + (index * 5));
        });
        
        const { formattedDate, date } = generateDate();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text("DATE ISSUED:", columnWidth + 25, startY);
        doc.setFont('helvetica', 'normal');
        doc.text(date, columnWidth + 51, startY);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("EMPLOYEE DETAILS", columnWidth + 25, startY + 10);
        const employeeDetails = [
            selectedEmployee?.name || "",
            selectedEmployee?.jobTitle || "",
            selectedEmployee?.contact || "",
            selectedEmployee?.email || ""
        ];
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        employeeDetails.forEach((detail, index) => {
            doc.text(detail, columnWidth + 25, startY + 18 + (index * 5)); 
        });
        
        let currentY = startY + 50;
        const checkPageOverflow = (heightToAdd) => {
            if (currentY + heightToAdd > pageHeight) {
                doc.addPage();
                currentY = 20; 
            }
        };
        
        checkPageOverflow(20); 
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("SERVICE DETAILS", 25, currentY);
        currentY += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        if (serviceDetails) {
            const wrappedServiceDetails = doc.splitTextToSize(serviceDetails, maxWidth);
            wrappedServiceDetails.forEach((line) => {
                checkPageOverflow(lineHeight); 
                doc.text(line, 25, currentY);
                currentY += lineHeight;
            });
        }
        
        checkPageOverflow(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("REMARKS", 25, currentY + 8);
        currentY += 16;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        if (remarks) {
            const wrappedRemarks = doc.splitTextToSize(remarks, maxWidth);
            wrappedRemarks.forEach((line) => {
                checkPageOverflow(lineHeight); 
                doc.text(line, 25, currentY);
                currentY += lineHeight;
            });
        }
        
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);

        setDocInstance(doc);
        setPdfUrl(pdfUrl);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false); 
        setPdfUrl(null); 
    };

    const downloadPDF = () => {
        if (!docInstance) return;
        
        docInstance.save(fileName+".pdf");
    };

    const generateDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}${month}${day}`;
        const date = `${month}-${day}-${year}`;

        return { formattedDate, date };
    }

    const generateFileName = () => {
        const { formattedDate, date } = generateDate();
    
        let fileName = `SOW-${selectedCustomer?.plateNo}-${formattedDate}`;
        fileName = fileName.replace(/\s+/g, '');

        return fileName;
    }

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
                                disabled={isSubmittingCustomer}
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
                        disabled={isSubmittingCustomer}
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
                                disabled={isSubmittingCustomer}
                            />

                            <p><strong>Car Model:</strong></p>
                            <input
                                className="sow-placeholder"
                                type="text"
                                placeholder="Enter car model"
                                value={newCustomer.carModel}
                                onChange={(e) => setNewCustomer({ ...newCustomer, carModel: e.target.value })}
                                required
                                disabled={isSubmittingCustomer}
                            />

                            <p><strong>Plate No:</strong></p>
                            <input
                                className="sow-placeholder"
                                type="text"
                                placeholder="Enter plate number"
                                value={newCustomer.plateNo}
                                onChange={(e) => setNewCustomer({ ...newCustomer, plateNo: e.target.value })}
                                required
                                disabled={isSubmittingCustomer}
                            />

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
                                disabled={isSubmittingCustomer}
                            />

                            <p><strong>Email:</strong></p>
                            <input
                                className="sow-placeholder"
                                type="email"
                                placeholder="Enter email"
                                value={newCustomer.email}
                                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                required
                                disabled={isSubmittingCustomer}
                            />

                            <p><strong>Address:</strong></p>
                            <input
                                className="sow-placeholder"
                                type="text"
                                placeholder="Enter address"
                                value={newCustomer.address}
                                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                required
                                disabled={isSubmittingCustomer}
                            />

                            <button
                                className="sow-submit-btn"
                                type="submit"
                                disabled={isSubmittingCustomer}
                            >
                                {isSubmittingCustomer ? 'Submitting...' : 'Submit'}
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
                                disabled={isSubmittingEmployee}
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
                        type="button"
                        className={`sow-add-employee-btn ${showEmployeeDetails ? 'cancel' : ''}`} 
                        onClick={handleToggleEmployee}
                        disabled={isSubmittingEmployee}
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
                                disabled={isSubmittingEmployee}
                            />

                            <p><strong>Job Title:</strong></p>
                            <input
                                className="sow-placeholder"
                                type="text"
                                placeholder="Enter job title"
                                value={newEmployee.jobTitle}
                                onChange={(e) => setNewEmployee({ ...newEmployee, jobTitle: e.target.value })}
                                required
                                disabled={isSubmittingEmployee}
                            />

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
                                disabled={isSubmittingEmployee}
                            />

                            <p><strong>Email:</strong></p>
                            <input
                                className="sow-placeholder"
                                type="email"
                                placeholder="Enter email"
                                value={newEmployee.email}
                                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                required
                                disabled={isSubmittingEmployee}
                            />

                            <p><strong>Role:</strong></p>
                            <select
                                className="employees-select"
                                name="role"
                                value={newEmployee.role}
                                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                required
                                disabled={isSubmittingEmployee}
                            >
                                <option value="" disabled>Select a user's role</option>
                                <option value="none">Not Applicable</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>

                            <button
                                className="sow-submit-btn"
                                type="submit"
                                disabled={isSubmittingEmployee}
                            >
                                {isSubmittingEmployee ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <div className="sow-services-section">
                <div className="sow-header-section">
                    <h2>SERVICES</h2>
                    <span className="material-symbols-outlined sow-info-icon" data-tooltip="These are the services performed on the client's vehicle.">info</span>
                </div>
                <textarea className="sow-services-textarea" placeholder="Enter service details here..." />
            </div>

            <div className="sow-remarks-section">
                <div className="sow-header-section">
                    <h2>REMARKS</h2>
                    <span className="material-symbols-outlined sow-info-icon" data-tooltip="Further details regarding the completed inspections.">info</span>
                </div>
                <textarea className="sow-remarks-textarea" placeholder="Enter remarks here..."></textarea>
            </div>

            <button className="sow-save-button" onClick={generatePDF}>Preview .PDF</button>
            {showModal && (
                <div className="sow-modal">
                    <span className="close" onClick={closeModal}>&times;</span>
                    <iframe
                        src={pdfUrl}
                        width="100%"
                        height="300px"
                        title="PDF Preview"
                    ></iframe>
                    <button onClick={downloadPDF} className="sow-download-button">Download .PDF</button>
                </div>
            )}
        </div>
    );
};

export default ScopeOfWork;
