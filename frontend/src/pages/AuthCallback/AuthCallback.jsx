import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // You may need to run `npm install axios` in the frontend folder

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const authenticateUser = async (code) => {
            try {
                // Send the code to your backend server
                const response = await axios.post('http://localhost:4000/api/auth/github', { code });

                if (response.data.success) {
                    // If successful, store user info and set login status
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('user', JSON.stringify(response.data.user));

                    // Redirect to the dashboard
                    navigate('/dashboard');
                } else {
                    // Handle backend error
                    console.error('Authentication failed:', response.data.error);
                    navigate('/');
                }
            } catch (error) {
                // Handle network or server error
                console.error('Error during authentication request:', error);
                navigate('/');
            }
        };

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            authenticateUser(code);
        } else {
            console.error('GitHub OAuth failed: No code received.');
            navigate('/');
        }
    }, [navigate]);

    return (
        <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-xl">Authenticating with GitHub...</p>
                <p className="text-slate-400">Please wait while we log you in.</p>
            </div>
        </div>
    );
};

export default AuthCallback;