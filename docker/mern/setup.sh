#!/bin/sh
# setup.sh - Auto-creates MERN project structure

cd /workspace

# Check if already initialized
if [ -d "frontend" ] || [ -d "backend" ]; then
  echo "✅ Project already exists, skipping initialization..."
  exit 0
fi

echo "🚀 Initializing MERN project structure..."

# ============================================
# BACKEND SETUP
# ============================================
echo "📦 Setting up backend..."
mkdir -p backend/controllers backend/models backend/routes backend/config
cd backend

# Backend package.json
cat > package.json << 'EOF'
{
  "name": "backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
EOF

# Backend server.js
cat > server.js << 'EOF'
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins (development)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ 
    message: "✅ Backend API is running!",
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    service: "MERN Backend",
    port: PORT
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
EOF

# Backend .env
cat > .env << 'EOF'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mernapp
EOF

# Example model
cat > models/User.js << 'EOF'
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
EOF

# Example controller
cat > controllers/userController.js << 'EOF'
exports.getUsers = async (req, res) => {
  try {
    res.json({ message: "Get all users" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    res.json({ message: "Create user" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
EOF

cd ..

# ============================================
# FRONTEND SETUP
# ============================================
echo "⚛️  Setting up frontend..."
mkdir -p frontend/src/components frontend/public
cd frontend

# Frontend package.json
cat > package.json << 'EOF'
{
  "name": "frontend",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
EOF

# Frontend index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MERN App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# Frontend vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      "/api": "http://localhost:5000"
    }
  }
});
EOF

# Frontend main.jsx
cat > src/main.jsx << 'EOF'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Frontend App.jsx
cat > src/App.jsx << 'EOF'
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [backendUrl, setBackendUrl] = useState("");

  useEffect(() => {
    // Try multiple backend URLs
    const tryBackendUrls = [
      "http://localhost:5000/api",
      "/api", // Proxy fallback
      `${window.location.protocol}//${window.location.hostname}:5000/api`
    ];

    const testBackend = async () => {
      for (const url of tryBackendUrls) {
        try {
          console.log(`🔄 Trying backend at: ${url}`);
          const response = await fetch(url);
          const data = await response.json();
          
          setMessage(data.message);
          setBackendUrl(url);
          setLoading(false);
          console.log(`✅ Backend connected at: ${url}`);
          return;
        } catch (err) {
          console.log(`❌ Failed to connect to: ${url}`, err.message);
        }
      }
      
      setMessage("❌ Failed to connect to backend on all URLs");
      setLoading(false);
    };

    testBackend();
  }, []);

  return (
    <div className="App">
      <h1>🚀 MERN Stack App</h1>
      <div className="status">
        <p>{loading ? "🔄 Connecting to backend..." : message}</p>
        {backendUrl && <p className="backend-url">📡 Backend: {backendUrl}</p>}
      </div>
      
      <div className="info">
        <h2>🎯 Development URLs</h2>
        <div className="url-list">
          <p>✅ <strong>Frontend (React)</strong>: http://localhost:3000</p>
          <p>✅ <strong>Backend (Express)</strong>: http://localhost:5000</p>
          <p>✅ <strong>IDE (Code-Server)</strong>: http://localhost:8080</p>
        </div>
        
        <h2>🛠️ Quick Commands</h2>
        <div className="commands">
          <code>npm run dev</code> - Start both servers<br/>
          <code>npm run dev:backend</code> - Backend only<br/>
          <code>npm run dev:frontend</code> - Frontend only
        </div>
      </div>
    </div>
  );
}

export default App;
EOF

# Frontend App.css
cat > src/App.css << 'EOF'
.App {
  text-align: center;
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  color: #61dafb;
  margin-bottom: 1rem;
}

h2 {
  color: #61dafb;
  margin: 1.5rem 0 1rem 0;
  font-size: 1.2rem;
}

.status {
  margin: 2rem 0;
  padding: 1rem;
  background: #1a1a1a;
  border-radius: 8px;
  border-left: 4px solid #61dafb;
}

.backend-url {
  font-size: 0.9rem;
  color: #888;
  margin-top: 0.5rem;
}

.info {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f5f5f5;
  border-radius: 8px;
  color: #333;
}

.url-list {
  text-align: left;
  margin: 1rem 0;
  background: #fff;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.url-list p {
  margin: 0.5rem 0;
  font-family: monospace;
}

.commands {
  text-align: left;
  background: #2d2d2d;
  color: #fff;
  padding: 1rem;
  border-radius: 4px;
  font-family: monospace;
  margin-top: 1rem;
}

.commands code {
  background: #444;
  padding: 2px 6px;
  border-radius: 3px;
  color: #61dafb;
}
EOF

# Frontend index.css
cat > src/index.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #282c34;
  color: white;
}
EOF

cd ..

# ============================================
# ROOT PROJECT FILES
# ============================================
echo "📝 Creating root files..."

# Root package.json
cat > package.json << 'EOF'
{
  "name": "mern-app",
  "version": "1.0.0",
  "scripts": {
    "install-all": "cd backend && npm install && cd ../frontend && npm install",
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm run dev\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev"
  }
}
EOF

# Root README
cat > README.md << 'EOF'
# 🚀 MERN Stack Application

Full-stack app with MongoDB, Express, React, and Node.js.

## Quick Start

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Run Development Servers
```bash
npm run dev
```

This starts:
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **IDE**: Already open in your browser

### 3. Run Separately (Optional)

Backend only:
```bash
npm run dev:backend
```

Frontend only:
```bash
npm run dev:frontend
```

## Project Structure

```
.
├── backend/          # Express.js API
│   ├── controllers/  # Request handlers
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── config/       # Configuration
│   └── server.js     # Entry point
│
├── frontend/         # React app
│   ├── src/
│   │   ├── components/
│   │   └── App.jsx
│   └── index.html
│
└── package.json      # Root scripts
```

## MongoDB Setup

Update `backend/.env` with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/mernapp
```

## Next Steps

1. ✅ Dependencies installed? Run: `npm run install-all`
2. ✅ Start coding! Run: `npm run dev`
3. ✅ Visit http://localhost:3000 to see your app

Happy coding! 🎉
EOF

# .gitignore
cat > .gitignore << 'EOF'
node_modules/
backend/node_modules/
frontend/node_modules/
.env
.env.local
frontend/dist/
backend/dist/
npm-debug.log*
.DS_Store
EOF

echo "✅ MERN project initialized successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm run install-all"
echo "2. Run: npm run dev"
echo "3. Visit http://localhost:3000"
echo ""