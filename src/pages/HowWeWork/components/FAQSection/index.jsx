import React from 'react';
import styles from './FAQSection.module.css'; // Import CSS Module

function FAQSection() {
  return (
    <section className={`${styles.faqSection} container container-lg my-5 py-5`}>
      <div className="row">
        <div className="col-12 text-center">
          <h3 className={`${styles.sectionSubtitle} fw-bold mb-4`}>Frequently Asked Questions</h3>
          <p className="lead text-muted">
            {/* Add content for FAQs here */}
            This is a placeholder for the FAQ Section. You can list common questions and answers here.
          </p>
          {/* Add more content like accordions or list of questions/answers */}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
