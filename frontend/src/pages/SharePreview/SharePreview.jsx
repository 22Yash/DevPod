import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-5">
        <div className="text-center">
          <div className="share-spinner mx-auto mb-5"></div>
          <p className="text-zinc-400 text-sm">Loading workspace preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-5">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
              <circle cx="10" cy="10" r="8" />
              <line x1="10" y1="6" x2="10" y2="11" />
              <circle cx="10" cy="14" r="0.5" fill="#ef4444" />
            </svg>
          </div>
          <h2 className="text-zinc-100 text-xl font-semibold mb-2">Unable to Load Workspace</h2>
          <p className="text-zinc-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold text-sm rounded-md cursor-pointer transition-colors border-none"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-5 sm:p-10">
      <div className="share-preview-card bg-zinc-900 border border-zinc-800 rounded-xl max-w-[720px] w-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <img
              src={shareData.owner.avatar}
              alt={shareData.owner.name}
              className="w-10 h-10 rounded-full border-2 border-zinc-700"
            />
            <div>
              <p className="text-xs text-zinc-500 m-0">Shared by</p>
              <p className="text-sm text-zinc-200 font-medium m-0 mt-0.5">{shareData.owner.name}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded text-xs font-mono uppercase tracking-wide">
            {shareData.template}
          </span>
        </div>

        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-zinc-100 m-0 mb-2">{shareData.name}</h1>
          {shareData.description && (
            <p className="text-zinc-400 text-sm leading-relaxed m-0 mb-6">{shareData.description}</p>
          )}

          <div className="flex items-center gap-4 mb-6 text-sm text-zinc-400">
            <span>
              <span className="text-zinc-500">Files:</span>{' '}
              <span className="text-zinc-300 font-medium">{shareData.fileCount}</span>
            </span>
            {shareData.packages && shareData.packages.length > 0 && (
              <span>
                <span className="text-zinc-500">Packages:</span>{' '}
                <span className="text-zinc-300 font-medium">{shareData.packages.length}</span>
              </span>
            )}
            <span>
              <span className="text-zinc-500">Clones:</span>{' '}
              <span className="text-zinc-300 font-medium">{shareData.cloneCount}</span>
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-zinc-300 m-0 mb-3">Files Included</h3>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-1 max-h-[260px] overflow-y-auto">
              {shareData.files.slice(0, 10).map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 rounded hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="font-mono text-sm text-zinc-300 truncate mr-4">{file.path}</span>
                  <span className="text-xs text-zinc-600 font-mono whitespace-nowrap">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              ))}
              {shareData.files.length > 10 && (
                <p className="text-center text-zinc-600 text-xs m-0 py-2">
                  + {shareData.files.length - 10} more files
                </p>
              )}
            </div>
          </div>

          {shareData.packages && shareData.packages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-zinc-300 m-0 mb-3">Packages</h3>
              <div className="flex flex-wrap gap-2">
                {shareData.packages.map((pkg, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-zinc-800 text-zinc-400 rounded text-xs font-mono border border-zinc-700/50"
                  >
                    {pkg}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 pt-4 border-t border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-300 m-0 mb-1">Clone This Workspace</h3>
            <p className="text-zinc-500 text-xs m-0 mb-4">
              Create your own copy with all files and packages included.
            </p>

            <div className="mb-4">
              <label className="block mb-2 text-xs font-medium text-zinc-400">
                Workspace Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter workspace name"
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors placeholder:text-zinc-500"
              />
            </div>

            {cloneError && (
              <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
                {cloneError}
              </div>
            )}

            <button
              onClick={handleClone}
              disabled={cloning || !customName.trim()}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-900 font-semibold text-sm rounded-md cursor-pointer transition-colors disabled:cursor-not-allowed border-none flex items-center justify-center gap-2"
            >
              {cloning ? (
                <>
                  <span className="share-spinner-small"></span>
                  Cloning Workspace...
                </>
              ) : (
                'Clone Workspace'
              )}
            </button>
          </div>

          {(shareData.expiresAt || shareData.maxClones) && (
            <div className="pt-3 border-t border-zinc-800 space-y-1">
              {shareData.expiresAt && (
                <p className="text-xs text-zinc-500 m-0">
                  Expires {new Date(shareData.expiresAt).toLocaleString()}
                </p>
              )}
              {shareData.maxClones && (
                <p className="text-xs text-zinc-500 m-0">
                  {shareData.cloneCount} / {shareData.maxClones} clones used
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
