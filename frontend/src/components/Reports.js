import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import '../styles/Reports.css';
import StockedUpIcon from '../images/box.png';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const API_KEY = process.env.REACT_APP_API_KEY;

const Reports = () => {
    const [activeButton, setActiveButton] = useState('Today'); 
    const [transactions, setTransactions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [salesData, setSalesData] = useState({ hourly: [], daily: [], monthly: [] });
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [isLoading, setIsLoading] = useState(true); 
    const [products, setProducts] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [lineChartOptions, setLineChartOptions] = useState({});
    const [totalSales, setTotalSales] = useState(0);
    const navigate = useNavigate();

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`${API_ENDPOINT}/item?resource=transaction`, {
                method: 'GET',
                headers: { 'x-api-key': API_KEY },
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const sortedTransactions = data.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
            setTransactions(sortedTransactions.slice(0, 5));
            aggregateSalesData(sortedTransactions);
        } catch (error) {
            alert('Error fetching transactions!');
            console.error('Error fetching transactions:', error);
        }
    };

    const aggregateSalesData = (transactions) => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); 
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
        const hourlySales = {};
        const dailySales = {};
        const monthlySales = {};
    
        transactions.forEach((transaction) => {
            const date = new Date(transaction.dateTime);
            const hour = date.getHours();
            const day = date.toISOString().split('T')[0];
            const month = date.getMonth() + 1;
    
            if (date >= sixMonthsAgo) {
                if (date.toDateString() === today.toDateString()) {
                    if (!hourlySales[hour]) hourlySales[hour] = 0;
                    hourlySales[hour] += transaction.amount;
                }
                if (date >= startOfMonth) {
                    if (!dailySales[day]) dailySales[day] = 0;
                    dailySales[day] += transaction.amount;
                }
                if (!monthlySales[month]) monthlySales[month] = 0;
                monthlySales[month] += transaction.amount;
            }
        });
    
        setSalesData({ hourly: hourlySales, daily: dailySales, monthly: monthlySales });
    };

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

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_ENDPOINT}/item?resource=inventory`, {
                method: 'GET',
                headers: { 'x-api-key': API_KEY },
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const lowStockItems = data.filter(product => {
                const unit = product.unit.toLowerCase(); 
                const stockCount = product.stock;
                if (unit === 'piece' && stockCount <= 5) return true; 
                if (unit === 'box' && stockCount <= 2) return true; 
                if (stockCount === 0) return true; 
                return false;
            });
            setProducts(data);
            setLowStockProducts(lowStockItems);
        } catch (error) {
            alert('Error fetching products!');
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateChartData = (timeRange) => {
        let labels = [];
        let data = [];
        let xAxisTitle = '';
    
        if (timeRange === 'Today') {
            labels = Object.keys(salesData.hourly).map(hour => `${hour}:00`);
            data = Object.values(salesData.hourly);
            xAxisTitle = 'Sales throughout the day';
        } else if (timeRange === 'Weekly') {
            const sortedDays = Object.keys(salesData.daily).sort((a, b) => new Date(a) - new Date(b));
            labels = sortedDays;
            data = sortedDays.map(day => salesData.daily[day]);
            xAxisTitle = 'Sales over the week (Sunday to Saturday)';
        } else if (timeRange === 'Monthly') {
            labels = Object.keys(salesData.monthly).map(month => {
                const monthIndex = parseInt(month, 10) - 1;
                return new Date(0, monthIndex).toLocaleString('default', { month: 'long' });
            });
            data = Object.values(salesData.monthly);
            xAxisTitle = 'Sales from the past 6 months to the most recent';
        }

        const totalAmount = data.reduce((sum, value) => sum + value, 0);
        setTotalSales(totalAmount);
    
        const dynamicLineChartOptions = {
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    bodyFont: {
                        family: 'Poppins',
                        size: 12, 
                    },
                    titleFont: {
                        family: 'Poppins',
                        size: 14, 
                    }
                },
                legend: {
                    labels: {
                        font: {
                            family: 'Poppins',
                            size: 14, 
                        },
                        color: '#000'
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time Period',
                        font: {
                            family: 'Poppins', // Set your desired font family for the x-axis title
                            size: 14, // Set the font size for the x-axis title
                            weight: 'normal'
                        },
                        color: '#333' // Set x-axis title color (optional)
                    },
                    ticks: {
                        font: {
                            family: 'Poppins', // Set your desired font family for x-axis labels
                            size: 12 // Set the font size for x-axis labels
                        },
                        color: '#666' // Set x-axis label color (optional)
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount',
                        font: {
                            family: 'Poppins',
                            size: 14,
                            weight: 'normal'
                        },
                        color: '#333'
                    },
                    ticks: {
                        font: {
                            family: 'Poppins',
                            size: 12 
                        },
                        color: '#666'
                    }
                }
            }
        };
    
        setChartData({
            labels,
            datasets: [{ label: 'Total Sales', data, backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }]
        });
    
        setLineChartOptions(dynamicLineChartOptions);
    };

    const handleButtonClick = (button) => {
        setActiveButton(button);
        updateChartData(button);
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await Promise.all([fetchTransactions(), fetchCustomers(), fetchEmployees(), fetchProducts()]);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        updateChartData(activeButton);
    }, [activeButton, salesData]);

    const pieData = {
        labels: ['Customer', 'Employee'],
        datasets: [{ label: 'Count', data: [customers.length, employees.length], backgroundColor: ['#FFCE56', '#FF6384'], hoverBackgroundColor: ['#FFCE56', '#FF6384'] }]
    };

    const pieOptions = {
        plugins: {
            legend: { labels: { font: { family: 'Poppins', size: 16, weight: 'bold' }, color: '#333' } },
            tooltip: { titleFont: { family: 'Poppins', size: 14, weight: 'bold' }, bodyFont: { family: 'Poppins', size: 12 } }
        }
    };

    return (
        <div className="reports-admin-homepage">
            <h1>Hi, Admin!</h1>

            <div className="reports-summary-and-chart">
                <div className="reports-summary-section">
                    <div className="reports-summary-header">
                        <div className="reports-summary-title">
                            <h2>Total Sales: ₱{totalSales.toLocaleString()}</h2>
                            <span className="material-symbols-outlined info-icon" data-tooltip="Total Sales reflecting the accumulated transaction amounts displayed in the graph.">info</span>
                            <div className="reports-summary-time-buttons">
                                <button className={`reports-time-button ${activeButton === 'Today' ? 'active' : 'inactive'}`} onClick={() => handleButtonClick('Today')}>Today</button>
                                <button className={`reports-time-button ${activeButton === 'Weekly' ? 'active' : 'inactive'}`} onClick={() => handleButtonClick('Weekly')}>Weekly</button>
                                <button className={`reports-time-button ${activeButton === 'Monthly' ? 'active' : 'inactive'}`} onClick={() => handleButtonClick('Monthly')}>Monthly</button>
                            </div>
                        </div>
                    </div>
                    <div className="reports-graph-section">
                        {chartData && chartData.labels.length > 0 ? <Line data={chartData} options={lineChartOptions} /> : <div className="reports-graph-placeholder">No data available</div>}
                    </div>
                </div>

                <div className="reports-pie-chart">
                    <Pie data={pieData} options={pieOptions} />
                </div>
            </div>

            <div className="reports-transaction-and-low-stock">
                <div className="reports-transaction-section">
                    <div className="reports-transaction-header">
                        <h2>Transaction History</h2>
                        <button className="reports-view-button" onClick={() => navigate('/transactions')}>View<span className="material-symbols-outlined">arrow_outward</span></button>
                    </div>
                    {isLoading ? <p>Loading transactions...</p> : (
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
                                {transactions.length > 0 ? transactions.map((transaction, index) => (
                                    <tr key={index}>
                                        <td>{transaction.dateTime}</td>
                                        <td>{transaction.customerName}</td>
                                        <td>{transaction.plateNo}</td>
                                        <td>{transaction.type}</td>
                                        <td>₱{transaction.amount}</td>
                                    </tr>
                                )) : <tr><td colSpan="6">No transactions available</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="reports-low-stock-section">
                    <div className="reports-low-stock-header">
                        <h2>Inventory (Low or Out of Stock)</h2>
                        <button className="reports-view-button" onClick={() => navigate('/inventory')}>View<span className="material-symbols-outlined">arrow_outward</span></button>
                    </div>
                    <div className="reports-low-stock-list">
                        {isLoading ? <p>Loading low stock products...</p> : (
                            lowStockProducts.length > 0 ? lowStockProducts.map((product, index) => (
                                <div key={index} className="low-stock-item">
                                    <p className="product-info">{product.product_name}</p>
                                    <p className="product-stock">{product.stock} {product.unit}{product.stock < 1 ? '' : (product.unit === 'box' ? 'es' : 's')}</p>
                                </div>
                            )) : (
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
