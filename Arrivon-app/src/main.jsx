
/*
 * Arrivon - Application Entry Point
 *
 * Purpose:
 * - Imports React and ReactDOM.
 * - Loads the main App component.
 * - Loads global CSS styles.
 * - Renders the application into the HTML page.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Main application component.
import App from './App.jsx';

// Global styles shared throughout the application.
import './index.css';

// Find the root HTML element and render Arrivon.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
