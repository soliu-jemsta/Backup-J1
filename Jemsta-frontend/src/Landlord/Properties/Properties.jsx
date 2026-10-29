import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import House1 from '../../assets/imgs/House1.png';
// import House2 from '../../assets/imgs/House2.png';
// import House3 from '../../assets/imgs/House3.png';
import properties from './propertiesData'; // Import property data

const Properties = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Property data
  // const properties = [
  //   { id: 1, name: 'Oakland House', image: House1 },
  //   { id: 2, name: 'Maple House', image: House2 },
  //   { id: 3, name: 'Shibuya House', image: House3 },
  //   { id: 4, name: 'Ikoyi House', image: House1 },
  //   { id: 5, name: 'VGC House', image: House2 },
  //   { id: 6, name: 'Greenville House', image: House3 }
  // ];

  // Filter properties based on search term
  const filteredProperties = properties.filter(property => 
    property.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Click handler to navigate to PropertyDetails
  const handlePropertyClick = (propertyId) => {
    navigate(`/landlord/properties/${propertyId}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top Section with Greeting and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
        <p className="text-sm text-gray-900">Dashboard / Properties</p>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search properties"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors"
          />
          <svg 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {filteredProperties.map((property) => (
          <div key={property.id} onClick={() => handlePropertyClick(property.id)} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            {/* Property Image */}
            <div className="aspect-w-16 aspect-h-12 bg-gray-200">
              <img
                src={property.image}
                alt={`${property.name} property exterior view`}
                className="w-full h-48 object-cover"
              />
            </div>
            
            {/* Property Name */}
            <div className="p-4 lg:p-6">
              <a 
                href="#" 
                className="text-lg font-medium text-gray-900 hover:text-primary underline decoration-1 underline-offset-2 transition-colors"
              >
                {property.name}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Properties;
