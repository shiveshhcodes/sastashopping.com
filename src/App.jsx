import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import HowWeWork from './pages/HowWeWork';
import ProductsPage from './pages/Products/ProductsPage';
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

        {/* Route for the Products Page */}
        <Route path="/products" element={<ProductsPage />} />
        
        {/* Routes for product categories */}
        <Route path="/products/electronics" element={<ProductsPage />} />
        <Route path="/products/laptops" element={<ProductsPage />} />
        <Route path="/products/fashion" element={<ProductsPage />} />
        <Route path="/products/watches" element={<ProductsPage />} />
        <Route path="/products/audio" element={<ProductsPage />} />
        <Route path="/products/home" element={<ProductsPage />} />

        {/* Add other routes here as needed */}
      </Routes>

      {/* Footer will be added later */}
    </Router>
  );
}

export default App;