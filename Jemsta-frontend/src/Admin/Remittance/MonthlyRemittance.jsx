import React, { useState } from 'react';
import PageHeader from '../shared/PageHeader';
import AdminTable, { AdminTr, AdminTd } from '../shared/AdminTable';

const remittanceData = [
  { id: 1, landlordName: 'John Wick', landlordEmail: 'jwick@jemsta.co.uk', property: 'Oakwood House', invoiceDate: '01/02/2026', dueDate: '15/02/2026' },
  { id: 2, landlordName: 'John Wick', landlordEmail: 'jwick@jemsta.co.uk', property: 'Oakwood House', invoiceDate: '01/03/2026', dueDate: '15/03/2026' },
  { id: 3, landlordName: 'John Wick', landlordEmail: 'jwick@jemsta.co.uk', property: 'Oakwood House', invoiceDate: '01/04/2026', dueDate: '15/04/2026' },
  { id: 4, landlordName: 'John Wick', landlordEmail: 'jwick@jemsta.co.uk', property: 'Oakwood House', invoiceDate: '01/05/2026', dueDate: '15/05/2026' },
  { id: 5, landlordName: 'John Wick', landlordEmail: 'jwick@jemsta.co.uk', property: 'Oakwood House', invoiceDate: '01/06/2026', dueDate: '15/06/2026' },
];

const FilterSelect = ({ placeholder, value, onChange, options = [] }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 border border-primaryGreen rounded-xl text-sm
        text-gray-600 bg-white appearance-none focus:outline-none
        focus:ring-2 focus:ring-primaryGreen focus:ring-opacity-30"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  </div>
);

const MonthlyRemittance = () => {
  const [filters, setFilters] = useState({ reportType: '', landlord: '', property: '', date: '' });
  const set = (field) => (e) => setFilters((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div>
      <PageHeader title="Monthly Remittance" buttonLabel="New Monthly Remittance" />

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <FilterSelect
            placeholder="Select Report Type"
            value={filters.reportType}
            onChange={set('reportType')}
            options={['Monthly', 'Quarterly', 'Annual']}
          />
          <FilterSelect
            placeholder="Select Landlord"
            value={filters.landlord}
            onChange={set('landlord')}
            options={['John Wick', 'Jane Doe']}
          />
          <FilterSelect
            placeholder="Select Property"
            value={filters.property}
            onChange={set('property')}
            options={['Oakwood House', 'Flat 1A', 'Cedar House', 'Maple Apartments']}
          />
          <input
            type="date"
            value={filters.date}
            onChange={set('date')}
            placeholder="Invoice Date"
            className="px-4 py-2.5 border border-primaryGreen rounded-xl text-sm
              text-gray-600 focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:ring-opacity-30"
          />
        </div>
      </div>

      <AdminTable columns={['S/N', 'Landlord Name', 'Landlord Email', 'Property', 'Invoice Date', 'Due Date']}>
        {remittanceData.map((r, i) => (
          <AdminTr key={r.id}>
            <AdminTd>{i + 1}</AdminTd>
            <AdminTd>{r.landlordName}</AdminTd>
            <AdminTd>{r.landlordEmail}</AdminTd>
            <AdminTd>{r.property}</AdminTd>
            <AdminTd>{r.invoiceDate}</AdminTd>
            <AdminTd>{r.dueDate}</AdminTd>
          </AdminTr>
        ))}
      </AdminTable>
    </div>
  );
};

export default MonthlyRemittance;
