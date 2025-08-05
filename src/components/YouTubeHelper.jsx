import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, Play, CheckCircle } from 'lucide-react';

const YouTubeHelper = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [copied, setCopied] = useState(false);

  // Extract YouTube video ID from URL
  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    const id = extractVideoId(url);
    setVideoId(id || '');
  };

  const copyVideoId = () => {
    navigator.clipboard.writeText(videoId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEmbedUrl = () => {
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">YouTube Video Helper</h2>
      
      <div className="space-y-6">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Video URL
          </label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={handleUrlChange}
            placeholder="Paste your YouTube video URL here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
          </p>
        </div>

        {/* Video ID Display */}
        {videoId && (
          <motion.div
            className="bg-green-50 border border-green-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-800 mb-1">
                  Video ID Extracted Successfully!
                </h3>
                <code className="text-sm bg-green-100 px-2 py-1 rounded text-green-700">
                  {videoId}
                </code>
              </div>
              <button
                onClick={copyVideoId}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Embed URL */}
        {videoId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Embed URL (for iframe)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={getEmbedUrl()}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getEmbedUrl());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Preview */}
        {videoId && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={getEmbedUrl()}
                title="YouTube video preview"
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">How to use:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Copy the YouTube video URL from your browser</li>
            <li>Paste it in the input field above</li>
            <li>The video ID will be automatically extracted</li>
            <li>Copy the video ID or embed URL to use in your training module</li>
            <li>Use the Video Management section in admin to add it to your course</li>
          </ol>
        </div>

        {/* Quick Actions */}
        {videoId && (
          <div className="flex items-center space-x-4">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on YouTube</span>
            </a>
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Play className="w-4 h-4" />
              <span>Add to Training</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeHelper;
