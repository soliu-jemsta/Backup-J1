import React from 'react';
import PropertyMark from '../assets/imgs/propertymark.png';
import Reposit from '../assets/imgs/reposit.png';
import CMP from '../assets/imgs/cmp.png';

const Partnership = () => {
  const partners = [
    { name: 'Propertymark', logo: PropertyMark },
    { name: 'Reposit', logo: Reposit },
    { name: 'CMP', logo: CMP }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Partnership
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
          {partners.map((partner, index) => (
            <div key={index} className="flex items-center justify-center">
              <img 
                src={partner.logo} 
                alt={`${partner.name} logo`}
                className=""
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partnership;
