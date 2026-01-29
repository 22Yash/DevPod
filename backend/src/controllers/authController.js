const githubService = require("../services/githubService");

const githubAuth = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ 
      error: "Authorization code is missing",
      details: "No authorization code received from GitHub"
    });
  }

  try {
    console.log('🔐 Processing GitHub OAuth with code:', code.substring(0, 10) + '...');
    
    const user = await githubService.getGitHubUser(code);
    
    // Store user in session
    req.session.userId = user._id;
    req.session.user = user;
    
    console.log('✅ User authenticated successfully:', user.login);
    
    res.json({ 
      success: true, 
      user,
      message: 'Authentication successful'
    });
  } catch (error) {
    console.error("❌ GitHub OAuth Error:", error.message);
    
    // Provide more specific error messages
    let errorMessage = "Authentication failed";
    let statusCode = 500;
    
    if (error.message.includes('GitHub OAuth error')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes('not configured')) {
      errorMessage = "Server configuration error";
      statusCode = 500;
    } else if (error.message.includes('GitHub API error')) {
      errorMessage = "GitHub service unavailable";
      statusCode = 502;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ 
        authenticated: false, 
        user: null 
      });
    }
    
    console.log('✅ Current user session found:', req.session.user.login);
    
    res.json({
      authenticated: true,
      user: req.session.user
    });
  } catch (error) {
    console.error('❌ Get current user error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  const userLogin = req.session.user?.login || 'unknown';
  
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Logout error:', err.message);
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    console.log('👋 User logged out:', userLogin);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

module.exports = { githubAuth, getCurrentUser, logout };