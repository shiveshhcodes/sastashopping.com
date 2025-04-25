import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './HowWeWork.module.css'; // Import CSS Module
// Import sub-components
import ProcessSection from './components/ProcessSection';
// Import placeholder components for now
import BenefitsSection from './components/BenefitsSection';
import FAQSection from './components/FAQSection';

// Assuming your Navbar component is in the correct path
// import Navbar from '../../components/Navbar'; // You will typically include Navbar in your App.jsx or layout component

function HowWeWork() {
  return (
    <main className={styles.howWeWorkContainer}>
      {/* Hero Section */}
      <section className={`${styles.heroSection} text-center`}>
        <div className="container container-lg py-5">
          <h1 className={`${styles.pageTitle} display-3 fw-bold mb-4`}>
            How SastaShopping Works
          </h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '800px' }}>
            Understand how our platform helps you save money by finding the best prices across multiple e-commerce sites like Amazon, Flipkart, Walmart, and more!
          </p>
        </div>
      </section>

      {/* Process Section */}
      <section className={styles.sectionPadding}>
        <ProcessSection />
      </section>

      {/* Benefits Section */}
      <section className={`${styles.sectionPadding} ${styles.sectionLight}`}>
        <BenefitsSection />
      </section>

      {/* FAQ Section */}
      <section className={styles.sectionPadding}>
        <FAQSection />
      </section>

      {/* Optional: You might have a Footer component here */}
      {/* import Footer from '../../components/Footer'; */}
      {/* <Footer /> */}
    </main>
  );
}

export default HowWeWork;
