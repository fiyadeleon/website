import React, { useState } from 'react';
import '../styles/Transactions.css';

function Transactions() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('Sort');
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTransactionIndex, setEditTransactionIndex] = useState(null);
    const [transactionDetails, setTransactionDetails] = useState({
        transactionNo: '',
        type: '',
        dateTime: '',
        customerName: '',
        plateNo: '',
        amount: ''
    });

    const [searchQuery, setSearchQuery] = useState(''); // State for search query

    const [transactions, setTransactions] = useState([
        { transactionNo: 'TXN001', type: 'Scope of Work', dateTime: '2024-08-01 14:00', customerName: 'John Doe', plateNo: 'ABC123', amount: 150.00 },
        { transactionNo: 'TXN002', type: 'Job Order', dateTime: '2024-08-02 15:30', customerName: 'Jane Smith', plateNo: 'XYZ456', amount: -50.00 },
        { transactionNo: 'TXN003', type: 'Scope of Work', dateTime: '2024-08-03 11:45', customerName: 'Michael Brown', plateNo: 'LMN789', amount: 200.00 },
        { transactionNo: 'TXN004', type: 'Parts Quotation', dateTime: '2024-08-04 10:15', customerName: 'Alice Johnson', plateNo: 'QRS234', amount: 175.00 },
        { transactionNo: 'TXN005', type: 'Receipt', dateTime: '2024-08-05 16:20', customerName: 'Bob Williams', plateNo: 'TUV678', amount: -30.00 }
    ]);

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
                sortedTransactions.sort((a, b) => {
                    const plateA = a.plateNo.toUpperCase();
                    const plateB = b.plateNo.toUpperCase();
                    return plateA.localeCompare(plateB, undefined, { numeric: true, sensitivity: 'base' });
                });
                break;
            case 'Plate No: Z to A':
                sortedTransactions.sort((a, b) => {
                    const plateA = a.plateNo.toUpperCase();
                    const plateB = b.plateNo.toUpperCase();
                    return plateB.localeCompare(plateA, undefined, { numeric: true, sensitivity: 'base' });
                });
                break;
            case 'Transaction No: High to Low':
                sortedTransactions.sort((a, b) => {
                    const numA = parseInt(a.transactionNo.replace(/[^0-9]/g, ''), 10);
                    const numB = parseInt(b.transactionNo.replace(/[^0-9]/g, ''), 10);
                    return numB - numA;
                });
                break;
            case 'Transaction No: Low to High':
                sortedTransactions.sort((a, b) => {
                    const numA = parseInt(a.transactionNo.replace(/[^0-9]/g, ''), 10);
                    const numB = parseInt(b.transactionNo.replace(/[^0-9]/g, ''), 10);
                    return numA - numB;
                });
                break;
            default:
                break;
        }
    
        setTransactions(sortedTransactions);
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
            setTransactions((prevTransactions) =>
                prevTransactions.filter((_, index) => !selectedCheckboxes.includes(index))
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
            setEditTransactionIndex(null);
            setTransactionDetails({ transactionNo: '', type: '', dateTime: '', customerName: '', plateNo: '', amount: '' });
        }
    };

    const handleEdit = (index) => {
        const transaction = transactions[index];
        setTransactionDetails({
            transactionNo: transaction.transactionNo,
            type: transaction.type,
            dateTime: transaction.dateTime,
            customerName: transaction.customerName,
            plateNo: transaction.plateNo,
            amount: transaction.amount.toString(),
        });
        setIsEditMode(true);
        setEditTransactionIndex(index);
        setIsModalOpen(true);
    };

    const handleSavePdf = () => {
        console.log('test');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTransactionDetails({
            ...transactionDetails,
            [name]: value,
        });
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newTransaction = {
            transactionNo: transactionDetails.transactionNo,
            type: transactionDetails.type,
            dateTime: transactionDetails.dateTime,
            customerName: transactionDetails.customerName,
            plateNo: transactionDetails.plateNo,
            amount: parseFloat(transactionDetails.amount),
        };

        if (isEditMode && editTransactionIndex !== null) {
            setTransactions((prevTransactions) =>
                prevTransactions.map((transaction, index) =>
                    index === editTransactionIndex ? newTransaction : transaction
                )
            );
            console.log('Transaction updated:', newTransaction);
        } else {
            setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
            console.log('Transaction added:', newTransaction);
        }

        toggleModal();
    };

    // Filtered transactions based on search query
    const filteredTransactions = transactions.filter((transaction) =>
        transaction.transactionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.plateNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        onChange={handleSearchInputChange}
                    />
                    <span className="material-symbols-outlined info-icon" data-tooltip="Only Transaction No., Customer Name, and Plate No. are searchable.">info</span>
                </div>
                <div className="transactions-actions">
                    <button className="add-transaction-button" onClick={toggleModal}>+ Add New Transaction</button>
                </div>
            </div>
            <div className="transactions-table">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>TRANSACTION NO.</th>
                            <th>TYPE</th>
                            <th>DATE & TIME</th>
                            <th>CUSTOMER NAME</th>
                            <th>PLATE NO.</th>
                            <th>AMOUNT</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((transaction, index) => (
                            <tr key={index}>
                                <td onClick={() => handleCheckboxChange(index)} style={{ cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        onChange={() => handleCheckboxChange(index)}
                                        checked={selectedCheckboxes.includes(index)}
                                        onClick={(e) => e.stopPropagation()} // Prevents the checkbox click from triggering the td click event
                                    />
                                </td>
                                <td>{transaction.transactionNo}</td>
                                <td>{transaction.type}</td>
                                <td>{transaction.dateTime}</td>
                                <td>{transaction.customerName}</td>
                                <td>{transaction.plateNo}</td>
                                <td>₱{transaction.amount.toFixed(2)}</td>
                                <td>
                                    <span
                                        className="material-symbols-outlined edit-icon"
                                        onClick={() => handleEdit(index)}
                                        title="Edit Transaction"
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

            {/* Modal for Adding/Editing Transaction */}
            {isModalOpen && (
                <>
                    <div className="modal-overlay" onClick={toggleModal}></div>
                    <div className="modal">
                        <div className="modal-content">
                            <h2>{isEditMode ? 'Edit Transaction' : 'Add New Transaction'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Type</label>
                                    <input
                                        type="text"
                                        name="type"
                                        value={transactionDetails.type}
                                        onChange={handleInputChange}
                                        required
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
                                <div className="form-group">
                                    <label>Customer Name</label>
                                    <input
                                        type="text"
                                        name="customerName"
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
                                <div className="modal-actions">
                                    <button type="button" onClick={toggleModal}>Cancel</button>
                                    <button type="submit">{isEditMode ? 'Update Transaction' : 'Add Transaction'}</button>
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
