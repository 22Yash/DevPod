const githubService = require("../services/githubService");

const githubAuth = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is missing" });
  }

  try {
    const user = await githubService.getGitHubUser(code);
    
    // Store user in session
    req.session.userId = user._id;
    req.session.user = user;
    
    res.json({ success: true, user });
  } catch (error) {
    console.error("GitHub OAuth Error:", error.message);
    res.status(500).json({ error: "Authentication failed" });
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
    
    res.json({
      authenticated: true,
      user: req.session.user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

module.exports = { githubAuth, getCurrentUser, logout };