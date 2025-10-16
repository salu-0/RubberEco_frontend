import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  TreePine, 
  Award, 
  ArrowRight,
  Briefcase,
  Star,
  DollarSign
} from 'lucide-react';

import { useTranslation } from 'react-i18next';

const RecruitmentBanner = ({ darkMode = false, compact = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const catchyQuotes = [
    t('recruitment.catchy1'),
    t('recruitment.catchy2'),
    t('recruitment.catchy3'),
    t('recruitment.catchy4'),
    t('recruitment.catchy5')
  ];

  const quickStats = [
    { icon: Users, label: t('recruitment.stats.happyEmployees'), value: "500+" },
    { icon: Award, label: t('recruitment.stats.industryLeader'), value: "#1" },
    { icon: DollarSign, label: t('recruitment.stats.competitivePay'), value: "₹35K+" },
    { icon: Star, label: t('recruitment.stats.employeeRating'), value: "4.8/5" }
  ];

  const urgentPositions = [
    t('recruitment.positions.fieldTappingSpecialists'),
    t('recruitment.positions.qualityControlInspectors'),
    t('recruitment.positions.trainers'),
    t('recruitment.positions.collectionSupervisors')
  ];

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${darkMode ? 'bg-gradient-to-r from-green-800 to-green-900' : 'bg-gradient-to-r from-green-600 to-green-700'} rounded-2xl p-6 shadow-lg border-2 border-green-500 relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Briefcase className="h-5 w-5 text-green-200 mr-2" />
                <span className="text-green-200 text-sm font-medium">{t('recruitment.nowHiring')}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t('recruitment.workWithUs')}
              </h3>
              <p className="text-green-100 text-sm mb-3">
                {t('recruitment.greatOpportunities')}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {urgentPositions.slice(0, 2).map((position, index) => (
                  <span key={index} className="px-2 py-1 bg-white bg-opacity-20 text-white text-xs rounded-full">
                    {position}
                  </span>
                ))}
                <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs rounded-full font-semibold">
                  +2 More
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/join-as-staff')}
              className="px-6 py-3 bg-white text-green-700 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            >
              <span>{t('recruitment.applyNow')}</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-3xl shadow-2xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
    >
      {/* Header with animated background */}
      <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-8">
        <div className="absolute inset-0 bg-black opacity-10"></div>

        {/* Enhanced Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-yellow-400 opacity-15 rounded-full"></div>
        <div className="absolute bottom-4 right-1/3 w-16 h-16 bg-white opacity-20 rounded-full"></div>
        <div className="absolute top-8 left-8 w-12 h-12 bg-green-300 opacity-25 rounded-full"></div>

        {/* Geometric decorations */}
        <div className="absolute top-6 right-1/4 w-6 h-6 bg-yellow-400 opacity-40 transform rotate-45"></div>
        <div className="absolute bottom-8 left-1/3 w-4 h-4 bg-white opacity-30 transform rotate-12"></div>
        <div className="absolute top-1/3 right-8 w-8 h-8 bg-green-200 opacity-30 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{t('recruitment.title')}</h2>
                <p className="text-green-100">{t('recruitment.subtitle')}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold">
                {t('recruitment.urgentOpenings')}
              </div>
            </div>
          </div>

          {/* Catchy Quote Carousel */}
          <div className="mb-6">
            <motion.p
              key={catchyQuotes[0]}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl text-white font-medium"
            >
              {catchyQuotes[0]}
            </motion.p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="h-6 w-6 text-green-200" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-green-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Positions */}
          <div>
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🔥 {t('recruitment.jobsAvailableNow')}
            </h3>
            <div className="space-y-3">
              {urgentPositions.map((position, index) => (
                <motion.div
                  key={position}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="flex items-center">
                    <TreePine className="h-5 w-5 text-green-600 mr-3" />
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {position}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    {t('recruitment.urgent')}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column - Benefits */}
          <div>
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💎 {t('recruitment.whyChooseUs')}
            </h3>
            <div className="space-y-4">
              {[
                t('recruitment.benefits.b1'),
                t('recruitment.benefits.b2'),
                t('recruitment.benefits.b3'),
                t('recruitment.benefits.b4'),
                t('recruitment.benefits.b5'),
                t('recruitment.benefits.b6')
              ].map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/join-as-staff')}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Briefcase className="h-5 w-5" />
              <span>{t('recruitment.applyNowQuick')}</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/careers')}
              className={`px-8 py-4 border-2 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} font-semibold rounded-full transition-all duration-300`}
            >
              {t('recruitment.learnMoreCareers')}
            </motion.button>
          </div>
          <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('recruitment.joinTagline')}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default RecruitmentBanner;
