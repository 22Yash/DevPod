import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor, Rocket, Code, Plus, Search,
  Users, FolderOpen, Share2, Play, Activity, LogOut,
  Square, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShareWorkspaceModal from '../../components/ShareWorkspaceModal';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

const SHAREABLE_TEMPLATES = new Set(['python', 'nodejs', 'java']);

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState('workspaces');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [user, setUser] = useState(null);
  const [launchingTemplateId, setLaunchingTemplateId] = useState(null);
  const [stats, setStats] = useState({
    activeWorkspaces: 0,
    totalProjects: 0,
    collaborators: 0,
    hoursSaved: 0
  });
  const [workspaces, setWorkspaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [shareWorkspace, setShareWorkspace] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, workspacesResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/v1/workspaces/dashboard/stats`, {
          credentials: 'include'
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/v1/workspaces/list`, {
          credentials: 'include'
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      if (workspacesResponse.ok) {
        const workspacesData = await workspacesResponse.json();
        setWorkspaces(workspacesData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/workspaces/activity/recent`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const handleLogout = async () => {
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

  const openPendingIdeTab = () => window.open('about:blank', '_blank');

  const navigateToIde = (ideTab, ideUrl) => {
    if (ideTab && !ideTab.closed) {
      ideTab.location.href = ideUrl;
      return;
    }
    window.open(ideUrl, '_blank');
  };

  const closePendingIdeTab = (ideTab) => {
    if (ideTab && !ideTab.closed) {
      ideTab.close();
    }
  };

  const launchWorkspace = async (template) => {
    setLaunchingTemplateId(template.id);

    let templateKey;
    if (template.name.includes('Python')) templateKey = 'python';
    else if (template.name.includes('Node.js')) templateKey = 'nodejs';
    else if (template.name.includes('MERN')) templateKey = 'mern';
    else if (template.name.includes('Java')) templateKey = 'java';
    else {
      toast(`Template ${template.name} is not configured.`, 'error');
      setLaunchingTemplateId(null);
      return;
    }

    const ideTab = openPendingIdeTab();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/workspaces/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          template: templateKey,
          name: `${templateKey}-workspace-${Date.now()}`,
          description: `Workspace created from ${template.name} template`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          closePendingIdeTab(ideTab);
          toast('Session expired. Please login again.', 'error');
          navigate('/');
          return;
        }
        closePendingIdeTab(ideTab);
        const errorMsg = data.message || data.error || `Server error (${response.status})`;
        toast(`Failed to launch workspace: ${errorMsg}`, 'error');
        return;
      }

      const ideUrl = data.ideUrl;
      if (!ideUrl) {
        throw new Error('No IDE URL received from server');
      }

      navigateToIde(ideTab, ideUrl);
      await loadDashboardData();

    } catch (error) {
      closePendingIdeTab(ideTab);
      console.error("Failed to launch DevPod:", error);
      toast(`Failed to start workspace: ${error.message}`, 'error');
    } finally {
      setLaunchingTemplateId(null);
    }
  };

  const stopWorkspace = async (workspaceId) => {
    setActionLoading(workspaceId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/workspaces/${workspaceId}/stop`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to stop workspace');
      }
      await loadDashboardData();
    } catch (error) {
      toast(`Failed to stop workspace: ${error.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const startWorkspace = async (workspaceId) => {
    setActionLoading(workspaceId);
    const ideTab = openPendingIdeTab();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/workspaces/${workspaceId}/start`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start workspace');
      }
      if (!data.ideUrl) {
        throw new Error('No IDE URL received from server');
      }

      navigateToIde(ideTab, data.ideUrl);
      await loadDashboardData();
    } catch (error) {
      closePendingIdeTab(ideTab);
      toast(`Failed to start workspace: ${error.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteWorkspace = async (workspaceId, workspaceName) => {
    const confirmed = await confirm(`Are you sure you want to delete "${workspaceName}"? This cannot be undone.`);
    if (!confirmed) return;
    setActionLoading(workspaceId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/workspaces/${workspaceId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete workspace');
      }
      await loadDashboardData();
    } catch (error) {
      toast(`Failed to delete workspace: ${error.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const templates = [
    { id: 3, name: 'Python', description: 'Python environment with code-server IDE', tags: ['Backend', 'Python', 'API'],
      logo: <svg width="24" height="24" viewBox="0 0 256 255"><defs><linearGradient id="pa" x1="12.96%" y1="12.04%" x2="79.64%" y2="78.45%"><stop offset="0%" stopColor="#387EB8"/><stop offset="100%" stopColor="#366994"/></linearGradient><linearGradient id="pb" x1="19.13%" y1="20.58%" x2="90.58%" y2="88.01%"><stop offset="0%" stopColor="#FFE052"/><stop offset="100%" stopColor="#FFC331"/></linearGradient></defs><path d="M126.9 0C62.7 0 66.7 27.6 66.7 27.6l.1 28.6h61.3v8.6H39.2S0 60.7 0 126.2c0 65.5 34.2 63.2 34.2 63.2h20.4v-30.4s-1.1-34.2 33.6-34.2h57.8s32.6.5 32.6-31.5V33.5S183.2 0 126.9 0zM92.3 19.4c5.9 0 10.7 4.8 10.7 10.7 0 5.9-4.8 10.7-10.7 10.7-5.9 0-10.7-4.8-10.7-10.7 0-5.9 4.8-10.7 10.7-10.7z" fill="url(#pa)"/><path d="M128.8 254.1c63.2 0 60.2-27.6 60.2-27.6l-.1-28.6h-61.3v-8.6h88.9s39.2 4.1 39.2-61.4c0-65.5-34.2-63.2-34.2-63.2h-20.4v30.4s1.1 34.2-33.6 34.2h-57.8s-32.6-.5-32.6 31.5v59.8s-4.9 33.5 51.7 33.5zm34.3-19.4c-5.9 0-10.7-4.8-10.7-10.7 0-5.9 4.8-10.7 10.7-10.7 5.9 0 10.7 4.8 10.7 10.7 0 5.9-4.8 10.7-10.7 10.7z" fill="url(#pb)"/></svg> },
    { id: 4, name: 'Node.js', description: 'Node.js and Express development environment', tags: ['Backend', 'Node.js', 'Express'],
      logo: <svg width="24" height="24" viewBox="0 0 256 282"><path d="M116.5 1.6c7.1-4.1 15.9-4.1 23 0l96.3 55.6c7.1 4.1 11.5 11.8 11.5 20v111.2c0 8.2-4.4 15.8-11.5 20l-96.3 55.6c-7.1 4.1-15.9 4.1-23 0L20.2 208.4c-7.1-4.1-11.5-11.8-11.5-20V77.2c0-8.2 4.4-15.8 11.5-20L116.5 1.6z" fill="#539E43"/><text x="128" y="165" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="110" fontWeight="bold" fill="white">JS</text></svg> },
    { id: 5, name: 'MERN Stack', description: 'MongoDB, Express, React, Node.js full-stack environment', tags: ['Full-Stack', 'MongoDB', 'React'], featured: true,
      logo: <svg width="24" height="24" viewBox="0 0 256 256"><circle cx="128" cy="128" r="128" fill="#61DAFB" fillOpacity="0.1"/><circle cx="128" cy="128" r="18" fill="#61DAFB"/><ellipse cx="128" cy="128" rx="100" ry="38" fill="none" stroke="#61DAFB" strokeWidth="8"/><ellipse cx="128" cy="128" rx="100" ry="38" fill="none" stroke="#61DAFB" strokeWidth="8" transform="rotate(60 128 128)"/><ellipse cx="128" cy="128" rx="100" ry="38" fill="none" stroke="#61DAFB" strokeWidth="8" transform="rotate(120 128 128)"/></svg> },
    { id: 6, name: 'Java', description: 'Java 17 with Maven, Gradle, and code-server IDE', tags: ['Backend', 'Java', 'Maven', 'Gradle'],
      logo: <svg width="24" height="24" viewBox="0 0 256 346"><path d="M83 267s-14 8 9 11c28 3 42 3 73-4 0 0 8 5 19 9-68 29-153-2-101-16zm-9-37s-15 11 8 14c30 3 53 3 94-5 0 0 6 5 14 8-82 24-173 2-116-17z" fill="#5382A1"/><path d="M143 116c17 19-4 37-4 37s43-22 23-50c-18-26-32-39 44-84 0 0-119 30-63 97z" fill="#E76F00"/><path d="M233 295s10 8-11 15c-40 12-168 16-203 0-13-5 11-13 18-14 8-2 12-2 12-2-14-10-88 19-38 27 137 22 250-10 222-26zM89 190s-63 15-22 20c17 2 50 2 82-1 26-2 52-7 52-7s-9 4-16 8c-63 17-185 9-150-8 30-14 54-12 54-12zm112 63c64-33 34-66 14-61-5 1-7 2-7 2s2-3 5-4c38-13 67 40-13 61 0 0 1-1 1-2z" fill="#5382A1"/><path d="M162 0s36 36-34 90c-56 44-13 69 0 97-33-29-57-55-41-79C111 73 176 55 162 0z" fill="#E76F00"/><path d="M95 341c62 4 156-2 158-31 0 0-4 11-51 20-53 10-118 9-157 2 0 0 8 7 50 9z" fill="#5382A1"/></svg> }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-400/10';
      case 'stopped': return 'text-slate-400 bg-slate-400/10';
      case 'starting': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const formatAction = (action) => {
    const labels = {
      workspace_created: 'Created workspace',
      workspace_launched: 'Launched workspace',
      workspace_stopped: 'Stopped workspace',
      workspace_resumed: 'Resumed workspace',
      workspace_deleted: 'Deleted workspace',
      workspace_shared: 'Shared workspace',
      workspace_cloned: 'Cloned workspace',
      share_revoked: 'Revoked share link',
      command_executed: 'Executed command',
      user_login: 'Logged in',
    };
    return labels[action] || action;
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
            <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">DevPod</span>
            </motion.div>

            <div className="flex items-center space-x-6">
              {user && (
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.login} className="w-8 h-8 rounded-full border border-slate-700" />
                  ) : (
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold">{user.login ? user.login[0].toUpperCase() : "?"}</span>
                    </div>
                  )}
                  <span>{user.name || user.login}</span>
                </div>
              )}
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
        <motion.div initial="hidden" animate="visible" variants={stagger} className="mb-8">
          <motion.div variants={fadeInUp} className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name || user?.login || "Developer"}
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

          {/* Stats Cards */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Active Workspaces', value: stats.activeWorkspaces, icon: <Monitor className="w-5 h-5" />, colorClass: 'text-emerald-400' },
              { label: 'Total Projects', value: stats.totalProjects, icon: <FolderOpen className="w-5 h-5" />, colorClass: 'text-blue-400' },
              { label: 'Collaborators', value: stats.collaborators, icon: <Users className="w-5 h-5" />, colorClass: 'text-purple-400' },
            ].map((stat, index) => (
              <div key={index} className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={stat.colorClass}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
          <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl w-fit">
            {[
              { id: 'workspaces', label: 'My Workspaces', icon: <Monitor className="w-4 h-4" /> },
              { id: 'templates', label: 'Templates', icon: <Rocket className="w-4 h-4" /> },
              { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'activity') loadActivities();
                }}
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
            <motion.div key="workspaces" initial="hidden" animate="visible" exit="hidden" variants={stagger}>
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
              {filteredWorkspaces.length === 0 && !dashboardLoading ? (
                <motion.div variants={fadeInUp} className="text-center py-12 bg-slate-800 rounded-2xl border border-slate-700">
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
                  {filteredWorkspaces.map((workspace) => {
                    const isLoading = actionLoading === workspace.workspaceId;
                    const canShareWorkspace =
                      workspace.status === 'running' && SHAREABLE_TEMPLATES.has(workspace.template);
                    return (
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
                              <>
                                <motion.button
                                  onClick={() => {
                                    const domain = import.meta.env.VITE_WORKSPACE_DOMAIN;
                                    const url = domain
                                      ? `https://ws-${workspace.idePort}.${domain}`
                                      : `http://localhost:${workspace.idePort}`;
                                    window.open(url, '_blank');
                                  }}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Open
                                </motion.button>
                                {canShareWorkspace && (
                                  <button
                                    onClick={() => setShareWorkspace(workspace)}
                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                                    title="Share"
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => stopWorkspace(workspace.workspaceId)}
                                  disabled={isLoading}
                                  className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all disabled:opacity-50"
                                  title="Stop"
                                >
                                  <Square className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <motion.button
                                onClick={() => startWorkspace(workspace.workspaceId)}
                                disabled={isLoading}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 disabled:opacity-50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Play className="w-3 h-3" />
                                <span>{isLoading ? 'Starting...' : 'Start'}</span>
                              </motion.button>
                            )}
                            <button
                              onClick={() => deleteWorkspace(workspace.workspaceId, workspace.name)}
                              disabled={isLoading}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <motion.div key="templates" initial="hidden" animate="visible" exit="hidden" variants={stagger}>
              <motion.div variants={fadeInUp}>
                <h2 className="text-2xl font-bold mb-4">All Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {templates.map((template) => {
                    const isTemplateLaunching = launchingTemplateId === template.id;
                    return (
                      <motion.div
                        key={template.id}
                        variants={fadeInUp}
                        whileHover={{ y: -3 }}
                        className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-300"
                      >
                        <div className="flex items-center space-x-3 mb-5">
                          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                            {template.logo}
                          </div>
                          <div>
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-xs text-slate-400">{template.description}</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => launchWorkspace(template)}
                          className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition-all"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isTemplateLaunching}
                        >
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
            <motion.div key="activity" initial="hidden" animate="visible" exit="hidden" variants={stagger}>
              <motion.div variants={fadeInUp} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {activities.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No activity yet. Launch a workspace to get started!</p>
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity._id} className="flex items-center space-x-4 p-4 bg-slate-700/50 rounded-xl">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                          <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{formatAction(activity.action)}</p>
                          <p className="text-xs text-slate-400">
                            {activity.workspaceId?.name || ''}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Share Workspace Modal */}
      {shareWorkspace && (
        <ShareWorkspaceModal
          workspace={shareWorkspace}
          onClose={() => setShareWorkspace(null)}
          onShareCreated={(wsId, token) => {
            setWorkspaces(prev => prev.map(ws =>
              ws.workspaceId === wsId ? { ...ws, isShared: true, shareToken: token } : ws
            ));
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
