import React from "react";

const TenantMessages = () => {
  return (
    <div className="p-6">
      <p className="text-sm text-gray-900 mb-4">Dashboard / Messages</p>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Messages</h2>
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="space-y-3">
          <div className="border-b pb-2">
            <p className="font-medium">Property Manager</p>
            <p className="text-sm text-gray-600">Reminder: inspection on Friday at 10:00 AM.</p>
          </div>
          <div className="border-b pb-2">
            <p className="font-medium">Support</p>
            <p className="text-sm text-gray-600">Your maintenance request has been assigned.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantMessages;
