import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook to manage navigation control and prevent unauthorized back navigation
 * @param {Object} options - Configuration options
 * @param {boolean} options.preventBackToLogin - Prevent going back to login after authentication
 * @param {boolean} options.preventBackToHome - Prevent going back to home (for admin users)
 * @param {string} options.userRole - Current user role
 * @param {boolean} options.isAuthenticated - Authentication status
 */
export const useNavigationGuard = ({
  preventBackToLogin = false,
  preventBackToHome = false,
  userRole = null,
  isAuthenticated = false
} = {}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data from localStorage
  const getUserData = useCallback(() => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      return {
        user: userData ? JSON.parse(userData) : null,
        token,
        isLoggedIn: !!(userData && token)
      };
    } catch (error) {
      console.error('Error parsing user data:', error);
      return { user: null, token: null, isLoggedIn: false };
    }
  }, []);

  // Handle browser back/forward navigation
  const handlePopState = useCallback((event) => {
    const { user, isLoggedIn } = getUserData();
    const currentPath = window.location.pathname;
    
    

    // Prevent going back to login pages after authentication
    if (preventBackToLogin && isLoggedIn && 
        (currentPath === '/login' || currentPath === '/register' || currentPath === '/forgot-password')) {
      
      event.preventDefault();
      
      // Redirect based on user role
      if (user?.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (user?.role === 'broker') {
        navigate('/broker-dashboard', { replace: true });
      } else if (user?.role === 'staff' && user?.useStaffDashboard) {
        navigate('/staff-dashboard', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
      return;
    }

    // Prevent admin users from going back to home from admin dashboard
    if (preventBackToHome && user?.role === 'admin' && (currentPath === '/' || currentPath === '/home')) {
      
      event.preventDefault();
      navigate('/admin-dashboard', { replace: true });
      return;
    }

    // Additional role-based navigation controls
    if (isLoggedIn && user?.role === 'admin') {
      // Admin users should stay within admin areas or allowed public pages
      const allowedPaths = ['/admin-dashboard', '/profile', '/features', '/training', '/markets', '/about'];
      const isAllowedPath = allowedPaths.some(path => currentPath.startsWith(path));

      if (!isAllowedPath && (currentPath === '/' || currentPath === '/home')) {
        
        navigate('/admin-dashboard', { replace: true });
      }
    }

    // Staff users should only access their dashboard
    if (isLoggedIn && user?.role === 'staff' && user?.useStaffDashboard) {
      // Staff members can only access their dashboard and logout
      const allowedStaffPaths = ['/staff-dashboard', '/login'];
      const isAllowedStaffPath = allowedStaffPaths.some(path => currentPath.startsWith(path));

      if (!isAllowedStaffPath) {
        
        navigate('/staff-dashboard', { replace: true });
      }
    }

    // Broker users should be redirected to broker dashboard from home
    if (isLoggedIn && user?.role === 'broker' && (currentPath === '/' || currentPath === '/home')) {
      
      navigate('/broker-dashboard', { replace: true });
    }
  }, [navigate, preventBackToLogin, preventBackToHome, userRole, getUserData]);

  // Set up navigation guard
  useEffect(() => {
    const { isLoggedIn } = getUserData();
    
    if (isLoggedIn && (preventBackToLogin || preventBackToHome)) {
      
      // Add popstate listener for browser back/forward buttons
      window.addEventListener('popstate', handlePopState);
      
      // Push current state to prevent immediate back navigation
      if (preventBackToLogin) {
        window.history.pushState(null, '', window.location.pathname);
      }
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [handlePopState, preventBackToLogin, preventBackToHome, location.pathname]);

  // Utility function to navigate with proper history management
  const guardedNavigate = useCallback((to, options = {}) => {
    const { user, isLoggedIn } = getUserData();
    
    // If navigating to login pages while authenticated, redirect appropriately
    if (isLoggedIn && (to === '/login' || to === '/register' || to === '/forgot-password')) {
      
      if (user?.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (user?.role === 'broker') {
        navigate('/broker-dashboard', { replace: true });
      } else if (user?.role === 'staff' && user?.useStaffDashboard) {
        navigate('/staff-dashboard', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
      return;
    }
    
    // If admin trying to navigate to home, redirect to dashboard
    if (isLoggedIn && user?.role === 'admin' && (to === '/' || to === '/home')) {
      
      navigate('/admin-dashboard', { replace: true });
      return;
    }

    // If broker trying to navigate to home or farmer routes, redirect to broker dashboard
    if (isLoggedIn && user?.role === 'broker') {
      const farmerRoutes = ['/training', '/nursery', '/markets', '/pricing', '/about', '/careers', '/features'];
      const isFarmerRoute = farmerRoutes.some(route => to.startsWith(route));
      
      if (to === '/' || to === '/home' || isFarmerRoute) {
        console.log('🚫 Broker trying to access farmer route, redirecting to broker dashboard:', to);
        navigate('/broker-dashboard', { replace: true });
        return;
      }
    }

    // If staff trying to navigate anywhere except staff dashboard or logout, redirect to staff dashboard
    if (isLoggedIn && user?.role === 'staff' && user?.useStaffDashboard) {
      const allowedStaffPaths = ['/staff-dashboard', '/login'];
      const isAllowedStaffPath = allowedStaffPaths.some(path => to.startsWith(path));

      if (!isAllowedStaffPath) {
        navigate('/staff-dashboard', { replace: true });
        return;
      }
    }

    // Normal navigation
    navigate(to, { replace: true, ...options });
  }, [navigate, getUserData]);

  // Function to clear navigation history (useful for logout)
  const clearNavigationHistory = useCallback(() => {
    console.log('🧹 Clearing navigation history');
    // Replace current history entry to prevent back navigation
    window.history.replaceState(null, '', '/login');
  }, []);

  return {
    guardedNavigate,
    clearNavigationHistory,
    getUserData
  };
};

export default useNavigationGuard;
