import React, { useState } from 'react';
// import allMaintenanceData from '../maintenanceData';
import Maintenance from '../Maintenance';

const MainContent = () => {
  const [activeMaintenanceTab, setActiveMaintenanceTab] = useState('Open');

  const statsCards = [
    { number: '8', label: 'Properties', bgColor: 'bg-green-200', textColor: 'text-green-800' },
    { number: '12', label: 'Active Tenants', bgColor: 'bg-blue-200', textColor: 'text-blue-800' },
    { number: '£3,500', label: 'Rent this month', bgColor: 'bg-yellow-200', textColor: 'text-yellow-800' },
    { number: '8', label: 'Pending Issues', bgColor: 'bg-red-200', textColor: 'text-red-800' }
  ];

  const rentData = [
    { property: 'Maple Apartments', tenant: 'John Wick', status: 'Overdue', statusColor: 'text-red-500' },
    { property: 'Oakwood House', tenant: 'Jason Statham', status: 'Paid', statusColor: 'text-green-500' },
    { property: 'Shibuya Apartments', tenant: 'Hanzo Hasashi', status: 'Paid', statusColor: 'text-green-500' }
  ];

  const documents = [
    { type: 'Contract', startDate: '01/01/2026', expiryDate: '01/04/2026' }
  ];

  return (
    // <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {statsCards.map((card, index) => (
            <div key={index} className={`${card.bgColor} rounded-lg p-4 lg:p-6 shadow-sm`}>
              <div className={`text-2xl lg:text-3xl font-bold ${card.textColor} mb-2`}>
                {card.number}
              </div>
              <div className={`text-sm font-medium ${card.textColor}`}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* Rent Overview */}
        <div className="bg-white rounded-lg shadow-sm mb-6 lg:mb-8 overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">Rent Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium">Property</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium">Tenant</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium">Rent Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rentData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">{row.property}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">{row.tenant}</td>
                      <td className={`px-4 lg:px-6 py-4 text-sm font-medium ${row.statusColor}`}>
                        {row.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Maintenance />

        {/* Documents */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-gray-900">Documents</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium text-gray-900">Document Type</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium text-gray-900">Start Date</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium text-gray-900">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 flex items-center">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">{doc.type}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{doc.startDate}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{doc.expiryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    // </main>
  );
};

export default MainContent;
