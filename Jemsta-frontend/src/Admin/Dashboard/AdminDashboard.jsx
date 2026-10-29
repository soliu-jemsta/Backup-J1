import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';

// Placeholder — no finance/transactions API exists yet, so this chart stays mocked.
const chartData = [
  { month: 'Jan',  Income: 90000,  Expense: 5000  },
  { month: 'Feb',  Income: 35000,  Expense: 20000 },
  { month: 'Mar',  Income: 38000,  Expense: 22000 },
  { month: 'Apr',  Income: 30000,  Expense: 18000 },
  { month: 'May',  Income: 32000,  Expense: 65000 },
  { month: 'Jun',  Income: 28000,  Expense: 60000 },
  { month: 'Jul',  Income: 25000,  Expense: 125000},
  { month: 'Aug',  Income: 70000,  Expense: 10000 },
  { month: 'Sep',  Income: 72000,  Expense: 8000  },
  { month: 'Oct',  Income: 35000,  Expense: 55000 },
  { month: 'Nov',  Income: 12000,  Expense: 5000  },
  { month: 'Dec',  Income: 10000,  Expense: 3000  },
];

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const statusBadge = (status) => {
  const styles = {
    active:    'bg-green-100 text-primaryGreen',
    completed: 'bg-blue-100 text-blue-700',
    pending:   'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status || '—'}
    </span>
  );
};

const AdminDashboard = () => {
  const { authFetch } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const [properties, setProperties] = useState([]);
  const [landlords,   setLandlords]   = useState([]);
  const [tenants,     setTenants]     = useState([]);
  const [projects,    setProjects]    = useState([]);

  useEffect(() => {
    Promise.all([
      authFetch(`${BASE_URL}/properties/properties`).then(r => r.json()).catch(() => []),
      authFetch(`${BASE_URL}/landlords/`).then(r => r.json()).catch(() => []),
      authFetch(`${BASE_URL}/tenants/tenants/`).then(r => r.json()).catch(() => []),
      authFetch(`${BASE_URL}/projects/projects/`).then(r => r.json()).catch(() => []),
    ])
      .then(([propsData, llData, tenantsData, projectsData]) => {
        setProperties(Array.isArray(propsData) ? propsData : []);
        setLandlords(Array.isArray(llData) ? llData : []);
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const pendingProjects = projects.filter(p => p.status === 'pending').length;

  const propertyName = (id) => properties.find(p => p.id === id)?.name || (id != null ? `#${id}` : '—');

  const stats = [
    { label: 'Total Properties', value: properties.length },
    { label: 'Total Landlord',   value: landlords.length },
    { label: 'Total Tenant',     value: tenants.length },
    { label: 'Pending Project',  value: pendingProjects },
    { label: 'Total Projects',   value: projects.length },
  ];

  // Most recently created/updated projects, newest first.
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.created_at || b.start_date || 0) - new Date(a.created_at || a.start_date || 0))
    .slice(0, 5);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <svg className="animate-spin h-6 w-6 mr-3 text-primaryGreen" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading dashboard...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20 text-red-500">
      ⚠️ Failed to load dashboard: {error}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-indigo-900">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-3xl font-bold text-indigo-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Monthly Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transaction Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">Transaction 2026</p>
            <span className="text-[11px] text-gray-400 italic">Sample data — finance API not yet connected</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={8} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip formatter={(v) => `£${v.toLocaleString()}`} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Income"  fill="#1a5c38" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Expense" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Overview */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">Monthly Overview</p>
          </div>
          <div className='flex flex-col justify-center h-full'>
            <p className="text-sm text-gray-500 text-center">Total:</p>
            <p className="text-3xl font-bold text-indigo-900 text-center mt-1">£4,605,300</p>
            <div className="grid grid-cols-2 gap-12 mt-6 mx-auto">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-3 h-3 rounded-sm bg-primaryGreen inline-block" />
                  <span className="text-xs text-gray-500">Income:</span>
                </div>
                <p className="text-lg font-bold text-indigo-900">£5,005,300</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-3 h-3 rounded-sm bg-lightGreen inline-block" />
                  <span className="text-xs text-gray-500">Expense:</span>
                </div>
                <p className="text-lg font-bold text-indigo-900">£400,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">Recent Projects</p>
        {recentProjects.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No projects yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primaryGreen text-white">
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase">Property</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase">Project</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase">Start Date</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((p) => (
                  <tr key={p.id} className="border-b border-indigo-100">
                    <td className="px-4 py-3 text-gray-700">{propertyName(p.property)}</td>
                    <td className="px-4 py-3 text-gray-700">{p.name || p.description || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{fmtDate(p.start_date)}</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
