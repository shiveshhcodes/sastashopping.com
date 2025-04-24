import React from 'react';
import styles from './ImageGrid.module.css'; // Import CSS Module

// ImageGrid component: Displays the grid of placeholder images.
function ImageGrid({ images = [] }) {
  return (
    <section className={styles.gridSection}>
      <div className={`container ${styles.gridContainer}`}>
        {images.map((image) => (
          <div key={image.id} className={styles.gridItem}>
            {/* Placeholder Icon SVG - You can replace this with actual <img> tags */}
            <svg className="placeholder-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.9999 3H2V21H21.9999V3ZM19.9999 5V16.585L16.4141 13L12.707 16.707L9.41406 13.414L5.00006 17.828V5H19.9999ZM5.00006 19L10.2929 13.707L13.5859 17L17.1719 13.414L19.9999 16.171V19H5.00006ZM8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7C9.10457 7 10 7.89543 10 9C10 10.1046 9.10457 11 8 11Z"/>
            </svg>
            {/* If using actual images: */}
            {/* <img
              src={image.src}
              alt={image.alt}
              className={styles.gridImage}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none'; // Hide broken image
                // Optionally display the placeholder SVG or a message
                const placeholder = e.target.parentNode.querySelector('.placeholder-icon');
                if(placeholder) placeholder.style.display = 'block';
              }}
            /> */}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ImageGrid;