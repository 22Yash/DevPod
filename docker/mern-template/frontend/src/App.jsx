import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Connecting...')
  const [apiData, setApiData] = useState(null)

  useEffect(() => {
    fetch('/api/test')
      .then(res => res.json())
      .then(data => {
        setApiData(data)
        setMessage('Connected')
      })
      .catch(err => {
        console.error('Backend connection failed:', err)
        setMessage('Not connected — start the backend')
      })
  }, [])

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#10b981" fillOpacity="0.1"/>
              <path d="M9 11L16 7L23 11V21L16 25L9 21Z" stroke="#10b981" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <span>DevPod</span>
          </div>
          <h1>MERN Stack Workspace</h1>
          <p className="subtitle">MongoDB + Express + React + Node.js</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Backend Status</span>
            <span className={`status-badge ${apiData ? 'connected' : 'disconnected'}`}>
              {message}
            </span>
          </div>
          {apiData && (
            <pre className="code-block">{JSON.stringify(apiData, null, 2)}</pre>
          )}
        </div>

        <div className="card">
          <span className="card-title">Quick Start</span>
          <div className="steps">
            <div className="step">
              <span className="step-num">1</span>
              <span>Frontend is running on port 3000</span>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <span>Start backend: <code>cd backend && npm run dev</code></span>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <span>Backend will run on port 5000</span>
            </div>
            <div className="step">
              <span className="step-num">4</span>
              <span>API calls are proxied — fetch("/api/...") just works</span>
            </div>
          </div>
        </div>

        <div className="links">
          <a href="/health" target="_blank" rel="noopener noreferrer">Health Check</a>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">React Docs</a>
          <a href="https://expressjs.com" target="_blank" rel="noopener noreferrer">Express Docs</a>
        </div>
      </div>
    </div>
  )
}

export default App
