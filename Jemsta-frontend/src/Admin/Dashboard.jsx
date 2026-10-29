import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'January', Income: 1200, Expense: 800 },
  { month: 'February', Income: 1500, Expense: 600 },
  { month: 'March', Income: 1800, Expense: 700 },
  { month: 'April', Income: 2000, Expense: 900 },
  { month: 'May', Income: 2200, Expense: 1000 },
  { month: 'June', Income: 2500, Expense: 1100 },
  { month: 'July', Income: 3000, Expense: 1200 },
  { month: 'August', Income: 2800, Expense: 1300 },
  { month: 'September', Income: 3200, Expense: 1400 },
  { month: 'October', Income: 3500, Expense: 1500 },
  { month: 'November', Income: 4000, Expense: 1600 },
  { month: 'December', Income: 4500, Expense: 1700 },
];

const Dashboard = () => {
  return (
    <div className="bg-green-50">
      {/* Top Section: Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { number: '60', label: 'Total Properties' },
          { number: '20', label: 'Total Landlord' },
          { number: '40', label: 'Total Tenant' },
          { number: '70', label: 'Pending Project' },
          { number: '8', label: 'Appointment' },
          { number: '8', label: 'Total Categories' },
        ].map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-800">{card.number}</div>
            <div className="text-sm text-gray-600">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left: Bar Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold mb-4">Transaction 2026</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Income" fill="#205B28" />
              <Bar dataKey="Expense" fill="#499448" />
            </BarChart>
          </ResponsiveContainer>
          <button className="mt-4 bg-primaryGreen text-white py-2 px-4 rounded">This Year Report</button>
        </div>

        {/* Right: Monthly Overview */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold mb-4">Monthly Overview</h3>
          <div className="text-xl font-bold mb-2">Total: £4,605,300</div>
          <div className="text-sm text-gray-600">
            <span className="text-primaryGreen">Income: £5,005,300</span><br />
            <span className="text-lightGreen">Expense: £400,000</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Project Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-bold mb-4">Recent Project</h3>
        <table className="min-w-full">
          <thead className="bg-primaryGreen text-white">
            <tr>
              <th className="px-4 py-2 text-left">Property</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { property: 'Maple Apartments', description: 'Roof repair', status: 'Pending' },
              { property: 'Oakwood House', description: 'Faulty kitchen faucet', status: 'Completed' },
              { property: 'Shibuya Apartments', description: 'Door repair', status: 'Completed' },
            ].map((project, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{project.property}</td>
                <td className="px-4 py-2">{project.description}</td>
                <td className={`px-4 py-2 ${project.status === 'Pending' ? 'text-red-500' : 'text-green-500'}`}>
                  {project.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
