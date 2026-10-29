import React from 'react';

const HowItWorks = () => {
  const steps = [
    { number: '01', title: 'Get Quote', description: 'Request a quote for your property needs online' },
    { number: '02', title: 'Compare Quotes', description: 'Compare quotes from multiple service providers' },
    { number: '03', title: 'Choose Provider', description: 'Select the best provider for your requirements' },
    { number: '04', title: 'Book Service', description: 'Schedule your preferred service appointment' },
    { number: '05', title: 'Pay Securely', description: 'Complete payment through our secure platform' }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            How It Works
          </h2>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-4">
            {steps.map((step, index) => {
                const isEven = index % 2 === 1; // 2nd, 4th, 6th...
                return (
                <div
                    key={index}
                    className={`flex-1 text-center py-3 text-primary ${
                    isEven ? "md:border-l md:border-r md:border-primary md:px-6" : ""
                    }`}
                >
                    <h2 className="text-5xl font-bold mb-4">
                    {step.number}
                    </h2>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-md">{step.description}</p>
                </div>
                );
            })}
            </div>
      </div>
    </section>
  );
};

export default HowItWorks;
