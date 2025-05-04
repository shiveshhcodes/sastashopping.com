import React, { useState } from 'react';
// Assuming Lucide React for icons based on your dependencies
// Using icons that visually match the screenshot and adding a potential icon for the final CTA
import { Code, TrendingUp, Bell, Check, Plus, ArrowRight, DollarSign, Clock, Shield, Zap, Heart } from 'lucide-react';
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
        <section className="container container-lg my-5 py-5" style={{background: '#f8fafc', borderRadius: '16px'}}>
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h3 className="fw-bold mb-4" style={{fontSize: '2rem', color: '#1a1a1a'}}>Why Choose SastaShopping?</h3>
              <p className="lead text-muted mb-5">
                Experience the power of smart shopping with our comprehensive price comparison platform
              </p>
            </div>
          </div>
          <div className="row g-4">
            {/* Benefit 1 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <DollarSign size={32} />
                </div>
                <h4 style={{color: '#2d3748', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem'}}>Maximum Savings</h4>
                <p style={{color: '#4a5568', fontSize: '1rem', lineHeight: 1.6, margin: 0}}>
                  Find the lowest prices across multiple platforms and save up to 50% on your purchases
                </p>
              </div>
            </div>
            {/* Benefit 2 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <Clock size={32} />
                </div>
                <h4 style={{color: '#2d3748', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem'}}>Time Efficient</h4>
                <p style={{color: '#4a5568', fontSize: '1rem', lineHeight: 1.6, margin: 0}}>
                  Compare prices instantly without visiting multiple websites
                </p>
              </div>
            </div>
            {/* Benefit 3 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <Shield size={32} />
                </div>
                <h4 style={{color: '#2d3748', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem'}}>Trusted Sources</h4>
                <p style={{color: '#4a5568', fontSize: '1rem', lineHeight: 1.6, margin: 0}}>
                  Get price data from verified retailers and trusted e-commerce platforms
                </p>
              </div>
            </div>
            {/* Benefit 4 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <TrendingUp size={32} />
                </div>
                <h4 style={{color: '#2d3748', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem'}}>Price Trends</h4>
                <p style={{color: '#4a5568', fontSize: '1rem', lineHeight: 1.6, margin: 0}}>
                  Track price history and make informed decisions about when to buy
                </p>
              </div>
            </div>
            {/* Benefit 5 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <Zap size={32} />
                </div>
                <h4 style={{color: '#2d3748', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem'}}>Instant Alerts</h4>
                <p style={{color: '#4a5568', fontSize: '1rem', lineHeight: 1.6, margin: 0}}>
                  Get notified immediately when prices drop to your desired level
                </p>
              </div>
            </div>
            {/* Benefit 6 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <Heart size={32} />
                </div>
                <h4 style={{color: '#2d3748', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem'}}>User-Friendly</h4>
                <p style={{color: '#4a5568', fontSize: '1rem', lineHeight: 1.6, margin: 0}}>
                  Simple and intuitive interface designed for hassle-free shopping
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - new style */}
        <section className="faq-section-new container container-lg my-5 py-5">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h3 className="faq-title">Frequently Asked Questions</h3>
              <p className="faq-desc">Find answers to common questions about our price comparison service</p>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              {[
                {
                  question: "How does SastaShopping help me save money?",
                  answer: "SastaShopping compares prices across multiple e-commerce platforms in real-time, helping you find the lowest price for any product. We also track price history and send alerts when prices drop, ensuring you never miss a good deal."
                },
                {
                  question: "Which e-commerce platforms do you support?",
                  answer: "We currently support major platforms including Amazon, Flipkart, Walmart, and more. We're constantly adding new platforms to provide you with comprehensive price comparisons."
                },
                {
                  question: "How accurate are your price comparisons?",
                  answer: "Our price data is updated in real-time directly from the retailers' websites. We verify prices multiple times a day to ensure accuracy and reliability."
                },
                {
                  question: "Is there a cost to use SastaShopping?",
                  answer: "No, SastaShopping is completely free to use. You can compare prices, track products, and receive price alerts without any charges."
                },
                {
                  question: "How do price alerts work?",
                  answer: "You can set your desired price for any product, and we'll notify you via email or push notification when the price drops to your specified amount. You can also track price history to make informed purchasing decisions."
                },
                {
                  question: "Can I trust the price history data?",
                  answer: "Yes, our price history data is collected from verified sources and updated regularly. We maintain historical records to help you identify price trends and make better purchasing decisions."
                }
              ].map((faq, index) => (
                <div key={index} className="faq-item-new">
                  <div
                    className={`faq-question-new${activeFaq === index ? ' active' : ''}`}
                    onClick={() => toggleFaq(index)}
                  >
                    <h4>{faq.question}</h4>
                    {activeFaq === index ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 15L12 9L18 15" stroke="#6b46c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="#6b46c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </div>
                  <div className={`faq-answer-new${activeFaq === index ? ' active' : ''}`}> 
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Saving?</h2>
          <p className="cta-subtitle">Join thousands of smart shoppers who save money every day</p>
          <button className="cta-button">
            <span>Compare Now</span>
            <ArrowRight size={20} className="arrow-icon" />
          </button>
          <p className="cta-note">No credit card required • Free forever</p>
        </div>
      </section>
    </div>
  );
}

export default ServicesPage;
