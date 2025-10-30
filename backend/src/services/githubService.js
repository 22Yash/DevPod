const axios = require("axios");
const User = require("../models/User");
const Activity = require("../models/Activity");

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

  const githubData = userResponse.data;

  // 3. Find or create user in database
  let user = await User.findOne({ githubId: githubData.id.toString() });

  if (!user) {
    // Create new user
    user = await User.create({
      githubId: githubData.id.toString(),
      login: githubData.login,
      name: githubData.name,
      avatar_url: githubData.avatar_url,
      email: githubData.email,
      bio: githubData.bio,
      location: githubData.location
    });

    console.log('✅ New user created:', user.login);

    // Log activity
    await Activity.create({
      userId: user._id,
      action: 'user_login',
      details: { firstLogin: true }
    });
  } else {
    // Update existing user
    user.lastLogin = new Date();
    user.name = githubData.name;
    user.avatar_url = githubData.avatar_url;
    user.email = githubData.email;
    user.bio = githubData.bio;
    user.location = githubData.location;
    await user.save();

    console.log('✅ User logged in:', user.login);

    // Log activity
    await Activity.create({
      userId: user._id,
      action: 'user_login',
      details: { firstLogin: false }
    });
  }

  // Return user data with MongoDB _id
  return {
    _id: user._id,
    githubId: user.githubId,
    login: user.login,
    avatar_url: user.avatar_url,
    name: user.name,
    email: user.email
  };
}

module.exports = { getGitHubUser };