import React, { useState, useEffect } from 'react';
import '../styles/Employees.css';
import { CognitoUserPool } from 'amazon-cognito-identity-js'; 
import AWS from 'aws-sdk'; 
import awsconfig from '../aws-exports';

function generateEmployeeId() {
    const randomString = Math.random().toString(36).substr(2, 6).toUpperCase();
    const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `EMP-${randomString}-${dateString}`;
}

function Employees() {
    const AWS_REGION = process.env.REGION;
    AWS.config.update({
        region: AWS_REGION,
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
    });
    
    const cognito = new AWS.CognitoIdentityServiceProvider({
        region: AWS_REGION
    });
    
    const createUserInCognito = async (email, role) => {
        const params = {
            UserPoolId: awsconfig.aws_user_pools_id,
            Username: email, 
            TemporaryPassword: 'TEMPORARY_PASSWORD', 
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email,
                },
                {
                    Name: 'email_verified',
                    Value: 'true',
                }
            ],
            DesiredDeliveryMediums: ['EMAIL']
        };
    
        try {
            // Step 1: Create the user in Cognito
            const result = await cognito.adminCreateUser(params).promise();
            console.log('User created in Cognito:', result);

            let groupName = null;

            if (role === "user") {
                groupName = "stanghero-user-group";
            } else if (role === "admin") {
                groupName = "stanghero-admin-group";
            } else {
                groupName = "stanghero-default-group";
            }

            // Step 2: Add the user to the group
            if (groupName) {
                const addUserToGroupParams = {
                    UserPoolId: process.env.COGNITO_USER_POOL_ID,
                    Username: email,
                    GroupName: groupName,
                };
                await cognito.adminAddUserToGroup(addUserToGroupParams).promise();
                console.log(`User added to group: ${groupName}`);
            }
    
            return result;
        } catch (err) {
            console.error('Error creating user in Cognito or adding to group:', err);
            throw err;
        }
    };

    const API_ENDPOINT = process.env.API_ENDPOINT;
    const API_KEY = process.env.API_KEY;

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('Sort');
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editEmployeeIndex, setEditEmployeeIndex] = useState(null);
    const [employeeDetails, setEmployeeDetails] = useState({
        id: '', name: '', jobTitle: '', salary: '', contact: '', email: '', role: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch(`${API_ENDPOINT}/item?resource=employee`, {
                method: 'GET',
                headers: {
                    'x-api-key': API_KEY
                },
            });

            if (!response.ok) throw new Error('Failed to fetch employees');
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            alert('Error fetching employees!');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

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
            case 'Job Title: A to Z':
                sortedEmployees.sort((a, b) => a.jobTitle.localeCompare(b.jobTitle));
                break;
            case 'Job Title: Z to A':
                sortedEmployees.sort((a, b) => a.jobTitle.localeCompare(b.jobTitle));
                break;
            default:
                break;
        }
        setEmployees(sortedEmployees);
    };

    const handleCheckboxChange = (index, name) => {
        const isAlreadySelected = selectedCheckboxes.includes(index);

        if (!isAlreadySelected) {
            console.log(`Selected employee: ${name}`);
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
                const selectedEmployees = selectedCheckboxes.map(index => {
                    const employee = employees[index];
                    return { id: employee.id };
                });

                const response = await fetch(`${API_ENDPOINT}/item?resource=employee`, {
                    method: 'DELETE',
                    headers: {
                        'x-api-key': API_KEY
                    },
                    body: JSON.stringify(selectedEmployees),
                });

                if (!response.ok) throw new Error('Failed to delete employees');

                const result = await response.json();
                console.log('Deletion result:', result);

                setEmployees((prevEmployees) =>
                    prevEmployees.filter((_, index) => !selectedCheckboxes.includes(index))
                );
                setSelectedCheckboxes([]);
            } catch (error) {
                console.error('Error deleting employees:', error);
                alert('Error deleting employees!');
            } finally {
                setCurrentPage(1);
            }
        } else {
            setSelectedCheckboxes([]);
        }
    };

    const handleClearAll = () => setSelectedCheckboxes([]);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        if (!isModalOpen) {
            setIsEditMode(false);
            setEditEmployeeIndex(null);
            setEmployeeDetails({ id: '', name: '', contact: '', jobTitle: '', salary: '', email: '', role: '' });
        }
    };

    const handleEdit = (index) => {
        const employee = employees[index];
        setEmployeeDetails({
            id: employee.id,
            name: employee.name,
            contact: employee.contact,
            jobTitle: employee.jobTitle,
            salary: employee.salary,
            email: employee.email,
            role: employee.role,
        });
        console.log(`To update: ${employee.id}`)
        setIsEditMode(true);
        setEditEmployeeIndex(index);
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmployeeDetails({ ...employeeDetails, [name]: value });
    };

    const handleSearchInputChange = (e) => setSearchQuery(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const newEmployee = {
            id: isEditMode ? employeeDetails.id : generateEmployeeId(),
            name: employeeDetails.name,
            contact: employeeDetails.contact,
            jobTitle: employeeDetails.jobTitle,
            salary: employeeDetails.salary,
            email: employeeDetails.email,
            role: employeeDetails.role,
        };
    
        try {
            setIsLoading(true);
    
            // Step 1: Add the employee to Cognito
            if (!isEditMode) {
                await createUserInCognito(employeeDetails.email, employeeDetails.role);
                console.log('New user added to Cognito with email and temporary password sent');
            }
    
            // Step 2: Add or update the employee in your API
            let response;
            if (isEditMode && editEmployeeIndex !== null) {
                response = await fetch(`${API_ENDPOINT}/item?resource=employee`, {
                    method: 'PUT',
                    headers: {
                        'x-api-key': API_KEY,
                    },
                    body: JSON.stringify(newEmployee),
                });
            } else {
                response = await fetch(`${API_ENDPOINT}/item?resource=employee`, {
                    method: 'POST',
                    headers: {
                        'x-api-key': API_KEY,
                    },
                    body: JSON.stringify(newEmployee),
                });
            }
    
            if (!response.ok) throw new Error(isEditMode ? 'Failed to update employee' : 'Failed to add employee');
    
            if (isEditMode && editEmployeeIndex !== null) {
                setEmployees((prevEmployees) =>
                    prevEmployees.map((employee, index) =>
                        index === editEmployeeIndex ? newEmployee : employee
                    )
                );
            } else {
                setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
            }
    
            toggleModal();
        } catch (error) {
            console.error('Error submitting employee:', error);
            alert('Error submitting employee!');
        } finally {
            setIsLoading(false);
            fetchEmployees();
        }
    };

    const filteredEmployees = employees.filter((employee) => {
        const id = employee.id ? employee.id.toLowerCase() : '';
        const name = employee.name ? employee.name.toLowerCase() : '';
        const jobTitle = employee.jobTitle ? employee.jobTitle.toLowerCase() : '';
        return id.includes(searchQuery.toLowerCase()) || name.includes(searchQuery.toLowerCase()) || jobTitle.includes(searchQuery.toLowerCase());
    });

    const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const totalPages = Math.ceil(filteredEmployees.length / pageSize);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    return (
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
                    <div onClick={() => handleSortSelection('Job Title: A to Z')}>Job Title: A to Z</div>
                    <div onClick={() => handleSortSelection('Job Title: Z to A')}>Job Title: Z to A</div>
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
                    <span className="material-symbols-outlined info-icon" data-tooltip="Only Name, and Job Title are searchable.">info</span>
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
                            <th>NAME</th>
                            <th>CONTACT NO.</th>
                            <th>JOB TITLE</th>
                            <th>SALARY</th>
                            <th>EMAIL</th>
                            <th>ROLE</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>
                                    <div className="loading-icon">
                                        <i className="fas fa-spinner fa-spin fa-3x"></i>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedEmployees.map((employee, index) => {
                                const absoluteIndex = (currentPage - 1) * pageSize + index;
                                return (
                                    <tr key={absoluteIndex}>
                                        <td onClick={() => handleCheckboxChange(absoluteIndex, employee.name)} style={{ cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                onChange={() => handleCheckboxChange(absoluteIndex, employee.name)}
                                                checked={selectedCheckboxes.includes(absoluteIndex)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td>{employee.name}</td>
                                        <td>{employee.contact}</td>
                                        <td>{employee.jobTitle}</td>
                                        <td>{employee.salary}</td>
                                        <td>{employee.email}</td>
                                        <td>{employee.role}</td>
                                        <td>
                                            <span
                                                className="material-symbols-outlined edit-icon"
                                                onClick={() => handleEdit(absoluteIndex)}
                                                title="Edit Employee"
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
                            <h2>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter employee name"
                                        value={employeeDetails.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact No.</label>
                                    <input
                                        type="text"
                                        pattern="[0-9]{11}" 
                                        maxLength="11"
                                        name="contact"
                                        placeholder="Enter employee contact"
                                        value={employeeDetails.contact}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Job Title</label>
                                    <input
                                        type="text"
                                        name="jobTitle"
                                        placeholder="Enter employee job title"
                                        value={employeeDetails.jobTitle}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Salary</label>
                                    <input
                                        type="text"
                                        name="salary"
                                        placeholder="Enter employee salary"
                                        value={employeeDetails.salary}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter employee email"
                                        value={employeeDetails.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        className="employees-select"
                                        name="role"
                                        placeholder="Select a user's role"
                                        value={employeeDetails.role}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="" disabled>Select a user's role</option>
                                        <option value="none">Not Applicable</option>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={toggleModal}>Cancel</button>
                                    <button type="submit" disabled={isLoading}>
                                        {isLoading
                                            ? (isEditMode ? 'Updating Employee...' : 'Adding Employee...')
                                            : (isEditMode ? 'Update Employee' : 'Add Employee')}
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

export default Employees;
