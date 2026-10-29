import React from "react";

const TenantDocuments = () => {
  return (
    <div className="p-6">
      <p className="text-sm text-gray-900 mb-4">Dashboard / Documents</p>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Documents</h2>
      <div className="bg-white rounded-lg shadow-md p-4">
        <ul className="space-y-2 text-primary">
          <li>Tenancy Agreement.pdf</li>
          <li>Rent Receipt - March 2026.pdf</li>
          <li>Inventory Checklist.pdf</li>
        </ul>
      </div>
    </div>
  );
};

export default TenantDocuments;
