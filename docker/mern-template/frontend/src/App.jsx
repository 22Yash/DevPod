import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')
  const [apiData, setApiData] = useState(null)

  useEffect(() => {
    // Test backend connection
    fetch('/api/test')
      .then(res => res.json())
      .then(data => {
        setApiData(data)
        setMessage('Connected to backend!')
      })
      .catch(err => {
        console.error('Backend connection failed:', err)
        setMessage('Backend connection failed - check if backend is running')
      })
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 MERN Template</h1>
        <p>Welcome to your DevPod MERN workspace!</p>
        
        <div className="status-card">
          <h3>Backend Status</h3>
          <p className={apiData ? 'success' : 'error'}>{message}</p>
          {apiData && (
            <pre>{JSON.stringify(apiData, null, 2)}</pre>
          )}
        </div>

        <div className="instructions">
          <h3>🔧 Getting Started</h3>
          <ol>
            <li>Frontend is running on port 3000</li>
            <li>Start backend: <code>cd backend && npm run dev</code></li>
            <li>Backend will run on port 5000</li>
            <li>Check the PORTS tab for forwarded URLs</li>
          </ol>
        </div>

        <div className="links">
          <a href="/health" target="_blank" rel="noopener noreferrer">
            Backend Health Check
          </a>
          <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
            Learn React
          </a>
          <a href="https://expressjs.com" target="_blank" rel="noopener noreferrer">
            Learn Express
          </a>
        </div>
      </header>
    </div>
  )
}

export default App