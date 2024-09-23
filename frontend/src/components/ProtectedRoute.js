import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, adminElement, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles.includes(role)) {
        if (role === 'admin' && adminElement) {
        return adminElement;
        }

        return element;
    }

    if (role === 'admin') {
        return <Navigate to="/reports" />;
    }

    if (role === 'user') {
        return <Navigate to="/userHomepage" />;
    }

    return <Navigate to="/login" />;
};

export default ProtectedRoute;