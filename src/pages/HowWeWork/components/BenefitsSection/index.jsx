import React from 'react';
import { DollarSign, Clock, Shield, TrendingUp, Zap, Heart } from 'lucide-react';
import styles from './BenefitsSection.module.css';

function BenefitsSection() {
  return (
    <section className={`${styles.benefitsSection} container container-lg my-5 py-5`}>
      <div className="row">
        <div className="col-12 text-center mb-5">
          <h3 className={`${styles.sectionSubtitle} fw-bold mb-4`}>Why Choose SastaShopping?</h3>
          <p className="lead text-muted mb-5">
            Experience the power of smart shopping with our comprehensive price comparison platform
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Benefit 1 */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <DollarSign size={32} />
            </div>
            <h4 className={styles.benefitTitle}>Maximum Savings</h4>
            <p className={styles.benefitDescription}>
              Find the lowest prices across multiple platforms and save up to 50% on your purchases
            </p>
          </div>
        </div>

        {/* Benefit 2 */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Clock size={32} />
            </div>
            <h4 className={styles.benefitTitle}>Time Efficient</h4>
            <p className={styles.benefitDescription}>
              Compare prices instantly without visiting multiple websites
            </p>
          </div>
        </div>

        {/* Benefit 3 */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Shield size={32} />
            </div>
            <h4 className={styles.benefitTitle}>Trusted Sources</h4>
            <p className={styles.benefitDescription}>
              Get price data from verified retailers and trusted e-commerce platforms
            </p>
          </div>
        </div>

        {/* Benefit 4 */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <TrendingUp size={32} />
            </div>
            <h4 className={styles.benefitTitle}>Price Trends</h4>
            <p className={styles.benefitDescription}>
              Track price history and make informed decisions about when to buy
            </p>
          </div>
        </div>

        {/* Benefit 5 */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Zap size={32} />
            </div>
            <h4 className={styles.benefitTitle}>Instant Alerts</h4>
            <p className={styles.benefitDescription}>
              Get notified immediately when prices drop to your desired level
            </p>
          </div>
        </div>

        {/* Benefit 6 */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Heart size={32} />
            </div>
            <h4 className={styles.benefitTitle}>User-Friendly</h4>
            <p className={styles.benefitDescription}>
              Simple and intuitive interface designed for hassle-free shopping
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;
