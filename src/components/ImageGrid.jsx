import React, { useMemo } from 'react';
import styles from './ImageGrid.module.css'; // Import CSS Module

// ImageGrid component: Displays the grid of placeholder images.
function ImageGrid({ images = [] }) {
  // Function to shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Memoize the shuffled and split arrays to prevent unnecessary re-renders
  const { topTrackImages, bottomTrackImages } = useMemo(() => {
    // Create a larger pool of images by repeating the array
    const expandedImages = Array(3).fill(images).flat();
    const shuffled = shuffleArray(expandedImages);
    
    // Split the shuffled array into two roughly equal parts
    const midPoint = Math.floor(shuffled.length / 2);
    
    return {
      topTrackImages: shuffled.slice(0, midPoint),
      bottomTrackImages: shuffled.slice(midPoint)
    };
  }, [images]); // Only recalculate when images array changes

  return (
    <section className={styles.gridSection}>
      <div className={styles.scrollContainer}>
        {/* Top track */}
        <div className={styles.scrollTrack}>
          {topTrackImages.map((image, index) => (
            <div 
              key={`track1-${image.id}-${index}`} 
              className={styles.scrollItem}
            >
              <img
                src={image.src}
                alt={image.alt}
                className={styles.gridImage}
                loading={index > 5 ? "lazy" : "eager"}
              />
            </div>
          ))}
        </div>
        
        {/* Bottom track */}
        <div className={styles.scrollTrack}>
          {bottomTrackImages.map((image, index) => (
            <div 
              key={`track2-${image.id}-${index}`} 
              className={styles.scrollItem}
            >
              <img
                src={image.src}
                alt={image.alt}
                className={styles.gridImage}
                loading={index > 5 ? "lazy" : "eager"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ImageGrid;