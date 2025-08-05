// Video Assets Index
// This file exports all training videos for easy importing

// Import video files with simplified names
import rubberTappingKnife from './How to sharpen rubber tapping knife (Part 1).mp4';
import rubberTappingKnifePart2 from './Sharpen rubber tapping knife (Part 2) - Rubber Tapping with Sasidharan Kannelil.mp4';

// Export video assets
export const trainingVideos = {
  // Rubber Tapping Fundamentals Module
  rubberTappingKnife: rubberTappingKnife,
  rubberTappingKnifePart2: rubberTappingKnifePart2,

  // Add more videos here as you upload them
  // example: rubberTappingBasics: rubberTappingBasicsVideo,
  // example: plantationManagement: plantationManagementVideo,
};

// Video metadata
export const videoMetadata = {
  rubberTappingKnife: {
    title: "പാഠം 1: റബ്ബർ ടാപ്പിംഗ് കത്തി എങ്ങനെ മൂർച്ച കൂട്ടാം",
    titleEnglish: "Lesson 1: How to sharpen rubber tapping knife",
    description: "Learn the proper technique for sharpening rubber tapping knives for optimal performance",
    duration: "Unknown", // Will be detected by video player
    instructor: "Sasidharan Kannali",
    language: "Malayalam",
    subtitles: "English available",
    difficulty: "Beginner",
    tags: ["knife sharpening", "tools", "maintenance", "rubber tapping"]
  },
  rubberTappingKnifePart2: {
    title: "പാഠം 2: എളുപ്പത്തിൽ കത്തി മൂർച്ച കൂട്ടുവാനുള്ള കുറുക്കുവഴി",
    titleEnglish: "Lesson 2: Easy shortcut to sharpen rubber tapping knife",
    description: "Learn quick and easy methods to sharpen your rubber tapping knife efficiently",
    duration: "Unknown", // Will be detected by video player
    instructor: "Sasidharan Kannali",
    language: "Malayalam",
    subtitles: "English available",
    difficulty: "Beginner",
    tags: ["knife sharpening", "shortcuts", "efficiency", "rubber tapping", "tools"]
  }
};

// Helper function to get video by key
export const getVideo = (videoKey) => {
  return trainingVideos[videoKey];
};

// Helper function to get video metadata
export const getVideoMetadata = (videoKey) => {
  return videoMetadata[videoKey];
};

// Export all videos as default
export default trainingVideos;
