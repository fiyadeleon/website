import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserPanel from './UserPanel';
import '../styles/UserHomepage.css';

import inventoryImage from '../images/inventory.png';
import sowImage from '../images/scope-of-work.png';
import joImage from '../images/job-order.png';
import invoiceImage from '../images/invoice.png';
import partsQuotationImage from '../images/parts-quotation.png';
import transactionsImage from '../images/transaction.png';

const UserHomepage = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleNavigation = (path) => {
    navigate(path); // Navigate to the specified path
  };

  return (
    <UserPanel>
      <div className="user-homepage">
        <h1>Hi, User!</h1>
        <p>How would you like to begin your day?</p>
        <div className="menu-options">
          <div
            className="menu-item"
            onClick={() => handleNavigation('/inventory')}
          >
            <img src={inventoryImage} alt="Inventory" />
            <p>Inventory</p>
          </div>
          <div
            className="menu-item"
            onClick={() => handleNavigation('/scopeOfWork')}
          >
            <img src={sowImage} alt="Scope of Work" />
            <p>Scope of Work</p>
          </div>
          <div
            className="menu-item"
            onClick={() => handleNavigation('/jobOrder')}
          >
            <img src={joImage} alt="Job Order" />
            <p>Job Order</p>
          </div>
          <div
            className="menu-item"
            onClick={() => handleNavigation('/invoice')}
          >
            <img src={invoiceImage} alt="Invoice" />
            <p>Invoice</p>
          </div>
          <div
            className="menu-item"
            onClick={() => handleNavigation('/partsQuotation')}
          >
            <img src={partsQuotationImage} alt="Parts Quotation" />
            <p>Parts Quotation</p>
          </div>
          <div
            className="menu-item"
            onClick={() => handleNavigation('/transactions')}
          >
            <img src={transactionsImage} alt="Transactions" />
            <p>Transactions</p>
          </div>
        </div>
      </div>
    </UserPanel>
  );
};

export default UserHomepage;
