import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/AdminPanel.css';
import logo from '../images/logo8-cropped.png';

const AdminPanel = ({ children, onCircleSelect }) => {
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [hoveredCircle, setHoveredCircle] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set the selectedCircle based on the current path
    switch (location.pathname) {
      case '/reports':
        setSelectedCircle(1);
        break;
      case '/inventory':
        setSelectedCircle(2);
        break;
      case '/customers':
        setSelectedCircle(3);
        break;
      case '/employees':
        setSelectedCircle(4);
        break;
      case '/transactions':
        setSelectedCircle(5);
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
        navigate('/reports');
        break;
      case 2:
        navigate('/inventory');
        break;
      case 3:
        navigate('/customers');
        break;
      case 4:
        navigate('/employees');
        break;
      case 5:
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
    "Reports",
    "Inventory",
    "Customers",
    "Employees",
    "Transactions"
  ];

  const handleMouseEnter = (circleNumber) => {
    setHoveredCircle(circleNumber);
  };

  const handleMouseLeave = () => {
    setHoveredCircle(null);
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <img src={logo} alt="Logo" className="sidebar-logo" /> {/* Add this line */}
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
                {["space_dashboard", "inventory_2", "face", "badge", "task"][index]}
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
      <div className="admin-content-wrapper">
        {children}
      </div>
    </div>
  );
};

export default AdminPanel;
