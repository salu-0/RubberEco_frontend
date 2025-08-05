# Training Videos Assets

This directory contains training videos that are bundled with the application.

## Current Videos

### Rubber Tapping Fundamentals Module

1. **പാഠം 1: റബ്ബർ ടാപ്പിംഗ് കത്തി എങ്ങനെ മൂർച്ച കൂട്ടാം**
   - **English:** Lesson 1: How to sharpen rubber tapping knife
   - **File:** `പാഠം 1_ റബ്ബർ ടാപ്പിംഗ് കത്തി എങ്ങനെ മൂർച്ച കൂട്ടാം _ How to sharpen rubber tapping knife (Part 1).mp4`
   - **Instructor:** Sasidharan Kannali
   - **Language:** Malayalam
   - **Status:** ✅ Active

## How to Add New Videos

### Step 1: Add Video File
1. Download your video from YouTube or other source
2. Convert to MP4 format (recommended)
3. Place the video file in this directory (`src/assets/videos/`)

### Step 2: Update index.js
Add your video import and metadata to `index.js`:

```javascript
// Import the new video
import newVideo from './your-video-file.mp4';

// Add to trainingVideos object
export const trainingVideos = {
  rubberTappingKnife: rubberTappingKnife,
  newVideo: newVideo, // Add this line
};

// Add metadata
export const videoMetadata = {
  newVideo: {
    title: "Your Malayalam Title",
    titleEnglish: "Your English Title",
    description: "Video description",
    duration: "10:30",
    instructor: "Instructor Name",
    language: "Malayalam",
    difficulty: "Beginner",
    tags: ["tag1", "tag2"]
  }
};
```

### Step 3: Update TrainingModule.jsx
Add your video to the appropriate module's video array:

```javascript
{
  id: 6,
  title: videoMetadata.newVideo?.title,
  titleEnglish: videoMetadata.newVideo?.titleEnglish,
  description: videoMetadata.newVideo?.description,
  duration: videoMetadata.newVideo?.duration,
  type: "local",
  videoUrl: trainingVideos.newVideo,
  completed: false
}
```

## File Naming Conventions

### Recommended Format:
- Use descriptive names in both Malayalam and English
- Include lesson number for sequential content
- Example: `പാഠം 2_ Basic Tapping Techniques.mp4`

### Avoid:
- Special characters that might cause issues: `< > : " | ? * \`
- Very long filenames (keep under 255 characters)
- Spaces at the beginning or end

## Video Specifications

### Recommended Settings:
- **Format:** MP4 (H.264 codec)
- **Resolution:** 1080p (1920x1080) or 720p (1280x720)
- **Frame Rate:** 30fps or 25fps
- **Audio:** AAC codec, 128kbps or higher
- **File Size:** Keep under 500MB for better performance

### Compression Tips:
- Use video compression tools to reduce file size
- Maintain good quality while keeping files manageable
- Consider multiple quality options for different devices

## Integration with Training System

Videos in this folder are automatically:
- ✅ Bundled with the application
- ✅ Optimized by Vite build process
- ✅ Cached by the browser
- ✅ Available offline once loaded
- ✅ Integrated with the custom video player

## Video Player Features

The LocalVideoPlayer component provides:
- ▶️ Play/Pause controls
- 🔊 Volume control with mute
- ⏩ Skip forward/backward (10 seconds)
- 🔄 Replay functionality
- 📺 Fullscreen support
- 📊 Progress tracking
- 📱 Mobile responsive design

## Troubleshooting

### Video Not Playing:
1. Check file format (MP4 recommended)
2. Verify file is properly imported in `index.js`
3. Check browser console for errors
4. Try different browser
5. Ensure file isn't corrupted

### Large File Sizes:
1. Compress video using tools like HandBrake
2. Reduce resolution if necessary
3. Consider hosting large files externally
4. Use progressive loading for better UX

### Import Errors:
1. Check file path in import statement
2. Ensure filename matches exactly (case-sensitive)
3. Restart development server after adding files
4. Check for special characters in filename

## External Tools

### Video Download:
- **yt-dlp:** Command-line YouTube downloader
- **4K Video Downloader:** GUI application
- **ClipGrab:** Free video downloader

### Video Compression:
- **HandBrake:** Free video transcoder
- **FFmpeg:** Command-line video processing
- **Online converters:** Various web-based tools

### Video Editing:
- **DaVinci Resolve:** Professional free editor
- **OpenShot:** Simple free editor
- **Shotcut:** Cross-platform editor

## Notes

- Videos are bundled with the app, increasing build size
- Consider external hosting for very large video libraries
- Ensure you have rights to use all videos
- Test videos across different browsers and devices
- Keep backup copies of original high-quality videos
