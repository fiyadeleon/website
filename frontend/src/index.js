// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';

import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';

import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure({
  ...awsconfig,
  oauth: {
    domain: 'your-cognito-domain.auth.region.amazoncognito.com',
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: 'http://localhost:3000/login',
    redirectSignOut: 'http://localhost:3000/',
    responseType: 'code',
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);