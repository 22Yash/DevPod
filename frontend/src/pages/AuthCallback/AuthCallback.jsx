import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        console.error('No authorization code found');
        navigate('/');
        return;
      }

      try {
        console.log('Exchanging code for user data...');
        
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
          throw new Error('Authentication failed');
        }

        const data = await response.json();
        console.log('Authentication successful:', data);

        // Store user data in localStorage for quick access
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error during authentication:', error);
        alert('Authentication failed. Please try again.');
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-white text-xl">Authenticating...</p>
        <p className="text-slate-400 text-sm mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  );
};

export default AuthCallback;