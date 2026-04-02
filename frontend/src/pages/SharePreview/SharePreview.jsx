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
      <div className="share-preview-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading workspace preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="share-preview-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Load Workspace</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="share-preview-container">
      <div className="share-preview-card">
        <div className="preview-header">
          <div className="owner-info">
            <img
              src={shareData.owner.avatar}
              alt={shareData.owner.name}
              className="owner-avatar"
            />
            <div>
              <p className="owner-label">Shared by</p>
              <p className="owner-name">{shareData.owner.name}</p>
            </div>
          </div>
          <span className="template-badge">{shareData.template}</span>
        </div>

        <div className="preview-body">
          <h1>{shareData.name}</h1>
          {shareData.description && (
            <p className="description">{shareData.description}</p>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📁</div>
              <div className="stat-info">
                <p className="stat-value">{shareData.fileCount}</p>
                <p className="stat-label">Files</p>
              </div>
            </div>

            {shareData.packages && shareData.packages.length > 0 && (
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <p className="stat-value">{shareData.packages.length}</p>
                  <p className="stat-label">Packages</p>
                </div>
              </div>
            )}

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <p className="stat-value">{shareData.cloneCount}</p>
                <p className="stat-label">Clones</p>
              </div>
            </div>
          </div>

          <div className="files-section">
            <h3>Files Included</h3>
            <div className="files-list">
              {shareData.files.slice(0, 10).map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-icon">📄</span>
                  <span className="file-path">{file.path}</span>
                  <span className="file-size">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              ))}
              {shareData.files.length > 10 && (
                <p className="more-files">
                  + {shareData.files.length - 10} more files
                </p>
              )}
            </div>
          </div>

          {shareData.packages && shareData.packages.length > 0 && (
            <div className="packages-section">
              <h3>Packages</h3>
              <div className="packages-list">
                {shareData.packages.map((pkg, index) => (
                  <span key={index} className="package-badge">
                    {pkg}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="clone-section">
            <h3>Clone This Workspace</h3>
            <p className="clone-description">
              Create your own copy of this workspace with all files and packages included.
            </p>

            <div className="form-group">
              <label>Workspace Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter workspace name"
                className="name-input"
              />
            </div>

            {cloneError && <div className="error-message">{cloneError}</div>}

            <button
              onClick={handleClone}
              disabled={cloning || !customName.trim()}
              className="btn-clone"
            >
              {cloning ? (
                <>
                  <span className="spinner-small"></span>
                  Cloning Workspace...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Clone Workspace
                </>
              )}
            </button>
          </div>

          {shareData.expiresAt && (
            <div className="expiry-notice">
              ⏰ This share link expires on{' '}
              {new Date(shareData.expiresAt).toLocaleString()}
            </div>
          )}

          {shareData.maxClones && (
            <div className="limit-notice">
              📊 {shareData.cloneCount} / {shareData.maxClones} clones used
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
