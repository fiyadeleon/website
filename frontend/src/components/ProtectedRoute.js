import React from 'react';
import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return token ? true : false;
};

const getUserRole = () => {
  return localStorage.getItem('role');
};

const ProtectedRoute = ({ element, adminElement }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const role = getUserRole();

  if (role === 'admin') {
    return adminElement;
  }

  return element;
};

export default ProtectedRoute;
