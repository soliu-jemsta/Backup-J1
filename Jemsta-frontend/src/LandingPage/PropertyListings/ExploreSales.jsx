import React from 'react';
import PropertyGrid from './PropertyGrid';

const ExploreSales = () => (
  <PropertyGrid
    type="sale"
    heading="Homes For Sale"
    searchPlaceholder="Search properties..."
    emptyMessage="No properties match your search."
  />
);

export default ExploreSales;
