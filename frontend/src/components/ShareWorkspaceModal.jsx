import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './ShareWorkspaceModal.css';

export default function ShareWorkspaceModal({ workspace, onClose }) {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [error, setError] = useState('');
  const [expiresIn, setExpiresIn] = useState(24);
  const [maxClones, setMaxClones] = useState('');
  const [copied, setCopied] = useState(false);

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

  const revokeShareLink = async () => {
    if (!confirm('Are you sure you want to revoke this share link?')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/workspace/${workspace.workspaceId}/share`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (response.ok) {
        alert('Share link revoked successfully');
        onClose();
      }
    } catch (err) {
      alert('Failed to revoke share link');
    }
  };

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

          {!shareData ? (
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
          ) : (
            <>
              <div className="share-success">
                <div className="success-icon">✓</div>
                <p>Share link created successfully!</p>
              </div>

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
                <button className="btn-secondary" onClick={revokeShareLink}>
                  Revoke Link
                </button>
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
