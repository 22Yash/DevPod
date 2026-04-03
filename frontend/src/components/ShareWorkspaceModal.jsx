import { useState, useEffect } from 'react';
import './ShareWorkspaceModal.css';

const SHAREABLE_TEMPLATES = new Set(['python', 'nodejs', 'java']);

export default function ShareWorkspaceModal({ workspace, onClose, onShareCreated }) {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [error, setError] = useState('');
  const [expiresIn, setExpiresIn] = useState(24);
  const [maxClones, setMaxClones] = useState('');
  const [copied, setCopied] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const isShareableTemplate = SHAREABLE_TEMPLATES.has(workspace.template);

  // If workspace is already shared, load the existing share info
  useEffect(() => {
    if (isShareableTemplate && workspace.isShared && workspace.shareToken) {
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
  }, [isShareableTemplate, workspace]);

  const generateShareLink = async () => {
    if (!isShareableTemplate) {
      setError('Sharing is supported for Python, Node.js, and Java workspaces only.');
      return;
    }

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
    <div
      className="modal-overlay fixed inset-0 z-[1000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="modal-content bg-slate-800 border border-slate-700 rounded-xl w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <h2 className="m-0 text-lg font-semibold text-white">Share Workspace</h2>
          <button
            className="flex items-center justify-center w-8 h-8 text-2xl text-slate-400 bg-transparent border-none rounded-md cursor-pointer transition-colors hover:text-white hover:bg-slate-700"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
            <h3 className="m-0 mb-2 text-base font-medium text-white">{workspace.name}</h3>
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-emerald-500/10 text-emerald-400">
              {workspace.template}
            </span>
          </div>

          {!isShareableTemplate && (
            <div className="p-3 mb-4 text-sm rounded-md bg-red-500/10 border border-red-500/30 text-red-400">
              Sharing is supported for Python, Node.js, and Java workspaces only.
            </div>
          )}

          {loadingExisting && (
            <p className="text-center text-slate-400 py-5">
              Loading share info...
            </p>
          )}

          {isShareableTemplate && showGenerateForm && (
            <>
              <div className="mb-6">
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-slate-300">
                    Expires In (hours)
                  </label>
                  <input
                    type="number"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    min="1"
                    max="168"
                    placeholder="24"
                    className="w-full px-3 py-2.5 text-base text-white bg-slate-900 border border-slate-700 rounded-md outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 placeholder:text-slate-500"
                  />
                  <small className="block mt-1.5 text-xs text-slate-500">
                    Link will expire after this many hours (max 7 days)
                  </small>
                </div>

                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-slate-300">
                    Max Clones (optional)
                  </label>
                  <input
                    type="number"
                    value={maxClones}
                    onChange={(e) => setMaxClones(e.target.value)}
                    min="1"
                    placeholder="Unlimited"
                    className="w-full px-3 py-2.5 text-base text-white bg-slate-900 border border-slate-700 rounded-md outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 placeholder:text-slate-500"
                  />
                  <small className="block mt-1.5 text-xs text-slate-500">
                    Maximum number of times this workspace can be cloned
                  </small>
                </div>
              </div>

              {error && (
                <div className="p-3 mb-4 text-sm rounded-md bg-red-500/10 border border-red-500/30 text-red-400">
                  {error}
                </div>
              )}

              <button
                className="w-full py-2.5 px-5 text-sm font-medium text-white bg-emerald-500 border-none rounded-md cursor-pointer transition-colors hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed"
                onClick={generateShareLink}
                disabled={loading}
              >
                {loading ? 'Creating Share Link...' : 'Generate Share Link'}
              </button>
            </>
          )}

          {isShareableTemplate && showShareResult && (
            <>
              {!shareData.existing && (
                <div className="text-center mb-6">
                  <div className="success-icon w-11 h-11 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl mx-auto mb-3">
                    ✓
                  </div>
                  <p className="m-0 text-emerald-400 font-medium text-sm">
                    Share link created successfully!
                  </p>
                </div>
              )}

              <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 mb-5 p-4 bg-slate-900 rounded-lg border border-slate-700">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Files:</span>
                  <span className="text-base font-semibold text-white">{shareData.fileCount}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Size:</span>
                  <span className="text-base font-semibold text-white">
                    {(shareData.totalSize / 1024).toFixed(2)} KB
                  </span>
                </div>
                {shareData.expiresAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Expires:</span>
                    <span className="text-base font-semibold text-white">
                      {new Date(shareData.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mb-5">
                <input
                  type="text"
                  value={shareData.shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2.5 text-sm font-mono text-white bg-slate-900 border border-slate-700 rounded-md outline-none"
                />
                <button
                  className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-500 border-none rounded-md cursor-pointer whitespace-nowrap transition-colors hover:bg-emerald-600"
                  onClick={copyToClipboard}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="flex-1 py-2.5 px-5 text-sm font-medium text-white bg-emerald-500 border-none rounded-md cursor-pointer transition-colors hover:bg-emerald-600"
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
