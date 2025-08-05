import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseAnon } from '../../supabaseClient';
import { useNavigationGuard } from '../../hooks/useNavigationGuard';

export default function AuthCallback() {
  const navigate = useNavigate();

  // Initialize navigation guard
  const { guardedNavigate } = useNavigationGuard({
    preventBackToLogin: true,
    preventBackToHome: false
  });

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Check if this is coming from registration
        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get('source');
        const isFromRegister = source === 'register';

        // Get the session after OAuth redirect
        const { data: { session }, error } = await supabaseAnon.auth.getSession();

        if (error) throw error;
        if (!session?.user) throw new Error('No user session found');

        // Create a Supabase client with the session access token for authenticated requests
        const supabase = createClient(
          supabaseAnon.supabaseUrl,
          supabaseAnon.supabaseKey,
          {
            global: {
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            }
          }
        );

        // Check if user exists in your public.users table
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (fetchError) {
          console.error('Error fetching user:', fetchError);
        }

        // If user doesn't exist, create them
        if (!existingUser || fetchError?.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('users')
            .insert([{
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
              provider: session.app_metadata?.provider || 'email'
            }]);

          if (insertError) {
            console.error('Error inserting user:', insertError);
            throw insertError;
          }
        }

        // Get user role from metadata
        const userRole = session.user.user_metadata?.role ||
                        session.user.raw_user_meta_data?.role ||
                        'farmer'; // default role

        console.log('🔍 Google OAuth user role:', userRole);
        console.log('👤 User metadata:', session.user.user_metadata);
        console.log('📋 Raw metadata:', session.user.raw_user_meta_data);

        // Create user object with role for localStorage
        const userWithRole = {
          ...session.user,
          role: userRole
        };

        // Store session and user data with role
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify(userWithRole));

        // Clear browser history to prevent back navigation to login
        window.history.replaceState(null, '', window.location.pathname);

        // Redirect logic - prioritize registration source
        if (isFromRegister) {
          console.log('🚀 Redirecting to home (from registration)');
          guardedNavigate('/home');
        } else {
          // Redirect based on role for login
          console.log('🎯 Redirecting based on role:', userRole);
          if (userRole === 'admin') {
            console.log('🚀 Redirecting to admin dashboard');
            guardedNavigate('/admin-dashboard');
          } else {
            console.log('🚀 Redirecting to home');
            guardedNavigate('/home');
          }
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { state: { error: 'Authentication failed' } });
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col items-center justify-center">
      <div className="loading-spinner w-16 h-16 mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900">Authenticating...</h2>
      <p className="text-gray-600 mt-2">Please wait while we sign you in</p>
    </div>
  );
}
