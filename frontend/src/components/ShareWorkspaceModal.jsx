import { useState } from 'react';
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
    } catch {
      alert('Failed to revoke share link');
    }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div
        className="share-modal-content rounded-xl w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: '#16161a',
          border: '1px solid #1e1e24',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid #1e1e24' }}
        >
          <h2 className="text-lg font-semibold m-0" style={{ color: '#e8e8ed' }}>
            Share Workspace
          </h2>
          <button
            className="bg-transparent border-none text-xl cursor-pointer w-8 h-8 flex items-center justify-center rounded-md transition-colors"
            style={{ color: '#4a4a58' }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#9898a8';
              e.currentTarget.style.backgroundColor = '#1a1a20';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4a4a58';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <div
            className="mb-5 p-4 rounded-lg"
            style={{
              backgroundColor: '#111114',
              border: '1px solid #1e1e24',
            }}
          >
            <h3 className="text-base font-medium m-0 mb-2" style={{ color: '#e8e8ed' }}>
              {workspace.name}
            </h3>
            <span
              className="inline-block px-3 py-1 rounded text-xs font-medium font-mono"
              style={{
                backgroundColor: 'rgba(240, 180, 41, 0.1)',
                color: '#f0b429',
              }}
            >
              {workspace.template}
            </span>
          </div>

          {!shareData ? (
            <>
              <div className="mb-5 space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: '#9898a8' }}>
                    Expires In (hours)
                  </label>
                  <input
                    type="number"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    min="1"
                    max="168"
                    placeholder="24"
                    className="w-full px-3 py-2.5 rounded-md text-sm transition-colors"
                    style={{
                      backgroundColor: '#111114',
                      border: '1px solid #22222a',
                      color: '#e8e8ed',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(240, 180, 41, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 0 1px rgba(240, 180, 41, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#22222a';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <p className="mt-1.5 text-xs m-0" style={{ color: '#4a4a58' }}>
                    Link will expire after this many hours (max 7 days)
                  </p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: '#9898a8' }}>
                    Max Clones (optional)
                  </label>
                  <input
                    type="number"
                    value={maxClones}
                    onChange={(e) => setMaxClones(e.target.value)}
                    min="1"
                    placeholder="Unlimited"
                    className="w-full px-3 py-2.5 rounded-md text-sm transition-colors"
                    style={{
                      backgroundColor: '#111114',
                      border: '1px solid #22222a',
                      color: '#e8e8ed',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(240, 180, 41, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 0 1px rgba(240, 180, 41, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#22222a';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <p className="mt-1.5 text-xs m-0" style={{ color: '#4a4a58' }}>
                    Maximum number of times this workspace can be cloned
                  </p>
                </div>
              </div>

              {error && (
                <div
                  className="mb-4 px-3 py-2.5 rounded-md text-sm"
                  style={{
                    backgroundColor: 'rgba(255, 107, 107, 0.08)',
                    border: '1px solid rgba(255, 107, 107, 0.15)',
                    color: '#ff6b6b',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                className="w-full py-2.5 px-4 font-semibold text-sm rounded-md cursor-pointer transition-colors border-none"
                style={{
                  backgroundColor: loading ? '#1e1e24' : '#f0b429',
                  color: loading ? '#4a4a58' : '#111114',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                onClick={generateShareLink}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#f5c240';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#f0b429';
                }}
              >
                {loading ? 'Creating Share Link...' : 'Generate Share Link'}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4 text-sm font-medium" style={{ color: '#4ade80' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 8 6.5 11.5 13 5" />
                </svg>
                Share link created
              </div>

              <div
                className="mb-4 px-3 py-2.5 rounded-md text-sm space-y-1"
                style={{
                  backgroundColor: '#111114',
                  border: '1px solid #1e1e24',
                }}
              >
                <div>
                  <span style={{ color: '#4a4a58' }}>Files:</span>{' '}
                  <span style={{ color: '#9898a8' }}>{shareData.fileCount}</span>
                  <span className="mx-2" style={{ color: '#1e1e24' }}>|</span>
                  <span style={{ color: '#4a4a58' }}>Size:</span>{' '}
                  <span style={{ color: '#9898a8' }}>{(shareData.totalSize / 1024).toFixed(2)} KB</span>
                </div>
                {shareData.expiresAt && (
                  <div>
                    <span style={{ color: '#4a4a58' }}>Expires:</span>{' '}
                    <span style={{ color: '#9898a8' }}>{new Date(shareData.expiresAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mb-5">
                <input
                  type="text"
                  value={shareData.shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2.5 rounded-md text-sm font-mono min-w-0"
                  style={{
                    backgroundColor: '#111114',
                    border: '1px solid #22222a',
                    color: '#9898a8',
                    outline: 'none',
                  }}
                />
                <button
                  className="px-4 py-2.5 font-semibold text-sm rounded-md cursor-pointer transition-colors whitespace-nowrap border-none"
                  style={{
                    backgroundColor: '#f0b429',
                    color: '#111114',
                  }}
                  onClick={copyToClipboard}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5c240'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f0b429'; }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2.5 text-sm font-medium rounded-md cursor-pointer transition-colors"
                  style={{
                    backgroundColor: '#16161a',
                    border: '1px solid #1e1e24',
                    color: '#9898a8',
                  }}
                  onClick={revokeShareLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a1a20';
                    e.currentTarget.style.borderColor = '#2a2a35';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#16161a';
                    e.currentTarget.style.borderColor = '#1e1e24';
                  }}
                >
                  Revoke Link
                </button>
                <button
                  className="px-4 py-2.5 text-sm font-semibold rounded-md cursor-pointer transition-colors border-none"
                  style={{
                    backgroundColor: '#f0b429',
                    color: '#111114',
                  }}
                  onClick={onClose}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5c240'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f0b429'; }}
                >
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
