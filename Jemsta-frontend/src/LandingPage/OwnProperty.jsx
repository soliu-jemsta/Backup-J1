import React from 'react';
import Deal from '../assets/imgs/deal.png'
// import TriggerTawkBtn from '../components/TriggerTawkBtn';

const OwnProperty = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl text-center my-12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              Own A Property?
            </h2>
        </div>
                    
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src={Deal}
              alt="Property management consultation meeting"
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
          
          <div className="text-left">

            <p className="text-lg text-primary mb-8 text-left">
              Let us manage, let us sell your property with complete transparency and professional oversight.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Accurate Market Appraisal</span>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Compliance Management</span>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Secure Rent Collection</span>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Dedicated Property Manager</span>
              </div>
            </div>
            
            {/* <button className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
              Contact a Representative
            </button> */}
            <a href="https://wa.link/yoshrr" target="_blank" className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
               Speak to a Representative
              </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnProperty;
