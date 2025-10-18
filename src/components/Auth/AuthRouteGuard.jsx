import { useEffect } from 'react';
import { useNavigationGuard } from '../../hooks/useNavigationGuard';

// Global guard to prevent navigating back to login when authenticated
export default function AuthRouteGuard() {
  // We rely on the hook's internal user detection (localStorage)
  useNavigationGuard({
    preventBackToLogin: true,
    preventBackToHome: false
  });

  // This component doesn't render any UI
  return null;
}
