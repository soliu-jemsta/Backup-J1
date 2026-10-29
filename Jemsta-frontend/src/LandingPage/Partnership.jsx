import React from 'react';
import PropertyMark from '../assets/imgs/propertymark.png';
import Reposit from '../assets/imgs/reposit.png';
import CMP from '../assets/imgs/cmp.png';
import Redress from '../assets/imgs/redress.png';
import RentSmart from '../assets/imgs/rent_smart_logo.webp';

const Partnership = () => {
  const partners = [
    { name: 'Propertymark', logo: PropertyMark },
    { name: 'Reposit', logo: Reposit },
    { name: 'CMP', logo: CMP },
    { name: 'Redress', logo: Redress },
    { name: 'RentSmart', logo: RentSmart }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Partnership
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="w-48 h-28 flex items-center justify-center"
            >
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Partnership;