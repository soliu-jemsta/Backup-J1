import React from 'react';

const PageHeader = ({ title, buttonLabel, onButtonClick }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-indigo-900">{title}</h2>
    {buttonLabel && (
      <button
        onClick={onButtonClick}
        className="px-4 py-2 bg-primaryGreen hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {buttonLabel}
      </button>
    )}
  </div>
);

export default PageHeader;
