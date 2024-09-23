import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { loadGoogleMapsAPI } from './loadGoogleMapsAPI';
import '../styles/Customers.css';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const API_KEY = process.env.REACT_APP_API_KEY;

function generateCustomerId() {
    const randomString = Math.random().toString(36).substr(2, 6).toUpperCase(); 
    const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, ''); 
    return `CUST-${randomString}-${dateString}`;
}

function Customers() {    
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('Sort');
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editCustomerIndex, setEditCustomerIndex] = useState(null);
    const [customerDetails, setCustomerDetails] = useState({
        id: '', name: '', contact: '', email: '', address: '', plateNo: '', carModel: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch(`${API_ENDPOINT}/item?resource=customer`, {
                method: 'GET',
                headers: {
                    'x-api-key': API_KEY
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }

            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            alert('Error fetching customers!');
        } finally {
            setIsLoading(false);
        }
    };

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
                sortedCustomers.sort((a, b) => a.plateNo.localeCompare(b.plateNo));
                break;
            case 'Plate No: Z to A':
                sortedCustomers.sort((a, b) => b.plateNo.localeCompare(a.plateNo));
                break;
            default:
                break;
        }

        setCustomers(sortedCustomers);
    };

    const handleCheckboxChange = (index, name) => {
        const isAlreadySelected = selectedCheckboxes.includes(index);

        if (!isAlreadySelected) {
            console.log(`Selected customer: ${name}`);
        }

        setSelectedCheckboxes((prevSelected) =>
            prevSelected.includes(index)
                ? prevSelected.filter((item) => item !== index)
                : [...prevSelected, index]
        );
    };

    const handleDeleteConfirmation = async (confirm) => {
        if (confirm) {
            try {
                const selectedCustomers = selectedCheckboxes.map(index => {
                    const customer = customers[index];
                    return { id: customer.id };
                });

                const response = await fetch(`${API_ENDPOINT}/item?resource=customer`, {
                    method: 'DELETE',
                    headers: {
                        'x-api-key': API_KEY
                    },
                    body: JSON.stringify(selectedCustomers),
                });

                if (!response.ok) {
                    throw new Error('Failed to delete customers');
                }

                const result = await response.json();
                console.log('Deletion result:', result);
                
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await fetchCustomers();
            } catch (error) {
                console.error('Error deleting customers:', error);
                alert('Error deleting customers!');
            } finally {
                setSelectedCheckboxes([]);

                setCustomers((prevCustomers) =>
                    prevCustomers.filter((_, index) => !selectedCheckboxes.includes(index))
                );

                setCurrentPage(1);
            }
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
            setCustomerDetails({ id: '', name: '', contact: '', email: '', address: '', plateNo: '', carModel: '' });
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
            carModel: customer.carModel,
        });
        console.log(`To update: ${customer.id}`)
        setIsEditMode(true);
        setEditCustomerIndex(index);
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails({ ...customerDetails, [name]: value });
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newCustomer = {
            id: isEditMode ? customerDetails.id : generateCustomerId(),
            name: customerDetails.name,
            contact: customerDetails.contact,
            email: customerDetails.email,
            address: customerDetails.address,
            plateNo: customerDetails.plateNo,
            carModel: customerDetails.carModel
        };

        try {
            setIsLoading(true);
            let response;
            if (isEditMode && editCustomerIndex !== null) {
                response = await fetch(`${API_ENDPOINT}/item?resource=customer`, {
                    method: 'PUT',
                    headers: {
                        'x-api-key': API_KEY
                    },
                    body: JSON.stringify(newCustomer),
                });
            } else {
                response = await fetch(`${API_ENDPOINT}/item?resource=customer`, {
                    method: 'POST',
                    headers: {
                        'x-api-key': API_KEY
                    },
                    body: JSON.stringify(newCustomer),
                });
            }

            if (!response.ok) {
                throw new Error(isEditMode ? 'Failed to update customer' : 'Failed to add customer');
            }

            const result = await response.json();
            console.log(isEditMode ? 'Transaction successfully updated:' : 'Transaction successfully added:', result);

            if (isEditMode && editCustomerIndex !== null) {
                setCustomers((prevCustomers) =>
                    prevCustomers.map((customer, index) =>
                        index === editCustomerIndex ? newCustomer : customer
                    )
                );
            } else {
                setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
            await fetchCustomers();
            toggleModal();
        } catch (error) {
            console.error('Error submitting customer:', error);
            alert('Error submitting customer!');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCustomers = customers.filter((customer) => {
        const id = customer.id ? customer.id.toLowerCase() : '';
        const name = customer.name ? customer.name.toLowerCase() : '';
        const plateNo = customer.plateNo ? customer.plateNo.toLowerCase() : '';
        
        return id.includes(searchQuery.toLowerCase()) ||
               name.includes(searchQuery.toLowerCase()) ||
               plateNo.includes(searchQuery.toLowerCase());
    });

    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const totalPages = Math.ceil(filteredCustomers.length / pageSize);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const [autocomplete, setAutocomplete] = useState(null);

    useEffect(() => {
        loadGoogleMapsAPI()
            .then(() => {
                console.log('Google Maps API loaded successfully');
            })
            .catch((err) => {
                console.error('Error loading Google Maps API:', err);
            });
    }, []);

    const onLoad = (autoC) => {
        setAutocomplete(autoC);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
                setCustomerDetails((prevDetails) => ({
                    ...prevDetails,
                    address: place.formatted_address,
                }));
            }
        } else {
            console.log('Autocomplete is not loaded yet!');
        }
    };

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
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>
                                    <div className="loading-icon">
                                        <i className="fas fa-spinner fa-spin fa-3x"></i>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedCustomers.map((customer, index) => {
                                const absoluteIndex = (currentPage - 1) * pageSize + index;
                                return (
                                    <tr key={absoluteIndex}>
                                        <td onClick={() => handleCheckboxChange(absoluteIndex, customer.name)} style={{ cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                onChange={() => handleCheckboxChange(absoluteIndex, customer.name)}
                                                checked={selectedCheckboxes.includes(absoluteIndex)}
                                                onClick={(e) => e.stopPropagation()}
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
                                                onClick={() => handleEdit(absoluteIndex)}
                                                title="Edit Customer"
                                            >
                                                edit_note
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="lower-table">
                {selectedCheckboxes.length > 0 && (
                    <button className="clear-all-button" onClick={handleClearAll}>
                        Clear All
                    </button>
                )}
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <span
                            key={i}
                            className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                            onClick={() => handlePageChange(i + 1)}
                        >
                            {i + 1}
                        </span>
                    ))}
                </div>
            </div>

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
                                        placeholder="Enter customer name"
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
                                        placeholder="Enter customer's plate number"
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
                                        placeholder="Enter customer's car model"
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
                                        placeholder="Enter customer's contact number"
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
                                        placeholder="Enter customer's email address"
                                        value={customerDetails.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                                        <input
                                            type="text"
                                            name="address"
                                            placeholder="Enter customer's address"
                                            value={customerDetails.address}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Autocomplete>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={toggleModal}>Cancel</button>
                                    <button type="submit" disabled={isLoading}>
                                        {isLoading 
                                            ? (isEditMode ? 'Updating Customer...' : 'Adding Customer...') 
                                            : (isEditMode ? 'Update Customer' : 'Add Customer')}
                                        </button>
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
