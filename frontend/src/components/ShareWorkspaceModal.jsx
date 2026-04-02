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
        className="share-modal-content bg-zinc-900 border border-zinc-800 rounded-xl w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100 m-0">Share Workspace</h2>
          <button
            className="text-zinc-500 hover:text-zinc-300 bg-transparent border-none text-xl cursor-pointer w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-zinc-800"
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-5 p-4 bg-zinc-800/50 rounded-lg border border-zinc-800">
            <h3 className="text-zinc-100 text-base font-medium m-0 mb-2">{workspace.name}</h3>
            <span className="inline-block px-3 py-1 bg-amber-500/15 text-amber-400 rounded text-xs font-medium font-mono">
              {workspace.template}
            </span>
          </div>

          {!shareData ? (
            <>
              <div className="mb-5 space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-zinc-300">
                    Expires In (hours)
                  </label>
                  <input
                    type="number"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    min="1"
                    max="168"
                    placeholder="24"
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors placeholder:text-zinc-500"
                  />
                  <p className="mt-1.5 text-xs text-zinc-500">Link will expire after this many hours (max 7 days)</p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-zinc-300">
                    Max Clones (optional)
                  </label>
                  <input
                    type="number"
                    value={maxClones}
                    onChange={(e) => setMaxClones(e.target.value)}
                    min="1"
                    placeholder="Unlimited"
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors placeholder:text-zinc-500"
                  />
                  <p className="mt-1.5 text-xs text-zinc-500">Maximum number of times this workspace can be cloned</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-900 font-semibold text-sm rounded-md cursor-pointer transition-colors disabled:cursor-not-allowed"
                onClick={generateShareLink}
                disabled={loading}
              >
                {loading ? 'Creating Share Link...' : 'Generate Share Link'}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4 text-emerald-400 text-sm font-medium">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2 8 6 12 14 4" />
                </svg>
                Share link created successfully
              </div>

              <div className="mb-4 px-3 py-2.5 bg-zinc-800/50 rounded-md text-sm text-zinc-400 space-y-1">
                <div>
                  <span className="text-zinc-500">Files:</span>{' '}
                  <span className="text-zinc-300">{shareData.fileCount}</span>
                  <span className="mx-2 text-zinc-700">|</span>
                  <span className="text-zinc-500">Size:</span>{' '}
                  <span className="text-zinc-300">{(shareData.totalSize / 1024).toFixed(2)} KB</span>
                </div>
                {shareData.expiresAt && (
                  <div>
                    <span className="text-zinc-500">Expires:</span>{' '}
                    <span className="text-zinc-300">{new Date(shareData.expiresAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mb-5">
                <input
                  type="text"
                  value={shareData.shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-300 text-sm font-mono focus:outline-none min-w-0"
                />
                <button
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold text-sm rounded-md cursor-pointer transition-colors whitespace-nowrap border-none"
                  onClick={copyToClipboard}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-md cursor-pointer transition-colors border border-zinc-700"
                  onClick={revokeShareLink}
                >
                  Revoke Link
                </button>
                <button
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-sm font-semibold rounded-md cursor-pointer transition-colors border-none"
                  onClick={onClose}
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
