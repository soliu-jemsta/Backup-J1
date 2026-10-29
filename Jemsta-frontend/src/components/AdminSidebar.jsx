import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuditAccess } from '../hooks/useAuditAccess';
import JemLogo from '../assets/imgs/jemLogo.png';

const ChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const BulletDot = () => (
  <span className="w-1.5 h-1.5 rounded-full bg-white inline-block flex-shrink-0" />
);

const navigationItems = {
  superuser: [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Users & Roles',
      children: [
        { name: 'Users', path: '/admin/users' },
        { name: 'Roles', path: '/admin/roles' },
      ],
    },
    { name: 'Landlord', path: '/admin/landlords' },
    { name: 'Tenant', path: '/admin/tenants' },
    { name: 'Project', path: '/admin/projects' },
    {
      name: 'Property Setup',
      children: [
        { name: 'Property', path: '/admin/property' },
        { name: 'Property Category', path: '/admin/property-category' },
        { name: 'Property Facility Type', path: '/admin/property-facility-type' },
      ],
    },
    { name: 'Remittance',
      children: [
        { name: 'Maintenance Invoice',path: '/admin/maintenance-invoice' },
        { name: 'Monthly Remittance',path: '/admin/monthly-remittance' },
        { name: 'Tenant Invoice', path: '/admin/tenant-invoice' }
      ],
    },
    { name: 'Report', 
      children: [
        { name: 'Company Financial Report', path: '/admin/monthly-report' },
        { name: 'Landlord Financial Report', path: '/admin/annual-report' },
        { name: 'VAT Report', path: '/admin/vat-report' },
      
      ],
     },

  ],
  manager: [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Landlord', path: '/admin/landlords' },
    { name: 'Tenant', path: '/admin/tenants' },
    {
      name: 'Property Setup',
      children: [
        { name: 'Property', path: '/admin/property' },
        { name: 'Property Category', path: '/admin/property-category' },
        { name: 'Property Facility Type', path: '/admin/property-facility-type' },
      ],
    },
  ],
  pm: [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Landlord', path: '/admin/landlords' },
  ],
  sl: [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Sales', path: '/admin/landlords' },
    { name: 'Lettings', path: '/admin/tenants' },
    { name: 'Project', path: '/admin/projects' },
    {
      name: 'Property Setup',
      children: [
        { name: 'Property', path: '/admin/property' },
        { name: 'Property Category', path: '/admin/property-category' },
        { name: 'Property Facility Type', path: '/admin/property-facility-type' },
      ],
    },
    { name: 'Remittance',
      children: [
        { name: 'Maintenance Invoice',path: '/admin/maintenance-invoice' },
        { name: 'Monthly Remittance',path: '/admin/monthly-remittance' },
        { name: 'Tenant Invoice', path: '/admin/tenant-invoice' }
      ],
    },
    { name: 'Report', 
      children: [
        { name: 'Company Financial Report', path: '/admin/monthly-report' },
        { name: 'Landlord Financial Report', path: '/admin/annual-report' },
        { name: 'VAT Report', path: '/admin/vat-report' },
      
      ],
     }
  ],
  pmf: [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Project', path: '/admin/projects' },
    {
      name: 'Property Setup',
      children: [
        { name: 'Property', path: '/admin/property' },
        { name: 'Property Category', path: '/admin/property-category' },
        { name: 'Property Facility Type', path: '/admin/property-facility-type' },
      ],
    },
    { name: 'Remittance',
      children: [
        { name: 'Maintenance Invoice',path: '/admin/maintenance-invoice' },
        { name: 'Monthly Remittance',path: '/admin/monthly-remittance' },
        { name: 'Tenant Invoice', path: '/admin/tenant-invoice' }
      ],
    },
    { name: 'Report', 
      children: [
        { name: 'Company Financial Report', path: '/admin/monthly-report' },
        { name: 'Landlord Financial Report', path: '/admin/annual-report' },
        { name: 'VAT Report', path: '/admin/vat-report' },
      
      ],
     }
  ]
};

// Maps a user's group name(s) to one of the navigationItems menu keys above.
// Admin Manager -> superuser (full access)
// Finance Manager -> pmf (Remittance + Reports)
// Property Management -> manager (Landlord, Tenant, Property Setup)
// Sales & Lettings Manager -> sl (Sales + Lettings + Reports)
const GROUP_MENU_MAP = {
  'admin manager':              'superuser',
  'finance manager':            'pmf',
  'property management':        'manager',
  'sales & lettings manager':   'sl',
};

// Priority order when a user belongs to multiple groups — most privileged wins.
const MENU_PRIORITY = ['superuser', 'manager', 'sl', 'pmf', 'pm'];

const getMenuKeyForUser = (user) => {
  const groups = user?.groups || [];
  if (!groups.length) return 'superuser'; // no group set → default to full access

  const matchedKeys = groups
    .map(g => GROUP_MENU_MAP[String(g.name || '').toLowerCase()])
    .filter(Boolean);

  if (!matchedKeys.length) return 'superuser'; // unrecognized group → safe default

  return MENU_PRIORITY.find(key => matchedKeys.includes(key)) || matchedKeys[0];
};

const NavItem = ({ item, setSidebarOpen }) => {
  const location = useLocation();

  // Check if any child route is currently active (to auto-expand)
  const hasActiveChild = item.children?.some(child =>
    location.pathname.startsWith(child.path)
  );

  const [open, setOpen] = useState(hasActiveChild || false);

  if (item.children) {
    return (
      <li>
        <button
          onClick={() => setOpen(prev => !prev)}
          className={`
            w-full flex items-center justify-between px-4 py-3 text-sm
            border-l-4 transition-colors
            ${hasActiveChild
              ? 'bg-lightGreen border-red-500 text-white'
              : 'border-transparent text-white hover:bg-lightGreen'}
          `}
        >
          <span>{item.name}</span>
          {open ? <ChevronUp /> : <ChevronDown />}
        </button>

        {open && (
          <ul className="bg-primary-700 py-1">
            {item.children.map(child => (
              <li key={child.name}>
                <NavLink
                  to={child.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 pl-7 pr-4 py-2.5 text-sm transition-colors
                    ${isActive ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <BulletDot />
                  {child.name}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.path}
        end={item.name === 'Dashboard'}
        className={({ isActive }) =>
          `flex px-4 py-3 text-sm border-l-4 transition-colors
          ${isActive
            ? 'bg-lightGreen border-red-500 text-white'
            : 'border-transparent text-white hover:bg-lightGreen'}`
        }
        onClick={() => setSidebarOpen(false)}
      >
        {item.name}
      </NavLink>
    </li>
  );
};

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const canViewAudit = useAuditAccess();
const baseItems = navigationItems[getMenuKeyForUser(user)] || navigationItems.superuser;
const navItems = canViewAudit
  ? [...baseItems, { name: 'Audit Log', path: '/admin/audit-log' }]
  : baseItems;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primaryGreen text-white
        flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Mobile close */}
        <div className="lg:hidden flex justify-end p-4">
          <button onClick={() => setSidebarOpen(false)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-lightGreen">
          <img src={JemLogo} alt="Jemsta Logo" />
          <p className="text-xs mt-1 text-gray-300">...making your dreams come home</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 lg:py-6 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.name} item={item} setSidebarOpen={setSidebarOpen} />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-lightGreen">
          <p className="text-sm font-medium mb-1">Admin Portal</p>
          <p className="text-xs text-gray-300 truncate">{user?.email}</p>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;