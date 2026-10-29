import React from 'react';

const WhyChooseUs = () => {
  const features = [
    { title: 'Lender Approved Solicitors', description: 'Wide choice of trusted, major lender-approved professionals.', icon: '🏦', bgColor: 'bg-green-100' },
    { title: 'CQS Accredited', description: 'All Solicitors hold Conveyancing Quality Scheme certification.', icon: '✅', bgColor: 'bg-gray-50' },
    { title: 'Compare Your Way', description: 'Filter by price, location, reviews — or all three.', icon: '📊', bgColor: 'bg-green-100' },
    { title: 'Dedicated Case Handler', description: 'One Conveyancer managing your case from start to finish.', icon: '👨‍💼', bgColor: 'bg-gray-50' },
    { title: 'SMS Updates', description: 'Real-time notifications as your case progresses.', icon: '📱', bgColor: 'bg-gray-50' },
    { title: 'Fixed Fees', description: 'Clear pricing with no hidden surprises.', icon: '💰', bgColor: 'bg-green-100' },
    { title: 'Online Case Tracking', description: 'Monitor progress anytime with full transparency.', icon: '💻', bgColor: 'bg-gray-50' },
    { title: 'Expert Conveyancers', description: 'Experienced property law specialists', icon: '⚖️', bgColor: 'bg-green-100' }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Why Choose Our Service
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className={`${feature.bgColor} rounded-lg p-6`}>
                <div className="text-2xl mb-2 flex items-center">
                    <span className="text-3xl">{feature.icon}</span>
                    <h3 className="text-lg font-bold text-gray-900 ml-2">{feature.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
