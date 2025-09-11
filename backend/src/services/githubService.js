const axios = require("axios");

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

async function getGitHubUser(code) {
  // 1. Exchange code for access token
  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    },
    { headers: { Accept: "application/json" } }
  );

  const { access_token } = tokenResponse.data;
  if (!access_token) {
    throw new Error("Failed to retrieve access token");
  }

  // 2. Fetch GitHub user profile
  const userResponse = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `token ${access_token}` },
  });

  return {
    login: userResponse.data.login,
    avatar_url: userResponse.data.avatar_url,
    name: userResponse.data.name,
  };
}

module.exports = { getGitHubUser };
