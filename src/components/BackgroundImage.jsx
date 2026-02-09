import { useState, useEffect } from 'react';

/**
 * BACKGROUND IMAGE CONFIGURATION
 *
 * To add a background image to any slide or section:
 * 1. Drop your image in /public/backgrounds/
 * 2. Add a mapping below: 'slide-id': 'your-image-filename.jpg'
 *
 * Images should be dark/moody tech themes (motherboards, servers, abstract tech)
 * They will be shown at ~10-15% opacity behind a dark overlay
 */
export const BACKGROUND_CONFIG = {
  // Presentation slides
  'slide-title': 'pexels-markusspiske-225250.jpg',
  'slide-problem': 'pexels-pixabay-270700.jpg',
  'slide-solution': 'pexels-godiatima-4976712.jpg',
  'slide-classification': 'pexels-sora-shimazaki-5926382.jpg',
  'slide-cost': 'pexels-nic-scrollstoppingphotos-6432056.jpg',
  'slide-upload': 'pexels-wwarby-19590477.jpg',

  // Analysis sections
  'section-overview': 'pexels-tstudio-34805588-10827833.jpg',
  'section-threshold': null,
  'section-cost-sim': null,
  'section-histogram': null,
  'section-filetypes': null,
  'section-waste': null,
};

export default function BackgroundImage({ slideId }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  const filename = BACKGROUND_CONFIG[slideId];

  useEffect(() => {
    if (!filename) {
      setImageSrc(null);
      setIsLoaded(false);
      return;
    }

    // Preload the image
    const img = new Image();
    img.onload = () => {
      setImageSrc(`/backgrounds/${filename}`);
      // Small delay for smoother fade-in
      requestAnimationFrame(() => {
        setIsLoaded(true);
      });
    };
    img.onerror = () => {
      console.warn(`Background image not found: ${filename}`);
      setImageSrc(null);
      setIsLoaded(false);
    };
    img.src = `/backgrounds/${filename}`;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [filename]);

  // No image configured for this slide
  if (!filename || !imageSrc) {
    return null;
  }

  return (
    <div
      className={`slide-background ${isLoaded ? 'loaded' : ''}`}
      style={{ backgroundImage: `url(${imageSrc})` }}
    />
  );
}
