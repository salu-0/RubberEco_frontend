import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Video,
  Save,
  X,
  ExternalLink,
  Play,
  Clock,
  BookOpen,
  Upload,
  Youtube
} from 'lucide-react';
import VideoUpload from '../../components/VideoUpload';

const VideoManagement = ({ darkMode = true }) => {
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: "രബ്ബർ ടാപ്പിംഗ് പരിശീലനം (Rubber Tapping Training Overview)",
      description: "Channel introduction and overview of rubber tapping fundamentals",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration: "6:07",
      moduleId: 1,
      order: 1,
      status: "published"
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoType, setVideoType] = useState('youtube'); // 'youtube' or 'local'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    localUrl: '',
    duration: '',
    moduleId: 1,
    order: 1,
    type: 'youtube'
  });

  const modules = [
    { id: 1, name: "Rubber Tapping Fundamentals" },
    { id: 2, name: "Plantation Management" },
    { id: 3, name: "Disease Prevention & Treatment" },
    { id: 4, name: "Market Analysis & Pricing" }
  ];

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingVideo) {
      // Update existing video
      setVideos(videos.map(video => 
        video.id === editingVideo.id 
          ? { ...video, ...formData }
          : video
      ));
      setEditingVideo(null);
    } else {
      // Add new video
      const newVideo = {
        id: Date.now(),
        ...formData,
        status: 'published'
      };
      setVideos([...videos, newVideo]);
    }
    
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      duration: '',
      moduleId: 1,
      order: 1
    });
    setShowAddForm(false);
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      youtubeUrl: video.youtubeUrl,
      duration: video.duration,
      moduleId: video.moduleId,
      order: video.order
    });
    setShowAddForm(true);
  };

  const handleDelete = (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      setVideos(videos.filter(video => video.id !== videoId));
    }
  };

  const handleVideoUploaded = (videoData) => {
    const newVideo = {
      id: Date.now(),
      title: videoData.title,
      description: `Uploaded video: ${videoData.fileName}`,
      localUrl: videoData.localUrl,
      youtubeUrl: '',
      duration: videoData.duration,
      moduleId: 1,
      order: videos.length + 1,
      type: 'local',
      status: 'published'
    };

    setVideos([...videos, newVideo]);
    setShowUploadForm(false);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setShowUploadForm(false);
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      localUrl: '',
      duration: '',
      moduleId: 1,
      order: 1,
      type: 'youtube'
    });
  };

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Video className="inline-block mr-3 h-8 w-8 text-green-500" />
            Video Management
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage training videos and content</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={() => setShowUploadForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-green-500/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload className="w-5 h-5" />
            <span>Upload Video</span>
          </motion.button>
          <motion.button
            onClick={() => {
              setVideoType('youtube');
              setShowAddForm(true);
            }}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-red-500/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Youtube className="w-5 h-5" />
            <span>Add YouTube</span>
          </motion.button>
        </div>
      </div>

      {/* Video Upload Form */}
      {showUploadForm && (
        <VideoUpload
          onVideoUploaded={handleVideoUploaded}
          onCancel={() => setShowUploadForm(false)}
          darkMode={darkMode}
        />
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <motion.div
          className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white'} backdrop-blur-sm rounded-2xl shadow-xl border p-6 ${
            darkMode ? 'border-green-500/20' : 'border-gray-100'
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h2>
            <button
              onClick={cancelForm}
              className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Video Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="e.g., 6:07"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube URL
              </label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              {formData.youtubeUrl && getYouTubeVideoId(formData.youtubeUrl) && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Valid YouTube URL detected
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Training Module
                </label>
                <select
                  value={formData.moduleId}
                  onChange={(e) => setFormData({...formData, moduleId: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-6">
              <motion.button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-green-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-5 h-5" />
                <span>{editingVideo ? 'Update Video' : 'Add Video'}</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={cancelForm}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Videos List */}
      <div className={`${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white'} backdrop-blur-sm rounded-2xl shadow-xl border overflow-hidden ${
        darkMode ? 'border-green-500/20' : 'border-gray-100'
      }`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-green-500/20 bg-gray-700/50' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Training Videos</h2>
        </div>

        <div className={`divide-y ${darkMode ? 'divide-green-500/20' : 'divide-gray-200'}`}>
          {videos.map((video) => (
            <motion.div
              key={video.id}
              className={`p-6 transition-colors ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
              whileHover={{ backgroundColor: darkMode ? '#374151' : '#f9fafb' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Video className="w-5 h-5 text-green-500" />
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{video.title}</h3>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                      {video.status}
                    </span>
                  </div>

                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{video.description}</p>

                  <div className={`flex items-center space-x-6 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {video.duration}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {modules.find(m => m.id === video.moduleId)?.name}
                    </div>
                    <div>Order: {video.order}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'text-gray-400 hover:text-green-400 hover:bg-green-500/10' : 'text-gray-400 hover:text-blue-500'
                    }`}
                    title="View on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleEdit(video)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'text-gray-400 hover:text-green-400 hover:bg-green-500/10' : 'text-gray-400 hover:text-blue-500'
                    }`}
                    title="Edit video"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500'
                    }`}
                    title="Delete video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoManagement;
