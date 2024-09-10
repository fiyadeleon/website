import React, { useState, useEffect } from 'react';
import '../styles/Transactions.css';

function generateTransactionId() {
    const randomString = Math.random().toString(36).substr(2, 6).toUpperCase();
    const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `TRAN-${randomString}-${dateString}`;
}

function Transactions() {
    const API_ENDPOINT = process.env.API_ENDPOINT;
    const API_KEY = process.env.API_KEY;

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('Sort');
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTransactionIndex, setEditTransactionIndex] = useState(null);
    const [transactionDetails, setTransactionDetails] = useState({ id: '', type: '', dateTime: '', customerName: '', plateNo: '', amount: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`${API_ENDPOINT}/item?resource=transaction`, {
                method: 'GET',
                headers: {
                    'x-api-key': API_KEY
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            alert('Error fetching transactions!');
            console.error('Error fetching transactions:', error);
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

        const sortedTransactions = [...transactions];
    
        switch (sortOption) {
            case 'Customer Name: A to Z':
                sortedTransactions.sort((a, b) => a.customerName.localeCompare(b.customerName));
                break;
            case 'Customer Name: Z to A':
                sortedTransactions.sort((a, b) => b.customerName.localeCompare(a.customerName));
                break;
            case 'Plate No: A to Z':
                sortedTransactions.sort((a, b) => a.plateNo.localeCompare(b.plateNo, undefined, { numeric: true, sensitivity: 'base' }));
                break;
            case 'Plate No: Z to A':
                sortedTransactions.sort((a, b) => b.plateNo.localeCompare(a.plateNo, undefined, { numeric: true, sensitivity: 'base' }));
                break;
            case 'Transaction No: High to Low':
                sortedTransactions.sort((a, b) => {
                    const numA = parseInt(a.id.replace(/[^0-9]/g, ''), 10);
                    const numB = parseInt(b.id.replace(/[^0-9]/g, ''), 10);
                    return numB - numA;
                });
                break;
            case 'Transaction No: Low to High':
                sortedTransactions.sort((a, b) => {
                    const numA = parseInt(a.id.replace(/[^0-9]/g, ''), 10);
                    const numB = parseInt(b.id.replace(/[^0-9]/g, ''), 10);
                    return numA - numB;
                });
                break;
            default:
                break;
        }
    
        setTransactions(sortedTransactions);
    };

    const handleCheckboxChange = (index, id) => {
        const isAlreadySelected = selectedCheckboxes.includes(index);

        if (!isAlreadySelected) {
            console.log(`Selected transaction: ${id}`);
        }

        setSelectedCheckboxes((prevSelected) => {
            if (isAlreadySelected) {
                return prevSelected.filter((item) => item !== index);
            } else {
                return [...prevSelected, index];
            }
        });
    };

    const handleDeleteConfirmation = async (confirm) => {
        if (confirm) {
            try {
                const selectedTransactions = selectedCheckboxes.map(index => {
                    const transaction = transactions[index];
                    return { id: transaction.id };
                });

                const response = await fetch(`${API_ENDPOINT}/item?resource=transaction`, {
                    method: 'DELETE',
                    headers: {
                        'x-api-key': API_KEY
                    },
                    body: JSON.stringify(selectedTransactions)
                });

                if (!response.ok) {
                    throw new Error('Failed to delete selected transactions');
                }

                const result = await response.json();
                console.log('Deletion result:', result);

                setTransactions((prevTransactions) =>
                    prevTransactions.filter((_, index) => !selectedCheckboxes.includes(index))
                );
                setSelectedCheckboxes([]);

            } catch (error) {
                alert('Error deleting transaction(s)!');
                console.error('Error deleting transactions:', error);
            } finally {
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
            setEditTransactionIndex(null);
            setTransactionDetails({ id: '', type: '', dateTime: '', customerName: '', plateNo: '', amount: '' });
        }
    };

    const handleEdit = (index) => {
        const transaction = transactions[index];
        const formattedDateTime = transaction.dateTime.replace('T', ' ');
        setTransactionDetails({
            id: transaction.id,
            type: transaction.type,
            dateTime: formattedDateTime,
            customerName: transaction.customerName,
            plateNo: transaction.plateNo,
            amount: transaction.amount.toString(),
        });
        console.log(`To update: ${transaction.id}`)
        setIsEditMode(true);
        setEditTransactionIndex(index);
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTransactionDetails({
            ...transactionDetails,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newTransactionId = isEditMode ? transactionDetails.id : generateTransactionId();
        const formattedDateTime = transactionDetails.dateTime.replace('T', ' ');
        const newTransaction = {
            id: newTransactionId,
            type: transactionDetails.type,
            dateTime: formattedDateTime,
            customerName: transactionDetails.customerName,
            plateNo: transactionDetails.plateNo,
            amount: parseFloat(transactionDetails.amount),
        };

        try {
            setIsLoading(true);
            let response;

            if (isEditMode && editTransactionIndex !== null) {
                response = await fetch(`${API_ENDPOINT}/item?resource=transaction`, {
                    method: 'PUT',
                    headers: {
                        'x-api-key': API_KEY
                    },
                    body: JSON.stringify(newTransaction)
                });
            } else {
                response = await fetch(`${API_ENDPOINT}/item?resource=transaction`, {
                    method: 'POST',
                    headers: {
                        'x-api-key': API_KEY
                    },
                    body: JSON.stringify(newTransaction)
                });
            }

            if (!response.ok) {
                throw new Error(isEditMode ? 'Failed to update transaction' : 'Failed to add transaction');
            }

            const result = await response.json();
            console.log(isEditMode ? 'Transaction successfully updated:' : 'Transaction successfully added:', result);

            if (isEditMode && editTransactionIndex !== null) {
                const transactionIndex = transactions.findIndex((transaction) => transaction.id === transactionDetails.id);

                setTransactions((prevTransactions) =>
                    prevTransactions.map((transaction, index) =>
                        index === editTransactionIndex ? newTransaction : transaction
                    )
                );
            } else {
                setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
            }

            toggleModal();

        } catch (error) {
            alert('Error submitting transaction!');
            console.error('Error submitting transaction:', error);
        } finally {
            setIsLoading(false);
            fetchTransactions();
        }
    };

    const filteredTransactions = transactions.filter((transaction) =>
        transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.plateNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const totalPages = Math.ceil(filteredTransactions.length / pageSize);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="transactions">
            <div className="transactions-header">
                <h1>TRANSACTIONS</h1>
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

            <div className="transactions-info">
                <div className="transactions-status">
                    <button className="status-button all active">
                        <span>All</span>
                        <span className="all-count">{transactions.length}</span>
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
                    <div onClick={() => handleSortSelection('Customer Name: A to Z')}>Customer Name: A to Z</div>
                    <div onClick={() => handleSortSelection('Customer Name: Z to A')}>Customer Name: Z to A</div>
                    <div onClick={() => handleSortSelection('Plate No: A to Z')}>Plate No: A to Z</div>
                    <div onClick={() => handleSortSelection('Plate No: Z to A')}>Plate No: Z to A</div>
                    <div onClick={() => handleSortSelection('Transaction No: High to Low')}>Transaction No: High to Low</div>
                    <div onClick={() => handleSortSelection('Transaction No: Low to High')}>Transaction No: Low to High</div>
                </div>
                <div className="search-container">
                    <span className="material-symbols-outlined search-icon">search</span>
                    <input
                        type="text"
                        placeholder="Search transactions"
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="material-symbols-outlined info-icon" data-tooltip="Only Transaction No., Customer Name, and Plate No. are searchable.">info</span>
                </div>
                {/* <div className="transactions-actions">
                    <button className="add-transaction-button" onClick={toggleModal}>+ Add New Transaction</button>
                </div> */}
            </div>
            <div className="transactions-table">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>TRANSACTION NO.</th>
                            <th>TYPE</th>
                            <th>CUSTOMER NAME</th>
                            <th>PLATE NO.</th>
                            <th>AMOUNT</th>
                            <th>DATE & TIME</th>
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
                            paginatedTransactions.map((transaction, index) => {
                                const absoluteIndex = (currentPage - 1) * pageSize + index;
                                return (
                                    <tr key={absoluteIndex}>
                                        <td onClick={() => handleCheckboxChange(absoluteIndex, transaction.id)} style={{ cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                onChange={() => handleCheckboxChange(absoluteIndex, transaction.id)}
                                                checked={selectedCheckboxes.includes(absoluteIndex)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td>{transaction.id}</td>
                                        <td>{transaction.type}</td>
                                        <td>{transaction.customerName}</td>
                                        <td>{transaction.plateNo}</td>
                                        <td>₱{transaction.amount.toFixed(2)}</td>
                                        <td>{transaction.dateTime}</td>
                                        <td>
                                            <span
                                                className="material-symbols-outlined edit-icon"
                                                onClick={() => handleEdit(absoluteIndex)}
                                                title="Edit Transaction"
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
                    <button onClick={handleClearAll} className="clear-all-button">Clear All</button>
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
                            <h2>{isEditMode ? 'Edit Transaction' : 'Add New Transaction'}</h2>
                            <form onSubmit={handleSubmit}>
                                {!isEditMode && (
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select 
                                            className="transactions-select"
                                            name="type"
                                            placeholder="Select transaction type"
                                            value={transactionDetails.type}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" disabled>Select transaction type</option>
                                            <option value="Scope of Work">Scope of Work</option>
                                            <option value="Job Order">Job Order</option>
                                            <option value="Invoice">Invoice</option>
                                            <option value="Parts Quotation">Parts Quotation</option>
                                        </select>
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Customer Name</label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        placeholder="Select transaction type"
                                        value={transactionDetails.customerName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Plate No.</label>
                                    <input
                                        type="text"
                                        name="plateNo"
                                        value={transactionDetails.plateNo}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Amount</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={transactionDetails.amount}
                                        onChange={handleInputChange}
                                        required
                                        step="0.01"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        name="dateTime"
                                        value={transactionDetails.dateTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={toggleModal}>Cancel</button>
                                    <button type="submit" disabled={isLoading}>
                                        {isLoading 
                                            ? (isEditMode ? 'Updating Transaction...' : 'Adding Transaction...') 
                                            : (isEditMode ? 'Update Transaction' : 'Add Transaction')}
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

export default Transactions;
