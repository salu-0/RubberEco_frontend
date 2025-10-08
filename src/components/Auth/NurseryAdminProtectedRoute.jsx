import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const NurseryAdminProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // Check for nursery admin token
      const nurseryAdminToken = localStorage.getItem('nurseryAdminToken');
      const nurseryAdminUser = localStorage.getItem('nurseryAdminUser');

      if (nurseryAdminToken && nurseryAdminUser) {
        try {
          const user = JSON.parse(nurseryAdminUser);
          setUserRole('nursery_admin');
          setIsAuthenticated(true);
          return;
        } catch (error) {
          console.error('Error parsing nursery admin user data:', error);
          localStorage.removeItem('nurseryAdminUser');
          localStorage.removeItem('nurseryAdminToken');
        }
      }

      // Check for regular user token (prevent regular users from accessing nursery admin routes)
      const regularToken = localStorage.getItem('token');
      const regularUser = localStorage.getItem('user');

      if (regularToken && regularUser) {
        try {
          const user = JSON.parse(regularUser);
          setUserRole(user.role);
          // If regular user tries to access nursery admin routes, redirect them
          setIsAuthenticated(false);
          return;
        } catch (error) {
          console.error('Error parsing regular user data:', error);
        }
      }

      setIsAuthenticated(false);
    };
    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying nursery admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to nursery admin login if not authenticated as nursery admin
  if (!isAuthenticated) {
    console.log('🚫 Redirecting to nursery admin login from:', location.pathname);
    return <Navigate to="/nursery-admin/login" replace state={{ from: location }} />;
  }

  // If authenticated as nursery admin, allow access
  if (isAuthenticated && userRole === 'nursery_admin') {
    return children;
  }

  // Fallback redirect
  return <Navigate to="/nursery-admin/login" replace />;
};

export default NurseryAdminProtectedRoute;
