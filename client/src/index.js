// Modified as part of build error fix task on 2025-05-08, 4:22:42 AM
// Importing the process patch file to ensure process object is available.
import './process-patch';

// Modified as part of build error fix task on 2025-05-08, 4:18:09 AM
// Temporary patch to ensure window.process and window.Buffer are available globally.
if (typeof window !== 'undefined') {
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.Buffer = window.Buffer || require('buffer').Buffer; // Add Buffer patch
}

import './core/config/environment'; // Load environment variables
import React from 'react';
import ReactDOM from 'react-dom/client';

import './shared/styles/index.css'; // Assuming you have a global CSS file here
import App from './App';
import reportWebVitals from './reportWebVitals'; // Optional: for performance monitoring
import { initializeComponentVerification } from './utils/development/verifyComponent'; // Add import


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Initialize component verification system in development mode
if (process.env.NODE_ENV === 'development') {
  initializeComponentVerification();
}
