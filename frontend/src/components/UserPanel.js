import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // Import axios for making the request
import '../styles/UserPanel.css';
import logo from '../images/logo8-cropped.png';

const UserPanel = ({ children, onCircleSelect }) => {
    const [selectedCircle, setSelectedCircle] = useState(null);
    const [hoveredCircle, setHoveredCircle] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // To handle loading state
    const navigate = useNavigate();
    const location = useLocation();

    // UseEffect to fetch protected data when the component mounts
    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
        navigate('/login'); // Redirect if no token is found
        return;
        }
    
        setLoading(false); // Token is present, stop loading
    }, [navigate]);

    // Set selected circle based on the current path
    useEffect(() => {
        switch (location.pathname) {
        case '/inventory':
            setSelectedCircle(1);
            break;
        case '/scopeOfWork':
            setSelectedCircle(2);
            break;
        case '/jobOrder':
            setSelectedCircle(3);
            break;
        case '/invoice':
            setSelectedCircle(4);
            break;
        case '/partsQuotation':
            setSelectedCircle(5);
            break;
        case '/transactions':
            setSelectedCircle(6);
            break;
        default:
            setSelectedCircle(null);
            break;
        }
    }, [location.pathname]);

    const handleCircleClick = (circleNumber) => {
        setSelectedCircle(circleNumber);
        if (onCircleSelect) {
        onCircleSelect(circleNumber);
        }

        switch (circleNumber) {
        case 1:
            navigate('/inventory');
            break;
        case 2:
            navigate('/scopeOfWork');
            break;
        case 3:
            navigate('/jobOrder');
            break;
        case 4:
            navigate('/invoice');
            break;
        case 5:
            navigate('/partsQuotation');
            break;
        case 6:
            navigate('/transactions');
            break;
        default:
            break;
        }
    };

    const handleSettingsClick = () => {
        navigate('/settings');
    };

    const handleLogoutClick = () => {
        localStorage.removeItem('id');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const tooltipsFeature = [
        "Inventory",
        "Scope of Work",
        "Job Order",
        "Invoice",
        "Parts Quotation",
        "Transactions"
    ];

    const handleMouseEnter = (circleNumber) => {
        setHoveredCircle(circleNumber);
    };

    const handleMouseLeave = () => {
        setHoveredCircle(null);
    };

    if (loading) {
        return <div>Loading...</div>; // Show a loading spinner or text while verifying authentication
    }

    return (
        <div className="layout">
        <div className="sidebar">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <div className="circles-container">
            {tooltipsFeature.map((tooltip, index) => (
                <div
                key={index}
                className={`circle ${selectedCircle === index + 1 ? 'active' : ''} ${hoveredCircle === index + 1 ? 'hovered' : ''}`}
                onClick={() => handleCircleClick(index + 1)}
                onMouseEnter={() => handleMouseEnter(index + 1)}
                onMouseLeave={handleMouseLeave}
                >
                <span className="material-symbols-outlined">
                    {["inventory_2", "list_alt", "order_approve", "receipt_long", "request_quote", "task"][index]}
                </span>
                <span className="tooltip">{tooltip}</span>
                </div>
            ))}
            </div>
            <div className="button-container">
            <button onClick={handleSettingsClick} className="settings-btn">
                <span className="material-symbols-outlined">settings</span>
            </button>
            <button onClick={handleLogoutClick} className="logout-btn">
                <span className="material-symbols-outlined">logout</span>
            </button>
            </div>
        </div>
        <div className="content-wrapper">
            {children} 
        </div>
        </div>
    );
};

export default UserPanel;
