import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import { ActionBadge, ValueCell, actorLabel, fmtTimestamp, readApiError } from './auditUtils';

const MetaRow = ({ label, children }) => (
  <div className="flex gap-3 py-1.5">
    <span className="text-xs text-gray-500 w-28 flex-shrink-0 pt-0.5">{label}</span>
    <span className="text-sm text-gray-900 min-w-0 break-words">{children}</span>
  </div>
);

const AuditDetailModal = ({ entryId, onClose, onFilterRequest }) => {
  const { authFetch } = useAuth();
  const [entry,   setEntry]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    authFetch(`${BASE_URL}/audit/logs/${entryId}/`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await readApiError(res));
        return res.json();
      })
      .then((data) => { if (!cancelled) setEntry(data); })
      .catch((err) => {
        console.error('[AuditDetail] failed to load entry', entryId, err);
        if (!cancelled) setError(err.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [entryId, authFetch]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const changeRows = entry?.changes ? Object.entries(entry.changes) : [];
  const metadataKeys = entry?.metadata ? Object.keys(entry.metadata) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-gray-900">Audit Entry</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="px-8 py-6">
          {loading && (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <svg className="animate-spin h-5 w-5 mr-3 text-primaryGreen" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading entry...
            </div>
          )}

          {!loading && error && (
            <p className="text-center text-red-500 py-12">⚠️ {error}</p>
          )}

          {!loading && !error && entry && (
            <>
              {/* Header facts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-6">
                <div>
                  <MetaRow label="Action"><ActionBadge action={entry.action} /></MetaRow>
                  <MetaRow label="When">
                    <span title={entry.timestamp}>{fmtTimestamp(entry.timestamp)}</span>
                  </MetaRow>
                  <MetaRow label="Actor">
                    {actorLabel(entry.actor)}
                    {entry.actor?.role && <span className="text-xs text-gray-400"> ({entry.actor.role})</span>}
                  </MetaRow>
                  <MetaRow label="Record">
                    {entry.model_name
                      ? <>{entry.model_name} — {entry.object_repr}{entry.object_id ? ` (#${entry.object_id})` : ''}</>
                      : <span className="text-gray-400">Not tied to a record</span>}
                  </MetaRow>
                </div>
                <div>
                  <MetaRow label="IP address">{entry.ip_address || '—'}</MetaRow>
                  <MetaRow label="Request">
                    {entry.method || entry.path
                      ? <span className="font-mono text-xs">{entry.method} {entry.path}</span>
                      : '—'}
                  </MetaRow>
                  <MetaRow label="Request ID">
                    {entry.request_id ? (
                      <span className="font-mono text-xs">
                        {entry.request_id}
                        {onFilterRequest && (
                          <button
                            type="button"
                            onClick={() => onFilterRequest(entry.request_id)}
                            className="ml-2 font-sans text-primaryGreen hover:underline"
                          >
                            See everything in this request
                          </button>
                        )}
                      </span>
                    ) : '—'}
                  </MetaRow>
                  <MetaRow label="User agent">
                    <span className="text-xs text-gray-600">{entry.user_agent || '—'}</span>
                  </MetaRow>
                </div>
              </div>

              {/* Diff */}
              <h4 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                Changes
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {changeRows.length} field{changeRows.length === 1 ? '' : 's'}
                </span>
              </h4>

              {changeRows.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No field changes recorded for this entry.</p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm table-fixed">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                        <th className="px-4 py-2 w-1/4">Field</th>
                        <th className="px-4 py-2 w-[37.5%]">Old value</th>
                        <th className="px-4 py-2 w-[37.5%]">New value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changeRows.map(([field, pair]) => {
                        const [oldValue, newValue] = Array.isArray(pair) ? pair : [null, pair];
                        return (
                          <tr key={field} className="border-t border-gray-100 align-top">
                            <td className="px-4 py-2.5 font-mono text-xs text-gray-700 break-words">{field}</td>
                            <td className="px-4 py-2.5 bg-red-50 text-red-800"><ValueCell value={oldValue} /></td>
                            <td className="px-4 py-2.5 bg-green-50 text-green-800"><ValueCell value={newValue} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {metadataKeys.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">Metadata</h4>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap break-words">
                    {JSON.stringify(entry.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditDetailModal;
