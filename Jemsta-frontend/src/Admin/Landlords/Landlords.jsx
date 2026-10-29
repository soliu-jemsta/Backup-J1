import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../shared/PageHeader';
import AdminTable, { AdminTr, AdminTd, ActionButtons } from '../shared/AdminTable';
import Modal from '../shared/Modal';
import { FormInput, FormSelect, GoogleAddressInput, ModalActions } from '../shared/FormFields';
import { useToast } from '../shared/ToastProvider';


// const BASE_URL = 'http://127.0.0.1:8000/api';

// Django choices — update labels here if the backend changes.
// NOTE: type values are now lowercase (matches what the API sends back, e.g. "sole").
const LANDLORD_TYPES = [
  { value: 'sole',    label: 'Sole'    },
  { value: 'joint',   label: 'Joint'   },
  { value: 'group', label: 'Group' },
];

const PLAN_OPTIONS = [
  { value: 'full_management',  label: 'Full Management'  },
  { value: 'let_only',         label: 'Let Only'         },
  { value: 'rent_collection',  label: 'Rent Collection'  },
  { value: 'premium',  label: 'Premium'  },
];

const emptyMember = (isPrimary = false) => ({
  id: null,
  contact_id: null,
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  is_primary: isPrimary,
  receives_notifications: true,
});

const emptyForm = {
  account_number: '',
  address: '',
  type: '',
  plan: '',
  status: '',
  finance_manager: '',
  property_manager: '',
  sales_manager: '',
  members: [emptyMember(true)],
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

const Landlords = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [landlords,   setLandlords]   = useState([]);
  const [managers,    setManagers]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form,        setForm]        = useState(emptyForm);
  const [formErrors,  setFormErrors]  = useState({});

  useEffect(() => {
    Promise.all([
      authFetch(`${BASE_URL}/landlords/`).then(r => { if (!r.ok) throw new Error(`Server error: ${r.status}`); return r.json(); }),
      authFetch(`${BASE_URL}/users/users/`).then(r => r.json()).catch(() => []),
    ])
      .then(([llData, usersData]) => {
        console.log("LLData", llData);
        console.log("UserData: ", usersData);
        setLandlords(Array.isArray(llData) ? llData : []);
        const mgrs = Array.isArray(usersData)
          ? usersData.filter(u => u.role === 'staff')
          : [];
        setManagers(mgrs);
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

  const openEdit = (l) => {
    setEditingItem(l);
    const members = Array.isArray(l.members) && l.members.length
      ? l.members.map(m => ({
          id: m.id ?? null,
          contact_id: m.contact?.id ?? null,
          first_name: m.contact?.first_name || '',
          last_name:  m.contact?.last_name  || '',
          email:      m.contact?.email      || '',
          phone:      m.contact?.phone      || '',
          is_primary: !!m.is_primary,
          receives_notifications: m.receives_notifications !== undefined ? m.receives_notifications : true,
        }))
      : [emptyMember(true)];

    setForm({
      account_number:   l.account_number         || '',
      address:          l.correspondence_address || '',
      type:             l.type                   || '',
      plan:             l.plan                   || '',
      status:           l.rsw_status ? 'Active' : 'Inactive',
      finance_manager:  l.finance_manager  || '',
      property_manager: l.property_manager || '',
      sales_manager:    l.sales_manager    || '',
      members,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingItem(null); };
  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const setAddress = (val) => setForm(prev => ({ ...prev, address: val }));

  // ── Member row helpers ──
  const updateMember = (index, field) => (e) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      members: prev.members.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }));
  };
  const setMemberPrimary = (index) => () => {
    setForm(prev => ({
      ...prev,
      members: prev.members.map((m, i) => ({ ...m, is_primary: i === index })),
    }));
  };
  const setMemberNotifications = (index) => (e) => {
    const checked = e.target.checked;
    setForm(prev => ({
      ...prev,
      members: prev.members.map((m, i) => i === index ? { ...m, receives_notifications: checked } : m),
    }));
  };
  const addMember = () => {
    setForm(prev => ({ ...prev, members: [...prev.members, emptyMember(false)] }));
  };
  const removeMember = (index) => () => {
    setForm(prev => {
      const members = prev.members.filter((_, i) => i !== index);
      // keep exactly one primary if the removed member was primary
      if (!members.some(m => m.is_primary) && members.length) members[0].is_primary = true;
      return { ...prev, members };
    });
  };

  const buildBody = () => {
    const body = {
      account_number:         form.account_number         || null,
      correspondence_address: form.address                || null,
      type:                   form.type                   || null,
      plan:                   form.plan                   || null,
      rsw_status:             form.status || 0,
      finance_manager:        form.finance_manager  || null,
      property_manager:       form.property_manager || null,
      sales_manager:          form.sales_manager    || null,
      members: form.members
        .filter(m => m.first_name || m.last_name || m.email || m.phone)
        .map(m => ({
          ...(m.id ? { id: m.id } : {}),
          is_primary: m.is_primary,
          receives_notifications: m.receives_notifications,
          contact: {
            ...(m.contact_id ? { id: m.contact_id } : {}),
            first_name: m.first_name,
            last_name:  m.last_name,
            email:      m.email,
            phone:      m.phone,
          },
        })),
    };
    console.log("Body Data: ", body);
    return body;
  };

  const handleSubmit = () => {
    setFormErrors({});
    const url    = editingItem
      ? `${BASE_URL}/landlords/${editingItem.id}/`
      : `${BASE_URL}/landlords/`;
    const method = editingItem ? 'PUT' : 'POST';

    authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody()),
    })
      .then(parseResponse)
      .then(result => {
        showSuccess(editingItem ? 'Landlord updated successfully' : 'Landlord created successfully');
        setLandlords(prev =>
          editingItem
            ? prev.map(l => l.id === result.id ? result : l)
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
    if (!window.confirm('Delete this landlord?')) return;
    authFetch(`${BASE_URL}/landlords/${id}/`, { method: 'DELETE' })
      .then(parseResponse)
      .then(() => {
        showSuccess('Landlord deleted successfully');
        setLandlords(prev => prev.filter(l => l.id !== id));
      })
      .catch(err => { showError(err.message); });
  };

  // ── Display helpers ──
  const managerName = (username) => {
    if (!username) return '—';
    const m = managers.find(m => m.username === username);
    if (!m) return username;
    return [m.first_name, m.last_name].filter(Boolean).join(' ') || m.username;
  };
  const planLabel = (val) => PLAN_OPTIONS.find(p => p.value === val)?.label || val || '—';
  const typeLabel = (val) => LANDLORD_TYPES.find(t => t.value === val)?.label || val || '—';
  const managerOptions = managers.map(m => ({
    value: m.id,
    label: [m.first_name, m.last_name].filter(Boolean).join(' ') || m.username,
  }));

  const primaryContact = (l) =>
    l.members?.find(m => m.is_primary)?.contact || l.members?.[0]?.contact || null;

  const landlordName = (l) => {
    const names = (l.members || [])
      .map(m => [m.contact?.first_name, m.contact?.last_name].filter(Boolean).join(' '))
      .filter(Boolean);
    return names.join(' & ') || `Landlord #${l.id}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <svg className="animate-spin h-6 w-6 mr-3 text-primaryGreen" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading landlords...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20 text-red-500">
      ⚠️ Failed to load landlords: {error}
    </div>
  );

  return (
    <div>
      <PageHeader title="Landlord" buttonLabel="Add Landlord" onButtonClick={openAdd} />

      {landlords.length === 0 ? (
        <div className="bg-white border rounded-lg py-16 text-center text-gray-400">
          No landlords found
        </div>
      ) : (
        <AdminTable columns={[
          'S/N', 'ID', 'Name', 'LL Type', 'Plan', 'Primary Email', 'Primary Phone',
          'Address', 'Account Number', 'Finance Mgr', 'Property Mgr', 'Sales Mgr', 'Status', 'Action',
        ]}>
          {landlords.map((l, i) => {
            const contact = primaryContact(l);
            return (
              <AdminTr key={l.id}>
                <AdminTd>{i + 1}</AdminTd>
                <AdminTd>{l.id}</AdminTd>

                <AdminTd>
                  <span
                    className="text-primaryGreen font-medium cursor-pointer hover:underline"
                    onClick={() => navigate(`/admin/landlords/${l.id}`)}
                  >
                    {landlordName(l)}
                  </span>
                </AdminTd>

                <AdminTd>{typeLabel(l.type)}</AdminTd>
                <AdminTd>{planLabel(l.plan)}</AdminTd>
                <AdminTd>{contact?.email || '—'}</AdminTd>
                <AdminTd>{contact?.phone || '—'}</AdminTd>
                <AdminTd>{l.correspondence_address || '—'}</AdminTd>
                <AdminTd>{l.account_number || '—'}</AdminTd>
                <AdminTd>{managerName(l.finance_manager)}</AdminTd>
                <AdminTd>{managerName(l.property_manager)}</AdminTd>
                <AdminTd>{managerName(l.sales_manager)}</AdminTd>

                <AdminTd>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    l.rsw_status ? 'bg-green-100 text-primaryGreen' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {l.rsw_status ? 'Active' : 'Inactive'}
                  </span>
                </AdminTd>

                <AdminTd>
                  <ActionButtons onEdit={() => openEdit(l)} onDelete={() => handleDelete(l.id)} />
                </AdminTd>
              </AdminTr>
            );
          })}
        </AdminTable>
      )}

      {showModal && (
        <Modal onClose={closeModal}>
          {formErrors.general && (
            <div className="col-span-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded mb-2">
              {formErrors.general}
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">

            <FormInput
              type='number'
              label="Account Number:"
              placeholder="Enter bank account number"
              value={form.account_number}
              onChange={set('account_number')}
              error={formErrors.account_number?.[0]}
            />
            <FormSelect
              label="Landlord Type:"
              placeholder="Select Type"
              value={form.type}
              onChange={set('type')}
              options={LANDLORD_TYPES}
              error={formErrors.type?.[0]}
            />
            <FormSelect
              label="Plan:"
              placeholder="Select Plan"
              value={form.plan}
              onChange={set('plan')}
              options={PLAN_OPTIONS}
              error={formErrors.plan?.[0]}
            />
            <FormSelect
              label="Status:"
              placeholder="Select Status"
              value={form.status}
              onChange={set('status')}
              options={[{ value: 1, label: 'Active' }, { value: 0, label: 'Inactive' }]}
              error={formErrors.rsw_status?.[0]}
            />

            <FormSelect
              label="Finance Manager:"
              placeholder="Select Finance Manager"
              value={form.finance_manager}
              onChange={set('finance_manager')}
              options={managerOptions}
              error={formErrors.finance_manager?.[0]}
            />
            <FormSelect
              label="Property Manager:"
              placeholder="Select Property Manager"
              value={form.property_manager}
              onChange={set('property_manager')}
              options={managerOptions}
              error={formErrors.property_manager?.[0]}
            />
            <FormSelect
              label="Sales Manager:"
              placeholder="Select Sales Manager"
              value={form.sales_manager}
              onChange={set('sales_manager')}
              options={managerOptions}
              error={formErrors.sales_manager?.[0]}
            />

            <div className="col-span-2">
              <GoogleAddressInput
                label="Correspondence Address:"
                value={form.address}
                onChange={setAddress}
                error={formErrors.correspondence_address?.[0]}
              />
            </div>

            {/* ── Members (owners) ── sole = 1 member, joint = 2+ ── */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-800">
                  Owner(s) / Member(s):
                </label>
                <button
                  type="button"
                  onClick={addMember}
                  className="text-xs font-medium text-primaryGreen hover:underline"
                >
                  + Add Member
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {form.members.map((m, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 relative">
                    {form.members.length > 1 && (
                      <button
                        type="button"
                        onClick={removeMember(idx)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm"
                        aria-label="Remove member"
                      >
                        ✕
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <FormInput
                        label="First Name:"
                        placeholder="Enter first name"
                        value={m.first_name}
                        onChange={updateMember(idx, 'first_name')}
                        error={formErrors.members?.[idx]?.contact?.first_name?.[0]}
                      />
                      <FormInput
                        label="Last Name:"
                        placeholder="Enter last name"
                        value={m.last_name}
                        onChange={updateMember(idx, 'last_name')}
                        error={formErrors.members?.[idx]?.contact?.last_name?.[0]}
                      />
                      <FormInput
                        label="Email:"
                        placeholder="Enter email"
                        type="email"
                        value={m.email}
                        onChange={updateMember(idx, 'email')}
                        error={formErrors.members?.[idx]?.contact?.email?.[0]}
                      />
                      <FormInput
                        label="Phone Number:"
                        placeholder="Enter phone"
                        value={m.phone}
                        onChange={updateMember(idx, 'phone')}
                        error={formErrors.members?.[idx]?.contact?.phone?.[0]}
                      />
                    </div>
                    <div className="flex items-center gap-6 mt-3">
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="primary-member"
                          checked={m.is_primary}
                          onChange={setMemberPrimary(idx)}
                          className="w-4 h-4 accent-primaryGreen"
                        />
                        Primary contact
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={m.receives_notifications}
                          onChange={setMemberNotifications(idx)}
                          className="w-4 h-4 accent-primaryGreen"
                        />
                        Receives notifications
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          <ModalActions onCancel={closeModal} onSubmit={handleSubmit} />
        </Modal>
      )}
    </div>
  );
};

export default Landlords;
