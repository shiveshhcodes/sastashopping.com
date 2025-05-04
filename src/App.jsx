import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import HowWeWork from './pages/HowWeWork';
import ProductsPage from './pages/Products/ProductsPage';
import ServicesPage from './pages/Services/ServicesPage';
import ElectronicsGadgets from './pages/Categories/ElectronicsGadgets';
import LaptopsComputers from './pages/Categories/LaptopsComputers';
import FashionApparel from './pages/Categories/FashionApparel';
import WatchesAccessories from './pages/Categories/WatchesAccessories';
import AudioHeadphones from './pages/Categories/AudioHeadphones';
import HomeFurniture from './pages/Categories/HomeFurniture';
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

        {/* Route for the Services Page */}
        <Route path="/services" element={<ServicesPage />} />

        {/* Route for the Products Page */}
        <Route path="/products" element={<ProductsPage />} />
        
        {/* Routes for product categories */}
        <Route path="/products/electronics" element={<ElectronicsGadgets />} />
        <Route path="/products/laptops" element={<LaptopsComputers />} />
        <Route path="/products/fashion" element={<FashionApparel />} />
        <Route path="/products/watches" element={<WatchesAccessories />} />
        <Route path="/products/audio" element={<AudioHeadphones />} />
        <Route path="/products/home" element={<HomeFurniture />} />

        {/* Add other routes here as needed */}
      </Routes>

      {/* Footer will be added later */}
    </Router>
  );
}

export default App;