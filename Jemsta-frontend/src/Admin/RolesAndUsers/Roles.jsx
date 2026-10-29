import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import PageHeader from '../shared/PageHeader';
import AdminTable, { AdminTr, AdminTd } from '../shared/AdminTable';


// const BASE_URL = 'http://127.0.0.1:8000/api/users';

// NOTE: /users/roles/ (and /users/role-choices/) return fixed choice pairs
// ({ value, label }) matching the User.role field — staff/landlord/tenant.
// These are Python-side model choices, not DB rows, so there's no id and no
// create/update/delete endpoint behind them — this page is a read-only
// reference list. Real, addable groups (Admin, Property Manager, etc.) live
// at /users/groups/ and are managed from the Group field on the Users page.

const Roles = () => {
  const { authFetch } = useAuth();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    authFetch(`${BASE_URL}/users/roles/`)
      .then(r => { if (!r.ok) throw new Error(`Server error: ${r.status}`); return r.json(); })
      .then(data => { setRoles(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <svg className="animate-spin h-6 w-6 mr-3 text-primaryGreen" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading roles...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20 text-red-500">
      ⚠️ Failed to load roles: {error}
    </div>
  );

  return (
    <div>
      <PageHeader title="Roles" />

      <p className="text-sm text-gray-400 mb-4">
        These are the fixed roles a user can be assigned — managed on the backend, not editable here.
      </p>

      {roles.length === 0 ? (
        <div className="bg-white border rounded-lg py-16 text-center text-gray-400">
          No roles found
        </div>
      ) : (
        <AdminTable columns={['S/N', 'Role']}>
          {roles.map((r, i) => (
            <AdminTr key={r.value ?? i}>
              <AdminTd>{i + 1}</AdminTd>
              <AdminTd className="font-medium text-gray-800">{r.label ?? r.value}</AdminTd>
            </AdminTr>
          ))}
        </AdminTable>
      )}
    </div>
  );
};

export default Roles;
