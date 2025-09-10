import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage/LandingPage';
import Dashboard from './pages/Dashboard/Dashboard';
import AuthCallback from './pages/AuthCallback/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page (default) */}
        <Route path="/" element={<LandingPage />} />

        {/* GitHub OAuth Callback */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Dashboard page */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;