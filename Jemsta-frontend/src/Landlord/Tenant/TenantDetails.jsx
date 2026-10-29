import React from 'react';
import { useParams } from 'react-router-dom';
import { tenants } from './tenantsData';

const TenantDetails = () => {
  const { tenantId } = useParams(); // Get tenantId from route parameters
  const tenant = tenants.find(t => t.id === parseInt(tenantId)); // Find tenant based on ID

  // Default tenant data if none provided (for demo purposes)
  const defaultTenant = {
    id: 1,
    name: 'Soliu Adeosun',
    email: 'sawlew@gmail.com',
    phone: '08024182946',
    property: 'Oakland House',
    image: 'https://placehold.co/120x120/8B5CF6/FFFFFF?text=SA',
    leaseStartDate: '2024-01-15',
    leaseEndDate: '2024-12-31',
    rentAmount: '£1,200',
    emergencyContact: 'John Adeosun - 08012345678',
    address: 'Ty Cynon House, Navigation Park, Abercynon'
  };

  const tenantData = tenant || defaultTenant;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section with Breadcrumb and Profile Image */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 gap-4">
        {/* Breadcrumb */}
        <div className="flex-1">
          <p className="text-sm text-gray-900">Dashboard / Tenants</p>
        </div>
        
        {/* Profile Image - Top Right */}
        <div className="flex justify-end sm:justify-start">
          <img
            src={tenantData.image}
            alt={`${tenantData.name} profile picture`}
            className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
        </div>
      </div>

      {/* Tenant Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Name:</p>
            <p className="text-lg font-semibold text-gray-900">{tenantData.name}</p>
          </div>

          {/* Phone */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Phone:</p>
            <p className="text-lg font-semibold text-gray-900">{tenantData.phone}</p>
          </div>

          {/* Lease Start Date */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Lease Start Date:</p>
            <p className="text-lg font-semibold text-gray-900">{tenantData.leaseStartDate}</p>
          </div>

          {/* Rent Amount */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Rent Amount:</p>
            <p className="text-lg font-semibold text-gray-900">{tenantData.rentAmount}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Email */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Email:</p>
            <p className="text-lg font-semibold text-gray-900">{tenantData.email}</p>
          </div>

          {/* Property */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Property:</p>
            <p className="text-lg font-semibold text-gray-900">{tenantData.property}</p>
          </div>

          {/* Lease End Date */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Lease End Date:</p>
            <p className="text-lg font-semibold text-gray-900">{tenantData.leaseEndDate}</p>
          </div>

          {/* Emergency Contact */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Emergency Contact:</p>
            <p className="text-lg font-semibold text-gray-900">{tenantData.emergencyContact}</p>
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h3>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Property Address:</p>
          <p className="text-base text-gray-900">{tenantData.address}</p>
        </div>
      </div>
    </div>
  );
};

export default TenantDetails;
