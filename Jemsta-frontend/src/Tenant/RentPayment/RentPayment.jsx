import React from "react";

const RentPayment = () => {
  return (
    <div className="p-6">
      <p className="text-sm text-gray-900 mb-4">Dashboard / Rent Payment</p>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Rent Payment</h2>
      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-gray-700">Current Month Rent: £800</p>
        <p className="text-gray-700 mt-2">Status: Paid</p>
      </div>
    </div>
  );
};

export default RentPayment;
