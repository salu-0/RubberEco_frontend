import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useNavigationGuard } from '../../hooks/useNavigationGuard';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  // Initialize navigation guard
  const { getUserData } = useNavigationGuard({
    preventBackToLogin: true,
    preventBackToHome: userRole === 'admin',
    userRole: userRole,
    isAuthenticated: isAuthenticated === true
  });

  useEffect(() => {
    const checkAuth = async () => {
      // Check for JWT token (MongoDB login)
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setUserRole(user.role);

          // Check role-based access if required
          if (requiredRole && user.role !== requiredRole) {
            setIsAuthenticated(false);
            return;
          }

          setIsAuthenticated(true);
          return;
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }

      // Check for Supabase session (Google OAuth)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // For Supabase users, we might need to fetch role from user metadata
        const role = session.user?.user_metadata?.role || 'user';
        setUserRole(role);

        // Check role-based access if required
        if (requiredRole && role !== requiredRole) {
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);
        return;
      }

      setIsAuthenticated(false);
    };
    checkAuth();
  }, [requiredRole]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🚫 Redirecting to login from protected route:', location.pathname);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role-based redirection for authenticated users
  if (isAuthenticated && userRole) {
    // If admin is trying to access non-admin routes, redirect to dashboard
    if (userRole === 'admin' && location.pathname === '/profile') {
      console.log('🔄 Redirecting admin to dashboard from profile');
      return <Navigate to="/admin-dashboard" replace />;
    }

    // If non-admin is trying to access admin routes
    if (userRole !== 'admin' && location.pathname.startsWith('/admin')) {
      console.log('🚫 Non-admin user trying to access admin route');
      return <Navigate to="/home" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;