import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      // Handle OAuth errors from GitHub
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
        
        // Send code to backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/github`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important: Send cookies with request
          body: JSON.stringify({ code })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Authentication failed:', response.status, errorData);
          throw new Error(errorData.error || `Authentication failed (${response.status})`);
        }

        const data = await response.json();
        console.log('✅ Authentication successful:', data.user?.login);

        // Store user data in localStorage for quick access
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');

        // Show success message briefly
        console.log('🎉 Welcome,', data.user?.name || data.user?.login);

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('❌ Error during authentication:', error.message);
        
        // Show user-friendly error message
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
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-white text-xl">Authenticating with GitHub...</p>
        <p className="text-slate-400 text-sm mt-2">Please wait while we set up your account</p>
        <div className="mt-4 text-xs text-slate-500">
          This should only take a few seconds
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;