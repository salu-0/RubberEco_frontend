/**
 * Video utility functions for handling HTML5 video operations safely
 */

/**
 * Safely play a video element, handling AbortError and other play errors
 * @param {HTMLVideoElement} videoElement - The video element to play
 * @returns {Promise<boolean>} - Returns true if play was successful, false otherwise
 */
export const safeVideoPlay = async (videoElement) => {
  if (!videoElement) {
    console.warn('Video element is null or undefined');
    return false;
  }

  try {
    const playPromise = videoElement.play();
    
    // Modern browsers return a promise from play()
    if (playPromise !== undefined) {
      await playPromise;
      return true;
    }
    
    // Older browsers might not return a promise
    return true;
  } catch (error) {
    // Handle different types of errors
    switch (error.name) {
      case 'AbortError':
        // The play() request was interrupted by a call to pause()
        console.debug('Video play was aborted (likely due to rapid play/pause)');
        break;
      case 'NotAllowedError':
        // The user hasn't interacted with the document yet
        console.warn('Video play not allowed - user interaction required');
        break;
      case 'NotSupportedError':
        // The video format is not supported
        console.error('Video format not supported');
        break;
      default:
        console.warn('Video play error:', error.message);
    }
    return false;
  }
};

/**
 * Safely pause a video element
 * @param {HTMLVideoElement} videoElement - The video element to pause
 * @returns {boolean} - Returns true if pause was successful, false otherwise
 */
export const safeVideoPause = (videoElement) => {
  if (!videoElement) {
    console.warn('Video element is null or undefined');
    return false;
  }

  try {
    videoElement.pause();
    return true;
  } catch (error) {
    console.warn('Video pause error:', error.message);
    return false;
  }
};

/**
 * Toggle video play/pause state safely
 * @param {HTMLVideoElement} videoElement - The video element to toggle
 * @param {boolean} isCurrentlyPlaying - Current playing state
 * @returns {Promise<boolean>} - Returns the new playing state
 */
export const toggleVideoPlayback = async (videoElement, isCurrentlyPlaying) => {
  if (!videoElement) {
    console.warn('Video element is null or undefined');
    return false;
  }

  if (isCurrentlyPlaying) {
    const pauseSuccess = safeVideoPause(videoElement);
    return !pauseSuccess; // Return false if pause was successful
  } else {
    const playSuccess = await safeVideoPlay(videoElement);
    return playSuccess; // Return true if play was successful
  }
};

/**
 * Set video time safely
 * @param {HTMLVideoElement} videoElement - The video element
 * @param {number} time - Time in seconds
 * @returns {boolean} - Returns true if successful, false otherwise
 */
export const safeSetVideoTime = (videoElement, time) => {
  if (!videoElement) {
    console.warn('Video element is null or undefined');
    return false;
  }

  try {
    videoElement.currentTime = Math.max(0, Math.min(time, videoElement.duration || 0));
    return true;
  } catch (error) {
    console.warn('Video time set error:', error.message);
    return false;
  }
};

/**
 * Set video volume safely
 * @param {HTMLVideoElement} videoElement - The video element
 * @param {number} volume - Volume level (0-1)
 * @returns {boolean} - Returns true if successful, false otherwise
 */
export const safeSetVideoVolume = (videoElement, volume) => {
  if (!videoElement) {
    console.warn('Video element is null or undefined');
    return false;
  }

  try {
    videoElement.volume = Math.max(0, Math.min(1, volume));
    return true;
  } catch (error) {
    console.warn('Video volume set error:', error.message);
    return false;
  }
};

/**
 * Format time in MM:SS or HH:MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export const formatVideoTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

/**
 * Check if video element is ready for playback
 * @param {HTMLVideoElement} videoElement - The video element
 * @returns {boolean} - Returns true if video is ready
 */
export const isVideoReady = (videoElement) => {
  if (!videoElement) return false;
  return videoElement.readyState >= 3; // HAVE_FUTURE_DATA or higher
};

/**
 * Add comprehensive error handling to video element
 * @param {HTMLVideoElement} videoElement - The video element
 * @param {Function} onError - Error callback function
 * @returns {Function} - Cleanup function to remove listeners
 */
export const addVideoErrorHandling = (videoElement, onError) => {
  if (!videoElement || typeof onError !== 'function') {
    console.warn('Invalid parameters for video error handling');
    return () => {};
  }

  const handleError = (event) => {
    const error = videoElement.error;
    let errorMessage = 'Unknown video error';

    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMessage = 'Video playback was aborted';
          break;
        case error.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error occurred while loading video';
          break;
        case error.MEDIA_ERR_DECODE:
          errorMessage = 'Video decoding error';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported';
          break;
        default:
          errorMessage = `Video error (code: ${error.code})`;
      }
    }

    onError(errorMessage, error);
  };

  videoElement.addEventListener('error', handleError);

  // Return cleanup function
  return () => {
    videoElement.removeEventListener('error', handleError);
  };
};
