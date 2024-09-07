import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Reports from './components/Reports';
import UserHomepage from './components/UserHomepage';
import Inventory from './components/Inventory';
import ScopeOfWork from './components/ScopeOfWork';
import JobOrder from './components/JobOrder';
import Invoice from './components/Invoice';
import PartsQuotation from './components/PartsQuotation';
import Transactions from './components/Transactions'; 
import Customers from './components/Customers'; 
import Employees from './components/Employees'; 
import Settings from './components/Settings'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import AdminPanel from './components/AdminPanel';  
import UserPanel from './components/UserPanel';    

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/userHomepage" 
            element={<ProtectedRoute element={<UserPanel><UserHomepage /></UserPanel>} adminElement={<AdminPanel />} />} 
          />
          <Route 
            path="/reports" 
            element={<ProtectedRoute element={<UserPanel><Reports /></UserPanel>} adminElement={<AdminPanel />} />} 
          />
          <Route 
            path="/inventory" 
            element={<ProtectedRoute element={<UserPanel><Inventory /></UserPanel>} adminElement={<AdminPanel />} />} 
          />
          <Route 
            path="/scopeOfWork" 
            element={<ProtectedRoute element={<UserPanel><ScopeOfWork /></UserPanel>} adminElement={<AdminPanel />} />} 
          />
          <Route 
            path="/jobOrder" 
            element={<ProtectedRoute element={<UserPanel><JobOrder /></UserPanel>} adminElement={<AdminPanel />} />} 
          />
          <Route 
            path="/invoice" 
            element={<ProtectedRoute element={<UserPanel><Invoice /></UserPanel>} adminElement={<AdminPanel />} />} 
          />
          <Route 
            path="/partsQuotation" 
            element={<ProtectedRoute element={<UserPanel><PartsQuotation /></UserPanel>} adminElement={<AdminPanel />} />} 
          />
          <Route 
            path="/transactions" 
            element={<ProtectedRoute element={<UserPanel><Transactions /></UserPanel>} adminElement={<AdminPanel />} />} 
          />
          <Route 
            path="/customers" 
            element={<ProtectedRoute element={<UserPanel><Customers /></UserPanel>} adminElement={<AdminPanel />} />} 
          />
          <Route 
            path="/employees" 
            element={<ProtectedRoute element={<UserPanel><Employees /></UserPanel>} adminElement={<AdminPanel />} />} 
          />
          <Route 
            path="/settings" 
            element={<ProtectedRoute element={<UserPanel><Settings /></UserPanel>} adminElement={<AdminPanel />} />} 
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
