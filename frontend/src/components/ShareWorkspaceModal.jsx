import { useState, useEffect } from 'react';
import './ShareWorkspaceModal.css';

export default function ShareWorkspaceModal({ workspace, onClose, onShareCreated }) {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [error, setError] = useState('');
  const [expiresIn, setExpiresIn] = useState(24);
  const [maxClones, setMaxClones] = useState('');
  const [copied, setCopied] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // If workspace is already shared, load the existing share info
  useEffect(() => {
    if (workspace.isShared && workspace.shareToken) {
      setLoadingExisting(true);
      fetch(
        `${import.meta.env.VITE_API_URL}/api/share/${workspace.shareToken}`,
        { credentials: 'include' }
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            const shareUrl = `${window.location.origin}/share/${workspace.shareToken}`;
            setShareData({
              shareUrl,
              shareToken: workspace.shareToken,
              fileCount: data.fileCount,
              totalSize: data.files?.reduce((sum, f) => sum + f.size, 0) || 0,
              expiresAt: data.expiresAt,
              existing: true,
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoadingExisting(false));
    }
  }, [workspace]);

  const generateShareLink = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/workspace/${workspace.workspaceId}/share`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            expiresIn: parseInt(expiresIn),
            maxClones: maxClones ? parseInt(maxClones) : null
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create share link');
      }

      setShareData(data);
      if (onShareCreated) {
        onShareCreated(workspace.workspaceId, data.shareToken);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareData.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showShareResult = shareData && !loadingExisting;
  const showGenerateForm = !shareData && !loadingExisting;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share Workspace</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="workspace-info">
            <h3>{workspace.name}</h3>
            <p className="template-badge">{workspace.template}</p>
          </div>

          {loadingExisting && (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px 0' }}>
              Loading share info...
            </p>
          )}

          {showGenerateForm && (
            <>
              <div className="share-options">
                <div className="form-group">
                  <label>Expires In (hours)</label>
                  <input
                    type="number"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    min="1"
                    max="168"
                    placeholder="24"
                  />
                  <small>Link will expire after this many hours (max 7 days)</small>
                </div>

                <div className="form-group">
                  <label>Max Clones (optional)</label>
                  <input
                    type="number"
                    value={maxClones}
                    onChange={(e) => setMaxClones(e.target.value)}
                    min="1"
                    placeholder="Unlimited"
                  />
                  <small>Maximum number of times this workspace can be cloned</small>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                className="btn-primary"
                onClick={generateShareLink}
                disabled={loading}
              >
                {loading ? 'Creating Share Link...' : 'Generate Share Link'}
              </button>
            </>
          )}

          {showShareResult && (
            <>
              {!shareData.existing && (
                <div className="share-success">
                  <div className="success-icon">✓</div>
                  <p>Share link created successfully!</p>
                </div>
              )}

              <div className="share-stats">
                <div className="stat">
                  <span className="stat-label">Files:</span>
                  <span className="stat-value">{shareData.fileCount}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Size:</span>
                  <span className="stat-value">
                    {(shareData.totalSize / 1024).toFixed(2)} KB
                  </span>
                </div>
                {shareData.expiresAt && (
                  <div className="stat">
                    <span className="stat-label">Expires:</span>
                    <span className="stat-value">
                      {new Date(shareData.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="share-url-container">
                <input
                  type="text"
                  value={shareData.shareUrl}
                  readOnly
                  className="share-url-input"
                />
                <button
                  className="btn-copy"
                  onClick={copyToClipboard}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>

              <div className="share-actions">
                <button className="btn-primary" onClick={onClose}>
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
