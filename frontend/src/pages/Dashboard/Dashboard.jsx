import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor, Rocket, Code, Plus, Search,
  Users, Clock, FolderOpen, GitBranch, Share2, Play, Activity, LogOut,
  Square, Trash2, Terminal, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShareWorkspaceModal from '../../components/ShareWorkspaceModal';

const TEMPLATE_COLORS = {
  python: '#3572A5',
  nodejs: '#68A063',
  mern: '#4DB33D',
  java: '#ED8B00',
};

const Dashboard = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const statsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/workspaces/dashboard/stats`, {
        credentials: 'include'
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      const workspacesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/workspaces/list`, {
        credentials: 'include'
      });
      if (workspacesResponse.ok) {
        const workspacesData = await workspacesResponse.json();
        setWorkspaces(workspacesData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
      alert(`Template ${template.name} is not configured.`);
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
          alert('Session expired. Please login again.');
          navigate('/');
          return;
        }
        closePendingIdeTab(ideTab);
        const errorMsg = data.message || data.error || `Server error (${response.status})`;
        alert(`Failed to launch workspace: ${errorMsg}`);
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
      alert(`Failed to start workspace: ${error.message}`);
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
      alert(`Failed to stop workspace: ${error.message}`);
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
      alert(`Failed to start workspace: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteWorkspace = async (workspaceId, workspaceName) => {
    if (!confirm(`Are you sure you want to delete "${workspaceName}"? This cannot be undone.`)) {
      return;
    }
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
      alert(`Failed to delete workspace: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const templates = [
    { id: 3, name: 'Python Development', description: 'Python 3.10 with Flask, FastAPI, and common packages', key: 'python', uses: 120 },
    { id: 4, name: 'Node.js Backend', description: 'Node 20 with Express, npm, and build tools', key: 'nodejs', uses: 80 },
    { id: 5, name: 'MERN Stack', description: 'MongoDB, Express, React, Node.js full-stack', key: 'mern', featured: true, uses: 200 },
    { id: 6, name: 'Java Development', description: 'JDK 17 with Maven, Gradle, and code-server', key: 'java', uses: 95 }
  ];

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

  const fade = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="min-h-screen" style={{ background: '#111114', color: '#e8e8ed' }}>

      {/* ── Top bar ── */}
      <nav className="sticky top-0 z-50 h-14 flex items-center px-6" style={{ background: 'rgba(17,17,20,0.88)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e1e24' }}>
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#f0b429' }}>
              <Terminal className="w-3.5 h-3.5" style={{ color: '#111114' }} />
            </div>
            <span className="font-semibold text-sm tracking-tight">DevPod</span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7a7a8e' }}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.login} className="w-6 h-6 rounded-full" style={{ border: '1px solid #22222a' }} />
                ) : (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium" style={{ background: '#22222a', color: '#7a7a8e' }}>
                    {user.login ? user.login[0].toUpperCase() : '?'}
                  </div>
                )}
                <span className="text-xs">{user.name || user.login}</span>
              </div>
            )}
            <button onClick={handleLogout} className="p-1.5 rounded transition-colors" style={{ color: '#4a4a58' }} title="Logout"
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ff6b6b')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#4a4a58')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Header + Stats ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight mb-4">
              Welcome back, {user?.name || user?.login || 'Developer'}
            </h1>
            <div className="flex items-center gap-6 text-xs" style={{ color: '#5a5a6a' }}>
              {[
                { label: 'active', value: stats.activeWorkspaces },
                { label: 'projects', value: stats.totalProjects },
                { label: 'collaborators', value: stats.collaborators },
                { label: 'hours saved', value: stats.hoursSaved },
              ].map((s, i) => (
                <span key={i}>
                  <span className="font-semibold text-sm" style={{ color: '#e8e8ed' }}>{s.value}</span>{' '}
                  {s.label}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('templates')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
            style={{ background: '#f0b429', color: '#111114' }}
          >
            <Plus className="w-4 h-4" />
            New Workspace
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-6 mb-8" style={{ borderBottom: '1px solid #1e1e24' }}>
          {[
            { id: 'workspaces', label: 'Workspaces', icon: <Monitor className="w-3.5 h-3.5" /> },
            { id: 'templates', label: 'Templates', icon: <Rocket className="w-3.5 h-3.5" /> },
            { id: 'activity', label: 'Activity', icon: <Activity className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id === 'activity') loadActivities(); }}
              className="flex items-center gap-1.5 pb-3 text-xs font-medium -mb-px transition-colors"
              style={{
                borderBottom: activeTab === tab.id ? '2px solid #f0b429' : '2px solid transparent',
                color: activeTab === tab.id ? '#e8e8ed' : '#5a5a6a',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">

          {/* Workspaces */}
          {activeTab === 'workspaces' && (
            <motion.div key="workspaces" initial="hidden" animate="show" exit="hidden" variants={{ show: { transition: { staggerChildren: 0.04 } }, hidden: {} }}>
              <motion.div variants={fade} className="flex gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#4a4a58' }} />
                  <input
                    type="text"
                    placeholder="Search workspaces..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none transition-colors"
                    style={{ background: '#16161a', border: '1px solid #22222a', color: '#e8e8ed' }}
                    onFocus={(e) => (e.target.style.borderColor = '#33333d')}
                    onBlur={(e) => (e.target.style.borderColor = '#22222a')}
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 rounded-lg text-xs focus:outline-none"
                  style={{ background: '#16161a', border: '1px solid #22222a', color: '#9898a8' }}
                >
                  <option value="all">All</option>
                  <option value="running">Running</option>
                  <option value="stopped">Stopped</option>
                </select>
              </motion.div>

              {filteredWorkspaces.length === 0 ? (
                <motion.div variants={fade} className="text-center py-20 rounded-xl" style={{ background: '#16161a', border: '1px solid #1e1e24' }}>
                  <FolderOpen className="w-10 h-10 mx-auto mb-3" style={{ color: '#2a2a35' }} />
                  <p className="text-sm font-medium mb-1" style={{ color: '#7a7a8e' }}>No workspaces yet</p>
                  <p className="text-xs mb-5" style={{ color: '#4a4a58' }}>Launch one from the Templates tab</p>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                    style={{ background: '#f0b429', color: '#111114' }}
                  >
                    Browse Templates
                  </button>
                </motion.div>
              ) : (
                <motion.div variants={{ show: { transition: { staggerChildren: 0.03 } }, hidden: {} }} className="rounded-xl overflow-hidden" style={{ border: '1px solid #1e1e24' }}>
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_120px_100px_140px_140px] gap-4 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: '#16161a', color: '#4a4a58', borderBottom: '1px solid #1e1e24' }}>
                    <span>Workspace</span>
                    <span>Template</span>
                    <span>Status</span>
                    <span>Last accessed</span>
                    <span className="text-right">Actions</span>
                  </div>

                  {filteredWorkspaces.map((workspace) => {
                    const isLoading = actionLoading === workspace.workspaceId;
                    const tColor = TEMPLATE_COLORS[workspace.template] || '#5a5a6a';
                    return (
                      <motion.div
                        key={workspace._id || workspace.id}
                        variants={fade}
                        className="grid grid-cols-[1fr_120px_100px_140px_140px] gap-4 items-center px-5 py-3.5 transition-colors duration-150"
                        style={{ borderBottom: '1px solid #1e1e24', background: '#111114' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#14141a')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#111114')}
                      >
                        {/* Name */}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#e8e8ed' }}>{workspace.name}</p>
                          <p className="text-[11px] truncate mt-0.5" style={{ color: '#4a4a58' }}>{workspace.description}</p>
                        </div>

                        {/* Template */}
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tColor }} />
                          <span className="text-xs font-mono" style={{ color: '#7a7a8e' }}>{workspace.template}</span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${workspace.status === 'running' ? 'bg-green-400' : 'bg-zinc-600'}`} />
                          <span className="text-xs" style={{ color: workspace.status === 'running' ? '#4ade80' : '#5a5a6a' }}>{workspace.status}</span>
                        </div>

                        {/* Last accessed */}
                        <span className="text-xs font-mono" style={{ color: '#4a4a58' }}>
                          {new Date(workspace.lastAccessed).toLocaleDateString()}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-1">
                          {workspace.status === 'running' ? (
                            <>
                              <button
                                onClick={() => window.open(`http://localhost:${workspace.idePort}`, '_blank')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 hover:brightness-110"
                                style={{ background: '#f0b429', color: '#111114' }}
                              >
                                <ExternalLink className="w-3 h-3" />
                                Open
                              </button>
                              <button onClick={() => setShareWorkspace(workspace)} className="p-1.5 rounded-md transition-colors" style={{ color: '#4a4a58' }} title="Share"
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#7a7a8e')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#4a4a58')}
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => stopWorkspace(workspace.workspaceId)} disabled={isLoading} className="p-1.5 rounded-md transition-colors disabled:opacity-40" style={{ color: '#4a4a58' }} title="Stop"
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#fbbf24')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#4a4a58')}
                              >
                                <Square className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startWorkspace(workspace.workspaceId)}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors disabled:opacity-40"
                              style={{ background: '#1e1e24', color: '#9898a8', border: '1px solid #2a2a35' }}
                            >
                              <Play className="w-3 h-3" />
                              {isLoading ? 'Starting...' : 'Start'}
                            </button>
                          )}
                          <button onClick={() => deleteWorkspace(workspace.workspaceId, workspace.name)} disabled={isLoading} className="p-1.5 rounded-md transition-colors disabled:opacity-40" style={{ color: '#4a4a58' }} title="Delete"
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ff6b6b')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#4a4a58')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Templates */}
          {activeTab === 'templates' && (
            <motion.div key="templates" initial="hidden" animate="show" exit="hidden" variants={{ show: { transition: { staggerChildren: 0.06 } }, hidden: {} }}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {templates.map((template) => {
                  const isTemplateLaunching = launchingTemplateId === template.id;
                  const tColor = TEMPLATE_COLORS[template.key] || '#5a5a6a';
                  return (
                    <motion.div
                      key={template.id}
                      variants={fade}
                      className="rounded-xl p-5 transition-colors duration-200 group"
                      style={{ background: '#16161a', border: '1px solid #22222a', borderTop: `2px solid ${tColor}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a20')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#16161a')}
                    >
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold mb-1" style={{ color: '#e8e8ed' }}>{template.name}</h3>
                        <p className="text-xs leading-relaxed" style={{ color: '#5a5a6a' }}>{template.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono" style={{ color: '#3a3a45' }}>{template.uses} launches</span>
                        <button
                          onClick={() => launchWorkspace(template)}
                          disabled={isTemplateLaunching}
                          className="px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150 disabled:opacity-40 hover:brightness-110"
                          style={{ background: '#f0b429', color: '#111114' }}
                        >
                          {isTemplateLaunching ? 'Launching...' : 'Launch'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Activity */}
          {activeTab === 'activity' && (
            <motion.div key="activity" initial="hidden" animate="show" exit="hidden" variants={{ show: { transition: { staggerChildren: 0.03 } }, hidden: {} }}>
              {activities.length === 0 ? (
                <motion.div variants={fade} className="text-center py-20">
                  <Activity className="w-8 h-8 mx-auto mb-3" style={{ color: '#2a2a35' }} />
                  <p className="text-sm" style={{ color: '#4a4a58' }}>No activity yet</p>
                </motion.div>
              ) : (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1e1e24' }}>
                  {activities.map((activity, i) => (
                    <motion.div
                      key={activity._id}
                      variants={fade}
                      className="flex items-center justify-between px-5 py-3 transition-colors"
                      style={{ borderBottom: i < activities.length - 1 ? '1px solid #1e1e24' : 'none', background: '#111114' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#14141a')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#111114')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f0b429' }} />
                        <div>
                          <p className="text-xs font-medium" style={{ color: '#c8c8d0' }}>{formatAction(activity.action)}</p>
                          <p className="text-[11px]" style={{ color: '#4a4a58' }}>{activity.workspaceId?.name || ''}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono" style={{ color: '#3a3a45' }}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {shareWorkspace && (
        <ShareWorkspaceModal workspace={shareWorkspace} onClose={() => setShareWorkspace(null)} />
      )}
    </div>
  );
};

export default Dashboard;
