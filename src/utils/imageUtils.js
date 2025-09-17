// Utility functions for handling images safely

// Default placeholder images
import b1Image from '../assets/images/bid/b1.jpg';
import b2Image from '../assets/images/bid/b2.jpg';
import b3Image from '../assets/images/bid/b3.jpg';

const placeholderImages = [b1Image, b2Image, b3Image];

/**
 * Check if a URL is a blob URL
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's a blob URL
 */
export const isBlobUrl = (url) => {
  return url && url.startsWith('blob:');
};

/**
 * Get a safe image URL, falling back to placeholder if needed
 * @param {string} url - The original URL
 * @param {number} index - Index for selecting different placeholder images
 * @returns {string} - Safe image URL
 */
export const getSafeImageUrl = (url, index = 0) => {
  if (!url || isBlobUrl(url) || url === '/api/placeholder/400/300') {
    return placeholderImages[index % placeholderImages.length];
  }
  return url;
};

/**
 * Handle image load error by setting a placeholder
 * @param {Event} event - The error event
 * @param {number} index - Index for selecting different placeholder images
 */
export const handleImageError = (event, index = 0) => {
  event.target.src = placeholderImages[index % placeholderImages.length];
};

/**
 * Process an array of image URLs to ensure they're all safe
 * @param {Array} images - Array of image URLs
 * @returns {Array} - Array of safe image URLs
 */
export const processImageUrls = (images) => {
  if (!Array.isArray(images) || images.length === 0) {
    return [placeholderImages[0]];
  }
  
  // Filter out null/undefined and process valid images
  const validImages = images.filter(img => img && img !== '/api/placeholder/400/300');
  
  if (validImages.length === 0) {
    return [placeholderImages[0]];
  }
  
  return validImages.map((img, index) => getSafeImageUrl(img, index));
};
