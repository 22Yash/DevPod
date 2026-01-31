import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, Monitor, Rocket, Code, Settings, Plus, Search,
  Users, Clock, FolderOpen, GitBranch, Share2, Play, Activity, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('workspaces');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [user, setUser] = useState(null);
  // NEW STATE: Tracks the ID of the template currently being launched
  const [launchingTemplateId, setLaunchingTemplateId] = useState(null); 
  const [stats, setStats] = useState({
    activeWorkspaces: 2,
    totalProjects: 12,
    collaborators: 6,
    hoursSaved: 84
  });
  const [workspaces, setWorkspaces] = useState([]);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Load dashboard stats
    loadDashboardData();
  }, []);

  // Load dashboard data from backend
  const loadDashboardData = async () => {
    // ... (Your loadDashboardData function remains the same)
    try {
      // Get dashboard stats
      const statsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/workspaces/dashboard/stats`, {
        credentials: 'include'
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Get workspaces list
      const workspacesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/workspaces/list`, {
        credentials: 'include'
      });
      
      if (workspacesResponse.ok) {
        const workspacesData = await workspacesResponse.json();
        setWorkspaces(workspacesData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Keep using mock data if API fails
    }
  };

  // Logout function
  const handleLogout = async () => {
    // ... (Your handleLogout function remains the same)
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Launch Workspace function with proper authentication
  const launchWorkspace = async (template) => { 
    // Set loading state for this specific template
    setLaunchingTemplateId(template.id); 

    let templateKey;
    
    // Map display name to backend's required key
    if (template.name.includes('Python')) {
      templateKey = 'python';
    } else if (template.name.includes('Node.js')) {
      templateKey = 'nodejs';
    } else if (template.name.includes('MERN')) {
      templateKey = 'mern';
    } else {
      alert(`Template ${template.name} is not configured.`);
      setLaunchingTemplateId(null);
      return;
    }

    console.log(`🚀 Launching ${templateKey} workspace via API...`);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/workspaces/launch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies for authentication
        body: JSON.stringify({ 
          template: templateKey,
          name: `${templateKey}-workspace-${Date.now()}`,
          description: `Workspace created from ${template.name} template`
        })
      });

      // Parse response
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Launch failed:', response.status, data);
        
        // Handle specific error cases
        if (response.status === 401) {
          alert('Session expired. Please login again.');
          navigate('/');
          return;
        } else if (response.status === 503 && data.message?.includes('Docker')) {
          alert('Docker is not running. Please start Docker Desktop and try again.');
          return;
        } else if (response.status === 502 && data.message?.includes('internet')) {
          alert('Failed to download required files. Please check your internet connection and try again.');
          return;
        } else if (response.status === 400) {
          alert(`Configuration error: ${data.message || 'Invalid template selected'}`);
          return;
        }
        
        // Generic error message with details
        const errorMsg = data.message || data.error || `Server error (${response.status})`;
        alert(`Failed to launch workspace: ${errorMsg}`);
        return;
      }

      // Success case
      console.log('✅ Workspace launched successfully:', data);
      
      const ideUrl = data.ideUrl;
      if (!ideUrl) {
        throw new Error('No IDE URL received from server');
      }
      
      console.log(`🎉 Workspace ready. Opening: ${ideUrl}`);
      
      // Show success message
      alert(`🎉 ${template.name} workspace is ready! Opening in new tab...`);
      
      // Reload dashboard data to show new workspace
      await loadDashboardData();
      
      // Open the new DevPod IDE in a new tab
      window.open(ideUrl, '_blank');

    } catch (error) {
      console.error("❌ Failed to launch DevPod:", error);
      
      // Handle network errors
      if (error.message.includes('fetch')) {
        alert("Network error. Please check your connection and try again.");
      } else if (error.message.includes('IDE URL')) {
        alert("Workspace created but failed to get access URL. Please check the dashboard.");
      } else {
        alert(`Failed to start workspace: ${error.message}`);
      }
    } finally {
      // Clear loading state
      setLaunchingTemplateId(null); 
    }
  };

  // Mock data for templates 
  const templates = [
    {
      id: 3,
      name: 'Python Development',
      description: 'Python environment with code-server IDE',
      icon: '🐍',
      tags: ['Backend', 'Python', 'API'],
      featured: false,
      uses: 120
    },
    {
      id: 4,
      name: 'Node.js Backend',
      description: 'Node.js and Express development environment',
      icon: '⚙️',
      tags: ['Backend', 'Node.js', 'Express'],
      featured: false,
      uses: 80
    },
    {
      id: 5,
      name: 'MERN Stack',
      description: 'MongoDB, Express, React, Node.js full-stack environment',
      icon: '🍃',
      tags: ['Full-Stack', 'MongoDB', 'React'],
      featured: true,
      uses: 200
    }
  ];

  // ... (Your animation variants and utility functions remain the same)
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-400/10';
      case 'stopped': return 'text-slate-400 bg-slate-400/10';
      case 'starting': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const filteredWorkspaces = workspaces.filter(workspace => {
    const matchesSearch = workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          workspace.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || workspace.status === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">DevPod</span>
            </motion.div>

            <div className="flex items-center space-x-6">
              {user && (
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="w-8 h-8 rounded-full border border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {user.login ? user.login[0].toUpperCase() : "?"}
                      </span>
                    </div>
                  )}
                  <span>{user.name || user.login}</span>
                </div>
              )}
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mb-8"
        >
          <motion.div variants={fadeInUp} className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name || user?.login || "Developer"} 👋
              </h1>
              <p className="text-slate-300">Ready to build something amazing today?</p>
            </div>
            <motion.button
              onClick={() => setActiveTab('templates')}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              <span>New Workspace</span>
            </motion.button>
          </motion.div>

          {/* Stats Cards - Now using real data */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Workspaces', value: stats.activeWorkspaces, icon: <Monitor className="w-5 h-5" />, color: 'emerald' },
              { label: 'Total Projects', value: stats.totalProjects, icon: <FolderOpen className="w-5 h-5" />, color: 'blue' },
              { label: 'Collaborators', value: stats.collaborators, icon: <Users className="w-5 h-5" />, color: 'purple' },
              { label: 'Hours Saved', value: stats.hoursSaved, icon: <Clock className="w-5 h-5" />, color: 'orange' }
            ].map((stat, index) => (
              <div key={index} className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`text-${stat.color}-400`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8"
        >
          <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl w-fit">
            {[
              { id: 'workspaces', label: 'My Workspaces', icon: <Monitor className="w-4 h-4" /> },
              { id: 'templates', label: 'Templates', icon: <Rocket className="w-4 h-4" /> },
              { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {/* Workspaces Tab */}
          {activeTab === 'workspaces' && (
            <motion.div
              key="workspaces"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={stagger}
            >
              {/* Search and Filter */}
              <motion.div variants={fadeInUp} className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search workspaces..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="running">Running</option>
                  <option value="stopped">Stopped</option>
                </select>
              </motion.div>

              {/* Workspaces Grid */}
              {filteredWorkspaces.length === 0 ? (
                <motion.div 
                  variants={fadeInUp}
                  className="text-center py-12 bg-slate-800 rounded-2xl border border-slate-700"
                >
                  <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No workspaces yet</h3>
                  <p className="text-slate-400 mb-6">Create your first workspace to get started</p>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Browse Templates
                  </button>
                </motion.div>
              ) : (
                <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredWorkspaces.map((workspace) => (
                    <motion.div
                      key={workspace._id || workspace.id}
                      variants={fadeInUp}
                      whileHover={{ y: -5 }}
                      className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold">{workspace.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workspace.status)}`}>
                              {workspace.status}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mb-3">{workspace.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-slate-400 mb-4">
                        <div className="flex items-center space-x-1">
                          <Code className="w-4 h-4" />
                          <span>{workspace.template}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GitBranch className="w-4 h-4" />
                          <span>{workspace.branches}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{workspace.collaborators?.length || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500">Last accessed</p>
                          <p className="text-sm text-slate-300">
                            {new Date(workspace.lastAccessed).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {workspace.status === 'running' ? (
                            <motion.button
                              onClick={() => window.open(`http://localhost:${workspace.idePort}`, '_blank')}
                              className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Open
                            </motion.button>
                          ) : (
                            <motion.button
                              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Start
                            </motion.button>
                          )}
                          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={stagger}
            >
              {/* All Templates */}
              <motion.div variants={fadeInUp}>
                <h2 className="text-2xl font-bold mb-4">All Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {templates.map((template) => {
                    // Check if this specific template is currently launching
                    const isTemplateLaunching = launchingTemplateId === template.id;

                    return (
                      <motion.div
                        key={template.id}
                        variants={fadeInUp}
                        whileHover={{ y: -3 }}
                        className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all duration-300"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div>
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-xs text-slate-400">{template.uses} uses</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => {
                            if (template.url && template.name === 'React + Vite') {
                              window.open(template.url, "_blank");
                            } else {
                              // Pass the full template object to the launch function
                              launchWorkspace(template); 
                            }
                          }}
                          className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition-all"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          // Use the specific launching state for the disabled prop
                          disabled={isTemplateLaunching} 
                        >
                          {/* Display the correct text based on the specific template's loading state */}
                          {isTemplateLaunching ? 'Launching...' : 'Use'}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={stagger}
            >
              <motion.div variants={fadeInUp} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="text-center py-8 text-slate-400">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Your recent activity will appear here</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;