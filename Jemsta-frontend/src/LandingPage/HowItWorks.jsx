import React from 'react';
import MortgageImg from '../assets/imgs/deal.png';
// import TriggerTawkBtn from '../components/TriggerTawkBtn';

const HowItWorks = () => {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-100 rounded-2xl flex flex-col md:flex-row items-center gap-6 px-8 py-8 relative overflow-hidden">
          {/* Left: small image */}
          <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shadow-md">
            <img
              src={MortgageImg}
              alt="Mortgage advice"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Center: Text */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-primary">Need Mortgage Advice?</h3>
            <p className="text-gray-600 mt-1 text-sm">
              Partnered with trusted brokers offering tailored solutions
            </p>
          </div>

          {/* Right: Button */}
          <div className="flex-shrink-0">
            {/* <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm whitespace-nowrap">
              Speak to a broker
            </button> */}
            <a href="https://wa.link/yoshrr" target="_blank" className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
               Speak to a broker
              </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;