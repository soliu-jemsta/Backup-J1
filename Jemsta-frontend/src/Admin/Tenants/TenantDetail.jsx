import { useAuth } from '../../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


const BASE_URL = 'http://127.0.0.1:8000/api';

const TenantDetail = () => {
  const { authFetch } = useAuth();
  const { tenantId } = useParams();
  const navigate     = useNavigate();

  const [tenant,     setTenant]     = useState(null);
  const [property,   setProperty]   = useState(null);
  const [landlord,   setLandlord]   = useState(null);
  const [comments,   setComments]   = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    authFetch(`${BASE_URL}/tenants/tenants/${tenantId}/`)
      .then(r => {
        if (!r.ok) throw new Error(`Tenant not found (${r.status})`);
        return r.json();
      })
      .then(async (tenantData) => {
        setTenant(tenantData);

        if (tenantData.property) {
          const propRes = await authFetch(`${BASE_URL}/properties/properties/${tenantData.property}/`).catch(() => null);
          if (propRes && propRes.ok) {
            const propData = await propRes.json();
            setProperty(propData);
            const llId = propData.landlord;
            if (llId) {
              const llRes = await authFetch(`${BASE_URL}/landlords/landlords/${llId}/`).catch(() => null);
              if (llRes && llRes.ok) setLandlord(await llRes.json());
            }
          }
        }
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [tenantId]);

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    setComments(prev => [{
      id: Date.now(),
      author: 'Admin',
      role: 'Admin',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      message: newComment.trim(),
    }, ...prev]);
    setNewComment('');
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <svg className="animate-spin h-6 w-6 mr-3 text-primaryGreen" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading tenant details...
    </div>
  );

  if (error || !tenant) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-red-500">⚠️ {error || 'Tenant not found'}</p>
      <button onClick={() => navigate('/admin/tenants')}
        className="px-4 py-2 bg-primaryGreen text-white text-sm rounded-lg hover:bg-green-800 transition-colors">
        ← Back to Tenants
      </button>
    </div>
  );

  const fullName = `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || `Tenant #${tenant.id}`;

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/admin/tenants')}
          className="flex items-center gap-2 bg-primaryGreen text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors">
          ← Back
        </button>
        <h1 className="text-lg font-bold text-gray-900">{fullName}</h1>
        <span className={`text-sm font-medium px-4 py-1 rounded-full border ${
          tenant.is_active ? 'border-primaryGreen text-primaryGreen' : 'border-gray-400 text-gray-500'
        }`}>
          {tenant.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Overview */}
      <Section title="Overview">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <DetailRow label="First Name:"  value={tenant.first_name || '—'} />
            <DetailRow label="Last Name:"   value={tenant.last_name  || '—'} />
            <DetailRow label="Email:"       value={tenant.email      || '—'} />
            <DetailRow label="Phone:"       value={tenant.phone      || '—'} />
            <DetailRow label="Start Date:"  value={fmtDate(tenant.start_date)} />
            <DetailRow label="End Date:"    value={fmtDate(tenant.end_date)} />
          </div>
        </div>
      </Section>

      {/* Property */}
      <Section title="Property">
        {!property ? (
          <EmptyCard message="No property linked to this tenant." />
        ) : (
          <div className="border-2 border-blue-400 rounded-lg p-4 bg-white">
            <DetailRow label="Landlord:" value={landlord ? landlord.name : `Landlord #${property.landlord}`} link />
            <DetailRow label="Property:" value={property.name || `Property #${property.id}`} link />
            <DetailRow label="Address:"  value={property.address || '—'} />
            <DetailRow label="Rent:"     value={property.rent_amount ? `£${property.rent_amount}` : '—'} />
          </div>
        )}
      </Section>

      {/* Comments */}
      <Section title="Comments">
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-400 mb-2">Add a comment here</p>
          <textarea
            className="w-full border border-gray-200 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primaryGreen"
            rows={4} value={newComment} onChange={e => setNewComment(e.target.value)}
          />
          <button onClick={handleCommentSubmit}
            className="mt-3 bg-primaryGreen text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-green-800 transition-colors">
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

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">{title}</h2>
    {children}
  </div>
);

const DetailRow = ({ label, value, link = false }) => (
  <div className="flex gap-2 items-start mb-1">
    <span className="text-sm text-gray-500 w-32 flex-shrink-0">{label}</span>
    {link
      ? <span className="text-sm text-primaryGreen font-medium cursor-pointer hover:underline">{value}</span>
      : <span className="text-sm text-gray-900">{value}</span>
    }
  </div>
);

const EmptyCard = ({ message }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-400 text-center">
    {message}
  </div>
);

export default TenantDetail;