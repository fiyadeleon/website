// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Reports from './components/Reports';
import UserHomepage from './components/UserHomepage';
import Inventory from './components/Inventory';
import ScopeOfWork from './components/ScopeOfWork';
import JorOrder from './components/JobOrder';
import Invoice from './components/Invoice';
import PartsQuotation from './components/PartsQuotation';
import Transactions from './components/Transactions'; 
import Customers from './components/Customers'; 
import Employees from './components/Employees'; 
import Settings from './components/Settings'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/userHomepage" element={<ProtectedRoute element={<UserHomepage />} />} /> */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/userHomepage" element={<UserHomepage />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/scopeOfWork" element={<ScopeOfWork />} />
          <Route path="/jobOrder" element={<JorOrder />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/partsQuotation" element={<PartsQuotation />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
