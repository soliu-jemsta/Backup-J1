import React from 'react';

const AdminTable = ({ columns, children }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th
              key={i}
              className="bg-primaryGreen text-white text-left px-4 py-3 font-medium text-xs uppercase tracking-wide"
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export const AdminTr = ({ children }) => (
  <tr className="border-b border-indigo-100 hover:bg-gray-50 transition-colors">
    {children}
  </tr>
);

export const AdminTd = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>
);

export const StatusBadge = ({ status }) => {
  const isActive = String(status).toLowerCase() === 'active';
  return (
    <span
      className={`inline-block px-3 py-1 rounded text-xs font-medium text-white ${
        isActive ? 'bg-primaryGreen' : 'bg-red-400'
      }`}
    >
      {status}
    </span>
  );
};

export const ActionButtons = ({ onEdit, onDelete }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={onEdit}
      className="text-primaryGreen hover:text-green-700 transition-colors"
      title="Edit"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </button>
    <button
      onClick={onDelete}
      className="text-red-500 hover:text-red-700 transition-colors"
      title="Delete"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
);

export default AdminTable;
