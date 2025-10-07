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

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "✅ Backend API is running!" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
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

  useEffect(() => {
    fetch("http://localhost:5000/api")
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setMessage("❌ Failed to connect to backend");
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <h1>🚀 MERN Stack App</h1>
      <p>{loading ? "Loading..." : message}</p>
      <div className="info">
        <p>✅ Frontend: React + Vite</p>
        <p>✅ Backend: Express.js</p>
        <p>✅ Database: MongoDB (configure in backend/.env)</p>
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
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #61dafb;
  margin-bottom: 1rem;
}

.info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.info p {
  margin: 0.5rem 0;
  color: #333;
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