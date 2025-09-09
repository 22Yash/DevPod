require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })); // Allow requests from your frontend
app.use(express.json());

// GitHub OAuth credentials from environment variables
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// This endpoint will receive the code from the frontend
app.post('/api/auth/github', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code is missing' });
    }

    try {
        // 1. Exchange the code for an access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
            },
            {
                headers: {
                    Accept: 'application/json',
                },
            }
        );

        const { access_token } = tokenResponse.data;

        if (!access_token) {
            return res.status(500).json({ error: 'Failed to retrieve access token' });
        }

        // 2. Use the access token to get the user's profile from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${access_token}`,
            },
        });

        // 3. Send the user data back to the frontend
        const userData = {
            login: userResponse.data.login,
            avatar_url: userResponse.data.avatar_url,
            name: userResponse.data.name,
        };

        // In a real app, you would create a session or a JWT here.
        // For now, we'll just send the user data.
        res.json({ success: true, user: userData });

    } catch (error) {
        console.error('Error during GitHub OAuth:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred during authentication.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});