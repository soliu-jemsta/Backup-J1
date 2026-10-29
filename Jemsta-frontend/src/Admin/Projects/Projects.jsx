import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../shared/PageHeader';
import AdminTable, { AdminTr, AdminTd, ActionButtons } from '../shared/AdminTable';
import Modal from '../shared/Modal';
import { FormInput, FormSelect, ModalActions } from '../shared/FormFields';
import { useToast } from '../shared/ToastProvider';
import InvoiceModal from './InvoiceModal';

const emptyForm = {
  property: '', landlord: '', name: '', status: 'active', cost: '',
};

const parseResponse = async (response) => {
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const error = new Error(
      (data && typeof data === 'object' ? data.detail || JSON.stringify(data) : data) || `Error ${response.status}`
    );
    error.data = data;
    throw error;
  }
  return data;
};

const fmtGBP = (n) => `£${parseFloat(n || 0).toFixed(2)}`;

const Projects = () => {
  const { authFetch } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [projects,    setProjects]    = useState([]);
  const [properties,  setProperties]  = useState([]);
  const [landlords,   setLandlords]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form,        setForm]        = useState(emptyForm);
  const [formErrors,  setFormErrors]  = useState({});
  const [imageFile,   setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [invoicingItem, setInvoicingItem] = useState(null);

  useEffect(() => {
    Promise.all([
      authFetch(`${BASE_URL}/projects/projects/`).then(r => { if (!r.ok) throw new Error(`Server error: ${r.status}`); return r.json(); }),
      authFetch(`${BASE_URL}/properties/properties/`).then(r => r.json()).catch(() => []),
      authFetch(`${BASE_URL}/landlords/`).then(r => r.json()).catch(() => []),
    ])
      .then(([projectsData, propsData, llData]) => {
        console.log('Fetched projects:', projectsData);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setProperties(Array.isArray(propsData) ? propsData : []);
        setLandlords(Array.isArray(llData) ? llData : []);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFormErrors({});
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingItem(p);
    setForm({
      property: p.property != null ? String(p.property) : '',
      landlord: p.landlord != null ? String(p.landlord) : '',
      name:     p.name     || '',
      status:   p.status   || 'active',
      cost:     p.cost != null ? String(p.cost) : '',
    });
    setFormErrors({});
    setImageFile(null);
    setImagePreview(p.primary_image || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setImageFile(null);
    setImagePreview(null);
  };
  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : (editingItem?.primary_image || null));
  };

  const handlePropertyChange = (e) => {
    const selectedId = e.target.value;
    const selectedProperty = properties.find(p => String(p.id) === selectedId);
    setForm(prev => ({
      ...prev,
      property: selectedId,
      landlord: selectedProperty?.landlord != null ? String(selectedProperty.landlord) : prev.landlord,
    }));
  };

  const buildBody = () => ({
    name:     form.name,
    property: form.property ? Number(form.property) : null,
    landlord: form.landlord ? Number(form.landlord) : null,
    status:   form.status   || 'active',
    cost:     form.cost !== '' ? Number(form.cost) : 0,
  });

  // NOTE: assumes the write field for the image is `primary_image` (matches the
  // read field seen in the API response). Confirm this with the backend dev —
  // if projects use a nested `images` array like properties do, this'll need
  // a follow-up POST to an /images/ endpoint instead.
  const buildFormData = () => {
    const fd = new FormData();
    const body = buildBody();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== null && value !== undefined) fd.append(key, value);
    });
    if (imageFile) fd.append('primary_image', imageFile);
    return fd;
  };

  const handleSubmit = async () => {
    setFormErrors({});
    const url    = editingItem ? `${BASE_URL}/projects/projects/${editingItem.id}/` : `${BASE_URL}/projects/projects/`;
    const method = editingItem ? 'PATCH' : 'POST';
    const useFormData = !!imageFile;

    try {
      const result = await authFetch(url, {
        method,
        ...(useFormData
          ? { body: buildFormData() }
          : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildBody()) }),
      }).then(parseResponse);

      showSuccess(editingItem ? 'Project updated successfully' : 'Project created successfully');
      setProjects(prev =>
        editingItem
          ? prev.map(p => p.id === result.id ? result : p)
          : [...prev, result]
      );
      closeModal();
    } catch (err) {
      showError(err.message);
      if (err.data && typeof err.data === 'object') setFormErrors(err.data);
      else setFormErrors({ general: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await authFetch(`${BASE_URL}/projects/projects/${id}/`, { method: 'DELETE' }).then(parseResponse);
      showSuccess('Project deleted successfully');
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      showError(err.message);
    }
  };

  const openInvoice = async (project) => {
    try {
      const detail = await authFetch(`${BASE_URL}/projects/projects/${project.id}/`).then(parseResponse);
      setInvoicingItem(detail);
    } catch (err) {
      showError(err.message);
      setInvoicingItem(project); // fall back to list data if the detail fetch fails
    }
  };

  const propertyName = (id) => properties.find(p => p.id === id)?.name || (id != null ? `#${id}` : '—');
  const landlordName = (id) => {
    const l = landlords.find(l => l.id === id);
    if (!l) return id != null ? `#${id}` : '—';
    const primary = l.members?.find(m => m.is_primary) || l.members?.[0];
    const contact = primary?.contact;
    if (!contact) return `Landlord #${l.id}`;
    return [contact.first_name, contact.last_name].filter(Boolean).join(' ') || `Landlord #${l.id}`;
  };

  const propertyOptions = properties.map(p => ({ value: String(p.id), label: p.name || `Property #${p.id}` }));
  const landlordOptions = landlords.map(l => ({ value: String(l.id), label: landlordName(l.id) }));

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <svg className="animate-spin h-6 w-6 mr-3 text-primaryGreen" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading projects...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20 text-red-500">
      ⚠️ Failed to load projects: {error}
    </div>
  );

  const statusBadge = (status) => {
    const styles = {
      incomplete: 'bg-red-100 text-red-600',
      pending:   'bg-yellow-100 text-yellow-700',
      completed: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {status || '—'}
      </span>
    );
  };

  const trafficLightDot = (color) => {
    const dotStyles = {
      green:  'bg-green-500',
      amber:  'bg-amber-500',
      yellow: 'bg-amber-500',
      red:    'bg-red-500',
    };
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-full ${dotStyles[color] || 'bg-gray-300'}`} />
        <span className="text-xs text-gray-500 capitalize">{color || '—'}</span>
      </span>
    );
  };

  const completionBar = (pct) => {
    const value = Math.max(0, Math.min(100, Number(pct) || 0));
    return (
      <div className="flex items-center gap-2 w-28">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primaryGreen rounded-full" style={{ width: `${value}%` }} />
        </div>
        <span className="text-xs text-gray-500 w-8 text-right">{value}%</span>
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Projects" buttonLabel="Add Project" onButtonClick={openAdd} />

      {projects.length === 0 ? (
        <div className="bg-white border rounded-lg py-16 text-center text-gray-400">
          No projects found
        </div>
      ) : (
        <AdminTable columns={[
          'S/N', 'Project Name', 'Property', 'Landlord',
          'Completion', 'Total', 'Status', 'Traffic Light', 'Action',
        ]}>
          {projects.map((p, i) => (
            <AdminTr key={p.id}>
              <AdminTd>{i + 1}</AdminTd>
              {/* <AdminTd>{p.id}</AdminTd> */}
              <AdminTd>
                <div className="flex items-center gap-2">
                  {p.primary_image ? (
                    <img src={p.primary_image} alt="" className="w-7 h-7 rounded object-cover flex-shrink-0" />
                  ) : (
                    <span className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-300 flex-shrink-0">🏠</span>
                  )}
                  <span
                    className="text-primaryGreen font-medium cursor-pointer hover:underline"
                    onClick={() => navigate(`/admin/projects/${p.id}`)}
                  >
                    {p.name}
                  </span>
                </div>
              </AdminTd>
              <AdminTd>{propertyName(p.property)}</AdminTd>
              <AdminTd>{landlordName(p.landlord)}</AdminTd>
              <AdminTd>{completionBar(p.completion_percentage)}</AdminTd>
              <AdminTd>{fmtGBP(p.total)}</AdminTd>
              <AdminTd>{statusBadge(p.status)}</AdminTd>
              <AdminTd>{trafficLightDot(p.traffic_light)}</AdminTd>
              <AdminTd>
                <div className="flex items-center gap-2">
                  <ActionButtons onEdit={() => openEdit(p)} onDelete={() => handleDelete(p.id)} />
                  <button
                    type="button"
                    onClick={() => openInvoice(p)}
                    className="text-xs font-medium text-primaryGreen hover:underline whitespace-nowrap"
                  >
                    Invoice
                  </button>
                </div>
              </AdminTd>
            </AdminTr>
          ))}
        </AdminTable>
      )}

      {showModal && (
        <Modal onClose={closeModal}>
          {formErrors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded mb-4">
              {formErrors.general}
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <FormSelect
              label="Property:"
              placeholder="Select Property"
              value={form.property}
              onChange={handlePropertyChange}
              options={propertyOptions}
              error={formErrors.property?.[0]}
            />
            <FormInput
              label="Project Name:"
              placeholder="Enter project name"
              value={form.name}
              onChange={set('name')}
              error={formErrors.name?.[0]}
            />

            {/* Landlord — auto-filled from selected property, read-only */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-800">Landlord:</label>
              <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed">
                {form.landlord ? landlordName(Number(form.landlord)) : 'Auto-filled on property select'}
              </div>
            </div>

            <FormSelect
              label="Status:"
              placeholder="Select Status"
              value={form.status}
              onChange={set('status')}
              options={[
                { value: 'pending',   label: 'Pending'   },
                { value: 'completed', label: 'Completed' },
                { value: 'incomplete', label: 'Incomplete' },
              ]}
              error={formErrors.status?.[0]}
            />

            <FormInput
              label="Cost (£):"
              type="number"
              placeholder="0.00"
              value={form.cost}
              onChange={set('cost')}
              error={formErrors.cost?.[0]}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-800">Project Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:text-sm"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded object-cover mt-1" />
              )}
            </div>
          </div>

          {editingItem && (
            <div className="mt-5 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-gray-600 mb-2">Calculated (read-only)</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-500">
                <span>Completion:</span><span>{editingItem.completion_percentage}%</span>
                <span>Total:</span><span>{fmtGBP(editingItem.total)}</span>
                <span>Traffic Light:</span><span className="capitalize">{editingItem.traffic_light || '—'}</span>
              </div>
            </div>
          )}

          <ModalActions onCancel={closeModal} onSubmit={handleSubmit} />
        </Modal>
      )}

      {invoicingItem && (
        <InvoiceModal
          project={invoicingItem}
          property={properties.find(prop => prop.id === invoicingItem.property)}
          landlord={landlords.find(l => l.id === invoicingItem.landlord)}
          onClose={() => setInvoicingItem(null)}
        />
      )}
    </div>
  );
};

export default Projects;