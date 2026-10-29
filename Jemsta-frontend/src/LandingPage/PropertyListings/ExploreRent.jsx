import React from 'react';
import PropertyGrid from './PropertyGrid';

const ExploreRent = () => (
  <PropertyGrid
    type="rent"
    heading="Homes For Rent"
    searchPlaceholder="Search rentals..."
    emptyMessage="No rental properties match your search."
  />
);

export default ExploreRent;
