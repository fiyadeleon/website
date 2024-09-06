import React, { useState } from 'react';
import AdminPanel from './AdminPanel';
import '../styles/Employees.css';

function Employees() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('Sort');
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editEmployeeIndex, setEditEmployeeIndex] = useState(null);
    const [employeeDetails, setEmployeeDetails] = useState({
        id: '',
        name: '',
        contact: '',
        email: '',
        jobTitle: '',
        salary: ''
    });

    const [searchQuery, setSearchQuery] = useState('');

    const [employees, setEmployees] = useState([
        { id: 'EMP001', jobTitle: 'Senior Mechanic', name: 'John Doe', contact: '1234567890', email: 'john@example.com', salary: 55000 },
        { id: 'EMP002', jobTitle: 'Engine Specialist', name: 'Jane Smith', contact: '0987654321', email: 'jane@example.com', salary: 60000 },
        { id: 'EMP003', jobTitle: 'Transmission Technician', name: 'Michael Brown', contact: '5555555555', email: 'michael@example.com', salary: 58000 },
        { id: 'EMP004', jobTitle: 'Brake and Suspension Specialist', name: 'Alice Johnson', contact: '1112223333', email: 'alice@example.com', salary: 57000 },
        { id: 'EMP005', jobTitle: 'Diagnostic Technician', name: 'Bob Williams', contact: '4445556666', email: 'bob@example.com', salary: 62000 }
      ]);
      

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleSortSelection = (sortOption) => {
        setSelectedSort(sortOption);
        setDropdownOpen(false);
        
        const sortedEmployees = [...employees];
    
        switch (sortOption) {
            case 'Name: A to Z':
                sortedEmployees.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'Name: Z to A':
                sortedEmployees.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'Employee No: High to Low':
                sortedEmployees.sort((a, b) => {
                    const numA = parseInt(a.id.replace(/[^0-9]/g, ''), 10);
                    const numB = parseInt(b.id.replace(/[^0-9]/g, ''), 10);
                    return numB - numA;
                });
                break;
            case 'Employee No: Low to High':
                sortedEmployees.sort((a, b) => {
                    const numA = parseInt(a.id.replace(/[^0-9]/g, ''), 10);
                    const numB = parseInt(b.id.replace(/[^0-9]/g, ''), 10);
                    return numA - numB;
                });
                break;
            default:
                break;
        }
    
        setEmployees(sortedEmployees);
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
            setEmployees((prevEmployees) =>
                prevEmployees.filter((_, index) => !selectedCheckboxes.includes(index))
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
            setEditEmployeeIndex(null);
            setEmployeeDetails({ id: '', name: '', contact: '', email: '', jobTitle: '', salary: '' });
        }
    };

    const handleEdit = (index) => {
        const employee = employees[index];
        setEmployeeDetails({
            id: employee.id,
            name: employee.name,
            contact: employee.contact,
            email: employee.email,
            jobTitle: employee.jobTitle,
            salary: employee.salary
        });
        setIsEditMode(true);
        setEditEmployeeIndex(index);
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmployeeDetails({
            ...employeeDetails,
            [name]: value,
        });
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newEmployee = {
            id: employeeDetails.id,
            name: employeeDetails.name,
            contact: employeeDetails.contact,
            email: employeeDetails.email,
            jobTitle: employeeDetails.jobTitle,
            salary: parseFloat(employeeDetails.salary)
        };

        if (isEditMode && editEmployeeIndex !== null) {
            setEmployees((prevEmployees) =>
                prevEmployees.map((employee, index) =>
                    index === editEmployeeIndex ? newEmployee : employee
                )
            );
            console.log('Employee updated:', newEmployee);
        } else {
            setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
            console.log('Employee added:', newEmployee);
        }

        toggleModal();
    };

    const filteredEmployees = employees.filter((employee) =>
        employee.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminPanel>
            <div className="employees">
                <div className="employees-header">
                    <h1>EMPLOYEES</h1>
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

                <div className="employees-info">
                    <div className="employees-status">
                        <button className="status-button all active">
                            <span>All</span>
                            <span className="all-count">{employees.length}</span>
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
                        <div onClick={() => handleSortSelection('Employee No: High to Low')}>Employee No: High to Low</div>
                        <div onClick={() => handleSortSelection('Employee No: Low to High')}>Employee No: Low to High</div>
                    </div>
                    <div className="search-container">
                        <span className="material-symbols-outlined search-icon">search</span>
                        <input
                            type="text"
                            placeholder="Search employees"
                            className="search-input"
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                        />
                        <span className="material-symbols-outlined info-icon" data-tooltip="Only Employee No., Name, and Job Title are searchable.">info</span>
                    </div>
                    <div className="employees-actions">
                        <button className="add-employee-button" onClick={toggleModal}>+ Add New Employee</button>
                    </div>
                </div>
                <div className="employees-table">
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>EMPLOYEE NO.</th>
                                <th>NAME</th>
                                <th>CONTACT NO.</th>
                                <th>EMAIL</th>
                                <th>JOB TITLE</th>
                                <th>SALARY</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((employee, index) => (
                                <tr key={index}>
                                    <td onClick={() => handleCheckboxChange(index)} style={{ cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            onChange={() => handleCheckboxChange(index)}
                                            checked={selectedCheckboxes.includes(index)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </td>
                                    <td>{employee.id}</td>
                                    <td>{employee.name}</td>
                                    <td>{employee.contact}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.jobTitle}</td>
                                    <td>₱{employee.salary.toFixed(2)}</td>
                                    <td>
                                        <span
                                            className="material-symbols-outlined edit-icon"
                                            onClick={() => handleEdit(index)}
                                            title="Edit Employee"
                                        >
                                            edit_note
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

                {isModalOpen && (
                    <>
                        <div className="modal-overlay" onClick={toggleModal}></div>
                        <div className="modal">
                            <div className="modal-content">
                                <h2>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={employeeDetails.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact</label>
                                        <input
                                            type="text"
                                            name="contact"
                                            value={employeeDetails.contact}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={employeeDetails.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Job Title</label>
                                        <input
                                            type="text"
                                            name="jobTitle"
                                            value={employeeDetails.jobTitle}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Salary</label>
                                        <input
                                            type="number"
                                            name="salary"
                                            value={employeeDetails.salary}
                                            onChange={handleInputChange}
                                            required
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="modal-actions">
                                        <button type="button" onClick={toggleModal}>Cancel</button>
                                        <button type="submit">{isEditMode ? 'Update Employee' : 'Add Employee'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminPanel>
    );
}

export default Employees;
