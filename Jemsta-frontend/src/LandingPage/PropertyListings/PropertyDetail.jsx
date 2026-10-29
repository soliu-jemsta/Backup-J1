import React from 'react';
import { useParams, Link } from 'react-router-dom';
import PropertyGallery from './PropertyGallery';
import PropertyDetailSkeleton from './PropertyDetailSkeleton';
import { usePropertyDetail } from '../../hooks/usePropertyDetail';
import { statusColorClass } from '../../hooks/normalizeProperty';

const ENQUIRIES_EMAIL = 'info@jemsta.co.uk';
const ENQUIRIES_PHONE = '0144 384 2731';

const BedIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a2 2 0 012-2h14a2 2 0 012 2v6M3 18v2M21 18v2M3 12V9a1 1 0 011-1h4a1 1 0 011 1v3" />
  </svg>
);

const BathIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3zM7 12V6a2 2 0 012-2c1 0 1.8.6 2 1.5M3 12h18" />
  </svg>
);

const AreaIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4zM14 14h6v6h-6v-6zM4 20l6-6M20 4l-6 6" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const PublicPropertyDetail = () => {
  const { id } = useParams();
  const { property, isLoading, error } = usePropertyDetail(id);

  if (isLoading) {
    return <PropertyDetailSkeleton />;
  }

  if (error || !property) {
    return (
      <section className="py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Property not found</h2>
        <p className="text-gray-500 mt-2">
          {error
            ? "Couldn't load this property right now. Please try again shortly."
            : 'This listing may have been let, sold, or removed.'}
        </p>
        <Link to="/" className="inline-block mt-6 text-primary font-semibold hover:underline">
          &larr; Back to listings
        </Link>
      </section>
    );
  }

  const badgeClass = statusColorClass(property.status);
  const backTo = property.type === 'rent' ? '/rent' : '/sales';
  const backLabel = property.type === 'rent' ? 'Homes For Rent' : 'Homes For Sale';

  return (
    <section className="py-32 bg-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
        >
          &larr; Back to {backLabel}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: gallery + description */}
          <div className="lg:col-span-2">
            <PropertyGallery images={property.images} title={property.title} />

            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                {property.statusLabel && (
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
                    {property.statusLabel}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{property.title}</h1>
              {property.address && <p className="text-gray-500 mt-1">{property.address}</p>}

              <div className="flex flex-wrap items-center gap-6 text-gray-700 mt-5 py-5 border-y border-gray-200">
                <span className="flex items-center gap-2">
                  <BedIcon />
                  <span className="font-medium">{property.beds}</span> {property.beds === 1 ? 'bed' : 'beds'}
                </span>
                <span className="flex items-center gap-2">
                  <BathIcon />
                  <span className="font-medium">{property.baths}</span> {property.baths === 1 ? 'bath' : 'baths'}
                </span>
                {property.areaSqft && (
                  <span className="flex items-center gap-2">
                    <AreaIcon />
                    <span className="font-medium">{property.areaSqft}</span> sqft
                  </span>
                )}
              </div>

              {property.description && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">About this property</h2>
                  <p className="text-gray-600 leading-relaxed">{property.description}</p>
                </div>
              )}

              {property.features?.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Features</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    {property.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-gray-700 text-sm">
                        <CheckIcon />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right: sticky price + contact panel */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <p className="text-2xl font-bold text-primary">{property.price}</p>
              {property.type === 'rent' && property.availableFrom && (
                <p className="text-sm text-gray-500 mt-0.5">Available from {property.availableFrom}</p>
              )}
              {(property.propertyType || property.tenure) && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {[property.propertyType, property.tenure].filter(Boolean).join(' · ')}
                </p>
              )}

              {/*
                The API's property object doesn't include per-listing agent
                info yet, so these point at a general enquiries contact —
                swap ENQUIRIES_EMAIL / ENQUIRIES_PHONE for the real ones (or
                wire per-property agent data through once the backend adds it).
              */}
              <a
                href={`mailto:${ENQUIRIES_EMAIL}?subject=Enquiry: ${encodeURIComponent(property.title)}`}
                className="block w-full text-center bg-primary text-white font-semibold rounded-lg px-4 py-3 mt-5 hover:opacity-90 transition-opacity"
              >
                Enquire About This Property
              </a>

              <a
                href={`tel:${ENQUIRIES_PHONE}`}
                className="block w-full text-center border border-gray-300 text-gray-700 font-semibold rounded-lg px-4 py-3 mt-3 hover:bg-gray-50 transition-colors"
              >
                Call {ENQUIRIES_PHONE}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default PublicPropertyDetail;