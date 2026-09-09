import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import api from './services/api.js';

if (window.Telegram?.WebApp) {
  try {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  } catch {
    // Telegram WebApp may be unavailable in a normal browser.
  }
}

api.authenticateTelegram().catch(() => {
  // Mini App UI remains usable even if the API is temporarily unreachable.
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
