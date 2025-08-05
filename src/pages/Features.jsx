import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cpu,
  BarChart3,
  TrendingUp,
  ShoppingCart,
  GraduationCap,
  Shield,
  Smartphone,
  Cloud,
  Zap,
  Globe,
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useNavigationGuard } from '../hooks/useNavigationGuard';

const Features = () => {
  const navigate = useNavigate();

  // Initialize navigation guard
  const { getUserData } = useNavigationGuard({
    preventBackToLogin: true,
    preventBackToHome: false
  });

  // Check if admin or staff user is trying to access features page
  useEffect(() => {
    const { user, isLoggedIn } = getUserData();
    if (isLoggedIn && user?.role === 'admin') {
      console.log('🚫 Admin user detected on features page, redirecting to dashboard');
      navigate('/admin-dashboard', { replace: true });
    } else if (isLoggedIn && user?.role === 'staff' && user?.useStaffDashboard) {
      console.log('🚫 Staff user detected on features page, redirecting to staff dashboard');
      navigate('/staff-dashboard', { replace: true });
    }
  }, [navigate, getUserData]);
  const mainFeatures = [
    {
      icon: <Cpu className="h-12 w-12" />,
      title: "Smart IoT Monitoring",
      description: "Real-time tracking of plantation health, weather conditions, and latex production with advanced sensor networks.",
      benefits: ["24/7 monitoring", "Weather alerts", "Soil moisture tracking", "Tree health analysis"]
    },
    {
      icon: <BarChart3 className="h-12 w-12" />,
      title: "Yield Analytics",
      description: "Advanced analytics to optimize tapping schedules and maximize rubber yield using machine learning algorithms.",
      benefits: ["Predictive analytics", "Optimal tapping schedules", "Yield forecasting", "Performance insights"]
    },
    {
      icon: <TrendingUp className="h-12 w-12" />,
      title: "Market Intelligence",
      description: "Live rubber prices and market trends to help you sell at the best time and maximize profits.",
      benefits: ["Real-time pricing", "Market trends", "Price alerts", "Trading insights"]
    },
    {
      icon: <ShoppingCart className="h-12 w-12" />,
      title: "Direct Marketplace",
      description: "Connect directly with buyers and eliminate middleman commissions through our integrated marketplace.",
      benefits: ["Direct buyer access", "No middleman fees", "Secure transactions", "Quality verification"]
    },
    {
      icon: <GraduationCap className="h-12 w-12" />,
      title: "Expert Training",
      description: "Access to agricultural experts and modern plantation management techniques through our learning platform.",
      benefits: ["Expert consultations", "Video tutorials", "Best practices", "Certification programs"]
    },
    {
      icon: <Shield className="h-12 w-12" />,
      title: "Quality Assurance",
      description: "Ensure premium rubber quality with our testing and certification services for better market prices.",
      benefits: ["Quality testing", "Certification", "Grade verification", "Premium pricing"]
    }
  ];

  const additionalFeatures = [
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile App",
      description: "Access all features on-the-go with our intuitive mobile application."
    },
    {
      icon: <Cloud className="h-8 w-8" />,
      title: "Cloud Storage",
      description: "Secure cloud storage for all your plantation data and historical records."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-time Alerts",
      description: "Instant notifications for critical events and optimal harvesting times."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Network",
      description: "Connect with rubber farmers and buyers from around the world."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Support",
      description: "Join a community of farmers sharing knowledge and best practices."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-accent-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover how RubberEco's comprehensive suite of tools can transform your 
              rubber plantation management and boost your profitability.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Core Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage your plantation efficiently</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start space-x-6">
                  <div className="text-primary-500 bg-primary-50 p-3 rounded-xl">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary-500" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Additional Benefits</h2>
            <p className="text-xl text-gray-600">More ways we help you succeed</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-primary-500 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to get started</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Sign Up & Setup",
                description: "Create your account and configure your plantation details in minutes."
              },
              {
                step: "02", 
                title: "Install Sensors",
                description: "Deploy our IoT sensors across your plantation for comprehensive monitoring."
              },
              {
                step: "03",
                title: "Start Optimizing",
                description: "Use our analytics and recommendations to improve your plantation's performance."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Experience These Features?</h2>
            <p className="text-xl mb-8 opacity-90">
              Start your free trial today and see the difference RubberEco can make
            </p>
            <Link to="/register">
              <motion.button 
                className="bg-white text-primary-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 inline-flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold">RubberEco</span>
            </div>
            <p className="text-gray-400 mb-4">Digital solutions for modern rubber plantations.</p>
            <p className="text-gray-500">&copy; 2024 RubberEco. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;
