import React from 'react';

const WhyChooseUs = () => {
  const columns = [
    {
      title: 'For Sellers',
      items: [
        'Proven marketing strategy',
        'Strong local buyer network',
        'Accurate pricing strategy',
      ],
    },
    {
      title: 'For Landlords',
      items: [
        'Fully managed packages',
        'Rent protection options',
        'Dedicated maintenance coordination',
      ],
    },
    {
      title: 'For All Clients',
      items: [
        'Dedicated case handler',
        'Compliance Management',
        'Transparent fees',
      ],
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Why Choose Our Service
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-300">
          {columns.map((col, index) => (
            <div key={index} className="px-8 py-6">
              <h3 className="text-lg font-bold text-primary mb-4">{col.title}</h3>
              <ul className="space-y-2">
                {col.items.map((item, i) => (
                  <li key={i} className="flex items-start text-gray-700 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2 mt-1.5 flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;