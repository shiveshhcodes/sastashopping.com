import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ImageGrid from '../components/ImageGrid';
import FeatureVideoSection from '../components/FeatureVideoSection';
import SavingsSection from '../components/SavingsSection';
import BottomSection from '../components/BottomSection';
import 'bootstrap/dist/css/bootstrap.min.css'; // Make sure Bootstrap is imported

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

function LandingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <HeroSection />
        <FeatureVideoSection />
        <SavingsSection />
        <ImageGrid images={placeholderGridImages} />
      </main>
      <BottomSection />
    </div>
  );
}

export default LandingPage;