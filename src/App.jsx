import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import HowWeWork from './pages/HowWeWork';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

// The App component serves as the main layout container.
function App() {
  return (
    <Router>
      <ScrollToTop />
      {/* Navbar will appear on all pages */}
      <Navbar />

      {/* Define your routes */}
      <Routes>
        {/* Route for the Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Route for the How We Work Page */}
        <Route path="/how-we-work" element={<HowWeWork />} />

        {/* Add other routes here as needed */}
      </Routes>

      {/* Footer will be added later */}
    </Router>
  );
}

export default App;