import React from 'react';

const CoreServices = () => {
  const services = [
    {
      icon: '🏠',
      title: 'Full-Service Lettings',
      description: 'Comprehensive lettings service with tenant screening, property management, and maintenance support.'
    },
    {
      icon: '📊',
      title: 'Accurate Property Appraisals',
      description: 'Professional property valuations using market data and expert analysis for accurate pricing.'
    },
    {
      icon: '🏢',
      title: 'Professional Property Management',
      description: 'Complete property management services including maintenance, tenant relations, and financial reporting.'
    },
    {
      icon: '🏘️',
      title: 'Professional Conveyancing',
      description: 'Expert legal services for property transactions, ensuring smooth and secure property transfers.'
    },
    {
      icon: '❓',
      title: 'Instant Quote Comparisons',
      description: 'Compare quotes from multiple service providers to get the best deals for your property needs.'
    },
    {
      icon: '🏡',
      title: 'End-To-End Sales Management',
      description: 'Complete sales process management from listing to closing, ensuring maximum value for your property.'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Core Services
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Jemsta property management is your trusted partner with many years of experience. They offer the expertise of 
            professional property management services to help you make the most of your investment. Learn 
            more about what we have to offer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreServices;
