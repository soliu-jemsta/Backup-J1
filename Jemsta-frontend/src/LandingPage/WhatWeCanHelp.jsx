import React from 'react';
import HandshakeImg from '../assets/imgs/deal.png';
// import TriggerTawkBtn from '../components/TriggerTawkBtn';

const WhatWeCanHelp = () => {
  const benefits = [
    'Guaranteed compliance handling',
    'Transparent monthly reporting',
    'Stress-free maintenance',
    'Proactive tenant management',
    'One point of contact',
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src={HandshakeImg}
              alt="Property management handshake"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8">
              Property Management Made Simple
            </h2>
            <ul className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3 flex-shrink-0"></span>
                  {benefit}
                </li>
              ))}
            </ul>
            {/* <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">
              Speak to a Property Manager
            </button> */}
            <a href="https://wa.link/yoshrr" target="_blank" className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
               Speak to a Property Manager
              </a>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeCanHelp;