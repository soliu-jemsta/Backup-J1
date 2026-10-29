import React from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';


const data = [
    { month: 'Jan', Income: 1200, Expenses: 800 },
    { month: 'Feb', Income: 1500, Expenses: 600 },
    { month: 'Mar', Income: 1800, Expenses: 700 },
    { month: 'Apr', Income: 2000, Expenses: 900 },
    { month: 'May', Income: 2200, Expenses: 1000 },
    { month: 'Jun', Income: 2500, Expenses: 1100 },
    { month: 'Jul', Income: 3000, Expenses: 1200 },
    { month: 'Aug', Income: 2800, Expenses: 1300 },
    { month: 'Sep', Income: 3200, Expenses: 1400 },
    { month: 'Oct', Income: 3500, Expenses: 1500 },
    { month: 'Nov', Income: 4000, Expenses: 1600 },
    { month: 'Dec', Income: 4500, Expenses: 1700 },
];

const currencyFormatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0
});

const FinancialOverview = () => {
    return (
        <div className="p-6">
            {/* Header with Breadcrumb */}
            <p className="text-sm text-gray-900 mb-4">Dashboard / Financial Overview</p>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-200 rounded-lg shadow-md p-4 text-center">
                    <h2 className="text-xl font-bold">£1,500</h2>
                    <p className="text-gray-600">Total Balance</p>
                </div>
                <div className="bg-green-200 rounded-lg shadow-md p-4 text-center">
                    <h2 className="text-xl font-bold">£1,600</h2>
                    <p className="text-gray-600">Income</p>
                </div>
                <div className="bg-red-200 rounded-lg shadow-md p-4 text-center">
                    <h2 className="text-xl font-bold">£100</h2>
                    <p className="text-gray-600">Expenses</p>
                </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h3 className="text-lg font-bold mb-4">Financial Overview</h3>
                {/* <div className="flex justify-between mb-4">
                    <div className="text-sm text-gray-600">Monthly View</div>
                    <select className="border border-gray-300 rounded-md p-1">
                        <option>Monthly View</option>
                        <option>Yearly View</option>
                    </select>
                </div> */}
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} barGap={6} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                            domain={[0, 5000]}
                            tickFormatter={(value) => currencyFormatter.format(value)}
                        />
                        <Tooltip formatter={(value) => currencyFormatter.format(value)} />
                        <Legend />
                        <Bar dataKey="Income" fill="#3d955c" />
                        <Bar dataKey="Expenses" fill="#ff7d7d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Transaction Table */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-bold mb-4">Transactions</h3>
                <table className="min-w-full">
                    <thead className="bg-primary text-white">
                        <tr>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Transaction Type</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="px-4 py-2">01/01/2026</td>
                            <td className="px-4 py-2">Income</td>
                            <td className="px-4 py-2">£800</td>
                        </tr>
                        <tr className="border-b">
                            <td className="px-4 py-2">28/01/2026</td>
                            <td className="px-4 py-2">Income</td>
                            <td className="px-4 py-2">£800</td>
                        </tr>
                        <tr className="border-b">
                            <td className="px-4 py-2">15/02/2026</td>
                            <td className="px-4 py-2">Expenses</td>
                            <td className="px-4 py-2">£100</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinancialOverview;
