import React from 'react';
import { motion } from 'framer-motion'; // Import motion from framer-motion
import styles from './ImageScroller.module.css'; // Import CSS Module

// ImageScroller component: Displays a continuously scrolling horizontal strip of images.
function ImageScroller({ images = [] }) {

  // Duplicate the images array for a seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    // Use the styles from the CSS Module
    <div className={styles.scrollerSection}>
      <div className={styles.scrollerContainer}>
        {/* Use framer-motion's motion.div for animation */}
        <motion.div
          className={styles.scrollerTrack}
          // Animation properties
          animate={{
            x: ['0%', '-100%'], // Animate horizontal position
          }}
          transition={{
            ease: 'linear',       // Constant speed
            duration: 40,         // Adjust duration for speed (longer = slower)
            repeat: Infinity,     // Repeat indefinitely
          }}
        >
          {/* Map through the duplicated images */}
          {duplicatedImages.map((src, index) => (
            <div key={index} className={styles.scrollerItem}>
              <img
                src={src}
                alt={`Scrolling image ${index + 1}`}
                className={styles.scrollerImage}
                // Fallback for broken images
                onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src="https://placehold.co/400x250/454545/e0e0e0?text=Error"; // Fallback
                    }
                }
                loading="lazy" // Lazy load images
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default ImageScroller;