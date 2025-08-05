
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Leaf, TreePine, Droplets, Sun, Wind, Sparkles, ArrowRight,
  Mail, Phone, MapPin, Globe, Share2, MessageCircle, Network,
  Clock, Users, Award, TrendingUp
} from 'lucide-react';
import Navbar from '../components/Navbar';
import plantImage from '../assets/images/img6.jpeg';
import { useNavigationGuard } from '../hooks/useNavigationGuard';

// Import gallery images
import img1 from '../assets/images/img1.jpeg';
import img2 from '../assets/images/img2.jpeg';
import img3 from '../assets/images/img3.jpeg';
import img4 from '../assets/images/img4.jpeg';
import img5 from '../assets/images/img5.jpeg';
import img7 from '../assets/images/img7.jpeg';










const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={plantImage}
          alt="Sustainable plantation background"
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 to-accent-900/30"></div>
      </div>

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Animated Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Leaves */}
        <motion.div
          className="absolute top-1/4 left-1/4 text-green-300/30"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Leaf className="w-8 h-8" />
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-1/4 text-green-400/25"
          animate={{
            y: [0, 15, 0],
            x: [0, -8, 0],
            rotate: [0, -15, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <TreePine className="w-10 h-10" />
        </motion.div>

        <motion.div
          className="absolute bottom-1/3 left-1/6 text-blue-300/30"
          animate={{
            y: [0, -25, 0],
            x: [0, 12, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          <Droplets className="w-6 h-6" />
        </motion.div>

        <motion.div
          className="absolute top-1/2 right-1/6 text-yellow-300/25"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Sun className="w-12 h-12" />
        </motion.div>

        <motion.div
          className="absolute bottom-1/4 right-1/3 text-gray-300/20"
          animate={{
            x: [0, 20, 0],
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <Wind className="w-8 h-8" />
        </motion.div>

        {/* Additional floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 border border-white/30"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-4 h-4 mr-2" />
              </motion.div>
              AI-Powered Plantation Management
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              <motion.span
                className="block bg-gradient-to-r from-primary-300 via-primary-200 to-primary-100 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                Transform
              </motion.span>
              <motion.span
                className="block text-white"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                Your Rubber
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-accent-300 to-accent-200 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                Plantation
              </motion.span>
            </h1>

            <motion.p
              className="text-xl text-gray-200 mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 1 }}
            >
              Maximize yield, optimize operations, and increase profitability with our
              cutting-edge digital platform designed specifically for rubber plantation management.
            </motion.p>

            {/* Animated CTA Button */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  y: [0, -5, 0]
                }}
                transition={{
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                Get Started Today
              </motion.button>
            </motion.div>




          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const navigate = useNavigate();

  // Initialize navigation guard to redirect admin users
  const { getUserData } = useNavigationGuard({
    preventBackToLogin: true,
    preventBackToHome: false
  });

  // Check if admin or staff user is trying to access home page
  useEffect(() => {
    const { user, isLoggedIn } = getUserData();
    if (isLoggedIn && user?.role === 'admin') {
      console.log('🚫 Admin user detected on home page, redirecting to dashboard');
      navigate('/admin-dashboard', { replace: true });
    } else if (isLoggedIn && user?.role === 'staff' && user?.useStaffDashboard) {
      console.log('🚫 Staff user detected on home page, redirecting to staff dashboard');
      navigate('/staff-dashboard', { replace: true });
    }
  }, [navigate, getUserData]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar transparent={true} />
      <Hero />

      {/* Key Features Section */}
      <section id="features" className="relative py-20 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          {/* Animated gradient orbs */}
          <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-primary-200 to-primary-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-accent-200 to-accent-300 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-secondary-200 to-secondary-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

          {/* Floating geometric shapes */}
          <div className="absolute top-32 right-1/4 w-16 h-16 border-2 border-primary-200 rounded-lg rotate-45 opacity-20 animate-spin-slow"></div>
          <div className="absolute bottom-40 left-1/4 w-12 h-12 border-2 border-accent-200 rounded-full opacity-25 animate-bounce-slow"></div>

          {/* Floating sparkles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-primary-300/40"
              style={{
                left: `${15 + i * 12}%`,
                top: `${20 + (i % 3) * 25}%`
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.7
              }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🌿 RubberEco Key Features
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive platform connecting all stakeholders in the rubber industry
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <motion.div
              className="relative group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
            >
              {/* Gradient glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 scale-110"></div>

              <div className="flex items-start space-x-4">
                <motion.div
                  className="text-4xl bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl text-white shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  🧑‍🌾
                </motion.div>
                <div className="flex-1">
                  <motion.h3
                    className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    1. Integrated Service System
                  </motion.h3>
                  <motion.p
                    className="text-gray-700 mb-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    One-stop platform for farmers, staff, brokers, and admins.
                  </motion.p>
                  <motion.p
                    className="text-gray-600"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Connects all stakeholders for efficient communication and coordination.
                  </motion.p>

                  {/* Hover arrow */}
                  <motion.div
                    className="mt-4 flex items-center text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: -10 }}
                    whileInView={{ x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className="text-sm font-medium mr-2">Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="relative group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.05,
                rotateY: -5,
                transition: { duration: 0.3 }
              }}
            >
              {/* Gradient glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 scale-110"></div>

              <div className="flex items-start space-x-4">
                <motion.div
                  className="text-4xl bg-gradient-to-br from-accent-500 to-accent-600 p-3 rounded-xl text-white shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  📅
                </motion.div>
                <div className="flex-1">
                  <motion.h3
                    className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-accent-600 transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    2. Tapping & Collection Management
                  </motion.h3>
                  <motion.p
                    className="text-gray-700 mb-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Farmers can request tapping services.
                  </motion.p>
                  <motion.p
                    className="text-gray-600"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Staff can assign rubber tappers and update latex/sheet collection in real-time.
                  </motion.p>

                  {/* Hover arrow */}
                  <motion.div
                    className="mt-4 flex items-center text-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: -10 }}
                    whileInView={{ x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <span className="text-sm font-medium mr-2">Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="relative group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
            >
              {/* Gradient glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 scale-110"></div>

              <div className="flex items-start space-x-4">
                <motion.div
                  className="text-4xl bg-gradient-to-br from-secondary-500 to-secondary-600 p-3 rounded-xl text-white shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  📈
                </motion.div>
                <div className="flex-1">
                  <motion.h3
                    className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-secondary-600 transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    3. Market Price & Training Info
                  </motion.h3>
                  <motion.p
                    className="text-gray-700 mb-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Farmers can view daily updated market prices.
                  </motion.p>
                  <motion.p
                    className="text-gray-600"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    Offers registration and certification for tapping training programs.
                  </motion.p>

                  {/* Hover arrow */}
                  <motion.div
                    className="mt-4 flex items-center text-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: -10 }}
                    whileInView={{ x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <span className="text-sm font-medium mr-2">Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              className="relative group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.05,
                rotateY: -5,
                transition: { duration: 0.3 }
              }}
            >
              {/* Gradient glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 scale-110"></div>

              <div className="flex items-start space-x-4">
                <motion.div
                  className="text-4xl bg-gradient-to-br from-primary-500 to-accent-500 p-3 rounded-xl text-white shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  🧑‍🔧
                </motion.div>
                <div className="flex-1">
                  <motion.h3
                    className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    4. Smart Skilled Worker Requests
                  </motion.h3>
                  <motion.p
                    className="text-gray-700 mb-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    Request services like fertilizer application or rain guard installation.
                  </motion.p>
                  <motion.p
                    className="text-gray-600"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    Skilled workers are assigned automatically based on availability and region.
                  </motion.p>

                  {/* Hover arrow */}
                  <motion.div
                    className="mt-4 flex items-center text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: -10 }}
                    whileInView={{ x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <span className="text-sm font-medium mr-2">Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🌿 Our Plantation Gallery
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore the beauty and efficiency of modern rubber plantation management through our comprehensive visual showcase
            </p>
          </motion.div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gallery Item 1 */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                <img
                  src={img1}
                  alt="Rubber plantation landscape"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">Plantation Overview</h3>
                  <p className="text-sm opacity-90">Modern rubber tree cultivation</p>
                </div>
              </div>
            </motion.div>

            {/* Gallery Item 2 */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                <img
                  src={img2}
                  alt="Rubber tapping process"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">Tapping Excellence</h3>
                  <p className="text-sm opacity-90">Professional latex collection</p>
                </div>
              </div>
            </motion.div>

            {/* Gallery Item 3 */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                <img
                  src={img3}
                  alt="Sustainable farming practices"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">Sustainable Practices</h3>
                  <p className="text-sm opacity-90">Eco-friendly cultivation methods</p>
                </div>
              </div>
            </motion.div>

            {/* Gallery Item 4 */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                <img
                  src={img4}
                  alt="Technology integration"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">Smart Technology</h3>
                  <p className="text-sm opacity-90">AI-powered management systems</p>
                </div>
              </div>
            </motion.div>

            {/* Gallery Item 5 */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                <img
                  src={img5}
                  alt="Quality processing"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">Quality Processing</h3>
                  <p className="text-sm opacity-90">Premium latex refinement</p>
                </div>
              </div>
            </motion.div>

            {/* Gallery Item 6 */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                <img
                  src={img7}
                  alt="Community impact"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">Community Impact</h3>
                  <p className="text-sm opacity-90">Empowering local farmers</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Gallery Stats */}
          <motion.div
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <motion.div
                className="text-3xl font-bold text-primary-600 mb-2"
                whileHover={{ scale: 1.1 }}
              >
                500+
              </motion.div>
              <p className="text-gray-600">Plantations Managed</p>
            </div>
            <div className="text-center">
              <motion.div
                className="text-3xl font-bold text-accent-600 mb-2"
                whileHover={{ scale: 1.1 }}
              >
                10K+
              </motion.div>
              <p className="text-gray-600">Trees Monitored</p>
            </div>
            <div className="text-center">
              <motion.div
                className="text-3xl font-bold text-secondary-600 mb-2"
                whileHover={{ scale: 1.1 }}
              >
                95%
              </motion.div>
              <p className="text-gray-600">Efficiency Rate</p>
            </div>
            <div className="text-center">
              <motion.div
                className="text-3xl font-bold text-primary-600 mb-2"
                whileHover={{ scale: 1.1 }}
              >
                24/7
              </motion.div>
              <p className="text-gray-600">Monitoring</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-300">
              Ready to revolutionize your rubber plantation management? Contact us today!
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-8">Contact Information</h3>

              <div className="space-y-6">
                <motion.div
                  className="flex items-center space-x-4"
                  whileHover={{ scale: 1.05, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-primary-500 p-3 rounded-lg">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-gray-300">info@rubbereco.com</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-4"
                  whileHover={{ scale: 1.05, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-accent-500 p-3 rounded-lg">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-gray-300">+1 (555) 123-4567</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-4"
                  whileHover={{ scale: 1.05, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-secondary-500 p-3 rounded-lg">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-gray-300">123 Plantation Ave, Rubber City, RC 12345</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-4"
                  whileHover={{ scale: 1.05, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-primary-600 p-3 rounded-lg">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Business Hours</p>
                    <p className="text-gray-300">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Contact Stats */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-8">Why Choose RubberEco?</h3>

              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Users className="w-8 h-8 mx-auto mb-3 text-primary-400" />
                  <p className="text-2xl font-bold">1000+</p>
                  <p className="text-gray-300">Active Users</p>
                </motion.div>

                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Award className="w-8 h-8 mx-auto mb-3 text-accent-400" />
                  <p className="text-2xl font-bold">99%</p>
                  <p className="text-gray-300">Satisfaction</p>
                </motion.div>

                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <TrendingUp className="w-8 h-8 mx-auto mb-3 text-secondary-400" />
                  <p className="text-2xl font-bold">35%</p>
                  <p className="text-gray-300">Yield Increase</p>
                </motion.div>

                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Clock className="w-8 h-8 mx-auto mb-3 text-primary-400" />
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-gray-300">Support</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-16">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
              {/* Company Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-lg">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-bold">RubberEco</span>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Revolutionizing rubber plantation management with AI-powered solutions
                  that connect farmers, workers, brokers, and administrators.
                </p>
                <div className="flex space-x-4">
                  <motion.a
                    href="#"
                    className="bg-gray-800 p-2 rounded-lg hover:bg-primary-500 transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Globe className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href="#"
                    className="bg-gray-800 p-2 rounded-lg hover:bg-primary-500 transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href="#"
                    className="bg-gray-800 p-2 rounded-lg hover:bg-primary-500 transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href="#"
                    className="bg-gray-800 p-2 rounded-lg hover:bg-primary-500 transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Network className="w-5 h-5" />
                  </motion.a>
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
                <ul className="space-y-3">
                  {['Home', 'Features', 'About', 'Pricing', 'Contact'].map((item, index) => (
                    <motion.li key={item}>
                      <a
                        href={`#${item.toLowerCase()}`}
                        className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                      >
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {item}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold mb-6">Services</h3>
                <ul className="space-y-3">
                  {[
                    'Plantation Management',
                    'Tapping Services',
                    'Market Analytics',
                    'Training Programs',
                    'Broker Network',
                    'AI Predictions'
                  ].map((service, index) => (
                    <motion.li key={service}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                      >
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {service}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-primary-400 mt-1" />
                    <div>
                      <p className="text-gray-400">info@rubbereco.com</p>
                      <p className="text-gray-400">support@rubbereco.com</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-primary-400 mt-1" />
                    <div>
                      <p className="text-gray-400">+1 (555) 123-4567</p>
                      <p className="text-gray-400">+1 (555) 987-6543</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-primary-400 mt-1" />
                    <p className="text-gray-400">
                      123 Plantation Avenue<br />
                      Rubber City, RC 12345<br />
                      United States
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-800 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <motion.p
                className="text-gray-400 text-sm mb-4 md:mb-0"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                © 2024 RubberEco. All rights reserved. Empowering sustainable rubber farming.
              </motion.p>
              <motion.div
                className="flex space-x-6 text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Cookie Policy
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
