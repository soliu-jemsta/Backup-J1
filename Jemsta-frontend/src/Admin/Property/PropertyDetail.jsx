import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyTypeLabel, tenureLabel, statusLabel, statusBadgeClass } from './propertyOptions';


// const BASE_URL = 'http://127.0.0.1:8000/api';

const PropertyDetail = () => {
  const { authFetch } = useAuth();
  const { propertyId } = useParams();
  const navigate        = useNavigate();

  const [property,   setProperty]   = useState(null);
  const [landlord,   setLandlord]   = useState(null);
  const [tenants,    setTenants]    = useState([]);
  const [managers,   setManagers]   = useState([]);
  const [comments,   setComments]   = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    authFetch(`${BASE_URL}/properties/properties/${propertyId}/`)
      .then(r => {
        if (!r.ok) throw new Error(`Property not found (${r.status})`);
        return r.json();
      })
      .then(async (propData) => {
        setProperty(propData);

        const requests = [];
        if (propData.landlord) {
          requests.push(
            authFetch(`${BASE_URL}/landlords/${propData.landlord}/`).then(r => r.ok ? r.json() : null).catch(() => null)
          );
        } else {
          requests.push(Promise.resolve(null));
        }
        requests.push(
  authFetch(`${BASE_URL}/tenants/tenants/`)
    .then(r => r.json())
    .then(data => Array.isArray(data)
      ? data.filter(t => String(t.property) === String(propertyId))
      : []
    )
    .catch(() => [])
);
        requests.push(
          authFetch(`${BASE_URL}/users/users/`).then(r => r.json()).catch(() => [])
        );

        const [llData, tenantsData, usersData] = await Promise.all(requests);
        setLandlord(llData);
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
        setLoading(false);
        const mgrs = Array.isArray(usersData)
          ? usersData.filter(u => u.role === 'staff')
          : [];

        setManagers(mgrs);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [propertyId]);

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    setComments(prev => [{
      id: Date.now(),
      author: 'Admin', role: 'Admin',
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

  const managerName = (id) => {
    const m = managers.find(u => u.id === id);
    if (!m) return id != null ? `#${id}` : '—';
    return [m.first_name, m.last_name].filter(Boolean).join(' ') || m.username;
  };

  // Landlords no longer have a top-level `name` — build a display name from members' contacts.
  const landlordDisplayName = (ll) => {
    if (!ll) return '—';
    const names = (ll.members || [])
      .map(m => [m.contact?.first_name, m.contact?.last_name].filter(Boolean).join(' '))
      .filter(Boolean);
    return names.join(' & ') || `Landlord #${ll.id}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <svg className="animate-spin h-6 w-6 mr-3 text-primaryGreen" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading property details...
    </div>
  );

  if (error || !property) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-red-500">⚠️ {error || 'Property not found'}</p>
      <button onClick={() => navigate('/admin/property')}
        className="px-4 py-2 bg-primaryGreen text-white text-sm rounded-lg hover:bg-green-800 transition-colors">
        ← Back to Properties
      </button>
    </div>
  );

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/admin/property')}
          className="flex items-center gap-2 bg-primaryGreen text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors">
          ← Back
        </button>
        <h1 className="text-lg font-bold text-gray-900">{property.name}</h1>
        <span className={`text-sm font-medium px-4 py-1 rounded-full border ${statusBadgeClass(property.status)}`}>
          {statusLabel(property.status)}
        </span>
      </div>

      {/* Overview */}
      <Section title="Overview">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <DetailRow label="Property Name:"   value={property.name || '—'} />
            <DetailRow label="Address:"         value={property.address || '—'} />
            <DetailRow label="Town:"            value={property.town || '—'} />
            <DetailRow label="Postcode:"        value={property.postcode || '—'} />
            <DetailRow label="Landlord:"        value={landlord ? landlordDisplayName(landlord) : property.landlord != null ? `#${property.landlord}` : '—'} link={!!landlord} />
            <DetailRow label="Manager:"         value={managerName(property.manager)} />
            <DetailRow label="Property Type:"   value={propertyTypeLabel(property.property_type)} />
            <DetailRow label="Tenure:"          value={tenureLabel(property.tenure)} />
            <DetailRow label="Bedrooms:"        value={property.bedrooms ?? '—'} />
            <DetailRow label="Bathrooms:"       value={property.bathrooms ?? '—'} />
            <DetailRow label="Rent Amount:"     value={property.rent_amount ? `£${property.rent_amount}` : '—'} />
            <DetailRow label="Management Rate:" value={property.management_rate ? `${property.management_rate}%` : '—'} />
            <DetailRow label="Vacant:"          value={property.is_vacant ? 'Yes' : 'No'} />
            <DetailRow label="Available From:"  value={fmtDate(property.available_from)} />
            <DetailRow label="Created:"         value={fmtDate(property.created_at)} />
          </div>
        </div>
      </Section>

      {/* Description & features */}
      {(property.description || property.key_features?.length > 0) && (
        <Section title="Listing Details">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {property.description && (
              <p className="text-sm text-gray-700 leading-relaxed mb-4">{property.description}</p>
            )}
            {property.key_features?.length > 0 && (
              <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {property.key_features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primaryGreen shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>
      )}

      {/* Photos */}
      <Section title="Photos">
        {!property.images || property.images.length === 0 ? (
          <EmptyCard message="No photos uploaded for this property." />
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {[...property.images]
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.image}
                    alt={img.caption || ''}
                    className="w-full h-28 object-cover rounded-lg border border-gray-200"
                  />
                  {img.is_primary && (
                    <span className="absolute top-1.5 left-1.5 bg-primaryGreen text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
          </div>
        )}
      </Section>

      {/* Tenants */}
      <Section title="Tenants">
        {tenants.length === 0 ? (
          <EmptyCard message="No tenants linked to this property." />
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {tenants.map((t, i) => (
              <div key={t.id}>
                <span className="text-primaryGreen text-sm font-medium cursor-pointer hover:underline">
                  {t.first_name} {t.last_name}
                </span>
                {i < tenants.length - 1 && <hr className="my-2 border-gray-100" />}
              </div>
            ))}
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
  <div className="flex gap-2 items-start">
    <span className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</span>
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

export default PropertyDetail;