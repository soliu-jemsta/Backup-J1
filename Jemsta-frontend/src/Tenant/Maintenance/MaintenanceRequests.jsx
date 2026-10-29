import React from "react";

const MaintenanceRequests = () => {
  return (
    <div className="p-6">
      <p className="text-sm text-gray-900 mb-4">Dashboard / Maintenance Requests</p>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Maintenance Requests</h2>
      <div className="bg-white rounded-lg shadow-md p-4">
        <ul className="space-y-3">
          <li className="border-b pb-2">Kitchen sink leak - In progress</li>
          <li className="border-b pb-2">Bedroom light replacement - Completed</li>
        </ul>
      </div>
    </div>
  );
};

export default MaintenanceRequests;
