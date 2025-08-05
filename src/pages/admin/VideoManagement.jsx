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

const VideoManagement = () => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
          <p className="text-gray-600">Manage training videos and content</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Video</span>
          </button>
          <button
            onClick={() => {
              setVideoType('youtube');
              setShowAddForm(true);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <Youtube className="w-4 h-4" />
            <span>Add YouTube</span>
          </button>
        </div>
      </div>

      {/* Video Upload Form */}
      {showUploadForm && (
        <VideoUpload
          onVideoUploaded={handleVideoUploaded}
          onCancel={() => setShowUploadForm(false)}
        />
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 border"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h2>
            <button
              onClick={cancelForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="e.g., 6:07"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingVideo ? 'Update Video' : 'Add Video'}</span>
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Videos List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Training Videos</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {videos.map((video) => (
            <div key={video.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Video className="w-5 h-5 text-primary-500" />
                    <h3 className="text-lg font-medium text-gray-900">{video.title}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {video.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{video.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
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
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    title="View on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleEdit(video)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Edit video"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoManagement;
