import React from "react";

const TenantDashboard = () => {
  return (
    <div className="p-6">
      <p className="text-sm text-gray-900 mb-4">Dashboard / Tenant</p>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tenant Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Next Rent Due</p>
          <p className="text-xl font-bold mt-1">01/04/2026</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Outstanding Balance</p>
          <p className="text-xl font-bold mt-1">£0</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Open Requests</p>
          <p className="text-xl font-bold mt-1">1</p>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
