import React, { useState } from 'react';
// Assuming Lucide React for icons based on your dependencies
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Loader2, Check } from 'lucide-react';
import './BottomSection.css'; // Import the CSS file for styling

function BottomSection() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    // Strict validation for gmail.com addresses only
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid Gmail address (example@gmail.com)');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }

    // Reset success message after 10 seconds
    setTimeout(() => {
      setIsSuccess(false);
    }, 10000);
  };

  return (
    <div className="bottom-section">
      {/* CTA Section */}
      <div className="container py-5">
        <div className="row align-items-center mb-5">
          <div className="col-12 col-md-6">
            <h2 className="display-4 fw-bold">Start Saving on Every Purchase</h2>
          </div>
          <div className="col-12 col-md-6">
            <p className="lead mb-4">
              Why pay more when you can find the best deals in an instant? Start comparing prices now and unlock incredible savings on your favorite products.
            </p>
            <div className="d-flex">
              <button className="btn btn-dark px-5 py-3">How We Work</button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="container py-5">
        <div className="row g-5">
          {/* Newsletter Section */}
          <div className="col-12 col-lg-4 pe-lg-5">
            <div className="mb-4">
              <h3 className="h4 mb-0">SastaShopping.com</h3>
            </div>
            <p className="text-muted mb-4">
              Subscribe to unlock exclusive deals, price drop alerts, and special discounts on your favorite products!
            </p>
            <form onSubmit={handleSubscribe} className="mb-3">
              <div className="subscription-form">
                <div className="d-flex gap-2">
                  <input
                    type="email"
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    placeholder="Enter your Gmail address"
                    aria-label="Your email here"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    disabled={isLoading || isSuccess}
                  />
                  <button 
                    type="submit" 
                    className={`btn btn-dark px-4 ${isLoading ? 'loading' : ''} ${isSuccess ? 'success' : ''}`}
                    disabled={isLoading || isSuccess}
                  >
                    {isLoading ? (
                      <Loader2 className="loader-icon" size={20} />
                    ) : isSuccess ? (
                      <span className="success-content">
                        <Check className="success-icon" size={20} />
                        <span className="success-emoji">✅</span>
                      </span>
                    ) : (
                      'Join'
                    )}
                  </button>
                </div>
                <div className="subscription-message">
                  {error && (
                    <small className="text-danger error-message">
                      {error}
                    </small>
                  )}
                  {isSuccess && (
                    <small className="text-success success-message">
                      <span className="success-emoji me-2">✅</span>
                      Thank you for subscribing! Get ready for amazing deals and updates.
                    </small>
                  )}
                  {!isSuccess && !error && (
                    <small className="text-muted mt-2 d-block">
                      By subscribing, you'll be the first to know about the best deals and savings opportunities.
                    </small>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Useful Links */}
          <div className="col-6 col-lg-2">
            <h5 className="fw-bold mb-4">Useful Links</h5>
            <ul className="list-unstyled mb-0">
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">About Us</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Contact Us</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Help Center</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Blog Posts</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">FAQs</a></li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div className="col-6 col-lg-2">
            <h5 className="fw-bold mb-4">Connect With Us</h5>
            <ul className="list-unstyled mb-0">
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Newsletter</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Community</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Events</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Partnerships</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Careers</a></li>
            </ul>
          </div>

          {/* Stay Social */}
          <div className="col-12 col-lg-4">
            <h5 className="fw-bold mb-4">Stay Social</h5>
            <ul className="list-unstyled mb-0">
              <li className="mb-3">
                <a href="#" className="text-decoration-none text-muted d-flex align-items-center">
                  <Facebook className="me-3" size={20} />
                  <span>Facebook</span>
                </a>
              </li>
              <li className="mb-3">
                <a href="#" className="text-decoration-none text-muted d-flex align-items-center">
                  <Instagram className="me-3" size={20} />
                  <span>Instagram</span>
                </a>
              </li>
              <li className="mb-3">
                <a href="#" className="text-decoration-none text-muted d-flex align-items-center">
                  <Twitter className="me-3" size={20} />
                  <span>X</span>
                </a>
              </li>
              <li className="mb-3">
                <a href="#" className="text-decoration-none text-muted d-flex align-items-center">
                  <Linkedin className="me-3" size={20} />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li className="mb-3">
                <a href="#" className="text-decoration-none text-muted d-flex align-items-center">
                  <Youtube className="me-3" size={20} />
                  <span>YouTube</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="row mt-5 pt-4 border-top">
          <div className="col-12 col-md-6">
            <p className="text-muted mb-3 mb-md-0">© 2025 SastaShopping. All rights reserved.</p>
          </div>
          <div className="col-12 col-md-6">
            <ul className="list-inline mb-0 text-md-end">
              <li className="list-inline-item me-3">
                <a href="#" className="text-decoration-none text-muted">Privacy Policy</a>
              </li>
              <li className="list-inline-item me-3">
                <a href="#" className="text-decoration-none text-muted">Terms of Service</a>
              </li>
              <li className="list-inline-item">
                <a href="#" className="text-decoration-none text-muted">Cookie Settings</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default BottomSection;
