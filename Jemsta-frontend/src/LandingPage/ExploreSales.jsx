import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import { usePropertyListings } from '../hooks/usePropertyListings';

const ExploreSales = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const { properties, isLoading, error } = usePropertyListings('sale');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set('q', value);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  };

  const filteredProperties = properties.filter((property) =>
    (property.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">

        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Homes For Sale
          </h2>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={handleSearchChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {isLoading && (
          <p className="text-center text-gray-500 mb-10">Loading properties...</p>
        )}

        {error && (
          <p className="text-center text-red-500 mb-10">
            Couldn't load properties right now. Please try again shortly.
          </p>
        )}

        {!isLoading && !error && filteredProperties.length === 0 && (
          <p className="text-center text-gray-500 mb-10">
            No properties match your search.
          </p>
        )}

        {!isLoading && !error && filteredProperties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ExploreSales;