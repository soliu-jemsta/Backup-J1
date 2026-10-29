import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import PageHeader from '../shared/PageHeader';
import AdminTable, { AdminTd } from '../shared/AdminTable';
import AuditDetailModal from './AuditDetailModal';
import {
  ActionBadge, FALLBACK_ACTIONS, actorLabel, fmtTimestamp, readApiError,
} from './auditUtils';

const PAGE_SIZES = [25, 50, 100, 200]; // API default is 50, max 200

const EMPTY_FILTERS = {
  q: '', action: '', model: '', actor_email: '',
  date_from: '', date_to: '', request_id: '', ordering: '-timestamp',
};

const FILTER_KEYS = ['q', 'action', 'model', 'actor_email', 'date_from', 'date_to', 'request_id'];

const inputCls =
  'w-full px-3 py-2 border border-primaryGreen rounded-lg text-sm bg-white placeholder-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:ring-opacity-30';

// Text filters shouldn't fire a request on every keystroke.
function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const Field = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    {children}
  </div>
);

const ChangedFields = ({ entry }) => {
  const fields = entry.changed_fields || [];
  if (fields.length === 0) return <span className="text-gray-300">—</span>;

  // Create/delete touch every field — a count reads better than a wall of chips.
  if (entry.action === 'create' || entry.action === 'delete') {
    return <span className="text-xs text-gray-500">{fields.length} field{fields.length === 1 ? '' : 's'}</span>;
  }

  const shown = fields.slice(0, 3);
  const extra = fields.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((f) => (
        <span key={f} className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-mono">{f}</span>
      ))}
      {extra > 0 && <span className="text-xs text-gray-400 self-center">+{extra} more</span>}
    </div>
  );
};

const AuditLog = () => {
  const { authFetch } = useAuth();

  const [filters,  setFilters]  = useState(EMPTY_FILTERS);
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [data,      setData]      = useState({ count: 0, results: [] });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [forbidden, setForbidden] = useState(false);

  const [filterOptions, setFilterOptions] = useState({ actions: FALLBACK_ACTIONS, models: [] });
  const [selectedId,    setSelectedId]    = useState(null);

  const debouncedQ     = useDebounced(filters.q);
  const debouncedEmail = useDebounced(filters.actor_email);

  // Guards against a slow earlier response overwriting a newer one.
  const requestSeq = useRef(0);

  // Dropdown options (actions + audited models) — loaded once.
  useEffect(() => {
    authFetch(`${BASE_URL}/audit/logs/filters/`)
      .then(res => (res.ok ? res.json() : null))
      .then(opts => {
        if (!opts) return;
        setFilterOptions({
          actions: Array.isArray(opts.actions) && opts.actions.length ? opts.actions : FALLBACK_ACTIONS,
          models:  Array.isArray(opts.models) ? opts.models : [],
        });
      })
      .catch(err => console.warn('[AuditLog] could not load filter options, using defaults', err));
  }, [authFetch]);

  // The list itself.
  useEffect(() => {
    const seq = ++requestSeq.current;

    const params = new URLSearchParams();
    const add = (key, value) => { if (value !== '' && value != null) params.set(key, value); };
    add('q',           debouncedQ.trim());
    add('actor_email', debouncedEmail.trim());
    add('action',      filters.action);
    add('model',       filters.model);
    add('date_from',   filters.date_from);
    add('date_to',     filters.date_to);
    add('request_id',  filters.request_id);
    params.set('ordering',  filters.ordering);
    params.set('page',      page);
    params.set('page_size', pageSize);

    const url = `${BASE_URL}/audit/logs/?${params.toString()}`;
    console.log('[AuditLog] GET', url);

    setLoading(true);
    setError(null);

    authFetch(url)
      .then(async (res) => {
        if (seq !== requestSeq.current) return;
        if (res.status === 403) {
          // Per the API doc: 403 means this user can't view the log at all.
          setForbidden(true);
          setData({ count: 0, results: [] });
          return;
        }
        if (!res.ok) throw new Error(await readApiError(res));
        const body = await res.json();
        if (seq !== requestSeq.current) return;
        setForbidden(false);
        setData({ count: body.count ?? 0, results: Array.isArray(body.results) ? body.results : [] });
      })
      .catch((err) => {
        console.error('[AuditLog] request failed', err);
        if (seq === requestSeq.current) setError(err.message);
      })
      .finally(() => {
        if (seq === requestSeq.current) setLoading(false);
      });
  }, [
    authFetch, debouncedQ, debouncedEmail,
    filters.action, filters.model, filters.date_from, filters.date_to,
    filters.request_id, filters.ordering, page, pageSize,
  ]);

  const updateFilter = (key) => (e) => {
    setFilters(prev => ({ ...prev, [key]: e.target.value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(prev => ({ ...EMPTY_FILTERS, ordering: prev.ordering }));
    setPage(1);
  };

  const filterByRequest = (requestId) => {
    setFilters(prev => ({ ...prev, request_id: requestId }));
    setPage(1);
    setSelectedId(null);
  };

  const hasActiveFilters = FILTER_KEYS.some(k => filters[k] !== '');
  const totalPages = Math.max(1, Math.ceil(data.count / pageSize));
  const rangeFrom  = data.count === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeTo    = (page - 1) * pageSize + data.results.length;

  if (forbidden) {
    return (
      <div>
        <PageHeader title="Audit Log" />
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-800 font-medium mb-1">You don't have permission to view the audit log.</p>
          <p className="text-sm text-gray-400">Ask an administrator to grant the "Can view audit log" permission to your group.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Audit Log" />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Field label="Search" className="md:col-span-2">
            <input
              type="text"
              className={inputCls}
              placeholder="Object name, actor email, object ID or request ID"
              value={filters.q}
              onChange={updateFilter('q')}
            />
          </Field>

          <Field label="Action">
            <select className={inputCls} value={filters.action} onChange={updateFilter('action')}>
              <option value="">All actions</option>
              {filterOptions.actions.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Model">
            <select
              className={inputCls}
              value={filters.model}
              onChange={updateFilter('model')}
              disabled={filterOptions.models.length === 0}
            >
              <option value="">All models</option>
              {filterOptions.models.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Actor email">
            <input
              type="text"
              className={inputCls}
              placeholder="Partial match"
              value={filters.actor_email}
              onChange={updateFilter('actor_email')}
            />
          </Field>

          <Field label="From">
            <input
              type="date"
              className={inputCls}
              value={filters.date_from}
              max={filters.date_to || undefined}
              onChange={updateFilter('date_from')}
            />
          </Field>

          <Field label="To">
            <input
              type="date"
              className={inputCls}
              value={filters.date_to}
              min={filters.date_from || undefined}
              onChange={updateFilter('date_to')}
            />
          </Field>

          <Field label="Order">
            <select className={inputCls} value={filters.ordering} onChange={updateFilter('ordering')}>
              <option value="-timestamp">Newest first</option>
              <option value="timestamp">Oldest first</option>
            </select>
          </Field>
        </div>

        {filters.request_id && (
          <div className="mt-3 flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-sm">
            <span className="text-gray-700">
              Showing everything from request <span className="font-mono text-xs">{filters.request_id}</span>
            </span>
            <button
              type="button"
              onClick={() => { setFilters(prev => ({ ...prev, request_id: '' })); setPage(1); }}
              className="text-primaryGreen hover:underline text-xs font-medium"
            >
              Clear
            </button>
          </div>
        )}

        {hasActiveFilters && (
          <div className="mt-3 text-right">
            <button type="button" onClick={clearFilters} className="text-sm text-primaryGreen hover:underline">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      <div className={`transition-opacity ${loading && data.results.length > 0 ? 'opacity-60' : ''}`}>
        <AdminTable columns={['Time', 'Action', 'Actor', 'Record', 'Changes', 'IP Address']}>
          {data.results.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-indigo-100 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedId(entry.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSelectedId(entry.id); }}
              tabIndex={0}
            >
              <AdminTd className="whitespace-nowrap text-xs">{fmtTimestamp(entry.timestamp)}</AdminTd>
              <AdminTd><ActionBadge action={entry.action} /></AdminTd>
              <AdminTd>
                <div className={entry.actor ? 'text-gray-800' : 'text-gray-400 italic'}>{actorLabel(entry.actor)}</div>
                {entry.actor?.role && <div className="text-xs text-gray-400">{entry.actor.role}</div>}
              </AdminTd>
              <AdminTd>
                {entry.model_name ? (
                  <>
                    <div className="font-medium text-gray-800">{entry.model_name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[240px]">
                      {entry.object_repr}{entry.object_id ? ` · #${entry.object_id}` : ''}
                    </div>
                  </>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </AdminTd>
              <AdminTd><ChangedFields entry={entry} /></AdminTd>
              <AdminTd className="text-xs font-mono">{entry.ip_address || '—'}</AdminTd>
            </tr>
          ))}

          {!loading && !error && data.results.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                {hasActiveFilters ? 'No entries match these filters.' : 'No audit entries yet.'}
              </td>
            </tr>
          )}

          {loading && data.results.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">Loading audit log...</td>
            </tr>
          )}
        </AdminTable>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-sm text-gray-600">
        <span>
          {data.count === 0 ? 'No entries' : `Showing ${rangeFrom}–${rangeTo} of ${data.count}`}
        </span>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Per page</span>
            <select
              className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 rounded-lg border border-primaryGreen text-primaryGreen disabled:opacity-40 hover:bg-green-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="px-3 py-1.5 rounded-lg border border-primaryGreen text-primaryGreen disabled:opacity-40 hover:bg-green-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {selectedId && (
        <AuditDetailModal
          entryId={selectedId}
          onClose={() => setSelectedId(null)}
          onFilterRequest={filterByRequest}
        />
      )}
    </div>
  );
};

export default AuditLog;
