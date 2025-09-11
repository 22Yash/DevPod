const express = require("express");
const { githubAuth } = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/github
router.post("/github", githubAuth);

module.exports = router;
