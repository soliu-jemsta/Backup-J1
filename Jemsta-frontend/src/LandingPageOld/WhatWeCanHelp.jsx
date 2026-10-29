import React from 'react';

const WhatWeCanHelp = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            What We Can Help With
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="text-center p-8">
            <h3 className="text-xl font-semibold text-primary mb-4">Property Purchase</h3>
            <p className="text-primary">
              Expert guidance through the entire property buying process, from search to closing, ensuring you make informed decisions.
            </p>
          </div>
          
          <div className="text-center p-8 md:border-l md:border-r md:border-primary">
            <h3 className="text-xl font-semibold text-primary mb-4">Property Sale</h3>
            <p className="text-primary">
              Comprehensive property selling services including market analysis, professional photography, and negotiation support.
            </p>
          </div>
          
          <div className="text-center p-8">
            <h3 className="text-xl font-semibold text-primary mb-4">Management</h3>
            <p className="text-primary">
              Full-service property management including tenant screening, maintenance coordination, and financial reporting.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:border-t md:border-primary">
          <div className="text-center p-8">
            <h3 className="text-xl font-semibold text-primary mb-4">Transfer of Equity</h3>
            <p className="text-primary">
              Legal services for transferring property ownership, ensuring all documentation and processes are handled professionally.
            </p>
          </div>
          
          <div className="text-center p-8 md:border-l md:border-r md:border-primary">
            <h3 className="text-xl font-semibold text-primary mb-4">Shared Ownership</h3>
            <p className="text-primary">
              Guidance on shared ownership schemes, helping you understand options and navigate the application process.
            </p>
          </div>
          
          <div className="text-center p-8">
            <h3 className="text-xl font-semibold text-primary mb-4">Right to Buy</h3>
            <p className="text-primary">
              Support for Right to Buy applications, including eligibility assessment and application assistance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeCanHelp;
