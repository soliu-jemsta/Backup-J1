import { BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../shared/PageHeader';
import AdminTable, { AdminTr, AdminTd, ActionButtons } from '../shared/AdminTable';
import Modal from '../shared/Modal';
import { FormInput, FormSelect, ModalActions } from '../shared/FormFields';
import { useToast } from '../shared/ToastProvider';




const emptyForm = {
  first_name: '', last_name: '', email: '', phone: '',
  property: '', start_date: '', end_date: '', is_active: 'true',
};

const parseResponse = async (response) => {
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const error = new Error('Request failed');
    error.data = data;
    throw error;
  }
  return data;
};

const Tenants = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [tenants, setTenants]         = useState([]);
  const [properties, setProperties]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm]               = useState(emptyForm);
  const [formErrors, setFormErrors]   = useState({});

  useEffect(() => {
    Promise.all([
      authFetch(`${BASE_URL}/tenants/tenants/`).then(r => { if (!r.ok) throw new Error(`Server error: ${r.status}`); return r.json(); }),
      authFetch(`${BASE_URL}/properties/`).then(r => r.json()).catch(() => []),
    ])
      .then(([tenantsData, propertiesData]) => {
        console.log("Tenants: ", tenantsData);
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
        setProperties(Array.isArray(propertiesData) ? propertiesData : []);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditingItem(t);
    setForm({
      first_name: t.first_name || '',
      last_name:  t.last_name  || '',
      email:      t.email      || '',
      phone:      t.phone      || '',
      property:   t.property   != null ? String(t.property) : '',
      start_date: t.start_date || '',
      end_date:   t.end_date   || '',
      is_active:  t.is_active  != null ? String(t.is_active) : 'true',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);
  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const buildBody = () => ({
    first_name: form.first_name,
    last_name:  form.last_name,
    email:      form.email,
    phone:      form.phone,
    property:   form.property ? Number(form.property) : null,
    start_date: form.start_date || null,
    end_date:   form.end_date   || null,
    is_active:  form.is_active === 'true',
  });

  const handleSubmit = () => {
    setFormErrors({});
    const url    = editingItem ? `${BASE_URL}/tenants/tenants/${editingItem.id}/` : `${BASE_URL}/tenants/tenants/`;
    const method = editingItem ? 'PUT' : 'POST';

    authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody()),
    })
      .then(parseResponse)
      .then(result => {
        showSuccess(editingItem ? 'Tenant updated successfully' : 'Tenant created successfully');
        setTenants(prev =>
          editingItem
            ? prev.map(t => t.id === result.id ? result : t)
            : [...prev, result]
        );
        closeModal();
      })
      .catch(err => {
        showError(err.message);
        if (err.data && typeof err.data === 'object') setFormErrors(err.data);
        else setFormErrors({ general: err.message });
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this tenant?')) return;
    authFetch(`${BASE_URL}/tenants/tenants/${id}/`, { method: 'DELETE' })
      .then(parseResponse)
      .then(() => {
        showSuccess('Tenant deleted successfully');
        setTenants(prev => prev.filter(t => t.id !== id));
      })
      .catch(err => { showError(err.message); });
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const propertyName = (id) => properties.find(p => p.id === id)?.name || (id != null ? `#${id}` : '—');

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <svg className="animate-spin h-6 w-6 mr-3 text-primaryGreen" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading tenants...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20 text-red-500">
      ⚠️ Failed to load tenants: {error}
    </div>
  );
  const propertyOptions = properties.map(p => ({ value: String(p.id), label: p.name }));

  return (
    <div>
      <PageHeader title="Tenant" buttonLabel="Add Tenant" onButtonClick={openAdd} />

      {tenants.length === 0 ? (
        <div className="bg-white border rounded-lg py-16 text-center text-gray-400">
          No tenants found
        </div>
      ) : (
        <AdminTable columns={[
          'S/N', 'ID', 'First Name', 'Last Name', 'Email', 'Phone',
          'Property', 'Start Date', 'End Date', 'Status', 'Action',
        ]}>
          {tenants.map((t, i) => (
            <AdminTr key={t.id}>
              <AdminTd>{i + 1}</AdminTd>
              <AdminTd>{t.id}</AdminTd>

              <AdminTd>
                <span
                  className="text-primaryGreen font-medium cursor-pointer hover:underline"
                  onClick={() => navigate(`/admin/tenants/${t.id}`)}
                >
                  {t.first_name}
                </span>
              </AdminTd>

              <AdminTd>{t.last_name}</AdminTd>
              <AdminTd>{t.email}</AdminTd>
              <AdminTd>{t.phone || '—'}</AdminTd>
              <AdminTd>{propertyName(t.property)}</AdminTd>
              <AdminTd>{fmtDate(t.start_date)}</AdminTd>
              <AdminTd>{fmtDate(t.end_date)}</AdminTd>

              <AdminTd>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  t.is_active
                    ? 'bg-green-100 text-primaryGreen'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {t.is_active ? 'Active' : 'Inactive'}
                </span>
              </AdminTd>

              <AdminTd>
                <ActionButtons onEdit={() => openEdit(t)} onDelete={() => handleDelete(t.id)} />
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
            <FormInput label="First Name:" placeholder="Enter first name" value={form.first_name} onChange={set('first_name')} error={formErrors.first_name?.[0]} />
            <FormInput label="Last Name:"  placeholder="Enter last name"  value={form.last_name}  onChange={set('last_name')}  error={formErrors.last_name?.[0]} />
            <FormInput label="Email:" placeholder="Enter email" type="email" value={form.email} onChange={set('email')} error={formErrors.email?.[0]} />
            <FormInput label="Phone Number:" placeholder="Enter phone" value={form.phone} onChange={set('phone')} error={formErrors.phone?.[0]} />
            <FormInput label="Start Date:" type="date" value={form.start_date} onChange={set('start_date')} error={formErrors.start_date?.[0]} />
            <FormInput label="End Date:"   type="date" value={form.end_date}   onChange={set('end_date')}   error={formErrors.end_date?.[0]} />
            <FormSelect
              label="Property:"
              placeholder="Select Property"
              value={form.property}
              onChange={set('property')}
              options={propertyOptions}
              error={formErrors.property?.[0]}
            />
            <FormSelect
              label="Status:"
              placeholder="Select Status"
              value={form.is_active}
              onChange={set('is_active')}
              options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]}
              error={formErrors.is_active?.[0]}
            />
          </div>
          <ModalActions onCancel={closeModal} onSubmit={handleSubmit} />
        </Modal>
      )}
    </div>
  );
};

export default Tenants;