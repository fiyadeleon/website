import React, { useState, useEffect, useRef } from 'react';
import '../styles/SalesOrder.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../images/logo6-cropped.jpg';
import { createUserInCognito, addEmployeeToAPI } from './employeeService';
import { addCustomerToAPI } from './customerService';
import { Autocomplete } from '@react-google-maps/api';
import { loadGoogleMapsAPI } from './loadGoogleMapsAPI';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const API_KEY = process.env.REACT_APP_API_KEY;

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

const SalesOrder = () => {
    const [customerQuery, setCustomerQuery] = useState('');
    const [employeeQuery, setEmployeeQuery] = useState('');
    const [inventoryQuery, setInventoryQuery] = useState('');
    const [pdfUrl, setPdfUrl] = useState(null); 
    const [showModal, setShowModal] = useState(false);
    const [docInstance, setDocInstance] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [fileName, setFileName] = useState('');
    const [grandTotal, setGrandTotal] = useState(0);

    const initialCustomerState = {
        name: '',
        carModel: '',
        plateNo: '',
        contact: '',
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

    const [serviceName, setServiceName] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [services, setServices] = useState([]);

    const [autocompleteInstance, setAutocompleteInstance] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

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
        
        loadGoogleMapsAPI()
        .then(() => console.log('Google Maps API loaded successfully'))
        .catch((err) => console.error('Error loading Google Maps API:', err));
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

        setFilteredCustomers([]);
    };

    const handleToggleEmployee = () => {
        setShowEmployeeDetails(!showEmployeeDetails);
        if (showEmployeeDetails) {
            setSelectedEmployee(null);
            setEmployeeQuery('');
        }

        setFilteredEmployees([]);
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
        setDiscount(0);
        setServices([]);
        setSelectedDate('');
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

    const handleAddService = () => {
        if (serviceName && servicePrice) {
            setServices([...services, { name: serviceName, price: parseFloat(servicePrice) }]);
            setServiceName('');
            setServicePrice('');
        } else {
            alert('Please enter both service name and price.');
        }
    };

    const handleRemoveService = (index) => {
        const updatedServices = services.filter((_, i) => i !== index);
        setServices(updatedServices);
    };

    const generatePDF = async () => {
        let errors = [];

        if (!selectedDate) {
            errors.push('Date & time is required.');
        }

        if (!selectedPaymentMethod) {
            errors.push('Payment method is required.');
        }

        if (!selectedCustomer) {
            errors.push('Customer details are missing.');
        } else {
            if (!selectedCustomer.name) errors.push('Customer name is required.');
            if (!selectedCustomer.carModel) errors.push('Customer car model is required.');
            if (!selectedCustomer.plateNo) errors.push('Customer plate number is required.');
            if (!selectedCustomer.contact) errors.push('Customer contact is required.');
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
        }
    
        selectedInventoryItems.forEach(item => {
            if (!item.purchaseQuantity || item.purchaseQuantity <= 0) {
                errors.push(`Purchase quantity for item "${item.product_name}" is required and must be greater than 0.`);
            } else if (item.purchaseQuantity > item.stock) {
                errors.push(`Purchase quantity for item "${item.product_name}" exceeds available stock (${item.stock}).`);
            }
        });
    
        if (services.length === 0) errors.push('Service details are required.');
    
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

        const maxWidth = pageWidth - 50;

        doc.addImage(logo, 'PNG', xCenter, 10, imgWidth, imgHeight);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        doc.text("Pascual 1 Compound Brgy. San Antonio, Parañaque, 1700 Metro Manila", pageWidth / 2, imgHeight + 12, { align: 'center' });
        doc.text("Contact no. 09088200922 | Email address: stanghero21@gmail.com", pageWidth / 2, imgHeight + 16, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text("SALES ORDER", pageWidth / 2, imgHeight + 26, { align: 'center' });

        const startY = imgHeight + 35;
        const columnWidth = pageWidth / 2;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text("SO No:", 25, startY);
        doc.setFont('helvetica', 'normal');
        doc.text(fileName, 38, startY);

        // CUSTOMER DETAILS
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("CUSTOMER DETAILS", 25, startY + 10);
        const customerDetails = [
            selectedCustomer?.name || "",
            selectedCustomer?.carModel || "",
            selectedCustomer?.plateNo || "",
            selectedCustomer?.contact || "",
            selectedCustomer?.address?.trim() && selectedCustomer.address !== "N/A" ? selectedCustomer.address : ""
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
        doc.text(new Date(selectedDate).toLocaleDateString(), columnWidth + 51, startY);

        // EMPLOYEE DETAILS
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("MECHANIC", columnWidth + 25, startY + 10);
        const employeeDetails = [
            selectedEmployee?.name || ""
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

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        checkPageOverflow(12);
        doc.text("SERVICES AND PRODUCTS", 25, currentY);
        currentY += 6;

        let totalAmountSubtotal = 0;

        const tableBody = services.map(service => {
            const serviceTotal = service.price;
            totalAmountSubtotal += serviceTotal;
            
            return [
                service.name,
                '1',
                `${service.price.toFixed(2)}`,
                `${serviceTotal.toFixed(2)}`
            ];
        });

        selectedInventoryItems.forEach(item => {
            const totalAmount = item.purchaseQuantity * item.price;
            totalAmountSubtotal += totalAmount;

            tableBody.push([
                item.product_name,
                item.purchaseQuantity.toString(),
                `${item.price.toFixed(2)}`,
                `${totalAmount.toFixed(2)}`
            ]);
        });

        doc.autoTable({
            startY: currentY,
            head: [['NAME', 'QUANTITY', 'UNIT PRICE', 'AMOUNT']],
            body: tableBody,
            tableWidth: maxWidth,
            styles: {
                fontSize: 10,
                cellPadding: 2,
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [211, 211, 211],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.1,
            },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1,
            theme: 'grid',
            margin: { left: 25 },
        });

        currentY = doc.autoTable.previous.finalY + 8;

        const finalX = 120;
        let valueX = 157;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        checkPageOverflow(20);
        doc.text("SUBTOTAL:", finalX, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${totalAmountSubtotal.toFixed(2)}`, valueX, currentY);

        const discountAmount = totalAmountSubtotal * (discount / 100);
        currentY += 7;
        doc.setFont('helvetica', 'bold');
        checkPageOverflow(20);
        doc.text("DISCOUNT ("+discount+")%:", finalX, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(`-${discountAmount.toFixed(2)}`, valueX, currentY);

        const grandTotal = totalAmountSubtotal - discountAmount;
        setGrandTotal(grandTotal);
        currentY += 7;
        doc.setFont('helvetica', 'bold');
        checkPageOverflow(20);
        doc.text("GRAND TOTAL:", finalX, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${grandTotal.toFixed(2)}`, valueX, currentY);

        if (selectedPaymentMethod !== "cash"){
            currentY += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text("PAYMENT METHOD", finalX, currentY);
            currentY += 5;
        }

        if (selectedPaymentMethod === 'bpi-bank-transfer') {
            doc.setFontSize(10);
            doc.text("BPI", finalX, currentY);
            currentY += 5;
            doc.setFont('helvetica', 'normal');
            doc.text("Jerish Balandra", finalX, currentY);
            currentY += 5;
            doc.text("316-959-4626", finalX, currentY);
        } else if (selectedPaymentMethod === 'e-wallet') {
            doc.setFontSize(10);
            doc.text("GCash / Paymaya", finalX, currentY);
            currentY += 5;
            doc.setFont('helvetica', 'normal');
            doc.text("Jerish Balandra", finalX, currentY);
            currentY += 5;
            doc.text("0997-890-0746", finalX, currentY);
        } else if (selectedPaymentMethod === 'metro-bank-transfer') {
            doc.setFontSize(10);
            doc.text("Metrobank", finalX, currentY);
            currentY += 5;
            doc.setFont('helvetica', 'normal');
            doc.text("Maria Jesusa Anne Balandra", finalX, currentY);
            currentY += 5;
            doc.text("0513-0517-82560", finalX, currentY);
        } else if (selectedPaymentMethod === 'security-bank-transfer') {
            doc.setFontSize(10);
            doc.text("Security Bank", finalX, currentY);
            currentY += 5;
            doc.setFont('helvetica', 'normal');
            doc.text("Maria Jesusa Anne Balandra", finalX, currentY);
            currentY += 5;
            doc.text("00000-5428-5873", finalX, currentY);
            currentY += 7;
            doc.text("Jerish Balandra", finalX, currentY);
            currentY += 5;
            doc.text("00000-5685-4883", finalX, currentY);
        }

        currentY += 30;
        const sigX = 120;
        checkPageOverflow(20);
        
        doc.setFont('helvetica', 'bold');
        doc.text("Authorized Name and Signature", sigX, currentY);
        currentY += 5;
        
        const footerMarginX = 25;
        const footerTextWidth = pageWidth - 2 * footerMarginX;
        
        const footerText = `
        TERMS & CONDITIONS:
        
        Hereby authorizes STANGHERO AUTOMOTIVE CARE SERVICES to carry out the above repair and grant its employees permission to operate the vehicle herein described on streets, highways, or elsewhere for the purpose of testing and/or inspection.
        
        PARTS NOT CLAIMED WITHIN TWO WEEKS AFTER THE RELEASE OF THE VEHICLE ARE SUBJECTED TO COMPANY DISPOSAL.
        `;
        
        const footerSentences = footerText.split(/[.!?]\s+/).filter(Boolean);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        
        footerSentences.forEach(function (sentence, index) {
            if (index < footerSentences.length - 1) {
                sentence += '.';
            }
        
            const wrappedSentence = doc.splitTextToSize(sentence, footerTextWidth);
        
            checkPageOverflow(wrappedSentence.length * 5);
        
            wrappedSentence.forEach(function (line) {
                doc.text(line, footerMarginX, currentY);
                currentY += 3; 
            });
        
            currentY += 5;
        });
        
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

    const downloadPDF = async () => {
        if (!docInstance) return;
        
        docInstance.save(fileName+".pdf");

        await saveTransactionDetails();
    };

    const saveTransactionDetails = async () => {
        const transactionData = {
            id: fileName,
            customerName: selectedCustomer['name'],
            mechanicName: selectedEmployee['name'],
            plateNo: selectedCustomer['plateNo'],
            type: "Sales Order",
            dateTime: selectedDate.replace('T', ' '),
            amount: grandTotal
        };
    
        try {
            const response = await fetch(`${API_ENDPOINT}/item?resource=transaction`, {
                method: 'POST',
                headers: {
                    'x-api-key': API_KEY,
                },
                body: JSON.stringify(transactionData),
            });
    
            if (!response.ok) {
                throw new Error('Failed to save transaction details');
            }
    
            const data = await response.json();
            console.log('Transaction saved successfully:', data);
            return data;
        } catch (error) {
            console.error('Error saving transaction details:', error);
            alert('Error saving transaction details to history');
        }
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
    
        let fileName = `SO-${selectedCustomer?.plateNo}-${formattedDate}`;
        fileName = fileName.replace(/\s+/g, '');

        return fileName;
    }

    const onLoad = (autocomplete) => {
        setAutocompleteInstance(autocomplete);
    };
    
    const onPlaceChanged = () => {
        if (autocompleteInstance) {
            const place = autocompleteInstance.getPlace();
            if (place.formatted_address) {
                setNewCustomer((prevCustomer) => ({
                    ...prevCustomer,
                    address: place.formatted_address
                }));
            }
        } else {
            console.log('Autocomplete is not loaded yet!');
        }
    };

    return (
        <div className="so-sales-order">
            <div className="so-header">
                <h1>SALES ORDER</h1>
                <button className="so-clear-button" onClick={handleClear}>Clear</button>
            </div>

            <div className="so-date-input-wrapper">
                <div className="so-header-section">
                    <h2>DATE & TIME ISSUED</h2>
                </div>
                <input
                    className="so-placeholder"
                    type="datetime-local"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                />
            </div>

            <div className="so-user-info">
                <form className="so-customer-section" ref={customerSearchRef} onSubmit={handleSaveNewCustomer}>
                    <h2>CUSTOMER</h2>
                    {!showCustomerDetails && (
                        <div className="so-search-bar">
                            <span className="material-symbols-outlined so-search-icon">search</span>
                            <input
                                type="text"
                                placeholder="Search Customer"
                                className="so-search-input"
                                value={customerQuery}
                                onChange={handleCustomerSearch}
                                onFocus={() => setFilteredCustomers(customers.slice(0, 5))}
                                disabled={isSubmittingCustomer}
                            />
                        </div>
                    )}
                    {filteredCustomers.length > 0 && (
                        <div className="so-dropdown">
                            {filteredCustomers.map((customer, index) => (
                                <div className="so-dropdown-option" key={index} onClick={() => handleCustomerSelect(customer)}>
                                    <span className="so-dropdown-text">{customer.name}</span>
                                    <span className="so-dropdown-actions">{customer.plateNo}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {selectedCustomer && !showCustomerDetails && (
                        <div className="so-customer-details">
                            <p><strong>Name:</strong> {selectedCustomer.name}</p>
                            <p><strong>Car Model:</strong> {selectedCustomer.carModel}</p>
                            <p><strong>Plate No:</strong> {selectedCustomer.plateNo}</p>
                            <p><strong>Contact:</strong> {selectedCustomer.contact}</p>
                            <p><strong>Address:</strong> {selectedCustomer.address || "N/A"}</p>
                        </div>
                    )}
                    <button 
                        type="button" 
                        className={`so-add-customer-btn ${showCustomerDetails ? 'cancel' : ''}`} 
                        onClick={handleToggleCustomer}
                        disabled={isSubmittingCustomer}
                    >
                        {showCustomerDetails ? 'Cancel' : '+ Add New Customer'}
                    </button>

                    {showCustomerDetails && (
                        <div className="so-customer-details">
                            <p><strong>Name:</strong></p>
                            <input
                                className="so-placeholder"
                                type="text"
                                placeholder="Enter name"
                                value={newCustomer.name}
                                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                required
                                disabled={isSubmittingCustomer}
                            />

                            <p><strong>Car Model:</strong></p>
                            <input
                                className="so-placeholder"
                                type="text"
                                placeholder="Enter car model"
                                value={newCustomer.carModel}
                                onChange={(e) => setNewCustomer({ ...newCustomer, carModel: e.target.value })}
                                required
                                disabled={isSubmittingCustomer}
                            />

                            <p><strong>Plate No:</strong></p>
                            <input
                                className="so-placeholder"
                                type="text"
                                placeholder="Enter plate number"
                                value={newCustomer.plateNo}
                                onChange={(e) => setNewCustomer({ ...newCustomer, plateNo: e.target.value })}
                                required
                                disabled={isSubmittingCustomer}
                            />

                            <p><strong>Contact No:</strong></p>
                            <input
                                className="so-placeholder"
                                type="tel" 
                                pattern="[0-9]{11}" 
                                maxLength="11"
                                placeholder="Enter contact number"
                                value={newCustomer.contact}
                                onChange={(e) => setNewCustomer({ ...newCustomer, contact: e.target.value })}
                                required
                                disabled={isSubmittingCustomer}
                            />

                            <p><strong>Address:</strong></p>
                            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                                <input
                                    className="so-placeholder"
                                    type="text"
                                    placeholder="Enter address"
                                    value={newCustomer.address}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    required
                                    disabled={isSubmittingCustomer}
                                />
                            </Autocomplete>

                            <button
                                className="so-submit-btn"
                                type="submit"
                                disabled={isSubmittingCustomer}
                            >
                                {isSubmittingCustomer ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    )}
                </form>

                <form className="so-employee-section" ref={employeeSearchRef} onSubmit={handleSaveNewEmployee}>
                    <h2>EMPLOYEE</h2>
                    {!showEmployeeDetails && (
                        <div className="so-search-bar">
                            <span className="material-symbols-outlined so-search-icon">search</span>
                            <input
                                type="text"
                                placeholder="Search Employee"
                                className="so-search-input"
                                value={employeeQuery}
                                onChange={handleEmployeeSearch}
                                onFocus={() => setFilteredEmployees(employees.slice(0, 5))}
                                disabled={isSubmittingEmployee}
                            />
                        </div>
                    )}
                    {filteredEmployees.length > 0 && (
                        <div className="so-dropdown">
                            {filteredEmployees.map((employee, index) => (
                                <div className="so-dropdown-option" key={index} onClick={() => handleEmployeeSelect(employee)}>
                                    <span className="so-dropdown-text">{employee.name}</span>
                                    <span className="so-dropdown-actions">{employee.jobTitle}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {selectedEmployee && !showEmployeeDetails && (
                        <div className="so-employee-details">
                            <p><strong>Name:</strong> {selectedEmployee.name}</p>
                            <p><strong>Job Title:</strong> {selectedEmployee.jobTitle}</p>
                            <p><strong>Contact:</strong> {selectedEmployee.contact}</p>
                            <p><strong>Email:</strong> {selectedEmployee.email}</p>
                        </div>
                    )}
                    <button 
                        type="button"
                        className={`so-add-employee-btn ${showEmployeeDetails ? 'cancel' : ''}`} 
                        onClick={handleToggleEmployee}
                        disabled={isSubmittingEmployee}
                    >
                        {showEmployeeDetails ? 'Cancel' : '+ Add New Employee'}
                    </button>

                    {showEmployeeDetails && (
                        <div className="so-employee-details">
                            <p><strong>Name:</strong></p>
                            <input
                                className="so-placeholder"
                                type="text"
                                placeholder="Enter name"
                                value={newEmployee.name}
                                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                required
                                disabled={isSubmittingEmployee}
                            />

                            <p><strong>Job Title:</strong></p>
                            <input
                                className="so-placeholder"
                                type="text"
                                placeholder="Enter job title"
                                value={newEmployee.jobTitle}
                                onChange={(e) => setNewEmployee({ ...newEmployee, jobTitle: e.target.value })}
                                required
                                disabled={isSubmittingEmployee}
                            />

                            <p><strong>Contact No:</strong></p>
                            <input
                                className="so-placeholder"
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
                                className="so-placeholder"
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
                                className="so-submit-btn"
                                type="submit"
                                disabled={isSubmittingEmployee}
                            >
                                {isSubmittingEmployee ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <div className="so-discount-section">
                <h2>DISCOUNT (%)</h2>
                <input
                    type="number"
                    id="discount"
                    value={discount}
                    onChange={(e) => {
                        let value = e.target.value;

                        if (value.startsWith('0') && value.length > 1) {
                            value = value.slice(1);
                        }

                        if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                            setDiscount(value);
                        }
                    }}
                    className="so-discount-input"
                    min="0"
                    max="100"
                    placeholder="Enter discount percentage"
                />
            </div>

            <div className="so-payment-section">
                <div className="so-header-section">
                    <h2>PREFERRED PAYMENT</h2>
                </div>
                <select
                    className="so-placeholder"
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    required
                >
                    <option value="" disabled>Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="bpi-bank-transfer">BPI - Bank Transfer</option>
                    <option value="metro-bank-transfer">Metrobank - Bank Transfer</option>
                    <option value="security-bank-transfer">Security Bank - Bank Transfer</option>
                    <option value="e-wallet">GCash / Paymaya</option>
                </select>
            </div>

            <div className="so-parts-section" ref={inventorySearchRef}>
                <div className="so-header-section">
                    <h2>INVENTORY</h2>
                    <span className="material-symbols-outlined so-info-icon" data-tooltip="Select the part(s) or item(s) required to complete the outlined services.">info</span>
                </div>
                <div className="so-search-bar">
                    <span className="material-symbols-outlined so-search-icon">search</span>
                    <input
                        type="text"
                        placeholder="Search for parts or items"
                        className="so-search-input"
                        value={inventoryQuery}
                        onChange={handleInventorySearch}
                        onFocus={handleInventoryFocus}
                    />
                </div>
                {isInventoryInputFocused && filteredInventory.length > 0 && (
                    <div className="so-dropdown">
                        {filteredInventory.map((item, index) => (
                            <div className="so-dropdown-option" key={index} onClick={() => handleInventorySelect(item)}>
                                <span className="so-dropdown-text">{item.product_name}</span>
                                <span className="so-dropdown-actions">
                                    {item.stock} {item.unit}{item.stock < 1 ? '' : (item.unit === 'box' ? 'es' : 's')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="so-inventory-table">
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
                                        <td>
                                            {item.stock - (item.purchaseQuantity || 0)} {item.stock - (item.purchaseQuantity || 0) > 0
                                                ? ` ${item.unit}${(item.unit === 'box' ? 'es' : item.unit === 'piece' ? 's' : '')}`
                                                : item.unit}
                                        </td>
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

            <div className="so-services-section">
                <div className="so-header-section">
                    <h2>SERVICES</h2>
                    <span className="material-symbols-outlined so-info-icon" data-tooltip="Add services performed on the vehicle.">info</span>
                </div>
                <div className="so-service-inputs-container">
                    <div className="so-service-inputs">
                        <textarea
                            placeholder="Enter service name"
                            value={serviceName}
                            onChange={(e) => setServiceName(e.target.value)}
                            className="so-service-name-input"
                        />
                        <input
                            type="number"
                            placeholder="Enter price"
                            value={servicePrice}
                            onChange={(e) => setServicePrice(e.target.value)}
                            className="so-service-price-input"
                        />
                    </div>
                    <button onClick={handleAddService} className="so-add-service-btn">Add Service</button>
                </div>

                <ul className="so-service-list">
                    {services.map((service, index) => {
                        const tasks = service.name.split('\n');

                        return (
                        <li key={index}>
                            <a className="service-name">
                                {tasks.map((task, taskIndex) => (
                                    <span key={taskIndex}>
                                    {task.trim()}
                                    <br />
                                    </span>
                                ))}
                            </a>
                            <span className="service-price">₱{service.price.toFixed(2)}</span>
                            <button onClick={() => handleRemoveService(index)} className="so-remove-service-btn">
                            <span className="material-symbols-outlined">delete</span>
                            </button>
                        </li>
                        );
                    })}
                </ul>
            </div>

            <button className="so-save-button" onClick={generatePDF}>Preview .PDF</button>
            {showModal && (
                <div className="so-modal">
                    <span className="close" onClick={closeModal}>&times;</span>
                    <iframe
                        src={pdfUrl}
                        width="100%"
                        height="300px"
                        title="PDF Preview"
                    ></iframe>
                    <button onClick={downloadPDF} className="so-download-button">Download .PDF</button>
                </div>
            )}
        </div>
    );
};

export default SalesOrder;
