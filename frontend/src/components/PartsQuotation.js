import React, { useState, useEffect, useRef } from 'react';
import '../styles/PartsQuotation.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../images/logo6-cropped.jpg';
import { addCustomerToAPI } from './customerService';
import { Autocomplete } from '@react-google-maps/api';
import { loadGoogleMapsAPI } from './loadGoogleMapsAPI';

let API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
let API_KEY = process.env.REACT_APP_API_KEY;

function generateCustomerId() {
    const randomString = Math.random().toString(36).substr(2, 6).toUpperCase();
    const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `CUST-${randomString}-${dateString}`;
}

const PartsQuotation = () => {
    const [customerQuery, setCustomerQuery] = useState('');
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

    const [newCustomer, setNewCustomer] = useState(initialCustomerState);
    const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);

    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedInventoryItems, setSelectedInventoryItems] = useState([]);

    const [showCustomerDetails, setShowCustomerDetails] = useState(false);

    const [isInventoryInputFocused, setIsInventoryInputFocused] = useState(false);
    const [errors, setErrors] = useState({});

    const customerSearchRef = useRef();
    const inventorySearchRef = useRef();
    
    const [customers, setCustomers] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);

    const [inventoryName, setInventoryName] = useState('');
    const [inventoryPrice, setInventoryPrice] = useState('');
    const [products, setProducts] = useState([]);

    const [isAddProductVisible, setIsAddProductVisible] = useState(false);
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
        fetchInventoryItems();

        loadGoogleMapsAPI()
        .then(() => console.log('Google Maps API loaded successfully'))
        .catch((err) => console.error('Error loading Google Maps API:', err));
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                customerSearchRef.current && !customerSearchRef.current.contains(event.target) &&
                inventorySearchRef.current && !inventorySearchRef.current.contains(event.target)
            ) {
                setFilteredCustomers([]);
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


    const handleClear = () => {
        setCustomerQuery('');
        setInventoryQuery('');
        setFilteredCustomers([]);
        setFilteredInventory([]);
        setSelectedCustomer(null);
        setSelectedInventoryItems([]);
        setShowCustomerDetails(false);
        setDiscount(0);
        setProducts([]);
        setSelectedDate('');
    };

    const handlePurchaseQuantityChange = (itemId, newQuantity, isProduct = false) => {
        const quantity = parseInt(newQuantity, 10) || 0;

        if (isProduct) {
            setProducts(prevProducts =>
                prevProducts.map(product => {
                    if (product.id === itemId) {
                        return {
                            ...product,
                            purchaseQuantity: quantity
                        };
                    }
                    return product;
                })
            );
        } else {
            setSelectedInventoryItems(prevItems =>
                prevItems.map(item => {
                    if (item.id === itemId) {
                        return {
                            ...item,
                            purchaseQuantity: quantity > item.stock ? item.stock : quantity
                        };
                    }
                    return item;
                })
            );
        }
    };

    const handleAddService = () => {
        if (inventoryName && inventoryPrice) {
            const newProduct = {
                id: Date.now(),
                name: inventoryName,
                price: parseFloat(inventoryPrice),
                purchaseQuantity: 1 
            };
            setProducts([...products, newProduct]);
            setInventoryName('');
            setInventoryPrice('');
        } else {
            alert('Please enter both product name and price.');
        }
    };

    const handleRemoveService = (index) => {
        const updatedServices = products.filter((_, i) => i !== index);
        setProducts(updatedServices);
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
            errors.push('Please select or add a customer.');
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
    
        if (selectedInventoryItems.length === 0 && products.length === 0) {
            errors.push('Please add at least one product or service.');
        }
    
        selectedInventoryItems.forEach(item => {
            if (!item.purchaseQuantity || item.purchaseQuantity <= 0) {
                errors.push(`Purchase quantity for item "${item.product_name}" must be greater than 0.`);
            } else if (item.purchaseQuantity > item.stock) {
                errors.push(`Purchase quantity for item "${item.product_name}" exceeds available stock (${item.stock}).`);
            }
        });

        products.forEach(product => {
            if (!product.purchaseQuantity || product.purchaseQuantity <= 0) {
                errors.push(`Purchase quantity for new product "${product.name}" must be greater than 0.`);
            }
        });
    
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
        doc.text("PARTS QUOTATION", pageWidth / 2, imgHeight + 26, { align: 'center' });

        const startY = imgHeight + 35;
        const columnWidth = pageWidth / 2;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text("PQ No:", 25, startY);
        doc.setFont('helvetica', 'normal');
        doc.text(fileName, 38, startY);

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
        doc.text("QUOTATION", 25, currentY);
        currentY += 7;

        let totalAmountSubtotal = 0;

        const tableBody = products.map(service => {
            const serviceTotal = service.purchaseQuantity * service.price;
            totalAmountSubtotal += serviceTotal;

            return [
                service.name,
                service.purchaseQuantity,
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
        doc.text("DISCOUNT (" + discount + ")%:", finalX, currentY);
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

        const footerMarginX = 25;
        const footerTextWidth = pageWidth - 2 * footerMarginX;
        
        const footerText = `
        TERMS & CONDITIONS:

        Customer will be billed after indicating acceptance of this quote
        Payments will be due prior to delivery of service and goods
        Minimum of 70% Downpayment is required
        Ordered parts will take 5-7 business days after downpayment, provided there are no delays from the courier or customs clearance
        
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
                doc.text(line, footerMarginX, currentY + 5);
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
            mechanicName: "N/A",
            plateNo: selectedCustomer['plateNo'],
            type: "Parts Quotation",
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
    
        let fileName = `PQ-${selectedCustomer?.plateNo}-${formattedDate}`;
        fileName = fileName.replace(/\s+/g, '');

        return fileName;
    }

    const toggleAddProduct = () => {
        setIsAddProductVisible(!isAddProductVisible);
        setFilteredInventory([]);
    };

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
        <div className="pq-parts-quotation">
            <div className="pq-header">
                <h1>PARTS QUOTATION</h1>
                <button className="pq-clear-button" onClick={handleClear}>Clear</button>
            </div>

            <div className="pq-user-info">
                <div className="pq-date-input-wrapper">
                    <div className="pq-date-header-section">
                    <h2>DATE & TIME ISSUED</h2>
                    </div>
                    <input
                    className="pq-placeholder"
                    type="datetime-local"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    />
                </div>
                <form className="pq-customer-section" ref={customerSearchRef} onSubmit={handleSaveNewCustomer}>
                    <h2>CUSTOMER</h2>
                    {!showCustomerDetails && (
                        <div className="pq-search-bar">
                            <span className="material-symbols-outlined pq-search-icon">search</span>
                            <input
                                type="text"
                                placeholder="Search Customer"
                                className="pq-search-input"
                                value={customerQuery}
                                onChange={handleCustomerSearch}
                                onFocus={() => setFilteredCustomers(customers.slice(0, 5))}
                                disabled={isSubmittingCustomer}
                            />
                        </div>
                    )}
                    {filteredCustomers.length > 0 && (
                        <div className="pq-dropdown">
                            {filteredCustomers.map((customer, index) => (
                                <div className="pq-dropdown-option" key={index} onClick={() => handleCustomerSelect(customer)}>
                                    <span className="pq-dropdown-text">{customer.name}</span>
                                    <span className="pq-dropdown-actions">{customer.plateNo}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {selectedCustomer && !showCustomerDetails && (
                        <div className="pq-customer-details">
                            <p><strong>Name:</strong> {selectedCustomer.name}</p>
                            <p><strong>Car Model:</strong> {selectedCustomer.carModel}</p>
                            <p><strong>Plate No:</strong> {selectedCustomer.plateNo}</p>
                            <p><strong>Contact:</strong> {selectedCustomer.contact}</p>
                            <p><strong>Address:</strong> {selectedCustomer.address || "N/A"}</p>
                        </div>
                    )}
                    <button 
                        type="button" 
                        className={`pq-add-customer-btn ${showCustomerDetails ? 'cancel' : ''}`} 
                        onClick={handleToggleCustomer}
                        disabled={isSubmittingCustomer}
                    >
                        {showCustomerDetails ? 'Cancel' : '+ Add New Customer'}
                    </button>

                    {showCustomerDetails && (
                        <div className="pq-customer-details">
                            <p><strong>Name:</strong></p>
                            <input
                                className="pq-placeholder"
                                type="text"
                                placeholder="Enter name"
                                value={newCustomer.name}
                                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                required
                                disabled={isSubmittingCustomer}
                            />

                            <p><strong>Car Model:</strong></p>
                            <input
                                className="pq-placeholder"
                                type="text"
                                placeholder="Enter car model"
                                value={newCustomer.carModel}
                                onChange={(e) => setNewCustomer({ ...newCustomer, carModel: e.target.value })}
                                required
                                disabled={isSubmittingCustomer}
                            />

                            <p><strong>Plate No:</strong></p>
                            <input
                                className="pq-placeholder"
                                type="text"
                                placeholder="Enter plate number"
                                value={newCustomer.plateNo}
                                onChange={(e) => setNewCustomer({ ...newCustomer, plateNo: e.target.value })}
                                required
                                disabled={isSubmittingCustomer}
                            />

                            <p><strong>Contact No:</strong></p>
                            <input
                                className="pq-placeholder"
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
                                    className="pq-placeholder"
                                    type="text"
                                    placeholder="Enter address"
                                    value={newCustomer.address}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    required
                                    disabled={isSubmittingCustomer}
                                />
                            </Autocomplete>

                            <button
                                className="pq-submit-btn"
                                type="submit"
                                disabled={isSubmittingCustomer}
                            >
                                {isSubmittingCustomer ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <div className="pq-discount-section">
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
                    className="pq-discount-input"
                    min="0"
                    max="100"
                    placeholder="Enter discount percentage"
                />
            </div>

            <div className="pq-payment-section">
                <div className="pq-header-section">
                    <h2>PREFERRED PAYMENT</h2>
                </div>
                <select
                    className="pq-placeholder"
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

            <div className="pq-parts-section" ref={inventorySearchRef}>
                <div className="pq-header-section">
                    <div className="pq-header-left">
                        <h2>INVENTORY</h2>
                        <span className="material-symbols-outlined pq-info-icon" data-tooltip="Select the part(s) or item(s) required to complete the outlined products.">info</span>
                    </div>
                    <button 
                        onClick={toggleAddProduct} 
                        className={`pq-add-service-btn ${isAddProductVisible ? 'cancel' : ''}`}>
                        {isAddProductVisible ? 'Cancel' : '+ Add New Product'}
                    </button>
                </div>

                {!isAddProductVisible && (
                    <div className="pq-search-bar">
                        <span className="material-symbols-outlined pq-search-icon">search</span>
                        <input
                            type="text"
                            placeholder="Search for parts or items"
                            className="pq-search-input"
                            value={inventoryQuery}
                            onChange={handleInventorySearch}
                            onFocus={handleInventoryFocus}
                        />
                    </div>
                )}

                {filteredInventory.length > 0 && (
                    <div className="pq-dropdown">
                        {filteredInventory.map((item, index) => (
                            <div className="pq-dropdown-option" key={index} onClick={() => handleInventorySelect(item)}>
                                <span className="pq-dropdown-text">{item.product_name}</span>
                                <span className="pq-dropdown-actions">{item.stock}</span>
                            </div>
                        ))}
                    </div>
                )}

                {isAddProductVisible && (
                    <div className="pq-service-inputs-container">
                        <div className="pq-service-inputs">
                            <input
                            placeholder="Enter product name"
                            value={inventoryName}
                            onChange={(e) => setInventoryName(e.target.value)}
                            className="pq-service-name-input"
                            />
                            <input
                            type="number"
                            placeholder="Enter price"
                            value={inventoryPrice}
                            onChange={(e) => setInventoryPrice(e.target.value)}
                            className="pq-service-price-input"
                            />
                        </div>

                        <button className="pq-add-manual-btn" onClick={handleAddService}>
                            <span className="material-symbols-outlined add-icon">add_box</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="product-tables-container">
                {selectedInventoryItems.length > 0 && (
                    <div className="existing-products-table">
                        <h2>Existing Products</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Stock</th>
                                    <th>Purchase Quantity</th>
                                    <th>Total Amount</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedInventoryItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.product_name}</td>
                                        <td>
                                            {item.stock - (item.purchaseQuantity || 0)}{' '}
                                            {item.stock - (item.purchaseQuantity || 0) > 0
                                                ? `${item.unit}${item.unit === 'box' ? 'es' : item.unit === 'piece' ? 's' : ''}`
                                                : item.unit}
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={item.purchaseQuantity || ''}
                                                min="1"
                                                onChange={(e) => handlePurchaseQuantityChange(item.id, e.target.value)}
                                                className="purchase-quantity-input"
                                            />
                                        </td>
                                        <td>₱{item.purchaseQuantity ? item.price * item.purchaseQuantity : item.price}</td>
                                        <td>
                                            <button className="remove-item-btn" onClick={() => handleRemoveInventoryItem(item.id)}>
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {products.length > 0 && (
                    <div className="new-products-table">
                        <h2>New Products</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Stock</th>
                                    <th>Purchase Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((service, index) => (
                                    <tr key={index}>
                                        <td>{service.name}</td>
                                        <td>None</td>
                                        <td>
                                            <input
                                                type="number"
                                                value={service.purchaseQuantity || ''}
                                                min="1"
                                                onChange={(e) => handlePurchaseQuantityChange(service.id, e.target.value, true)}
                                                className="purchase-quantity-input"
                                            />
                                        </td>
                                        <td>₱{(service.purchaseQuantity > 0 ? service.purchaseQuantity * service.price : service.price).toFixed(2)}</td>
                                        <td>
                                            <button onClick={() => handleRemoveService(index)} className="pq-remove-service-btn">
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <button className="pq-save-button" onClick={generatePDF}>Preview .PDF</button>
            {showModal && (
                <div className="pq-modal">
                    <span className="close" onClick={closeModal}>&times;</span>
                    <iframe
                        src={pdfUrl}
                        width="100%"
                        height="300px"
                        title="PDF Preview"
                    ></iframe>
                    <button onClick={downloadPDF} className="pq-download-button">Download .PDF</button>
                </div>
            )}
        </div>
    );
};

export default PartsQuotation;
