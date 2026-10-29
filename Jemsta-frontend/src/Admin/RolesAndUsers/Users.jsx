import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import PageHeader from '../shared/PageHeader';
import AdminTable, { AdminTr, AdminTd, StatusBadge, ActionButtons } from '../shared/AdminTable';
import Modal from '../shared/Modal';
import { FormInput, FormSelect, ModalActions } from '../shared/FormFields';
import { useToast } from '../shared/ToastProvider';


// const BASE_URL = 'http://127.0.0.1:8000/api/users';

// Fallback in case /users/roles/ is unreachable — keeps the form usable.
const FALLBACK_ROLE_OPTIONS = [
  { value: 'staff',    label: 'Staff' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'tenant',   label: 'Tenant' },
];

const emptyForm = {
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  role: '',     // 'staff' | 'landlord' | 'tenant' — from /users/roles/
  group: '',    // Django Group id — from /users/groups/ (Admin, Property Manager, etc.)
  is_active: true,
};

// Groups can come back as ids or as {id, name} objects depending on the serializer — handle both.
const groupIdOf = (g) => (g && typeof g === 'object' ? g.id : g);

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

const Users = () => {
  const { authFetch } = useAuth();
  const { showSuccess, showError } = useToast();

  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form,        setForm]        = useState(emptyForm);
  const [formErrors,  setFormErrors]  = useState({});
  // /users/roles/ returns fixed choice pairs, e.g. { value: 'staff', label: 'Staff' }.
  const [roleOptions, setRoleOptions] = useState(FALLBACK_ROLE_OPTIONS);
  // /users/groups/ returns real Django Groups: { id, name } (Admin, Property Manager, etc.)
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    Promise.all([
      authFetch(`${BASE_URL}/users/users/`).then(r => {
        if (!r.ok) throw new Error(`Server error: ${r.status}`);
        return r.json();
      }),
      authFetch(`${BASE_URL}/users/roles/`).then(r => r.json()).catch(() => null),
      authFetch(`${BASE_URL}/users/groups/`).then(r => r.json()).catch(() => null),
    ])
      .then(([usersData, rolesData, groupsData]) => {
        setUsers(Array.isArray(usersData) ? usersData : []);
        if (Array.isArray(rolesData) && rolesData.length && rolesData[0].value) {
          setRoleOptions(rolesData);
        }
        if (Array.isArray(groupsData)) setGroups(groupsData);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const openAdd = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({
      username:   u.username || '',
      first_name: u.first_name || '',
      last_name:  u.last_name || '',
      email:      u.email || '',
      phone:      u.phone || '',
      password:   '',
      role:       u.role || '',
      group:      Array.isArray(u.groups) && u.groups.length ? String(groupIdOf(u.groups[0])) : '',
      is_active:  u.is_active !== undefined ? u.is_active : true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);
  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };
  const setChecked = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.checked }));
  };

  const handleSubmit = () => {
    setFormErrors({});

    const body = {
      username:   form.username,
      first_name: form.first_name,
      last_name:  form.last_name,
      email:      form.email,
      phone:      form.phone || null,
      role:       form.role || null,
      groups:     form.group ? [Number(form.group)] : [],
      is_active:  form.is_active,
    };

    if (form.password) body.password = form.password;

    const url    = editingUser ? `${BASE_URL}/users/users/${editingUser.id}/` : `${BASE_URL}/users/users/`;
    const method = editingUser ? 'PUT' : 'POST';

    authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(parseResponse)
      .then(result => {
        showSuccess(editingUser ? 'User updated successfully' : 'User created successfully');
        setUsers(prev =>
          editingUser
            ? prev.map(u => u.id === result.id ? result : u)
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
    if (!window.confirm('Delete this user?')) return;
    authFetch(`${BASE_URL}/users/users/${id}/`, { method: 'DELETE' })
      .then(parseResponse)
      .then(() => {
        showSuccess('User deleted successfully');
        setUsers(prev => prev.filter(u => u.id !== id));
      })
      .catch(err => { showError(err.message); });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <svg className="animate-spin h-6 w-6 mr-3 text-primaryGreen" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading users...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20 text-red-500">
      ⚠️ Failed to load users: {error}
    </div>
  );



  return (
    <div>
      <PageHeader title="Users" buttonLabel="Add User" onButtonClick={openAdd} />

      {users.length === 0 ? (
        <div className="bg-white border rounded-lg py-16 text-center text-gray-400">
          No users found
        </div>
      ) : (
        <AdminTable columns={['S/N', 'ID', 'Name', 'Username', 'Email', 'Phone', 'Role', 'Group', 'Status', 'Action']}>
          {users.map((u, i) => {
            const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ') || '—';
            const roleLabel = roleOptions.find(r => r.value === u.role)?.label || u.role;
            const groupNames = Array.isArray(u.groups)
              ? u.groups.map(g => (typeof g === 'object' ? g.name : groups.find(gr => gr.id === g)?.name)).filter(Boolean).join(', ')
              : '';
            return (
              <AdminTr key={u.id}>
                <AdminTd>{i + 1}</AdminTd>
                <AdminTd>{u.id}</AdminTd>
                <AdminTd className="font-medium text-gray-800">{fullName}</AdminTd>
                <AdminTd>{u.username}</AdminTd>
                <AdminTd>{u.email}</AdminTd>
                <AdminTd>{u.phone || '—'}</AdminTd>
                <AdminTd>
                  {u.role ? (
                    <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                      {roleLabel || u.role}
                    </span>
                  ) : '—'}
                </AdminTd>
                <AdminTd>{groupNames || '—'}</AdminTd>
                <AdminTd>
                  <StatusBadge status={u.is_active ? 'Active' : 'Inactive'} />
                </AdminTd>
                <AdminTd>
                  <ActionButtons onEdit={() => openEdit(u)} onDelete={() => handleDelete(u.id)} />
                </AdminTd>
              </AdminTr>
            );
          })}
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
            <FormInput label="Last Name:" placeholder="Enter last name" value={form.last_name} onChange={set('last_name')} error={formErrors.last_name?.[0]} />
            <FormInput label="Username:" placeholder="Enter username" value={form.username} onChange={set('username')} error={formErrors.username?.[0]} />
            <FormInput label="Email:" placeholder="Enter email" type="email" value={form.email} onChange={set('email')} error={formErrors.email?.[0]} />
            <FormInput label="Phone Number:" placeholder="Enter phone" value={form.phone} onChange={set('phone')} error={formErrors.phone?.[0]} />
            <FormInput label="Password:" placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'} type="password" value={form.password} onChange={set('password')} error={formErrors.password?.[0]} />
            <FormSelect
              label="Role:"
              placeholder="Select Role"
              value={form.role}
              onChange={set('role')}
              options={roleOptions}
              error={formErrors.role?.[0]}
            />
            <FormSelect
              label="Group:"
              placeholder="Select Group"
              value={form.group}
              onChange={set('group')}
              options={groups.map(g => ({ value: String(g.id), label: g.name }))}
              error={formErrors.groups?.[0]}
            />
            <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mt-1">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={setChecked('is_active')}
                className="w-4 h-4 accent-primaryGreen"
              />
              Active
            </label>
          </div>
          <ModalActions onCancel={closeModal} onSubmit={handleSubmit} />
        </Modal>
      )}
    </div>
  );
};

export default Users;
