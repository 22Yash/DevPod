import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, Monitor, Rocket, Code, Settings, Plus, Search,
  Users, Clock, FolderOpen, GitBranch, Share2, Play, Activity
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('workspaces');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Mock data for workspaces
  const workspaces = [
    {
      id: 1,
      name: 'react-portfolio',
      description: 'Personal portfolio website built with React and Tailwind',
      status: 'running',
      template: 'React + Vite',
      lastAccessed: '2 hours ago',
      githubRepo: 'john-doe/react-portfolio',
      isPublic: false,
      collaborators: 1,
      branches: 3
    },
    {
      id: 2,
      name: 'ecommerce-api',
      description: 'REST API for ecommerce platform using Node.js and MongoDB',
      status: 'stopped',
      template: 'Node.js + Express',
      lastAccessed: '1 day ago',
      githubRepo: 'john-doe/ecommerce-api',
      isPublic: true,
      collaborators: 3,
      branches: 7
    },
    {
      id: 3,
      name: 'ml-experiments',
      description: 'Machine learning experiments with Python and TensorFlow',
      status: 'running',
      template: 'Python + Jupyter',
      lastAccessed: '5 minutes ago',
      githubRepo: 'john-doe/ml-experiments',
      isPublic: false,
      collaborators: 2,
      branches: 5
    }
  ];

  // Mock data for templates
  const templates = [
    {
      id: 1,
      name: 'React + Vite',
      description: 'Modern React development with Vite bundler',
      icon: '⚛️',
      tags: ['Frontend', 'JavaScript', 'React'],
      uses: 1247,
      featured: true
    },
    {
      id: 2,
      name: 'Node.js + Express',
      description: 'Backend API development with Express framework',
      icon: '🟢',
      tags: ['Backend', 'JavaScript', 'API'],
      uses: 892,
      featured: true
    },
    {
      id: 3,
      name: 'Python + FastAPI',
      description: 'High-performance API development with Python',
      icon: '🐍',
      tags: ['Backend', 'Python', 'API'],
      uses: 634,
      featured: false
    },
    {
      id: 4,
      name: 'Next.js Full-Stack',
      description: 'Complete full-stack application with Next.js',
      icon: '▲',
      tags: ['Full-Stack', 'React', 'SSR'],
      uses: 567,
      featured: true
    }
  ];

  // Animation variants
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
              <span className="text-xl font-bold">devspace</span>
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
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              <span>New Workspace</span>
            </motion.button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Workspaces', value: '2', icon: <Monitor className="w-5 h-5" />, color: 'emerald' },
              { label: 'Total Projects', value: '12', icon: <FolderOpen className="w-5 h-5" />, color: 'blue' },
              { label: 'Collaborators', value: '6', icon: <Users className="w-5 h-5" />, color: 'purple' },
              { label: 'Hours Saved', value: '84', icon: <Clock className="w-5 h-5" />, color: 'orange' }
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
              <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredWorkspaces.map((workspace) => (
                  <motion.div
                    key={workspace.id}
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
                        <Github className="w-4 h-4" />
                        <span>{workspace.githubRepo}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GitBranch className="w-4 h-4" />
                        <span>{workspace.branches}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{workspace.collaborators}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Last accessed</p>
                        <p className="text-sm text-slate-300">{workspace.lastAccessed}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {workspace.status === 'running' ? (
                          <motion.button
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
              {/* Featured Templates */}
              <motion.div variants={fadeInUp} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Featured Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.filter(t => t.featured).map((template) => (
                    <motion.div
                      key={template.id}
                      variants={fadeInUp}
                      whileHover={{ y: -5 }}
                      className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-3xl">{template.icon}</div>
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs font-medium">
                          Popular
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                      <p className="text-slate-400 text-sm mb-4">{template.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.tags.map((tag, i) => (
                          <span key={i} className="bg-slate-700 text-slate-300 px-2 py-1 rounded-lg text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">{template.uses} uses</span>
                        <motion.button
                          className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Use Template
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* All Templates */}
              <motion.div variants={fadeInUp}>
                <h2 className="text-2xl font-bold mb-4">All Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {templates.map((template) => (
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
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Use
                      </motion.button>
                    </motion.div>
                  ))}
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
                  {[
                    { action: 'Started workspace', target: 'react-portfolio', time: '2 hours ago', icon: <Play className="w-4 h-4 text-green-400" /> },
                    { action: 'Committed changes to', target: 'ecommerce-api', time: '1 day ago', icon: <Github className="w-4 h-4 text-blue-400" /> },
                    { action: 'Created new workspace', target: 'ml-experiments', time: '3 days ago', icon: <Plus className="w-4 h-4 text-emerald-400" /> },
                    { action: 'Shared workspace', target: 'react-portfolio', time: '1 week ago', icon: <Share2 className="w-4 h-4 text-purple-400" /> }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-slate-700/50 rounded-xl">
                      <div className="flex-shrink-0">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="text-white">{activity.action}</span>
                          <span className="text-emerald-400 font-medium ml-1">{activity.target}</span>
                        </p>
                        <p className="text-xs text-slate-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
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
