import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../styles/Reports.css';
import StockedUpIcon from '../images/box.png';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "https://q2tf3g5e4l.execute-api.ap-southeast-1.amazonaws.com/v1";
const API_KEY = process.env.REACT_APP_API_KEY || "XZSNV5hFIaaCJRBznp9mW2VPndBpD97V98E1irxs";

const Reports = () => {
    const [activeButton, setActiveButton] = useState('Monthly'); 
    const [transactions, setTransactions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 
    const [products, setProducts] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const navigate = useNavigate();

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
            const sortedTransactions = data.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
            setTransactions(sortedTransactions.slice(0, 5));
        } catch (error) {
            alert('Error fetching transactions!');
            console.error('Error fetching transactions:', error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await fetch(`${API_ENDPOINT}/item?resource=customer`, {
                method: 'GET',
                headers: {
                    'x-api-key': API_KEY
                },
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
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_ENDPOINT}/item?resource=inventory`, {
                method: 'GET',
                headers: {
                    'x-api-key': API_KEY
                },
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
    
            const lowStockItems = data.filter(product => {
                const unit = product.unit.toLowerCase(); 
                const stockCount = product.stock;
    
                if (unit === 'piece' && stockCount <= 5) {
                    return true; 
                } else if (unit === 'box' && stockCount <= 2) {
                    return true; 
                } else if (stockCount === 0) {
                    return true; 
                }
                return false;
            });
    
            console.log(data)
            setProducts(data);
            setLowStockProducts(lowStockItems);
        } catch (error) {
            alert('Error fetching products!');
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };    

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await Promise.all([fetchTransactions(), fetchCustomers(), fetchEmployees(), fetchProducts()]);
            setIsLoading(false);
        };
        
        fetchData();
    }, []);

    const pieData = {
        labels: ['Customer', 'Employee'],
        datasets: [
            {
                label: 'Count',
                data: [customers.length, employees.length],
                backgroundColor: ['#FFCE56', '#FF6384'],
                hoverBackgroundColor: ['#FFCE56', '#FF6384']
            }
        ]
    };

    const pieOptions = {
        plugins: {
            legend: {
                labels: {
                    font: {
                        family: 'Poppins',
                        size: 16,
                        weight: 'bold',
                    },
                    color: '#333',
                }
            },
            tooltip: {
                titleFont: {
                    family: 'Poppins',
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    family: 'Poppins',
                    size: 12,
                }
            }
        }
    };

    const handleButtonClick = (button) => {
        setActiveButton(button);
    };

    return (
        <div className="reports-admin-homepage">
            <h1>Hi, Admin!</h1>

            <div className="reports-summary-and-chart">
                {/* Summary Section */}
                <div className="reports-summary-section">
                    <div className="reports-summary-header">
                        <div className="reports-summary-title">
                            <h2>Total Sales: $100</h2>
                            <span className="material-symbols-outlined info-icon" data-tooltip="Total Sales based on the accumulated number in Invoices.">info</span>
                            <div className="reports-summary-time-buttons">
                                {/* Render buttons dynamically */}
                                <button
                                    className={`reports-time-button ${activeButton === 'Today' ? 'active' : 'inactive'}`}
                                    onClick={() => handleButtonClick('Today')}
                                >
                                    Today
                                </button>
                                <button
                                    className={`reports-time-button ${activeButton === 'Weekly' ? 'active' : 'inactive'}`}
                                    onClick={() => handleButtonClick('Weekly')}
                                >
                                    Weekly
                                </button>
                                <button
                                    className={`reports-time-button ${activeButton === 'Monthly' ? 'active' : 'inactive'}`}
                                    onClick={() => handleButtonClick('Monthly')}
                                >
                                    Monthly
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="reports-graph-section">
                        <div className="reports-graph-placeholder">Graph Placeholder</div>
                    </div>
                </div>

                {/* Pie Chart Section */}
                <div className="reports-pie-chart">
                    <Pie data={pieData} options={pieOptions} />
                </div>
            </div>

            {/* Transaction and Low Stock Side by Side */}
            <div className="reports-transaction-and-low-stock">
                {/* Transaction Section */}
                <div className="reports-transaction-section">
                    <div className="reports-transaction-header">
                        <h2>Transaction</h2>
                        <button 
                            className="reports-view-button" 
                            onClick={() => navigate('/transactions')}
                        >
                            View
                            <span className="material-symbols-outlined">
                                arrow_outward
                            </span>
                        </button>
                    </div>
                    {isLoading ? (
                        <p>Loading transactions...</p>
                    ) : (
                        <table className="reports-transaction-table">
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Customer Name</th>
                                    <th>Plate No.</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length > 0 ? (
                                    transactions.map((transaction, index) => (
                                        <tr key={index}>
                                            <td>{transaction.dateTime}</td>
                                            <td>{transaction.customerName}</td>
                                            <td>{transaction.plateNo}</td>
                                            <td>{transaction.type}</td>
                                            <td>₱{transaction.amount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">No transactions available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Low Stock Section */}
                <div className="reports-low-stock-section">
                    <div className="reports-low-stock-header">
                        <h2>Inventory</h2>
                        <button 
                            className="reports-view-button" 
                            onClick={() => navigate('/inventory')}
                        >
                            View
                            <span className="material-symbols-outlined">arrow_outward</span>
                        </button>
                    </div>
                    <div className="reports-low-stock-list">
                        {isLoading ? (
                            <p>Loading low stock products...</p>
                        ) : (
                            lowStockProducts.length > 0 ? (
                                lowStockProducts.map((product, index) => (
                                    <div key={index} className="low-stock-item">
                                        <p className="product-info">
                                            {product.product_name}
                                        </p>
                                        <p className="product-stock">{product.stock} {product.unit}{product.unit === 'box' ? 'es' : 's'}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="stocked-up">
                                    <img src={StockedUpIcon} alt="All stocked up" className="stocked-up-icon" />
                                    <a className="stocked-up-text">All products are sufficiently stocked.</a>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
