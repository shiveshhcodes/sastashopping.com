import React from 'react';
import Navbar from '../components/Navbar'; // Import the Navbar component
import HeroSection from '../components/HeroSection'; // Import the HeroSection component
import ImageGrid from '../components/ImageGrid'; // Import the ImageGrid component
import ImageScroller from '../components/ImageScroller'; // Import the ImageScroller component
import FeatureVideoSection from '../components/FeatureVideoSection'; // Import the FeatureVideoSection component
import SavingsSection from '../components/SavingsSection'; // Import the new section

// Updated placeholder image URLs (keep these)
const placeholderGridImages = [
  { id: 1, src: 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Modern+Office+Space', alt: 'Modern Office Space' },
  { id: 2, src: 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Team+Collaboration', alt: 'Team Collaboration' },
  { id: 3, src: 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Abstract+Background', alt: 'Abstract Background' },
  { id: 4, src: 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Data+Visualization', alt: 'Data Visualization' },
  { id: 5, src: 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Nature+Landscape', alt: 'Nature Landscape' },
  { id: 6, src: 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Cityscape+View', alt: 'Cityscape View' },
  { id: 7, src: 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Product+Showcase', alt: 'Product Showcase' },
  { id: 8, src: 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Creative+Design', alt: 'Creative Design' },
];

const placeholderScrollImages = [
  'https://placehold.co/400x250/2d2d2d/e0e0e0?text=Partner+Logo+1',
  'https://placehold.co/400x250/2d2d2d/e0e0e0?text=Tech+Abstract+A',
  'https://placehold.co/400x250/2d2d2d/e0e0e0?text=Client+Showcase+X',
  'https://placehold.co/400x250/2d2d2d/e0e0e0?text=Minimalist+Design',
  'https://placehold.co/400x250/2d2d2d/e0e0e0?text=Partner+Logo+2',
  'https://placehold.co/400x250/2d2d2d/e0e0e0?text=Nature+Wide+Shot',
  'https://placehold.co/400x250/2d2d2d/e0e0e0?text=Client+Showcase+Y',
  'https://placehold.co/400x250/2d2d2d/e0e0e0?text=Office+Workspace+View',
];

// The LandingPage component assembles the different sections of the page.
function LandingPage() {
  return (
    // Use inline styles for basic flex layout - alternatively create a Layout component
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Bar at the top */}
      <Navbar />

      {/* Main content area */}
      <main style={{ flexGrow: 1 }}> {/* Allow main content to grow */}
        {/* Hero section */}
        <HeroSection />

        {/* === Add the Feature and Video Section Component Here === */}
        {/* Ensure this is placed where you want the section to appear */}
        <FeatureVideoSection />
        <SavingsSection />
        {/* ====================================================== */}

        {/* Image Grid Section */}
        <ImageGrid images={placeholderGridImages} />
      </main>

      {/* Image Scroller section at the bottom */}
      <ImageScroller images={placeholderScrollImages} />

      {/* Optional Footer */}
      {/* <footer style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-200)', color: 'var(--text-200)', borderTop: '1px solid var(--bg-300)' }}>
        © 2025 Your Company Name. All Rights Reserved.
      </footer> */}
    </div>
  );
}

export default LandingPage;