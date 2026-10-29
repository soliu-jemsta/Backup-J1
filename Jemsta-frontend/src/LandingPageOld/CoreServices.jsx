import React from 'react';
import HouseBuyer from '../assets/imgs/housebuyer.png';

const CoreServices = () => {
  const services = [
    {
      image: HouseBuyer,
      title: 'Full-Service Lettings',
      description: 'Comprehensive lettings service with tenant screening, property management, and maintenance support.'
    },
    {
      image: HouseBuyer,
      title: 'Accurate Property Appraisals',
      description: 'Professional property valuations using market data and expert analysis for accurate pricing.'
    },
    {
      image: HouseBuyer,
      title: 'Professional Property Management',
      description: 'Complete property management services including maintenance, tenant relations, and financial reporting.'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-primary mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our Core Services
          </h2>
          <p className="text-lg text-gray-600 max-w-5xl mx-auto">
            A real estate transaction is a multifaceted process with many moving parts. That's why the experts at Jemsta UK will offer you a wide array of services to help you through the process. Take a look below to learn more about what we have to offer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="relative aspect-square transition-transform duration-300 rounded-2xl overflow-hidden">
              <div className="bg-cover bg-center h-full" style={{ backgroundImage: `url('${service.image}')` }}>
                <div className="absolute inset-0 bg-[#6F6961] opacity-90 flex flex-col justify-center services-center text-white text-center transition-opacity duration-300 hover:opacity-0 active:opacity-0 p-5">
                  <h3 className="text-md font-bold lg-3 mb-3 select-none">{service.title}</h3>
                  <p className="select-none">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreServices;
