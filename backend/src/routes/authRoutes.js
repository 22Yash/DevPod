const express = require("express");
const { githubAuth, getCurrentUser, logout } = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/github - Login with GitHub
router.post("/github", githubAuth);

// GET /api/auth/user - Get current logged in user
router.get("/user", getCurrentUser);

// POST /api/auth/logout - Logout
router.post("/logout", logout);

module.exports = router;