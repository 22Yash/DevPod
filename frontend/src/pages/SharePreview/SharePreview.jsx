import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Code } from 'lucide-react';
import './SharePreview.css';

export default function SharePreview() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [error, setError] = useState('');
  const [cloneError, setCloneError] = useState('');
  const [customName, setCustomName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    async function fetchSharePreview() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/share/${shareToken}`,
          {
            credentials: 'include'
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load share preview');
        }

        if (!isMounted) {
          return;
        }

        setShareData(data);
        setCustomName(`${data.name} (Copy)`);
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchSharePreview();

    // Check if user is logged in
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/user`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (isMounted) setIsLoggedIn(!!data?.authenticated); })
      .catch(() => { if (isMounted) setIsLoggedIn(false); });

    return () => {
      isMounted = false;
    };
  }, [shareToken]);

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

  const handleLoginToClone = () => {
    // Save current share URL so AuthCallback can redirect back here
    localStorage.setItem('redirectAfterLogin', `/share/${shareToken}`);
    const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GITHUB_CALLBACK_URL || 'http://localhost:5173/auth/callback';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email,repo`;
    window.location.href = githubAuthUrl;
  };

  const handleClone = async () => {
    setCloning(true);
    setCloneError('');
    const ideTab = openPendingIdeTab();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/share/${shareToken}/clone`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ customName })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clone workspace');
      }

      if (!data.workspace?.ideUrl) {
        throw new Error('No IDE URL received from server');
      }

      navigateToIde(ideTab, data.workspace.ideUrl);
      navigate('/dashboard');
    } catch (err) {
      closePendingIdeTab(ideTab);
      setCloneError(err.message);
      setCloning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-5">
        <div className="text-center">
          <div className="spinner w-14 h-14 border-[5px] border-slate-700 border-t-emerald-500 rounded-full mx-auto mb-5" />
          <p className="text-slate-400 text-base">Loading workspace preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-5">
        <div className="text-center max-w-md">
          <h2 className="text-white text-2xl font-semibold mb-3">Unable to Load Workspace</h2>
          <p className="text-slate-400 text-lg mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const statsText = [
    `${shareData.fileCount} files`,
    shareData.packages && shareData.packages.length > 0 ? `${shareData.packages.length} packages` : null,
    `${shareData.cloneCount} clones`
  ].filter(Boolean).join(' \u00B7 ');

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-5">
      <div className="share-preview-card bg-slate-800 border border-slate-700 rounded-2xl max-w-[800px] w-full overflow-hidden">
        <div className="bg-slate-800 px-8 py-7 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-4">
            <img
              src={shareData.owner.avatar}
              alt={shareData.owner.name}
              className="w-14 h-14 rounded-full border border-slate-600"
            />
            <div>
              <p className="text-slate-400 text-sm m-0">Shared by</p>
              <p className="text-white text-xl font-semibold mt-1 m-0">{shareData.owner.name}</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg font-medium uppercase text-sm tracking-wide">
            {shareData.template}
          </span>
        </div>

        <div className="p-10">
          <h1 className="text-white text-3xl font-bold m-0 mb-3">{shareData.name}</h1>
          {shareData.description && (
            <p className="text-slate-400 text-lg leading-relaxed m-0 mb-6">{shareData.description}</p>
          )}

          <p className="text-slate-400 text-sm mb-8">{statsText}</p>

          <div className="mb-8">
            <h3 className="text-white text-lg font-semibold m-0 mb-4">Files Included</h3>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 max-h-[300px] overflow-y-auto">
              {shareData.files.slice(0, 10).map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 py-2.5 px-2 ${index < Math.min(shareData.files.length, 10) - 1 ? 'border-b border-slate-700' : ''}`}
                >
                  <Code className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="flex-1 font-mono text-sm text-slate-300">{file.path}</span>
                  <span className="text-xs text-slate-500 font-mono">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
              ))}
              {shareData.files.length > 10 && (
                <p className="text-center text-slate-500 text-sm mt-3 m-0">
                  + {shareData.files.length - 10} more files
                </p>
              )}
            </div>
          </div>

          {shareData.packages && shareData.packages.length > 0 && (
            <div className="mb-8">
              <h3 className="text-white text-lg font-semibold m-0 mb-4">Packages</h3>
              <div className="flex flex-wrap gap-2">
                {shareData.packages.map((pkg, index) => (
                  <span key={index} className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-md text-sm font-mono">
                    {pkg}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-slate-300 text-lg font-semibold m-0 mb-2">Clone This Workspace</h3>
            <p className="text-slate-400 text-sm m-0 mb-5 leading-relaxed">
              Create your own copy of this workspace with all files and packages included.
            </p>

            {isLoggedIn === false ? (
              <button
                onClick={handleLoginToClone}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg text-lg transition-colors cursor-pointer border-none"
              >
                Login with GitHub to Clone
              </button>
            ) : (
              <>
                <div className="mb-5">
                  <label className="block mb-2 font-medium text-slate-300 text-sm">Workspace Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter workspace name"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-base outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                  />
                </div>

                {cloneError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-4">
                    {cloneError}
                  </div>
                )}

                <button
                  onClick={handleClone}
                  disabled={cloning || !customName.trim() || isLoggedIn === null}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500 text-white font-semibold rounded-lg text-lg transition-colors cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  {cloning ? (
                    <>
                      <span className="spinner-small w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full inline-block" />
                      Cloning Workspace...
                    </>
                  ) : (
                    'Clone Workspace'
                  )}
                </button>
              </>
            )}
          </div>

          {shareData.expiresAt && (
            <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-sm mt-4">
              This share link expires on {new Date(shareData.expiresAt).toLocaleString()}
            </div>
          )}

          {shareData.maxClones && (
            <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-sm mt-4">
              {shareData.cloneCount} / {shareData.maxClones} clones used
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
