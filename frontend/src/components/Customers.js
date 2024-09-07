import React, { useState } from 'react';
import '../styles/Customers.css';

function Customers() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('Sort');
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editCustomerIndex, setEditCustomerIndex] = useState(null);
    const [customerDetails, setCustomerDetails] = useState({
        id: '',
        name: '',
        contact: '',
        email: '',
        address: '',
        plateNo: '',
        carModel: ''
    });

    const [searchQuery, setSearchQuery] = useState(''); // State for search query

    const [customers, setCustomers] = useState([
        { id: 'CUST001', name: 'John Doe', contact: '1234567890', email: 'john@example.com', address: '123 Main St', plateNo: 'ABC123', carModel: 'Ford Mustang GT' },
        { id: 'CUST002', name: 'Jane Smith', contact: '0987654321', email: 'jane@example.com', address: '456 Elm St', plateNo: 'XYZ456', carModel: 'Ford Mustang EcoBoost' },
        { id: 'CUST003', name: 'Michael Brown', contact: '5555555555', email: 'michael@example.com', address: '789 Oak St', plateNo: 'LMN789', carModel: 'Ford Mustang Shelby GT500' },
        { id: 'CUST004', name: 'Alice Johnson', contact: '1112223333', email: 'alice@example.com', address: '321 Pine St', plateNo: 'QRS234', carModel: 'Ford Mustang Mach 1' },
        { id: 'CUST005', name: 'Bob Williams', contact: '4445556666', email: 'bob@example.com', address: '654 Cedar St', plateNo: 'TUV678', carModel: 'Ford Mustang GT Convertible' }
    ]);    

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleSortSelection = (sortOption) => {
        setSelectedSort(sortOption);
        setDropdownOpen(false);
        
        const sortedCustomers = [...customers];
    
        switch (sortOption) {
            case 'Name: A to Z':
                sortedCustomers.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'Name: Z to A':
                sortedCustomers.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'Plate No: A to Z':
                sortedCustomers.sort((a, b) => {
                    const plateA = a.plateNo.toUpperCase();
                    const plateB = b.plateNo.toUpperCase();
                    return plateA.localeCompare(plateB, undefined, { numeric: true, sensitivity: 'base' });
                });
                break;
            case 'Plate No: Z to A':
                sortedCustomers.sort((a, b) => {
                    const plateA = a.plateNo.toUpperCase();
                    const plateB = b.plateNo.toUpperCase();
                    return plateB.localeCompare(plateA, undefined, { numeric: true, sensitivity: 'base' });
                });
                break;
            default:
                break;
        }
    
        setCustomers(sortedCustomers);
    };

    const handleCheckboxChange = (index) => {
        setSelectedCheckboxes((prevSelected) => {
            if (prevSelected.includes(index)) {
                return prevSelected.filter((item) => item !== index);
            } else {
                return [...prevSelected, index];
            }
        });
    };

    const handleDeleteConfirmation = (confirm) => {
        if (confirm) {
            setCustomers((prevCustomers) =>
                prevCustomers.filter((_, index) => !selectedCheckboxes.includes(index))
            );
            setSelectedCheckboxes([]);
        } else {
            setSelectedCheckboxes([]);
        }
    };

    const handleClearAll = () => {
        setSelectedCheckboxes([]);
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        if (!isModalOpen) {
            setIsEditMode(false);
            setEditCustomerIndex(null);
            setCustomerDetails({ id: '', name: '', contact: '', email: '', address: '', plateNo: '' });
        }
    };

    const handleEdit = (index) => {
        const customer = customers[index];
        setCustomerDetails({
            id: customer.id,
            name: customer.name,
            contact: customer.contact,
            email: customer.email,
            address: customer.address,
            plateNo: customer.plateNo,
        });
        setIsEditMode(true);
        setEditCustomerIndex(index);
        setIsModalOpen(true);
    };

    const handleSavePdf = () => {
        console.log('test');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails({
            ...customerDetails,
            [name]: value,
        });
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newCustomer = {
            id: customerDetails.id,
            name: customerDetails.name,
            contact: customerDetails.contact,
            email: customerDetails.email,
            address: customerDetails.address,
            plateNo: customerDetails.plateNo,
            carModel: customerDetails.carModel
        };

        if (isEditMode && editCustomerIndex !== null) {
            setCustomers((prevCustomers) =>
                prevCustomers.map((customer, index) =>
                    index === editCustomerIndex ? newCustomer : customer
                )
            );
            console.log('Customer updated:', newCustomer);
        } else {
            setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
            console.log('Customer added:', newCustomer);
        }

        toggleModal();
    };

    // Filtered customers based on search query
    const filteredCustomers = customers.filter((customer) =>
        customer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.plateNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="customers">
            <div className="customers-header">
                <h1>CUSTOMERS</h1>
                {selectedCheckboxes.length > 0 && (
                    <div className="notification-box">
                        <p>{selectedCheckboxes.length} item(s) selected. Delete selected?</p>
                        <div className="notification-actions">
                            <button onClick={() => handleDeleteConfirmation(true)} className="yes-button">Yes</button>
                            <button onClick={() => handleDeleteConfirmation(false)} className="no-button">No</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="customers-info">
                <div className="customers-status">
                    <button className="status-button all active">
                        <span>All</span>
                        <span className="all-count">{customers.length}</span>
                    </button>
                </div>
            </div>
            <div className="sort-container">
                <button className="sort-button" onClick={toggleDropdown}>
                    {selectedSort}
                    <span className="material-symbols-outlined">
                        {dropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                    </span>
                </button>
                <div className={`dropdown-menu ${dropdownOpen ? 'open' : 'closed'}`}>
                    <div onClick={() => handleSortSelection('Name: A to Z')}>Name: A to Z</div>
                    <div onClick={() => handleSortSelection('Name: Z to A')}>Name: Z to A</div>
                    <div onClick={() => handleSortSelection('Plate No: A to Z')}>Plate No: A to Z</div>
                    <div onClick={() => handleSortSelection('Plate No: Z to A')}>Plate No: Z to A</div>
                </div>
                <div className="search-container">
                    <span className="material-symbols-outlined search-icon">search</span>
                    <input
                        type="text"
                        placeholder="Search customers"
                        className="search-input"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                    />
                    <span className="material-symbols-outlined info-icon" data-tooltip="Only Name, and Plate No. are searchable.">info</span>
                </div>
                <div className="customers-actions">
                    <button className="add-customer-button" onClick={toggleModal}>+ Add New Customer</button>
                </div>
            </div>
            <div className="customers-table">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>NAME</th>
                            <th>CAR MODEL</th>
                            <th>PLATE NO.</th>
                            <th>CONTACT NO.</th>
                            <th>EMAIL</th>
                            <th>ADDRESS</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map((customer, index) => (
                            <tr key={index}>
                                <td onClick={() => handleCheckboxChange(index)} style={{ cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        onChange={() => handleCheckboxChange(index)}
                                        checked={selectedCheckboxes.includes(index)}
                                        onClick={(e) => e.stopPropagation()} // Prevents the checkbox click from triggering the td click event
                                    />
                                </td>
                                <td>{customer.name}</td>
                                <td>{customer.carModel}</td>
                                <td>{customer.plateNo}</td>
                                <td>{customer.contact}</td>
                                <td>{customer.email}</td>
                                <td>{customer.address}</td>
                                <td>
                                    <span
                                        className="material-symbols-outlined edit-icon"
                                        onClick={() => handleEdit(index)}
                                        title="Edit Customer"
                                    >
                                        edit_note
                                    </span>
                                    <span 
                                        className="material-symbols-outlined save-pdf-icon"
                                        onClick={() => handleSavePdf()}
                                    >
                                        picture_as_pdf
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="lower-table">
                {selectedCheckboxes.length > 0 && (
                    <button className="clear-all-button" onClick={handleClearAll}>
                        Clear All
                    </button>
                )}
                <span className="page-number active">1</span>
                <span className="page-number">2</span>
                <span className="page-number">3</span>
                <span className="page-number">4</span>
                <span className="page-number">5</span>
            </div>

            {/* Modal for Adding/Editing Customer */}
            {isModalOpen && (
                <>
                    <div className="modal-overlay" onClick={toggleModal}></div>
                    <div className="modal">
                        <div className="modal-content">
                            <h2>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={customerDetails.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Plate No.</label>
                                    <input
                                        type="text"
                                        name="plateNo"
                                        value={customerDetails.plateNo}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Car Model</label>
                                    <input
                                        type="text"
                                        name="carModel"
                                        value={customerDetails.carModel}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact No.</label>
                                    <input
                                        type="tel" 
                                        pattern="[0-9]{11}" 
                                        maxLength="11"
                                        name="contact"
                                        value={customerDetails.contact}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={customerDetails.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={customerDetails.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={toggleModal}>Cancel</button>
                                    <button type="submit">{isEditMode ? 'Update Customer' : 'Add Customer'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Customers;
