import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InvoiceModal from './InvoiceModal';

const fmtGBP = (n) => `£${(parseFloat(n) || 0).toFixed(2)}`;

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const statusBadge = (status) => {
  const styles = {
    incomplete: 'bg-red-100 text-red-600',
    pending:    'bg-yellow-100 text-yellow-700',
    completed:  'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status || '—'}
    </span>
  );
};

const trafficLightDot = (color) => {
  const dotStyles = { green: 'bg-green-500', amber: 'bg-amber-500', yellow: 'bg-amber-500', red: 'bg-red-500' };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${dotStyles[color] || 'bg-gray-300'}`} />
      <span className="capitalize">{color || '—'}</span>
    </span>
  );
};

const landlordDisplayName = (ll) => {
  if (!ll) return '—';
  const names = (ll.members || [])
    .map(m => [m.contact?.first_name, m.contact?.last_name].filter(Boolean).join(' '))
    .filter(Boolean);
  return names.join(' & ') || `Landlord #${ll.id}`;
};

const ProjectDetail = () => {
  const { authFetch } = useAuth();
  const { projectId } = useParams();
  const navigate       = useNavigate();

  const [project,  setProject]  = useState(null);
  const [property, setProperty] = useState(null);
  const [landlord, setLandlord] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const [images,        setImages]        = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [invoicing,     setInvoicing]     = useState(false);

  const loadProject = () => {
    setLoading(true);
    authFetch(`${BASE_URL}/projects/projects/${projectId}/`)
      .then(r => {
        if (!r.ok) throw new Error(`Project not found (${r.status})`);
        return r.json();
      })
      .then(async (data) => {
        setProject(data);
        console.log('[ProjectDetail] loaded project', data);

        // The project record already carries images if the backend returns
        // them nested (same pattern as properties) — seed from that first,
        // and fall back to the dedicated endpoint below either way to stay
        // current.
        setImages(Array.isArray(data.images) ? data.images : []);

        const requests = [
          data.property != null
            ? authFetch(`${BASE_URL}/properties/properties/${data.property}/`).then(r => r.ok ? r.json() : null).catch(() => null)
            : Promise.resolve(null),
          data.landlord != null
            ? authFetch(`${BASE_URL}/landlords/${data.landlord}/`).then(r => r.ok ? r.json() : null).catch(() => null)
            : Promise.resolve(null),
        ];
        const [propData, llData] = await Promise.all(requests);
        setProperty(propData);
        setLandlord(llData);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(loadProject, [projectId]);

  // Refreshes the image list from the project's own record rather than a
  // separate GET — the /properties/properties/{id}/images/ list endpoint
  // wasn't reliable for that resource, so this avoids assuming a parallel
  // one exists for projects until confirmed.
  const refreshImages = () => {
    authFetch(`${BASE_URL}/projects/projects/${projectId}/`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) { setProject(data); setImages(Array.isArray(data.images) ? data.images : []); } })
      .catch(() => {});
  };

  // ASSUMPTION: mirrors the confirmed working pattern for properties
  // (POST /properties/properties/{id}/images/ with the file under the
  // "images" field). Not yet confirmed for projects — check the console
  // log below against the response if this 400s/404s.
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append('images', file);

    try {
      const res = await authFetch(`${BASE_URL}/projects/projects/${projectId}/images/`, { method: 'POST', body });
      const text = await res.text();
      console.log('[ProjectDetail] image upload response', res.status, text);
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      refreshImages();
    } catch (err) {
      alert(err.message); // eslint-disable-line no-alert -- no shared toast on this page yet
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleImageDelete = async (imageId) => {
    if (!window.confirm('Remove this image?')) return;
    try {
      const res = await authFetch(`${BASE_URL}/projects/project-images/${imageId}/`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error(`Delete failed (${res.status})`);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      alert(err.message); // eslint-disable-line no-alert
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <svg className="animate-spin h-6 w-6 mr-3 text-primaryGreen" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading project details...
    </div>
  );

  if (error || !project) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-red-500">⚠️ {error || 'Project not found'}</p>
      <button onClick={() => navigate('/admin/projects')}
        className="px-4 py-2 bg-primaryGreen text-white text-sm rounded-lg hover:bg-green-800 transition-colors">
        ← Back to Projects
      </button>
    </div>
  );

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/admin/projects')}
          className="flex items-center gap-2 bg-primaryGreen text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors">
          ← Back
        </button>
        <h1 className="text-lg font-bold text-gray-900">{project.name}</h1>
        <div className="flex items-center gap-3">
          {statusBadge(project.status)}
          <button
            onClick={() => setInvoicing(true)}
            className="text-sm font-medium px-4 py-1.5 rounded-full border border-primaryGreen text-primaryGreen hover:bg-green-50 transition-colors"
          >
            Invoice
          </button>
        </div>
      </div>

      {/* Overview */}
      <Section title="Overview">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <DetailRow label="Project Name:" value={project.name || '—'} />
            <DetailRow
              label="Property:"
              value={property?.name || (project.property != null ? `Property #${project.property}` : '—')}
              link={!!property}
              onClick={property ? () => navigate(`/admin/property/${property.id}`) : undefined}
            />
            <DetailRow label="Landlord:" value={landlordDisplayName(landlord)} link={!!landlord} />
            <DetailRow label="Completion:" value={`${project.completion_percentage ?? 0}%`} />
            <DetailRow label="Traffic Light:" value={trafficLightDot(project.traffic_light)} />
            <DetailRow label="Cost:" value={fmtGBP(project.cost)} />
            <DetailRow label="VAT Rate:" value={project.vat_rate_snapshot != null ? `${project.vat_rate_snapshot}%` : '—'} />
            <DetailRow label="VAT Amount:" value={fmtGBP(project.vat_amount)} />
            {project.apply_maintenance_fee && (
              <>
                <DetailRow label="Maintenance Rate:" value={project.maintenance_rate_snapshot != null ? `${project.maintenance_rate_snapshot}%` : '—'} />
                <DetailRow label="Maintenance Fee:" value={fmtGBP(project.maintenance_fee)} />
              </>
            )}
            <DetailRow label="Admin Rate:" value={project.admin_rate_snapshot != null ? `${project.admin_rate_snapshot}%` : '—'} />
            <DetailRow label="Admin Fee:" value={fmtGBP(project.admin_fee)} />
            <DetailRow label="Total:" value={<span className="font-semibold">{fmtGBP(project.total)}</span>} />
            <DetailRow label="Created:" value={fmtDate(project.created_at)} />
          </div>
        </div>
      </Section>

      {/* Photos */}
      <Section title="Photos">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {images.length === 0 ? (
            <p className="text-sm text-gray-400 mb-3">No photos uploaded for this project yet.</p>
          ) : (
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[...images]
                .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                .map((img) => (
                  <div key={img.id} className="relative group">
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
                    <button
                      type="button"
                      onClick={() => handleImageDelete(img.id)}
                      className="absolute top-1.5 right-1.5 bg-white/90 text-red-600 text-xs rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          )}

          <label className="inline-block">
            <span className="text-sm font-medium text-primaryGreen cursor-pointer hover:underline">
              {uploading ? 'Uploading…' : '+ Add Photo'}
            </span>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </Section>

      {invoicing && (
        <InvoiceModal
          project={project}
          property={property}
          landlord={landlord}
          onClose={() => setInvoicing(false)}
        />
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">{title}</h2>
    {children}
  </div>
);

const DetailRow = ({ label, value, link = false, onClick }) => (
  <div className="flex gap-2 items-start">
    <span className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</span>
    {link
      ? <span onClick={onClick} className="text-sm text-primaryGreen font-medium cursor-pointer hover:underline">{value}</span>
      : <span className="text-sm text-gray-900">{value}</span>
    }
  </div>
);

export default ProjectDetail;