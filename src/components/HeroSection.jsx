import React from 'react';
import styles from './HeroSection.module.css'; // Import CSS Module

// HeroSection component: The main introductory section.
function HeroSection() {
  return (
    <section className={styles.heroSection}> {/* Apply hero section styles */}
      <div className={`container ${styles.heroContainer}`}> {/* Use container and hero specific container */}

        {/* Main Heading */}
        <h1 className={styles.heading}>
          Find the Best Deals, Save <br /> More Today!
        </h1>

        {/* Subheading */}
        <p className={styles.subheading}>
          Welcome to your ultimate price comparison tool! Instantly discover the lowest prices across major retailers and maximize your savings.
        </p>

        {/* Call-to-Action Buttons */}
        <div className={styles.buttonGroup}>
          {/* Primary Button */}
          <button className={`${styles.button} ${styles.primaryButton}`}>
            Learn More
          </button>
          {/* Secondary Button (Outline style) */}
          <button className={`${styles.button} ${styles.secondaryButton}`}>
            Sign Up
          </button>
        </div>

      </div>
    </section>
  );
}

export default HeroSection;