import { Link } from 'react-router-dom';
import { statusColorClass } from '../../hooks/normalizeProperty';

const BedIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a2 2 0 012-2h14a2 2 0 012 2v6M3 18v2M21 18v2M3 12V9a1 1 0 011-1h4a1 1 0 011 1v3" />
  </svg>
);

const BathIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3zM7 12V6a2 2 0 012-2c1 0 1.8.6 2 1.5M3 12h18" />
  </svg>
);

const AreaIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4zM14 14h6v6h-6v-6zM4 20l6-6M20 4l-6 6" />
  </svg>
);

const PLACEHOLDER_IMAGE =
  'https://media.istockphoto.com/id/2155164659/photo/large-luxury-modern-bright-interiors-living-room-mockup-illustration-3d-rendering-image.jpg?s=2048x2048&w=is&k=20&c=tH-gw-ZrTkDKJLezm-GULIuq8oCvMP8fsdVA19DqRlw=';

const PropertyCard = ({ property }) => {
  const thumbnail = property.images?.[0] || property.image || PLACEHOLDER_IMAGE;
  const badgeClass = statusColorClass(property.status);

  return (
    <Link
      to={`/property/${property.id}`}
      className="group block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative overflow-hidden">
        <img
          src={thumbnail}
          alt={property.title}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {property.statusLabel && (
          <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
            {property.statusLabel}
          </span>
        )}

        <span className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-primary font-bold text-sm px-3 py-1 rounded-lg shadow">
          {property.price}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {property.title}
        </h3>

        {property.address && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{property.address}</p>
        )}

        <div className="flex items-center gap-4 text-gray-600 text-xs mt-3 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1.5">
            <BedIcon />
            {property.beds} {property.beds === 1 ? 'bed' : 'beds'}
          </span>
          <span className="flex items-center gap-1.5">
            <BathIcon />
            {property.baths} {property.baths === 1 ? 'bath' : 'baths'}
          </span>
          {property.areaSqft && (
            <span className="flex items-center gap-1.5">
              <AreaIcon />
              {property.areaSqft} sqft
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;