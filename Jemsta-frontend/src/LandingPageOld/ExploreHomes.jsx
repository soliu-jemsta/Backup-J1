import React from 'react';
import House1 from '../assets/imgs/House1.png';
import House2 from '../assets/imgs/House2.png';
import House3 from '../assets/imgs/House3.png';


const ExploreHomes = () => {
  const properties = [
    {
      image: House1,
      price: '£450,000',
      title: 'Stunning Modern House Near City Center',
      beds: 3,
      baths: 2,
      location: 'London'
    },
    {
      image: House2,
      price: '£325,000',
      title: 'Spacious Family Home With Garden',
      beds: 4,
      baths: 3,
      location: 'Manchester'
    },
    {
      image: House3,
      price: '£275,000',
      title: 'Luxury Apartment With City Views',
      beds: 2,
      baths: 2,
      location: 'Birmingham'
    },
    {
      image: House1,
      price: '£520,000',
      title: 'Beautiful Victorian House Fully Renovated',
      beds: 5,
      baths: 3,
      location: 'Edinburgh'
    },
    {
      image: House2,
      price: '£380,000',
      title: 'Charming Cottage In Quiet Neighborhood',
      beds: 3,
      baths: 2,
      location: 'Bristol'
    },
    {
      image: House3,
      price: '£750,000',
      title: 'Luxury Penthouse With Panoramic Views',
      beds: 3,
      baths: 3,
      location: 'Leeds'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Explore Homes Near You
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {properties.map((property, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow p-4">
              <div className="relative">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                {/* <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-lg font-semibold">
                  {property.price}
                </div> */}
              </div>
              
              <div className="py-2">
                <h2 className='font-bold'>{property.price}</h2>
                <p className="text-sm text-gray-900 my-2 underline">{property.title}</p>
                <div className="flex items-center text-gray-600 text-sm space-x-4 font-semibold">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    {property.beds} beds
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5zm0 2h10v8H5V6z" clipRule="evenodd" />
                    </svg>
                    {property.baths} baths
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-2">{property.location}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Browse More
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExploreHomes;
