import React, { useState } from 'react';
import House1 from '../assets/imgs/House1.png';
import House2 from '../assets/imgs/House2.png';
import House3 from '../assets/imgs/House3.png';

const BedIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 4a1 1 0 000 2v10a1 1 0 001 1h1v1a1 1 0 002 0v-1h8v1a1 1 0 002 0v-1h1a1 1 0 001-1V6a1 1 0 000-2H2z" />
  </svg>
);

const BathIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5zm0 2h10v8H5V6z" clipRule="evenodd" />
  </svg>
);

const forSaleProperties = [
  { image: House1, price: '£450,000', title: 'Plot 84 Chief House Street Trans Amed Industrial Agent', beds: 4, baths: 1 },
  { image: House2, price: '£450,000', title: 'Plot 84 Chief House Street Trans Amed Industrial Agent', beds: 4, baths: 1 },
  { image: House3, price: '£450,000', title: 'Plot 84 Chief House Street Trans Amed Industrial Agent', beds: 4, baths: 1 },
  { image: House1, price: '£450,000', title: 'Plot 84 Chief House Street Trans Amed Industrial Agent', beds: 4, baths: 1 },
  { image: House2, price: '£450,000', title: 'Plot 84 Chief House Street Trans Amed Industrial Agent', beds: 4, baths: 1 },
  { image: House3, price: '£450,000', title: 'Plot 84 Chief House Street Trans Amed Industrial Agent', beds: 4, baths: 1 },
];

const rentProperties = [
  { image: House2, price: '£1,800/mo', title: 'Plot 12 River View Apartments Modern Living Space', beds: 2, baths: 1 },
  { image: House3, price: '£2,200/mo', title: 'Plot 23 Garden Estate Luxury Detached Family Home', beds: 3, baths: 2 },
  { image: House1, price: '£1,500/mo', title: 'Plot 55 Central Quarter Contemporary Studio Flat', beds: 1, baths: 1 },
  { image: House3, price: '£2,500/mo', title: 'Plot 77 Oak Lane Executive Townhouse With Garage', beds: 4, baths: 2 },
  { image: House1, price: '£1,950/mo', title: 'Plot 36 Meadow Close Semi-Detached With Garden', beds: 3, baths: 1 },
  { image: House2, price: '£3,000/mo', title: 'Plot 91 Highfield Manor Penthouse With City Views', beds: 3, baths: 2 },
];

const ExploreHomes = () => {
  const [activeTab, setActiveTab] = useState('sale');
  const properties = activeTab === 'sale' ? forSaleProperties : rentProperties;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Explore Homes Near You..
          </h2>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setActiveTab('sale')}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === 'sale'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === 'rent'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Rent
            </button>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {properties.map((property, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="font-bold text-gray-900 text-lg">{property.price}</p>
                <p className="text-sm text-gray-700 underline mt-1 line-clamp-2">{property.title}</p>
                <div className="flex items-center text-gray-500 text-xs mt-2 space-x-3">
                  <span className="flex items-center font-medium">
                    <BedIcon />
                    {property.beds} beds
                  </span>
                  <span className="flex items-center font-medium">
                    <BathIcon />
                    {property.baths} baths
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">
            Browse More
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExploreHomes;