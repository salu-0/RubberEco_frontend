import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trainingAPI, getUserData, certificateAPI } from '../utils/api';
import enrollmentManager from '../utils/enrollmentManager';
import mockAPI from '../utils/mockAPI';
import { generateCertificatePDF, canGenerateCertificate, formatCertificateData } from '../utils/certificateGenerator';
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
  MessageCircle,
  Award,
  Trophy
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

    // Broker users should be redirected to their dashboard
    if (user?.role === 'broker') {
      console.log('🚫 Broker user accessing training module, redirecting to broker dashboard');
      navigate('/broker-dashboard', { replace: true });
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
  const [currentEnrollment, setCurrentEnrollment] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);

  // Training module data
  const placeholderThumb = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="%23f3f4f6"/><g fill="%239ca3af" font-family="Arial, Helvetica, sans-serif"><rect x="220" y="120" width="200" height="120" rx="12" ry="12" fill="%23e5e7eb"/><text x="320" y="190" font-size="18" text-anchor="middle">Thumbnail</text><text x="320" y="215" font-size="14" text-anchor="middle">640x360</text></g></svg>';
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
          thumbnailUrl: placeholderThumb,
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
          thumbnailUrl: placeholderThumb,
          completed: false
        },
        {
          id: 3,
          title: "പാഠം 3: റബ്ബർ ടാപ്പിംഗിൽ ഈ 5 കാര്യങ്ങൾ ശ്രദ്ധിച്ചാൽ പേടിക്കേണ്ട",
          titleEnglish: "Lesson 3: 5 rubber tapping rules - Don't worry if you follow these",
          description: "Learn the 5 essential rules for safe and effective rubber tapping with expert guidance from Sasidharan Kannali",
          duration: "6:35",
          type: "youtube",
          videoUrl: "https://www.youtube.com/embed/o1sc0iVBRT4",
          youtubeUrl: "https://www.youtube.com/embed/o1sc0iVBRT4",
          thumbnailUrl: placeholderThumb,
          completed: false
        },
        {
          id: 4,
          title: "പാഠം 4: റബ്ബർ ടാപ്പിംഗ് - സുരക്ഷാ നടപടികൾ",
          titleEnglish: "Lesson 4: Rubber Tapping - Safety Measures",
          description: "Essential safety guidelines and precautions for safe rubber tapping practices with Sasidharan Kannali",
          duration: "Unknown",
          type: "youtube",
          videoUrl: "https://www.youtube.com/embed/w_XlgbZz1SQ",
          youtubeUrl: "https://www.youtube.com/embed/w_XlgbZz1SQ",
          thumbnailUrl: placeholderThumb,
          completed: false
        },
        {
          id: 5,
          title: "പാഠം 5: റബ്ബർ ടാപ്പിംഗ് - മികച്ച രീതികൾ",
          titleEnglish: "Lesson 5: Rubber Tapping - Best Practices",
          description: "Advanced techniques and best practices for optimal rubber tapping results with expert guidance",
          duration: "Unknown",
          type: "youtube",
          videoUrl: "https://www.youtube.com/embed/TL9Z3QF_2Y0",
          youtubeUrl: "https://www.youtube.com/embed/TL9Z3QF_2Y0",
          thumbnailUrl: placeholderThumb,
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
      price: 0,
      isFree: true,
      videos: [
        {
          id: 1,
          title: "പാഠം 1: തോട്ടം ആസൂത്രണം",
          titleEnglish: "Lesson 1: Plantation Planning",
          description: "Learn how to plan and design efficient rubber plantations",
          duration: "25:00",
          type: "youtube",
          videoUrl: "https://www.youtube.com/embed/CfoAYh7IDXc",
          youtubeUrl: "https://www.youtube.com/embed/CfoAYh7IDXc",
          thumbnailUrl: placeholderThumb,
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
          thumbnailUrl: placeholderThumb,
          completed: false
        },
        {
          id: 3,
          title: "പാഠം 3: റബ്ബർ തോട്ടം മാനേജ്മെന്റ്",
          titleEnglish: "Lesson 3: Rubber Plantation Management",
          description: "Comprehensive guide to managing rubber plantations efficiently",
          duration: "25:00",
          type: "youtube",
          videoUrl: "https://www.youtube.com/embed/CfoAYh7IDXc",
          youtubeUrl: "https://www.youtube.com/embed/CfoAYh7IDXc",
          thumbnailUrl: placeholderThumb,
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
          thumbnailUrl: placeholderThumb,
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
          thumbnailUrl: placeholderThumb,
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

      // If enrolled, fetch enrollment details
      if (enrolled) {
        try {
          const { user } = getUserData();
          const enrollments = await trainingAPI.getUserEnrollments(user.id);
          const currentEnrollmentData = enrollments.enrollments?.find(
            enrollment => enrollment.moduleId === parseInt(moduleId)
          );
          setCurrentEnrollment(currentEnrollmentData);

          // Load completed lessons from enrollment data
          if (currentEnrollmentData && currentEnrollmentData.completedLessons) {
            const completedSet = new Set(currentEnrollmentData.completedLessons);
            setCompletedLessons(completedSet);
            console.log('📚 Loaded completed lessons from backend:', currentEnrollmentData.completedLessons);

            // Also save to localStorage as backup
            const progressKey = `progress_${user.id}_${moduleId}`;
            localStorage.setItem(progressKey, JSON.stringify(currentEnrollmentData.completedLessons));
          } else {
            // Fallback: Load from localStorage if backend data is not available
            console.log('⚠️ No backend progress data found, checking localStorage...');
            const progressKey = `progress_${user.id}_${moduleId}`;
            const savedProgress = localStorage.getItem(progressKey);
            if (savedProgress) {
              try {
                const completedArray = JSON.parse(savedProgress);
                const completedSet = new Set(completedArray);
                setCompletedLessons(completedSet);
                console.log('📚 Loaded completed lessons from localStorage fallback:', completedArray);
              } catch (error) {
                console.error('Error parsing saved progress:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching enrollment details:', error);

          // Fallback: Load from localStorage if API fails
          console.log('⚠️ API failed, checking localStorage for progress...');
          const { user } = getUserData();
          const progressKey = `progress_${user.id}_${moduleId}`;
          const savedProgress = localStorage.getItem(progressKey);
          if (savedProgress) {
            try {
              const completedArray = JSON.parse(savedProgress);
              const completedSet = new Set(completedArray);
              setCompletedLessons(completedSet);
              console.log('📚 Loaded completed lessons from localStorage after API error:', completedArray);
            } catch (parseError) {
              console.error('Error parsing saved progress after API error:', parseError);
            }
          }
        }
      }

      // If not enrolled in a paid course, redirect back to training page
      if (!enrolled && currentModule.isFree === false) {
        console.log('🚫 User not enrolled in paid course, redirecting to training page');
        navigate('/training', { replace: true });
        return;
      }


    };

    checkAndSetEnrollment();
  }, [currentModule, moduleId, navigate]);

  // Calculate progress when completed lessons or module changes
  useEffect(() => {
    if (currentModule && currentModule.videos) {
      const completedCount = completedLessons.size;
      const totalLessons = currentModule.videos.length;
      const newProgress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
      setProgress(newProgress);

      console.log(`📊 Progress calculated: ${completedCount}/${totalLessons} = ${newProgress.toFixed(1)}%`);

      // Check if course is completed and certificate can be generated
      if (newProgress >= 100 && currentEnrollment && !currentEnrollment.certificateIssued) {
        setShowCertificateModal(true);
      }
    }
  }, [completedLessons, currentModule, currentEnrollment?.certificateIssued]);

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

  // Load progress from localStorage on component mount (additional fallback)
  useEffect(() => {
    const { user } = getUserData();
    if (user && moduleId && completedLessons.size === 0) {
      const progressKey = `progress_${user.id}_${moduleId}`;
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        try {
          const completedArray = JSON.parse(savedProgress);
          if (completedArray.length > 0) {
            const completedSet = new Set(completedArray);
            setCompletedLessons(completedSet);
            console.log('🔄 Loaded progress from localStorage on mount:', completedArray);
          }
        } catch (error) {
          console.error('Error parsing saved progress on mount:', error);
        }
      }
    }
  }, [moduleId]); // Only run when moduleId changes

  const markAsCompleted = async (videoId) => {
    const newCompletedLessons = new Set([...completedLessons, videoId]);
    setCompletedLessons(newCompletedLessons);

    const { user } = getUserData();
    const completedArray = Array.from(newCompletedLessons);

    // Always save to localStorage as backup
    const progressKey = `progress_${user.id}_${moduleId}`;
    localStorage.setItem(progressKey, JSON.stringify(completedArray));
    console.log('💾 Progress saved to localStorage:', completedArray);

    // Also update enrollment manager
    const totalLessons = currentModule.videos.length;
    enrollmentManager.updateProgress(user.id, moduleId, completedArray, totalLessons);
    console.log('📊 Progress updated in enrollment manager');

    // Update backend progress if enrolled
    if (currentEnrollment) {
      try {
        const totalLessons = currentModule.videos.length;

        await trainingAPI.updateProgress(currentEnrollment.id, {
          completedLessons: completedArray,
          totalLessons: totalLessons
        });

        console.log('✅ Progress updated in backend');
      } catch (error) {
        console.error('Error updating progress in backend:', error);
        console.log('📝 Progress still saved locally as fallback');
      }
    } else {
      console.log('📝 No enrollment found, progress saved locally only');
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Certificate generation function
  const handleGenerateCertificate = async () => {
    if (!currentEnrollment) {
      console.error('No enrollment data available');
      alert('No enrollment data available. Please refresh the page.');
      return;
    }

    // Check if user has completed the course
    if (progress < 100) {
      alert('⚠️ You must complete 100% of the course to download your certificate.');
      return;
    }

    setIsGeneratingCertificate(true);

    try {
      // Try to generate certificate via API first
      let certificateData = null;
      try {
        const certificateResponse = await certificateAPI.generateCertificate(currentEnrollment.id);
        if (certificateResponse?.success) {
          certificateData = formatCertificateData(currentEnrollment, certificateResponse.certificate);
        }
      } catch (apiError) {
        console.warn('Certificate API call failed, using enrollment data instead:', apiError);
        // Fallback: generate from enrollment data without API
        certificateData = formatCertificateData(currentEnrollment, { id: `CERT-${Date.now()}` });
      }

      if (certificateData) {
        setCertificateData(certificateData);
        
        // Generate and download PDF
        await generateCertificatePDF(certificateData);

        // Update enrollment state to reflect certificate issued
        setCurrentEnrollment(prev => ({
          ...prev,
          certificateIssued: true,
          certificateIssuedDate: new Date()
        }));

        console.log('✅ Certificate generated successfully');
        alert('🎉 Congratulations! Your certificate has been generated and downloaded.');
      } else {
        throw new Error('Failed to format certificate data');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setIsGeneratingCertificate(false);
      setShowCertificateModal(false);
    }
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
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress >= 100 ? 'bg-green-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {Math.round(progress)}% Complete
                  </p>
                  {progress >= 100 && (
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        {currentEnrollment?.certificateIssued ? 'Certificate Issued' : 'Certificate Available'}
                      </span>
                    </div>
                  )}
                </div>
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

      {/* Certificate Generation Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-8 max-w-md mx-4 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 Congratulations!
            </h3>

            <p className="text-gray-600 mb-6">
              You have successfully completed the <strong>{currentModule.title}</strong> course!
              You can now generate and download your certificate.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Later
              </button>
              <button
                onClick={handleGenerateCertificate}
                disabled={isGeneratingCertificate}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGeneratingCertificate ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Generate Certificate</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Certificate Download Button (when course is 100% complete) */}
      {progress >= 100 && (
        <div className="fixed bottom-6 right-6 z-40">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateCertificate}
            disabled={isGeneratingCertificate}
            className={`${isGeneratingCertificate ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center space-x-2`}
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingCertificate ? 'Generating...' : 'Download Certificate'}</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default TrainingModule;
