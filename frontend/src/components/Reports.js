import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../styles/Reports.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Reports = () => {
    const pieData = {
        labels: ['Customer', 'Employee'],
        datasets: [
            {
                label: 'People',
                data: [900, 600],
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
                        family: 'Poppins',  // Custom font family
                        size: 16,           // Custom font size
                        weight: 'bold',     // Font weight
                    },
                    color: '#333',          // Font color
                }
            },
            tooltip: {
                titleFont: {
                    family: 'Poppins',      // Font family for tooltip titles
                    size: 14,               // Font size for tooltip titles
                    weight: 'bold'
                },
                bodyFont: {
                    family: 'Poppins',      // Font family for tooltip body
                    size: 12,               // Font size for tooltip body
                }
            }
        }
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
                                <button className="reports-time-button active">Monthly</button>
                                <button className="reports-time-button inactive">Weekly</button>
                                <button className="reports-time-button inactive">Today</button>
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
                        <button className="reports-view-button">View
                            <span className="material-symbols-outlined">
                                arrow_outward
                            </span>
                        </button>
                    </div>
                    <table className="reports-transaction-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Type</th>
                                <th>Date & Time</th>
                                <th>Customer</th>
                                <th>Plate No.</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Job Order</td>
                                <td>Jul 16, 2024 23:00:00</td>
                                <td>John Doe</td>
                                <td>PLV 12345</td>
                                <td>$105</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Job Order</td>
                                <td>Jul 16, 2024 13:00:00</td>
                                <td>John Doe</td>
                                <td>PAQ 3543</td>
                                <td>$26,000</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Scope of Work</td>
                                <td>Jul 01, 2024 04:00:00</td>
                                <td>John Doe</td>
                                <td>JKL 8907</td>
                                <td>$345</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Scope of Work</td>
                                <td>Jul 01, 2024 04:00:00</td>
                                <td>John Doe</td>
                                <td>JKL 8907</td>
                                <td>$345</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>Scope of Work</td>
                                <td>Jul 01, 2024 04:00:00</td>
                                <td>John Doe</td>
                                <td>JKL 8907</td>
                                <td>$345</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Low Stock Section */}
                <div className="reports-low-stock-section">
                    <div className="reports-low-stock-header">
                        <h3>Low on Stock</h3>
                        <button className="reports-view-button">View
                            <span className="material-symbols-outlined">
                                arrow_outward
                            </span>
                        </button>
                    </div>
                    <div className="reports-low-stock-list">
                        <p>Item 1</p>
                        <p>Item 2</p>
                        <p>Item 3</p>
                        <p>Item 4</p>
                        <p>Item 4</p>
                        <p>Item 4</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
