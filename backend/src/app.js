const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const workspacesRoutes = require('./routes/workspacesRoutes');

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/v1/workspaces', workspacesRoutes);

// Error handler (catch all)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
