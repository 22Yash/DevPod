import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      if (error) {
        console.error('GitHub OAuth error:', error, errorDescription);
        alert(`Authentication failed: ${errorDescription || error}`);
        navigate('/');
        return;
      }

      if (!code) {
        console.error('No authorization code found in callback URL');
        alert('Authentication failed: No authorization code received from GitHub');
        navigate('/');
        return;
      }

      try {
        console.log('🔄 Exchanging authorization code for user data...');

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/github`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ code })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Authentication failed:', response.status, errorData);
          throw new Error(errorData.error || `Authentication failed (${response.status})`);
        }

        const data = await response.json();

        if (!data.success || !data.user) {
          console.error('Authentication failed:', data.error || 'No user data received');
          throw new Error(data.error || 'Authentication failed - no user data');
        }

        console.log('✅ Authentication successful:', data.user?.login);

        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');

        console.log('🎉 Welcome,', data.user?.name || data.user?.login);

        navigate('/dashboard');
      } catch (error) {
        console.error('❌ Error during authentication:', error.message);

        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');

        const errorMessage = error.message.includes('fetch')
          ? 'Network error. Please check your connection and try again.'
          : error.message;

        alert(`Authentication failed: ${errorMessage}`);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 animate-spin" />
        </div>
        <p className="text-zinc-200 text-sm font-medium tracking-wide">Authenticating</p>
        <p className="text-zinc-600 text-xs mt-2 font-mono">connecting to github...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
