import React from 'react';

// Colours follow the same soft-pill style used for status badges elsewhere
// in the admin portal (see Projects.jsx statusBadge).
const ACTION_STYLES = {
  create:        'bg-green-100 text-green-700',
  update:        'bg-blue-100 text-blue-700',
  delete:        'bg-red-100 text-red-700',
  login:         'bg-emerald-50 text-emerald-700',
  login_failed:  'bg-orange-100 text-orange-700',
  otp_requested: 'bg-purple-100 text-purple-700',
  access:        'bg-gray-100 text-gray-600',
  export:        'bg-amber-100 text-amber-700',
  custom:        'bg-gray-100 text-gray-600',
};

// Used only if the /logs/filters/ call fails — values are from the API doc.
export const FALLBACK_ACTIONS = [
  'create', 'update', 'delete', 'login', 'login_failed',
  'otp_requested', 'access', 'export', 'custom',
].map(value => ({ value, label: actionLabel(value) }));

export function actionLabel(value) {
  if (!value) return '—';
  const text = String(value).replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const ActionBadge = ({ action }) => (
  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${ACTION_STYLES[action] || 'bg-gray-100 text-gray-600'}`}>
    {actionLabel(action)}
  </span>
);

// Timestamps arrive as ISO 8601 UTC — shown in the viewer's local time.
export const fmtTimestamp = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

// actor is null for system actions (management commands, shell, etc.).
// If a user was later deleted, actor.id is null but the email is kept.
export const actorLabel = (actor) => {
  if (!actor) return 'System';
  return actor.email || (actor.id != null ? `User #${actor.id}` : 'Unknown user');
};

// Turns an error response into one readable line. Handles the shapes in the
// doc: {"detail": "..."} and {"date_from": "Use YYYY-MM-DD..."}.
export async function readApiError(res) {
  try {
    const body = await res.json();
    if (typeof body?.detail === 'string') return body.detail;
    if (body && typeof body === 'object') {
      const parts = Object.entries(body).map(([field, msg]) =>
        `${field}: ${Array.isArray(msg) ? msg.join(' ') : msg}`
      );
      if (parts.length) return parts.join(' · ');
    }
  } catch { /* not JSON — fall through */ }
  return `Request failed (${res.status})`;
}

// Renders one side of a diff. Values that aren't plain JSON types come
// through as strings already; objects/arrays are pretty-printed.
export const ValueCell = ({ value }) => {
  if (value === null || value === undefined) {
    return <span className="italic text-gray-400">empty</span>;
  }
  if (value === '') {
    return <span className="italic text-gray-400">blank</span>;
  }
  if (typeof value === 'object') {
    return <pre className="whitespace-pre-wrap break-words text-xs font-mono">{JSON.stringify(value, null, 2)}</pre>;
  }
  return <span className="break-words">{String(value)}</span>;
};
