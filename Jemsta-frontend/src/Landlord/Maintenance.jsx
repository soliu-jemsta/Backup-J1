import React, { useState } from 'react'
import allMaintenanceData from './maintenanceData';

const Maintenance = () => {

    const [activeMaintenanceTab, setActiveMaintenanceTab] = useState('Open');
    const getFilteredMaintenanceData = () => {
        return allMaintenanceData.filter(item => item.category === activeMaintenanceTab);
    };

    // Get maintenance counts for each category
    const getMaintenanceCounts = () => {
    const counts = {
        'Open': allMaintenanceData.filter(item => item.category === 'Open').length,
        'In progress': allMaintenanceData.filter(item => item.category === 'In progress').length,
        'Resolved': allMaintenanceData.filter(item => item.category === 'Resolved').length
    };
        return counts;
    };

    const maintenanceCounts = getMaintenanceCounts();
    const filteredMaintenanceData = getFilteredMaintenanceData();

return (
    <>
    {/* Maintenance Request */}
        <div className="bg-white rounded-lg shadow-sm mb-6 lg:mb-8 overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">Maintenance Request</h3>
            
            {/* Toggle Buttons with Counts */}
            <div className="flex w-full mb-5 gap-5 lg:gap-8">
              {['Open', 'In progress', 'Resolved'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMaintenanceTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors rounded-lg relative ${
                    activeMaintenanceTab === tab
                      ? 'bg-primary text-white'
                      : 'bg-white text-primary border border-primary hover:bg-primary-600 hover:text-white'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    {tab}
                    {/* <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeMaintenanceTab === tab
                        ? 'bg-white text-primary'
                        : 'bg-primary text-white'
                    }`}>
                      {maintenanceCounts[tab]}
                    </span> */}
                  </span>
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium">Property</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium">Contractor</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium">Maintenance Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMaintenanceData.length > 0 ? (
                    filteredMaintenanceData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">{row.property}</td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">{row.contractor}</td>
                        <td className={`px-4 lg:px-6 py-4 text-sm font-medium ${row.statusColor}`}>
                          {row.status}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 lg:px-6 py-8 text-center text-gray-500">
                        No maintenance requests found for "{activeMaintenanceTab}" status.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </>
)
}

export default Maintenance