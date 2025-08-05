import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trainingAPI, getUserData } from '../utils/api';
import enrollmentManager from '../utils/enrollmentManager';
import mockAPI from '../utils/mockAPI';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Clock, 
  Users, 
  Star,
  CheckCircle,
  BookOpen,
  Download,
  Share2,
  Heart,
  MessageCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import LocalVideoPlayer from '../components/LocalVideoPlayer';
import { trainingVideos, videoMetadata } from '../assets/videos';
import { useNavigationGuard } from '../hooks/useNavigationGuard';

const TrainingModule = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize navigation guard
  const { getUserData } = useNavigationGuard();

  // Check authentication on component mount
  useEffect(() => {
    const { user, isLoggedIn } = getUserData();

    if (!isLoggedIn) {
      console.log('🚫 Unauthorized access to training module, redirecting to login');
      // Store the intended destination for redirect after login (only for regular users)
      localStorage.setItem('redirectAfterLogin', `/training/${moduleId}`);
      navigate('/login', { replace: true });
      return;
    }

    // Staff users should be redirected to their dashboard
    if (user?.role === 'staff' && user?.useStaffDashboard) {
      console.log('🚫 Staff user accessing training module, redirecting to staff dashboard');
      navigate('/staff-dashboard', { replace: true });
      return;
    }

    // Admin users should be redirected to their dashboard
    if (user?.role === 'admin') {
      console.log('🚫 Admin user accessing training module, redirecting to admin dashboard');
      navigate('/admin-dashboard', { replace: true });
      return;
    }

    console.log('✅ Authorized access to training module:', {
      moduleId,
      userName: user?.name,
      userRole: user?.role
    });
  }, [moduleId, navigate, getUserData]);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);

  // Training module data
  const modules = {
    1: {
      id: 1,
      title: "Rubber Tapping Fundamentals",
      description: "Master the essential techniques of rubber tapping with expert guidance from Sasidharan Kannali",
      instructor: "Sasidharan Kannali",
      duration: "2 hours",
      level: "Beginner",
      rating: 4.8,
      students: 1247,
      videos: [
        {
          id: 1,
          title: videoMetadata.rubberTappingKnife?.title || "പാഠം 1: റബ്ബർ ടാപ്പിംഗ് കത്തി എങ്ങനെ മൂർച്ച കൂട്ടാം",
          titleEnglish: videoMetadata.rubberTappingKnife?.titleEnglish || "Lesson 1: How to sharpen rubber tapping knife",
          description: videoMetadata.rubberTappingKnife?.description || "Learn the proper technique for sharpening rubber tapping knives for optimal performance",
          duration: videoMetadata.rubberTappingKnife?.duration || "Unknown",
          type: "local", // "local" for uploaded videos, "youtube" for YouTube embeds
          videoUrl: trainingVideos.rubberTappingKnife, // Imported video file
          youtubeUrl: "https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE", // Fallback YouTube URL
          thumbnailUrl: "/api/placeholder/640/360",
          completed: false
        },
        {
          id: 2,
          title: videoMetadata.rubberTappingKnifePart2?.title || "പാഠം 2: എളുപ്പത്തിൽ കത്തി മൂർച്ച കൂട്ടുവാനുള്ള കുറുക്കുവഴി",
          titleEnglish: videoMetadata.rubberTappingKnifePart2?.titleEnglish || "Lesson 2: Easy shortcut to sharpen rubber tapping knife",
          description: videoMetadata.rubberTappingKnifePart2?.description || "Learn quick and easy methods to sharpen your rubber tapping knife efficiently",
          duration: videoMetadata.rubberTappingKnifePart2?.duration || "Unknown",
          type: "local", // Using local video
          videoUrl: trainingVideos.rubberTappingKnifePart2, // Now properly imported
          youtubeUrl: "https://www.youtube.com/embed/VIDEO_ID_2",
          thumbnailUrl: "/api/placeholder/640/360",
          completed: false
        },
        {
          id: 3,
          title: "പാഠം 3: ഉപകരണങ്ങളും ഉപകരണങ്ങളും",
          titleEnglish: "Lesson 3: Tools and Equipment",
          description: "Understanding the essential tools for rubber tapping",
          duration: "8:45",
          type: "youtube",
          videoUrl: "https://www.youtube.com/embed/VIDEO_ID_3",
          youtubeUrl: "https://www.youtube.com/embed/VIDEO_ID_3",
          thumbnailUrl: "/api/placeholder/640/360",
          completed: false
        },
        {
          id: 4,
          title: "പാഠം 4: സുരക്ഷാ നടപടികൾ",
          titleEnglish: "Lesson 4: Safety Measures",
          description: "Important safety guidelines for rubber tapping",
          duration: "10:20",
          type: "youtube",
          videoUrl: "https://www.youtube.com/embed/VIDEO_ID_4",
          youtubeUrl: "https://www.youtube.com/embed/VIDEO_ID_4",
          thumbnailUrl: "/api/placeholder/640/360",
          completed: false
        },
        {
          id: 5,
          title: "പാഠം 5: മികച്ച രീതികൾ",
          titleEnglish: "Lesson 5: Best Practices",
          description: "Advanced tips and best practices from experienced tappers",
          duration: "15:15",
          type: "youtube",
          videoUrl: "https://www.youtube.com/embed/VIDEO_ID_5",
          youtubeUrl: "https://www.youtube.com/embed/VIDEO_ID_5",
          thumbnailUrl: "/api/placeholder/640/360",
          completed: false
        }
      ]
    },
    2: {
      id: 2,
      title: "Plantation Management",
      description: "Comprehensive guide to managing rubber plantations efficiently",
      instructor: "Dr. Priya Nair",
      duration: "3 hours",
      level: "Intermediate",
      rating: 4.9,
      students: 856,
      price: 1999,
      isFree: false,
      videos: [
        {
          id: 1,
          title: "പാഠം 1: തോട്ടം ആസൂത്രണം",
          titleEnglish: "Lesson 1: Plantation Planning",
          description: "Learn how to plan and design efficient rubber plantations",
          duration: "12:30",
          type: "youtube",
          videoUrl: "https://www.youtube.com/embed/PLANTATION_1",
          youtubeUrl: "https://www.youtube.com/embed/PLANTATION_1",
          thumbnailUrl: "/api/placeholder/640/360",
          completed: false
        },
        {
          id: 2,
          title: "പാഠം 2: മണ്ണ് പരിശോധന",
          titleEnglish: "Lesson 2: Soil Testing",
          description: "Understanding soil requirements for rubber cultivation",
          duration: "15:45",
          type: "youtube",
          videoUrl: "https://www.youtube.com/embed/PLANTATION_2",
          youtubeUrl: "https://www.youtube.com/embed/PLANTATION_2",
          thumbnailUrl: "/api/placeholder/640/360",
          completed: false
        }
      ]
    },
    3: {
      id: 3,
      title: "Disease Prevention & Treatment",
      description: "Identify and treat common rubber tree diseases and pests",
      instructor: "Dr. Rajesh Kumar",
      duration: "1.5 hours",
      level: "Advanced",
      rating: 4.7,
      students: 432,
      price: 2999,
      isFree: false,
      videos: [
        {
          id: 1,
          title: "പാഠം 1: രോഗ തിരിച്ചറിയൽ",
          titleEnglish: "Lesson 1: Disease Identification",
          description: "Learn to identify common rubber tree diseases",
          duration: "18:20",
          type: "youtube",
          videoUrl: "https://www.youtube.com/embed/DISEASE_1",
          youtubeUrl: "https://www.youtube.com/embed/DISEASE_1",
          thumbnailUrl: "/api/placeholder/640/360",
          completed: false
        }
      ]
    },
    4: {
      id: 4,
      title: "Market Analysis & Pricing",
      description: "Understanding rubber market trends and optimal selling strategies",
      instructor: "Prof. Suresh Menon",
      duration: "2.5 hours",
      level: "Intermediate",
      rating: 4.6,
      students: 623,
      price: 1799,
      isFree: false,
      videos: [
        {
          id: 1,
          title: "പാഠം 1: വിപണി വിശകലനം",
          titleEnglish: "Lesson 1: Market Analysis",
          description: "Understanding rubber market dynamics and trends",
          duration: "20:15",
          type: "youtube",
          videoUrl: "https://www.youtube.com/embed/MARKET_1",
          youtubeUrl: "https://www.youtube.com/embed/MARKET_1",
          thumbnailUrl: "/api/placeholder/640/360",
          completed: false
        }
      ]
    }
  };

  const currentModule = modules[moduleId];

  // Check if user is enrolled in this module (for paid courses)
  const checkEnrollmentStatus = async () => {
    if (!currentModule) return false;

    // Free courses are always accessible
    if (currentModule.isFree !== false) {
      return true;
    }

    // For paid courses, check enrollment status
    const { user } = getUserData();
    if (!user || !user.id) {
      return false;
    }

    // Primary check: Use enrollment manager (local storage)
    const isEnrolledLocally = enrollmentManager.isUserEnrolled(user.id, moduleId);
    if (isEnrolledLocally) {
      console.log('User is enrolled (found in local storage)');
      return true;
    }

    // Fallback 1: Try API check (real then mock)
    try {
      console.log('🔄 Checking enrollment via real API...');
      const data = await trainingAPI.checkEnrollmentStatus(user.id, moduleId);
      if (data.isEnrolled) {
        console.log('✅ User is enrolled (found via real API)');
        return true;
      }
    } catch (apiError) {
      console.warn('Real API enrollment check failed, trying mock API:', apiError.message);

      // Try mock API
      try {
        console.log('🎭 Checking enrollment via mock API...');
        const mockData = await mockAPI.checkEnrollmentStatus(user.id, moduleId);
        if (mockData.isEnrolled) {
          console.log('✅ User is enrolled (found via mock API)');
          return true;
        }
      } catch (mockError) {
        console.warn('Mock API enrollment check also failed:', mockError.message);
      }
    }

    // Fallback 2: Check pending enrollment in sessionStorage
    const pendingEnrollment = sessionStorage.getItem('pendingEnrollment');
    if (pendingEnrollment) {
      try {
        const enrollmentData = JSON.parse(pendingEnrollment);
        if (enrollmentData.moduleId === parseInt(moduleId)) {
          console.log('User has pending enrollment for this module');
          return true;
        }
      } catch (parseError) {
        console.error('Error parsing pending enrollment:', parseError);
      }
    }

    // Fallback 3: Check demo enrollment flag (backward compatibility)
    const recentPayment = localStorage.getItem(`demo_enrollment_${moduleId}`);
    if (recentPayment) {
      const paymentTime = parseInt(recentPayment);
      const timeDiff = Date.now() - paymentTime;
      // Consider enrollment valid for 24 hours
      if (timeDiff < 24 * 60 * 60 * 1000) {
        console.log('User has recent demo payment for this module');
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    const checkAndSetEnrollment = async () => {
      if (!currentModule) return;

      // Check enrollment status
      const enrolled = await checkEnrollmentStatus();
      setIsEnrolled(enrolled);
      setEnrollmentLoading(false);

      // If not enrolled in a paid course, redirect back to training page
      if (!enrolled && currentModule.isFree === false) {
        console.log('🚫 User not enrolled in paid course, redirecting to training page');
        navigate('/training', { replace: true });
        return;
      }

      // Calculate progress based on completed lessons
      const completedCount = completedLessons.size;
      const totalLessons = currentModule.videos.length;
      setProgress((completedCount / totalLessons) * 100);
    };

    checkAndSetEnrollment();
  }, [completedLessons, currentModule, moduleId, navigate]);

  // Debug: Log video URLs to console
  useEffect(() => {
    if (currentModule && currentModule.videos) {
      console.log('Video URLs:', currentModule.videos.map((v, i) => ({
        index: i,
        title: v.title,
        videoUrl: v.videoUrl,
        type: v.type
      })));
      console.log('Current video index:', currentVideo);
      console.log('Current video URL:', currentModule.videos[currentVideo]?.videoUrl);
    }
  }, [currentModule, currentVideo]);

  const markAsCompleted = (videoId) => {
    setCompletedLessons(prev => new Set([...prev, videoId]));
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!currentModule) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Module Not Found</h1>
            <Link to="/training" className="text-primary-600 hover:text-primary-700">
              Back to Training
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4 mb-4">
              <Link 
                to="/training"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Training
              </Link>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentModule.title}
                </h1>
                <p className="text-gray-600 mb-4">{currentModule.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {currentModule.students} students
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {currentModule.duration}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400" />
                    {currentModule.rating}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {currentModule.level}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 lg:mt-0">
                <div className="bg-gray-200 rounded-full h-2 w-48 mb-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {Math.round(progress)}% Complete
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {currentModule.videos[currentVideo]?.type === 'local' ? (
                  <LocalVideoPlayer
                    key={`video-${currentVideo}-${currentModule.videos[currentVideo]?.id}`} // Force re-render when video changes
                    videoSrc={currentModule.videos[currentVideo]?.videoUrl}
                    title={currentModule.videos[currentVideo]?.title}
                    poster={currentModule.videos[currentVideo]?.thumbnailUrl}
                    onProgress={(progress) => {
                      // Handle progress tracking
                      console.log('Video progress:', progress);
                    }}
                    onComplete={() => {
                      // Auto-mark as completed when video ends
                      markAsCompleted(currentModule.videos[currentVideo]?.id);
                    }}
                  />
                ) : (
                  <div className="aspect-video bg-black relative">
                    <iframe
                      src={currentModule.videos[currentVideo]?.youtubeUrl || currentModule.videos[currentVideo]?.videoUrl}
                      title={currentModule.videos[currentVideo]?.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {currentModule.videos[currentVideo]?.title}
                  </h2>
                  {currentModule.videos[currentVideo]?.titleEnglish && (
                    <h3 className="text-lg text-gray-700 mb-2">
                      {currentModule.videos[currentVideo]?.titleEnglish}
                    </h3>
                  )}
                  <p className="text-gray-600 mb-4">
                    {currentModule.videos[currentVideo]?.description}
                  </p>

                  {/* Debug info - remove this later */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-4 text-xs">
                    <strong>Debug:</strong> Video {currentVideo + 1} -
                    URL: {currentModule.videos[currentVideo]?.videoUrl?.substring(0, 50)}...
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => markAsCompleted(currentModule.videos[currentVideo]?.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          completedLessons.has(currentModule.videos[currentVideo]?.id)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          {completedLessons.has(currentModule.videos[currentVideo]?.id) 
                            ? 'Completed' 
                            : 'Mark Complete'
                          }
                        </span>
                      </button>
                      
                      <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Resources</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Course Content ({currentModule.videos.length} lessons)
                </h3>
                
                <div className="space-y-3">
                  {currentModule.videos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        currentVideo === index
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setCurrentVideo(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          completedLessons.has(video.id)
                            ? 'bg-green-500 text-white'
                            : currentVideo === index
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {completedLessons.has(video.id) ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                            {video.title}
                          </h4>
                          {video.titleEnglish && (
                            <p className="text-xs text-gray-500 mb-1 line-clamp-1">
                              {video.titleEnglish}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{video.duration}</span>
                            {currentVideo === index && (
                              <Play className="w-4 h-4 text-primary-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Instructor</p>
                    <p className="font-medium text-gray-900">{currentModule.instructor}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingModule;
