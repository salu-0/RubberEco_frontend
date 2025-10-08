import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import {
  Menu,
  X,
  Leaf,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useNavigationGuard } from '../hooks/useNavigationGuard';

const Navbar = ({ transparent = false, fixed = true }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useCart() || { items: [] };

  // Initialize navigation guard
  const { clearNavigationHistory } = useNavigationGuard();

  // Profile image storage utilities
  const getProfileImageKey = (userId) => `profile_image_${userId}`;
  const getProfileImage = (userId) => {
    return localStorage.getItem(getProfileImageKey(userId));
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    if (transparent) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [transparent]);

  // Check for logged in user
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);

      // Load profile image from separate storage
      const savedProfileImage = getProfileImage(parsedUser.id || parsedUser._id);
      if (savedProfileImage) {
        parsedUser.profileImage = savedProfileImage;
      }

      setUser(parsedUser);
    }
  }, [location]);

  // Listen for storage changes to update user data (including profile image)
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);

        // Load profile image from separate storage
        const savedProfileImage = getProfileImage(parsedUser.id || parsedUser._id);
        if (savedProfileImage) {
          parsedUser.profileImage = savedProfileImage;
        }

        setUser(parsedUser);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Dynamic nav items based on user role
  const getNavItems = () => {
    // Staff members should only see their dashboard
    if (user?.role === 'staff' && user?.useStaffDashboard) {
      return [{ name: 'Staff Dashboard', path: '/staff-dashboard' }];
    }

    // Admin users get limited navigation
    if (user?.role === 'admin') {
      return [{ name: 'Admin Dashboard', path: '/admin-dashboard' }];
    }

    // Regular users and non-authenticated users get full navigation
    const baseItems = [
      { name: t('navigation.home'), path: '/' },
      { name: t('navigation.features'), path: '/', scrollTo: 'features' },
      { name: t('navigation.training'), path: '/training' },
      { name: t('navigation.markets'), path: '/markets' },
      { name: t('navigation.nursery'), path: '/nursery' },
      { name: t('navigation.shop'), path: '/shop' }
    ];

    return baseItems;
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    // Clear all authentication tokens and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('nurseryAdminToken');
    localStorage.removeItem('nurseryAdminUser');
    setUser(null);
    setShowUserMenu(false);

    // Clear navigation history and redirect to login
    clearNavigationHistory();
    window.history.replaceState(null, '', '/login');
    navigate('/login', { replace: true });
  };

  const handleNavClick = (item, e) => {
    // Handle in-page scroll for features even when coming from other routes
    if (item.scrollTo) {
      e.preventDefault();
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(item.scrollTo);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 350);
      } else {
        const element = document.getElementById(item.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
    // For mobile menu, close it
    setIsOpen(false);
  };

  const getNavClasses = () => {
    if (transparent && !scrolled) {
      return 'bg-white/90 backdrop-blur-md shadow-sm';
    }
    return 'bg-white/95 backdrop-blur-md shadow-lg';
  };

  const getTextClasses = () => {
    if (transparent && !scrolled) {
      return 'text-gray-700';
    }
    return 'text-gray-700';
  };

  const getHoverClasses = () => {
    if (transparent && !scrolled) {
      return 'hover:text-primary-600';
    }
    return 'hover:text-primary-600';
  };

  return (
    <motion.nav 
      className={`${fixed ? 'fixed' : 'relative'} top-0 w-full z-50 transition-all duration-300 ${getNavClasses()}`}
      initial={fixed ? { y: -100 } : { opacity: 0 }}
      animate={fixed ? { y: 0 } : { opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2 pr-1 md:pr-2"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className={`text-2xl font-bold transition-colors ${
                transparent && !scrolled
                  ? 'bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent'
              }`}>
                RubberEco
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 ml-3 lg:ml-6">
            {navItems.map((item) => (
              <motion.div key={item.name}>
                <Link
                  to={item.path}
                  onClick={(e) => handleNavClick(item, e)}
                  className={`font-medium transition-all duration-300 relative group ${
                    item.highlight
                      ? item.color === 'orange'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full hover:shadow-lg hover:scale-105 transform hover:from-orange-600 hover:to-orange-700'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:shadow-lg hover:scale-105 transform'
                      : `${getTextClasses()} ${getHoverClasses()}`
                  }`}
                >
                  {item.name}
                  {!item.highlight && (
                    <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                      transparent && !scrolled ? 'bg-primary-600' : 'bg-primary-600'
                    }`}></span>
                  )}
                </Link>
              </motion.div>
            ))}
            {user && (
              <Link to="/cart" className={`relative font-medium ${getTextClasses()} ${getHoverClasses()}`}>
                {t('navigation.cart')}
                {items?.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center text-xs px-1.5 min-w-5 h-5 rounded-full bg-indigo-600 text-white">{items.length}</span>
                )}
              </Link>
            )}
            {location.pathname !== '/login' && location.pathname !== '/register' && (
              <div className="ml-4">
                <LanguageSelector variant="dropdown" size="small" />
              </div>
            )}
            
            {/* Auth Buttons / User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                /* User Menu */
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/30 transition-all duration-300 max-w-[220px]"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <span className="text-gray-700 font-medium hidden sm:block whitespace-nowrap truncate max-w-[120px]">{user.name}</span>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                /* Login Button */
                location.pathname !== '/login' && (
                  <Link to="/login">
                    <motion.button
                      className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                        transparent && !scrolled
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg'
                          : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t('navigation.login')}
                    </motion.button>
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden ml-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`transition-colors ${getTextClasses()} ${getHoverClasses()}`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div 
            className="md:hidden py-4 bg-white rounded-lg shadow-lg mt-2 border border-gray-100"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-4 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`font-medium transition-all duration-300 py-2 ${
                    item.highlight
                      ? item.color === 'orange'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full text-center hover:shadow-lg transform hover:scale-105 hover:from-orange-600 hover:to-orange-700'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full text-center hover:shadow-lg transform hover:scale-105'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                  onClick={(e) => handleNavClick(item, e)}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <Link to="/cart" onClick={() => setIsOpen(false)} className="font-medium text-gray-700 hover:text-primary-600 py-2">{t('navigation.cart')} {items?.length ? `(${items.length})` : ''}</Link>
              )}
              {location.pathname !== '/login' && location.pathname !== '/register' && (
                <div className="pt-2">
                  <LanguageSelector variant="dropdown" size="small" />
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4 space-y-3">
                {user ? (
                  /* Mobile User Menu */
                  <>
                    <div className="flex items-center space-x-3 px-2 py-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.name ? user.name.charAt(0).toUpperCase() : 'U'
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{user.role?.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors py-2"
                    >
                      <User className="h-4 w-4" />
                        <span>{t('navigation.profile')}</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors py-2 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('navigation.logout')}</span>
                    </button>
                  </>
                ) : (
                  /* Mobile Login Button */
                  location.pathname !== '/login' && (
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <button className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-full font-medium">
                        {t('navigation.login')}
                      </button>
                    </Link>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
