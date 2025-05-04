import React from 'react';
// Assuming Lucide React for icons based on your dependencies
import { Link, Repeat, LineChart, Search, AlertCircle } from 'lucide-react';
import styles from './ProcessSection.module.css'; // Import CSS Module

function ProcessSection() {
  return (
    <section className={`${styles.processSection} container container-lg my-5 py-5`}> {/* Apply custom class and Bootstrap container/padding */}
      <div className="row">
        {/* Left Column: Steps */}
        {/* Takes full width on small screens, 6 columns on medium and up */}
        <div className="col-12 col-md-6 mb-5 mb-md-0"> {/* Added bottom margin on small, removed on medium+ */}
          <h3 className={`${styles.sectionSubtitle} fw-bold mb-4`}>How It Works</h3> {/* Apply custom subtitle style */}
          <ol className={styles.howItWorksList}> {/* Apply custom list style from CSS Module */}
            <li>
              <div className={styles.stepContent}>
                <div className={styles.stepIcon}>
                  <Search size={24} />
                </div>
                <div>
                  <h4>Find Your Product</h4>
                  <p>Browse or search for products you want to buy</p>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.stepContent}>
                <div className={styles.stepIcon}>
                  <Link size={24} />
                </div>
                <div>
                  <h4>Paste Product Link</h4>
                  <p>Copy and paste the product link from any supported retailer</p>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.stepContent}>
                <div className={styles.stepIcon}>
                  <Repeat size={24} />
                </div>
                <div>
                  <h4>Compare Prices</h4>
                  <p>Instantly see prices from multiple platforms</p>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.stepContent}>
                <div className={styles.stepIcon}>
                  <LineChart size={24} />
                </div>
                <div>
                  <h4>Track Price History</h4>
                  <p>View price trends and set alerts for price drops</p>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.stepContent}>
                <div className={styles.stepIcon}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h4>Get Price Alerts</h4>
                  <p>Receive notifications when prices drop to your desired level</p>
                </div>
              </div>
            </li>
          </ol>
        </div>

        {/* Right Column: Feature Boxes */}
        {/* Takes full width on small screens, 6 columns on medium and up */}
        {/* Use gx-4 for horizontal gutter between feature items */}
        <div className="col-12 col-md-6">
           <div className="row gx-4"> {/* Row for the three feature boxes with horizontal gutter */}

              {/* Feature Box 1: Paste Product Links */}
              {/* Takes full width on small, 6 columns on medium and up */}
              <div className="col-12 col-sm-6 mb-4"> {/* Bottom margin on small and medium */}
                <div className={`${styles.featureBox} text-center p-4 border rounded-lg shadow-sm`}> {/* Apply custom box style, Bootstrap padding, border, rounded, shadow */}
                  <div className={styles.iconWrapper}> {/* Apply custom icon wrapper style */}
                     {/* Increased icon size and changed color to primary */}
                     <Link size={48} className="text-primary" />
                  </div>
                  <h5 className="fw-bold mb-2 text-dark">Paste Product Links</h5> {/* Feature title, darker text color */}
                  <p className="text-muted mb-0"> {/* Muted text color */}
                    Add links from Amazon, Flipkart, and other e-commerce sites
                  </p>
                </div>
              </div>

              {/* Feature Box 2: Compare Prices */}
              {/* Takes full width on small, 6 columns on medium and up */}
              <div className="col-12 col-sm-6 mb-4"> {/* Bottom margin on small and medium */}
                <div className={`${styles.featureBox} text-center p-4 border rounded-lg shadow-sm`}> {/* Apply custom box style, Bootstrap padding, border, rounded, shadow */}
                  <div className={styles.iconWrapper}> {/* Apply custom icon wrapper style */}
                     {/* Increased icon size and changed color to primary */}
                     <Repeat size={48} className="text-primary" />
                  </div>
                  <h5 className="fw-bold mb-2 text-dark">Compare Prices</h5> {/* Feature title, darker text color */}
                  <p className="text-muted mb-0"> {/* Muted text color */}
                    See prices from multiple platforms side by side
                  </p>
                </div>
              </div>

              {/* Feature Box 3: Price History */}
              <div className="col-12 col-sm-6 mb-4">
                <div className={`${styles.featureBox} text-center p-4 border rounded-lg shadow-sm`}>
                  <div className={styles.iconWrapper}>
                    <LineChart size={48} className="text-primary" />
                  </div>
                  <h5 className="fw-bold mb-2 text-dark">Price History</h5>
                  <p className="text-muted mb-0">
                    Track price trends and make informed decisions
                  </p>
                </div>
              </div>

              {/* Feature Box 4: Price Alerts */}
              <div className="col-12 col-sm-6 mb-4">
                <div className={`${styles.featureBox} text-center p-4 border rounded-lg shadow-sm`}>
                  <div className={styles.iconWrapper}>
                    <AlertCircle size={48} className="text-primary" />
                  </div>
                  <h5 className="fw-bold mb-2 text-dark">Price Alerts</h5>
                  <p className="text-muted mb-0">
                    Get notified when prices drop to your desired level
                  </p>
                </div>
              </div>
           </div>
        </div>
      </div>

       {/* Call to Action Button Section - Below the main row */}
       <div className="row mt-5"> {/* Top margin to separate from the above content */}
          <div className="col-12 text-center"> {/* Centered button */}
             {/* Prominent CTA Button with custom styling */}
             <button className={`${styles.ctaButton} btn btn-primary btn-lg`}> {/* Apply custom button style */}
               Start Comparing Prices
               <small className="d-block fw-normal mt-1">Find the best deals instantly</small> {/* Smaller text below button text */}
             </button>
          </div>
       </div>

       {/* Empty Space Placeholder - Below the CTA button */}
       <div className="row mt-5"> {/* Top margin */}
           <div className="col-12">
               {/* Placeholder div for the empty space with improved styling */}
               <div className={`${styles.emptySpace} rounded-lg shadow`}> {/* Apply custom empty space style, Bootstrap rounded and shadow */}
                   {/* Content for the empty space can go here later */}
                   {/* For now, it's just a styled div */}
               </div>
           </div>
       </div>

    </section>
  );
}

export default ProcessSection;
