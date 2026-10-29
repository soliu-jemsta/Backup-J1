import React from 'react';

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* backdrop */}
    <div
      className="absolute inset-0 bg-black bg-opacity-30"
      onClick={onClose}
    />
    {/* panel */}
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
      {children}
    </div>
  </div>
);

export default Modal;
