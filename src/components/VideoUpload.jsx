import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  X, 
  Play, 
  FileVideo, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

const VideoUpload = ({ onVideoUploaded, onCancel, darkMode = true }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setError('');
    
    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid video file (MP4, WebM, OGG, AVI, MOV)');
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      setError('File size must be less than 500MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const uploadVideo = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('title', selectedFile.name.replace(/\.[^/.]+$/, ""));

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // In a real application, you would upload to your server or cloud storage
      // For now, we'll simulate the upload and use the local file
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(uploadInterval);
      setUploadProgress(100);

      // Create video object with local file URL
      const videoData = {
        id: Date.now(),
        title: selectedFile.name.replace(/\.[^/.]+$/, ""),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        duration: "Unknown", // Would be extracted from video metadata
        localUrl: previewUrl,
        uploadDate: new Date().toISOString(),
        type: 'local'
      };

      // Call the callback with video data
      if (onVideoUploaded) {
        onVideoUploaded(videoData);
      }

      // Reset form
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white'} backdrop-blur-sm rounded-2xl shadow-xl border p-6 max-w-2xl mx-auto ${
        darkMode ? 'border-green-500/20' : 'border-gray-100'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Upload Training Video</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your video here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports MP4, WebM, OGG, AVI, MOV (max 500MB)
              </p>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Choose File
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <FileVideo className="w-8 h-8 text-gray-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
                
                {previewUrl && (
                  <div className="mt-3">
                    <video
                      src={previewUrl}
                      className="w-full max-w-md h-32 object-cover rounded-lg"
                      controls
                      preload="metadata"
                    />
                  </div>
                )}
              </div>
              
              <button
                onClick={removeFile}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={uploadVideo}
              disabled={uploading || !!error}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : uploadProgress === 100 ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Uploaded!</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Video</span>
                </>
              )}
            </button>
            
            <button
              onClick={removeFile}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Upload Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Download your video from YouTube using a YouTube downloader</li>
          <li>Recommended format: MP4 for best compatibility</li>
          <li>Keep file size under 500MB for faster loading</li>
          <li>Use descriptive filenames for better organization</li>
          <li>Videos will be stored locally in your project</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default VideoUpload;
