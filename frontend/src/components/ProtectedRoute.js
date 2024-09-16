import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode'; // You can use this library to decode JWT tokens

const ProtectedRoute = ({ element, adminElement, allowedRoles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Decode the token to extract payload (e.g., role)
        const decodedToken = jwtDecode(token);
        
        // Check if the token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Check for role from the decoded token or local storage
        const roleFromToken = decodedToken['custom:role'] || localStorage.getItem('role');
        setRole(roleFromToken);

        // Validate if the role is allowed
        if (allowedRoles.includes(roleFromToken)) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Token validation error', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (loading) {
    return <div>Loading...</div>; // Show a loader while checking auth status
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Render admin element if role is 'admin'
  if (role === 'admin' && adminElement) {
    return adminElement;
  }

  // Render user element if role is 'user'
  return element;
};

export default ProtectedRoute;
