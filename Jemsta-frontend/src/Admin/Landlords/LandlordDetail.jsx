import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


// const BASE_URL = "http://127.0.0.1:8000/api";

const LandlordDetail = () => {
  const { authFetch } = useAuth();
  const { landlordId } = useParams();
  const navigate = useNavigate();

  const [landlord, setLandlord]     = useState(null);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants]       = useState([]);
  const [managers, setManagers]     = useState([]);
  const [comments, setComments]     = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      // NOTE: was `/landlords/landlords/${id}/` — double-nested and inconsistent with the
      // list page, which fetches `/landlords/`. Aligned to the same base path here.
      authFetch(`${BASE_URL}/landlords/${landlordId}/`).then(r => {
        if (!r.ok) throw new Error(`Landlord not found (${r.status})`);
        return r.json();
      }),
      authFetch(`${BASE_URL}/properties/properties/?landlord=${landlordId}`).then(r => r.json()).catch(() => []),
      authFetch(`${BASE_URL}/tenants/tenants/?landlord=${landlordId}`).then(r => r.json()).catch(() => []),
      authFetch(`${BASE_URL}/users/users/`).then(r => r.json()).catch(() => []),
    ])
      .then(([landlordData, propertiesData, tenantsData, usersData]) => {
        setLandlord(landlordData);
        setProperties(Array.isArray(propertiesData) ? propertiesData : []);
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
        setManagers(Array.isArray(usersData) ? usersData : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [landlordId]);

  // Landlord no longer has a top-level `name` — build a display name from members' contacts
  // (sole = one name, joint = "First Last & First Last").
  const landlordName = landlord
    ? (landlord.members || [])
        .map(m => [m.contact?.first_name, m.contact?.last_name].filter(Boolean).join(' '))
        .filter(Boolean)
        .join(' & ') || `Landlord #${landlord.id}`
    : '';

  const managerName = (val) => {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'object') {
      return [val.first_name, val.last_name].filter(Boolean).join(' ') || val.username || '—';
    }
    const id = typeof val === 'number' ? val : (/^\d+$/.test(val) ? Number(val) : null);
    if (id !== null) {
      const m = managers.find(u => u.id === id);
      return m ? ([m.first_name, m.last_name].filter(Boolean).join(' ') || m.username) : `#${id}`;
    }
    // legacy: value was a username string
    const m = managers.find(u => u.username === val);
    return m ? ([m.first_name, m.last_name].filter(Boolean).join(' ') || m.username) : val;
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      author: 'Admin',
      role: 'Admin',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      message: newComment.trim(),
    };
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <svg className="animate-spin h-6 w-6 mr-3 text-primaryGreen" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading landlord details...
    </div>
  );

  if (error || !landlord) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-red-500">⚠️ {error || 'Landlord not found'}</p>
      <button
        onClick={() => navigate('/admin/landlords')}
        className="px-4 py-2 bg-primaryGreen text-white text-sm rounded-lg hover:bg-green-800 transition-colors"
      >
        ← Back to Landlords
      </button>
    </div>
  );

  return (
    <div className=" mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/admin/landlords')}
          className="flex items-center gap-2 bg-primaryGreen text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-lg font-bold text-gray-900">{landlordName}</h1>
        <span className={`text-sm font-medium px-4 py-1 rounded-full border ${
          landlord.rsw_status
            ? 'border-primaryGreen text-primaryGreen'
            : 'border-gray-400 text-gray-500'
        }`}>
          {landlord.rsw_status ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* ── Overview ── */}
      <Section title="Overview">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <DetailRow label="Company/Owner:"      value={landlordName} />
            <DetailRow label="Ownership Type:"     value={landlord.type || '—'} />
            <DetailRow label="Plan:"               value={landlord.plan || '—'} />
            <DetailRow label="Account Number:"     value={landlord.account_number || '—'} />
            <DetailRow label="Correspondence Address:" value={landlord.correspondence_address || '—'} />
            <DetailRow label="Status:" value={landlord.rsw_status ? 'Active' : 'Inactive'} />
          </div>
        </div>
      </Section>

      {/* ── Members / Owners ── */}
      <Section title="Owner(s)">
        {(landlord.members || []).length === 0 ? (
          <EmptyCard message="No owner details on file for this landlord." />
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
            {landlord.members.map((m, i) => (
              <div key={m.id ?? i} className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {[m.contact?.first_name, m.contact?.last_name].filter(Boolean).join(' ') || '—'}
                  </span>
                  {m.is_primary && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-primaryGreen rounded-full font-medium">Primary</span>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {m.contact?.email || '—'} · {m.contact?.phone || '—'}
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {m.receives_notifications ? 'Receives notifications' : 'No notifications'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Managers ── */}
      <Section title="Managers">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-x-8 gap-y-3">
            <DetailRow label="Finance Manager:"  value={managerName(landlord.finance_manager)} />
            <DetailRow label="Property Manager:" value={managerName(landlord.property_manager)} />
            <DetailRow label="Sales Manager:"    value={managerName(landlord.sales_manager)} />
          </div>
        </div>
      </Section>

      {/* ── Property ── */}
      <Section title="Property">
        {properties.length === 0 ? (
          <EmptyCard message="No properties linked to this landlord." />
        ) : (
          properties.map(p => (
            <div key={p.id} className="border-2 border-blue-400 rounded-lg p-4 bg-white mb-3">
              <DetailRow label="Landlord:" value={landlordName} link />
              <DetailRow label="Property:" value={p.name || p.address || `Property #${p.id}`} link />
              <DetailRow label="Address:"  value={p.address || p.correspondence_address || '—'} />
            </div>
          ))
        )}
      </Section>

      {/* ── Tenants ── */}
      <Section title="Tenants">
        {tenants.length === 0 ? (
          <EmptyCard message="No tenants linked to this landlord." />
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {tenants.map((t, i) => (
              <div key={t.id}>
                <span className="text-primaryGreen text-sm font-medium cursor-pointer hover:underline">
                  {t.name || t.full_name || `Tenant #${t.id}`}
                </span>
                {i < tenants.length - 1 && <hr className="my-2 border-gray-100" />}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Comments ── */}
      <Section title="Comments">
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-400 mb-2">Add a comment here</p>
          <textarea
            className="w-full border border-gray-200 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primaryGreen"
            rows={4}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button
            onClick={handleCommentSubmit}
            className="mt-3 bg-primaryGreen text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-green-800 transition-colors"
          >
            Submit
          </button>
        </div>

        {comments.length > 0 && <hr className="border-gray-200 mb-3" />}

        {comments.map(c => (
          <div key={c.id} className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-gray-900">{c.author}</span>
              <span className="text-xs text-gray-400">({c.role}) · {c.date}, {c.time}</span>
            </div>
            <p className="text-sm text-gray-700">{c.message}</p>
          </div>
        ))}
      </Section>

    </div>
  );
};

/* ── Reusable sub-components ── */
const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">{title}</h2>
    {children}
  </div>
);

const DetailRow = ({ label, value, link = false }) => (
  <div className="flex gap-2 items-start">
    <span className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</span>
    {link ? (
      <span className="text-sm text-primaryGreen font-medium cursor-pointer hover:underline">{value}</span>
    ) : (
      <span className="text-sm text-gray-900">{value}</span>
    )}
  </div>
);

const EmptyCard = ({ message }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-400 text-center">
    {message}
  </div>
);

export default LandlordDetail;