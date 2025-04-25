import React from 'react';
import styles from './BenefitsSection.module.css'; // Import CSS Module

function BenefitsSection() {
  return (
    <section className={`${styles.benefitsSection} container container-lg my-5 py-5`}>
      <div className="row">
        <div className="col-12 text-center">
          <h3 className={`${styles.sectionSubtitle} fw-bold mb-4`}>Benefits of Using Our Service</h3>
          <p className="lead text-muted">
            {/* Add content about the benefits here */}
            This is a placeholder for the Benefits Section. You can describe the advantages users get from your service.
          </p>
          {/* Add more content like benefit points, icons, etc. */}
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;
