import React from 'react';
import { useParams } from 'react-router-dom';
import properties from './propertiesData'; // Import property data
import tenants from './tenantsData'; // Import tenant data
import documents from './documentsData';
import Maintenance from '../Maintenance';

const PropertyDetails = () => {
  const { propertyId } = useParams(); // Get propertyId from route parameters
  const property = properties.find(p => p.id === parseInt(propertyId)); // Find property based on ID

  // Default property data if none provided (for demo purposes)
  const defaultProperty = {
    id: 1,
    name: 'Oakland House',
    image: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Oakland+House',
    address: 'Ty Cynon House, Navigation Park, Abercynon',
    description: 'A beautiful house located in a serene environment.',
    rent: '£3,500',
    amenities: ['Wi-Fi', 'Parking', 'Garden'],
  };

  const propertyData = property || defaultProperty;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Breadcrumb */}
      <p className="text-sm text-gray-900 mb-2">Dashboard / Properties</p>
      
      {/* Property Title */}
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{propertyData.name}</h1>

      {/* Property Image */}
      <img 
        src={propertyData.image} 
        alt={`${propertyData.name} property exterior view`}
        className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-md mb-4"
      />

      {/* Property Address */}
      <p className="text-gray-700 text-lg mb-2">{propertyData.address}</p>

      {/* Property Description */}
      <p className="text-gray-600 mb-4">{propertyData.description}</p>

      {/* Rent Information */}
      <p className="text-lg font-semibold text-gray-900">Rent: {propertyData.rent}</p>

      {/* Tenants Section */}
      <div className="my-6">
        <h3 className="text-lg font-bold text-gray-900">Tenants</h3>
        <div className="flex space-x-4 mt-2">
          {tenants.map((tenant, index) => (
            <div key={index} className="flex items-center">
              <img 
                src={tenant.image} 
                alt={`${tenant.name} avatar`} 
                className="w-10 h-10 rounded-full border-2 border-gray-300"
              />
              <span className="ml-2 text-gray-800">{tenant.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Section */}
      {/* <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Maintenance Request</h3>
        <div className="flex mb-4">
          {['Open', 'In progress', 'Resolved'].map((status) => (
            <button key={status} className="flex-1 py-2 text-sm font-medium transition-colors rounded-lg bg-gray-200 hover:bg-gray-300">
              {status}
            </button>
          ))}
        </div>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Contractor</th>
              <th className="px-4 py-2 text-left">Maintenance Status</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceRequests.map((request, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2">{request.contractor}</td>
                <td className={`px-4 py-2 ${request.statusColor}`}>{request.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
      <Maintenance />

      {/* Documents Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Documents</h3>
        <ul className="list-disc list-inside text-gray-700">
          {documents.map((doc, index) => (
            <li key={index} className="mb-2">{doc.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PropertyDetails;
