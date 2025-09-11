const githubService = require("../services/githubService");

const githubAuth = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is missing" });
  }

  try {
    const user = await githubService.getGitHubUser(code);
    res.json({ success: true, user });
  } catch (error) {
    console.error("GitHub OAuth Error:", error.message);
    res.status(500).json({ error: "Authentication failed" });
  }
};

module.exports = { githubAuth };
