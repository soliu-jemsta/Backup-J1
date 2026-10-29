import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const roleLabelMap = { staff: 'Staff', landlord: 'Landlord', tenant: 'Tenant' };
  const roleLabel = user?.groups?.[0]?.name || roleLabelMap[user?.adminRole] || 'Staff';

  const initials = (user?.name || user?.username || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">

        {/* Left: hamburger + greeting */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-800">
            Hi, {user?.name || user?.username || 'Admin'}
          </h1>
        </div>

        {/* Right: role badge + avatar + logout */}
        <div className="flex items-center gap-4">

          {/* Role badge — visible on md+ */}
          <span className={`
            hidden md:inline-block text-xs font-semibold px-2.5 py-1 rounded
            ${user?.adminRole === 'staff'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'}
          `}>
            {roleLabel}
          </span>

          {/* Name + portal label */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{user?.name || user?.username}</p>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>

          <div
            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-gray-200
              bg-primaryGreen text-white flex items-center justify-center
              text-xs lg:text-sm font-semibold"
            title={user?.name || user?.username}
          >
            {initials}
          </div>

          {/* Logout — text on sm+, icon only on mobile */}
          <button
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg
              bg-red-100 hover:bg-red-200 text-sm font-medium text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>

          <button
            onClick={handleLogout}
            className="sm:hidden p-2 rounded-md text-red-600 hover:text-red-900 hover:bg-red-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
