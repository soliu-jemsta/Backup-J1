import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JemLogo from '../assets/imgs/jemLogo.png';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navigationItems = {
    landlord: [
      { name: 'Dashboard', path: '/landlord' },
      { name: 'Properties', path: '/landlord/properties' },
      { name: 'Tenants', path: '/landlord/tenants' },
      { name: 'Financial Overview', path: '/landlord/finance' },
    ],
    tenant: [
      { name: 'Dashboard', path: '/tenant' },
      { name: 'Rent Payment', path: '/tenant/rent-payment' },
      { name: 'Maintenance', path: '/tenant/maintenance' },
      { name: 'Documents', path: '/tenant/documents' },
      { name: 'Messages', path: '/tenant/messages' },
    ],
  };

  const navItems = navigationItems[user?.role] || [];

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary text-white
        flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="lg:hidden flex justify-end p-4">
          <button onClick={() => setSidebarOpen(false)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        <div className="p-4 lg:p-6 border-b border-primary-600">
          {/* <h1 className="text-lg font-bold">Jemsta</h1> */}
          <img src={JemLogo} alt="Jemsta Logo" />
          <p className="text-xs mt-1">...making your dreams come home</p>
        </div>

        <div className="p-4 lg:p-6 border-b border-primary-600">
          <h3 className="text-base font-semibold mb-3 capitalize">
            {user?.role} Portal
          </h3>
          <div className="text-sm text-gray-300 space-y-1">
            {user?.role === 'landlord' ? (
              <>
                <p>Contract start: {user?.contractStart}</p>
                <p>Contract end: {user?.contractEnd}</p>
              </>
            ) : (
              <>
                <p>Lease start: {user?.leaseStart}</p>
                <p>Lease end: {user?.leaseEnd}</p>
              </>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 lg:py-6">
  <ul className="space-y-1">
    {navItems.map((item) => (
      <li key={item.name}>
        <NavLink
          to={item.path}
          end={item.name === 'Dashboard'}
          className={({ isActive }) =>
            `flex px-4 py-3 border-l-4 ${
              isActive
                ? 'bg-primary-600 border-red-500'
                : 'border-transparent hover:bg-primary-600'
            }`
          }
          onClick={() => setSidebarOpen(false)}
        >
          {item.name}
        </NavLink>
      </li>
    ))}
  </ul>
</nav>

        <div className="p-4 border-t border-primary-600">
          <p className="text-sm font-medium mb-2">Contact Account Manager:</p>
          <p className="text-sm mb-2">Kolade</p>
          <a href="https://wa.me/" className="text-sm hover:underline">Whatsapp</a>
        </div>
      </div>
    </>
  );
};

export default Sidebar;