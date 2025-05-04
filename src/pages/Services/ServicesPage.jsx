import React, { useState } from 'react';
// Assuming Lucide React for icons based on your dependencies
// Using icons that visually match the screenshot and adding a potential icon for the final CTA
import { Code, TrendingUp, Bell, Check, Plus, ArrowRight } from 'lucide-react';
import './ServicesPage.css'; // Import the CSS file for styling

// Assuming your Navbar component is in the correct path relative to src/pages/
// You will typically include Navbar in your main App.jsx or a layout component
// import Navbar from '../../components/Navbar';

function ServicesPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="services-page">
      <section className="services-main-content">
        {/* Hero Section */}
        <div className="hero-section text-center">
          <h1 className="hero-title">Find the Best Deals,<br />Save More Today!</h1>
          <p className="hero-subtitle">
            Your smart companion for comparing prices, tracking trends, and catching best offers.
          </p>
          <div className="hero-buttons">
            <button className="btn-learn-more">Learn More</button>
            <button className="btn-sign-up">Sign Up</button>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-grid">
          {/* Feature Box 1: Instant Savings */}
          <div className="feature-box">
            <div className="feature-content">
              <div className="feature-icon">
                <Code size={40} />
              </div>
              <div className="feature-text">
                <h5>Instant Savings</h5>
                <p>
                  Paste product links to compare prices from Amazon, Flipkart, Walmart, etc., and find the cheapest option
                </p>
              </div>
            </div>
          </div>

          {/* Feature Box 2: Track Price Drops */}
          <div className="feature-box">
            <div className="feature-content">
              <div className="feature-icon">
                <TrendingUp size={40} />
              </div>
              <div className="feature-text">
                <h5>Track Price Drops</h5>
                <p>
                  View historical price trends over time for smarter decision-making
                </p>
              </div>
            </div>
          </div>

          {/* Feature Box 3: Get Price Drop Alerts */}
          <div className="feature-box">
            <div className="feature-content">
              <div className="feature-icon">
                <Bell size={40} />
              </div>
              <div className="feature-text">
                <h5>Get Price Drop Alerts</h5>
                <p>
                  Get notified when the price of your tracked product drops or promotions become available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features List Section */}
        <div className="features-list-section">
          <h3>Features List Section</h3>
          <div className="features-list-grid">
            <div className="features-column">
              <ul>
                <li><Check size={20} /> Price Comparison</li>
                <li><Check size={20} /> Price History Tracking</li>
                <li><Check size={20} /> Deal Alerts</li>
              </ul>
            </div>
            <div className="features-column">
              <ul>
                <li><Check size={20} /> Currency Conversion</li>
                <li><Check size={20} /> Filter & Sort by Retailer</li>
                <li><Check size={20} /> Personalized Insights</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h3>Frequently Asked Questions</h3>
          <div className="faq-items">
            <div className="faq-item">
              <div 
                className={`faq-question ${activeFaq === 0 ? 'active' : ''}`}
                onClick={() => toggleFaq(0)}
              >
                <h5>How does SastaShopping work?</h5>
                <Plus size={24} />
              </div>
              <div className={`faq-answer ${activeFaq === 0 ? 'active' : ''}`}>
                <p>SastaShopping is a price comparison tool that helps you find the best deals across multiple online retailers. Simply paste a product link from any supported retailer, and we'll show you the current prices from various platforms, along with historical price trends and alerts for price drops.</p>
              </div>
            </div>
            <div className="faq-item">
              <div 
                className={`faq-question ${activeFaq === 1 ? 'active' : ''}`}
                onClick={() => toggleFaq(1)}
              >
                <h5>Is it free to use?</h5>
                <Plus size={24} />
              </div>
              <div className={`faq-answer ${activeFaq === 1 ? 'active' : ''}`}>
                <p>Yes, SastaShopping is completely free to use! You can compare prices, track products, and receive price drop alerts without any cost. We believe in helping everyone save money on their online shopping.</p>
              </div>
            </div>
            <div className="faq-item">
              <div 
                className={`faq-question ${activeFaq === 2 ? 'active' : ''}`}
                onClick={() => toggleFaq(2)}
              >
                <h5>Can I compare products from international websites?</h5>
                <Plus size={24} />
              </div>
              <div className={`faq-answer ${activeFaq === 2 ? 'active' : ''}`}>
                <p>Yes! SastaShopping supports price comparison across multiple international retailers including Amazon, Flipkart, Walmart, and more. We also provide currency conversion to help you make informed decisions regardless of the retailer's location.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Start saving today. Discover smarter shopping.</h2>
          <button className="cta-button">
            Compare Now <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}

export default ServicesPage;
