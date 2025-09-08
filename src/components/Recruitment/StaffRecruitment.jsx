import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  TreePine,
  Award,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Target,
  Briefcase
} from 'lucide-react';

const StaffRecruitment = ({ darkMode = false }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  const positions = [
    {
      title: "Field Tapping Specialist",
      icon: TreePine,
      description: "Expert rubber tappers with 2+ years experience",
      requirements: ["Professional tapping skills", "Early morning availability", "Physical fitness"],
      salary: "₹25,000 - ₹35,000/month",
      location: "Kerala Districts",
      type: "Full-time",
      urgent: true
    },
    {
      title: "Quality Control Inspector",
      icon: Award,
      description: "Ensure latex quality and collection standards",
      requirements: ["Quality assessment skills", "Attention to detail", "Basic education"],
      salary: "₹20,000 - ₹28,000/month",
      location: "Processing Centers",
      type: "Full-time",
      urgent: true
    },
    {
      title: "Trainer",
      icon: Users,
      description: "Train staff and farmers on best practices and techniques",
      requirements: ["Teaching skills", "Technical expertise", "Communication skills"],
      salary: "₹35,000 - ₹45,000/month",
      location: "Training Centers",
      type: "Full-time",
      urgent: true
    },
    {
      title: "Collection Supervisor",
      icon: Target,
      description: "Supervise latex collection and transportation",
      requirements: ["Leadership skills", "Logistics experience", "Team management"],
      salary: "₹30,000 - ₹40,000/month",
      location: "Multiple Locations",
      type: "Full-time",
      urgent: true
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Competitive Salary",
      description: "Above-market rates with performance bonuses"
    },
    {
      icon: Shield,
      title: "Health Insurance",
      description: "Comprehensive medical coverage for you and family"
    },
    {
      icon: Clock,
      title: "Flexible Hours",
      description: "Work-life balance with flexible scheduling"
    },
    {
      icon: Award,
      title: "Skill Development",
      description: "Regular training and certification programs"
    },
    {
      icon: Heart,
      title: "Job Security",
      description: "Stable employment with growth opportunities"
    },
    {
      icon: Zap,
      title: "Modern Tools",
      description: "Latest equipment and technology support"
    }
  ];



  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-green-800"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>

        {/* Background Pattern Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mt-48"></div>
        <div className="absolute top-20 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-yellow-400 opacity-20 rounded-full"></div>
        <div className="absolute bottom-10 right-1/3 w-24 h-24 bg-white opacity-15 rounded-full"></div>
        <div className="absolute top-1/2 left-0 w-16 h-16 bg-green-300 opacity-30 rounded-full -ml-8"></div>
        <div className="absolute top-1/3 right-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>

        {/* Geometric Shapes */}
        <div className="absolute top-16 left-16 w-8 h-8 bg-yellow-400 opacity-40 transform rotate-45"></div>
        <div className="absolute bottom-20 right-20 w-6 h-6 bg-white opacity-30 transform rotate-12"></div>
        <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-green-300 opacity-50 rounded-full"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Work With Us - Good Jobs Available!
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
              Join Kerala's best rubber company. Good salary, benefits, and secure jobs.
              Help farmers while building your future.
            </p>
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/join-as-staff')}
                className="px-8 py-4 bg-white text-green-700 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Briefcase className="h-5 w-5" />
                <span>Apply Now</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Why Choose RubberEco?
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              We offer good jobs with fair pay, benefits, and respect. Join our team and grow with us.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full mr-4">
                    <benefit.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {benefit.title}
                  </h3>
                </div>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Open Positions Section */}
      <div className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Jobs Available Now
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Find the right job for you. Good pay, steady work, and opportunities to learn and grow.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {positions.map((position, index) => (
              <motion.div
                key={position.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} relative overflow-hidden`}
              >
                {position.urgent && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      URGENT
                    </span>
                  </div>
                )}
                
                <div className="flex items-start mb-6">
                  <div className="p-4 bg-green-100 rounded-full mr-6">
                    <position.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {position.title}
                    </h3>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                      {position.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {position.salary}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-green-600 mr-2" />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {position.location}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-green-600 mr-2" />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {position.type}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Requirements:
                    </h4>
                    <ul className="space-y-1">
                      {position.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {req}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/join-as-staff')}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2024 RubberEco. All rights reserved. Empowering sustainable rubber farming.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StaffRecruitment;
