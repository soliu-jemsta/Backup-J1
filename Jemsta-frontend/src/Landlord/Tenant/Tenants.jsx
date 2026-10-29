import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenants } from './tenantsData'; // Import tenant data

const Tenants = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tenants based on search term (case-insensitive)
  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTenantClick = (tenantId) => {
    navigate(`/landlord/tenants/${tenantId}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top Section with Breadcrumb and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
        <p className="text-sm text-gray-900">Dashboard / Tenants</p>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search tenants"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors"
          />
          <svg 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredTenants.length > 0 
              ? `Showing ${filteredTenants.length} result${filteredTenants.length !== 1 ? 's' : ''} for "${searchTerm}"`
              : `No tenants found for "${searchTerm}"`
            }
          </p>
        </div>
      )}

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {filteredTenants.length > 0 ? (
          filteredTenants.map((tenant) => (
            <div key={tenant.id} onClick={() => handleTenantClick(tenant.id)} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              {/* Tenant Card Content */}
              <div className="p-6 lg:p-8 text-center">
                {/* Profile Image */}
                <div className="mb-4">
                  <img
                    src={tenant.image}
                    alt={`${tenant.name} profile picture`}
                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-full mx-auto object-cover border-2 border-gray-100"
                  />
                </div>
                
                {/* Tenant Name */}
                <a 
                  href="#" 
                  className="text-lg font-medium text-gray-900 hover:text-primary underline decoration-1 underline-offset-2 transition-colors"
                >
                  {tenant.name}
                </a>
              </div>
            </div>
          ))
        ) : searchTerm ? (
          /* No Results State */
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants found</h3>
            <p className="text-gray-500 text-center max-w-sm">
              We couldn't find any tenants matching "{searchTerm}". Try adjusting your search terms.
            </p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
            >
              Clear search
            </button>
          </div>
        ) : (
          /* Default: Show all tenants when no search term */
          tenants.map((tenant) => (
            <div key={tenant.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {/* Tenant Card Content */}
              <div className="p-6 lg:p-8 text-center">
                {/* Profile Image */}
                <div className="mb-4">
                  <img
                    src={tenant.image}
                    alt={`${tenant.name} profile picture`}
                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-full mx-auto object-cover border-2 border-gray-100"
                  />
                </div>
                
                {/* Tenant Name */}
                <a 
                  href="#" 
                  className="text-lg font-medium text-gray-900 hover:text-primary underline decoration-1 underline-offset-2 transition-colors"
                >
                  {tenant.name}
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tenants;
