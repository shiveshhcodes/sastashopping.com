import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Import global styles (including CSS variables)
import './styles/global.css' // Import our enhanced global styles

// Use React 18's createRoot API for rendering
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode helps catch potential problems in an application
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)