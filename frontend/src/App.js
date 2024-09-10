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
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* User-only routes */}
          <Route 
            path="/userHomepage" 
            element={<ProtectedRoute element={<UserPanel><UserHomepage /></UserPanel>} allowedRoles={['user']} />} 
          />
          <Route 
            path="/scopeOfWork" 
            element={<ProtectedRoute element={<UserPanel><ScopeOfWork /></UserPanel>} allowedRoles={['user']} />} 
          />
          <Route 
            path="/jobOrder" 
            element={<ProtectedRoute element={<UserPanel><JobOrder /></UserPanel>} allowedRoles={['user']} />} 
          />
          <Route 
            path="/invoice" 
            element={<ProtectedRoute element={<UserPanel><Invoice /></UserPanel>} allowedRoles={['user']} />} 
          />
          <Route 
            path="/partsQuotation" 
            element={<ProtectedRoute element={<UserPanel><PartsQuotation /></UserPanel>} allowedRoles={['user']} />} 
          />

          {/* Admin-only routes */}
          <Route 
            path="/reports" 
            element={<ProtectedRoute adminElement={<AdminPanel><Reports /></AdminPanel>} allowedRoles={['admin']} />} 
          />
          <Route 
            path="/customers" 
            element={<ProtectedRoute adminElement={<AdminPanel><Customers /></AdminPanel>} allowedRoles={['admin']} />} 
          />
          <Route 
            path="/employees" 
            element={<ProtectedRoute adminElement={<AdminPanel><Employees /></AdminPanel>} allowedRoles={['admin']} />} 
          />

          {/* Shared routes for both users and admins */}
          <Route 
            path="/inventory" 
            element={<ProtectedRoute element={<UserPanel><Inventory /></UserPanel>} adminElement={<AdminPanel><Inventory /></AdminPanel>} allowedRoles={['user', 'admin']} />} 
          />
          <Route 
            path="/transactions" 
            element={<ProtectedRoute element={<UserPanel><Transactions /></UserPanel>} adminElement={<AdminPanel><Transactions /></AdminPanel>} allowedRoles={['user', 'admin']} />} 
          />
          <Route 
            path="/settings" 
            element={<ProtectedRoute element={<UserPanel><Settings /></UserPanel>} adminElement={<AdminPanel><Settings /></AdminPanel>} allowedRoles={['user', 'admin']} />} 
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

