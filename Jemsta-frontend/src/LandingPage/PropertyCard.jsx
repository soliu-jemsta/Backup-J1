const BedIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 4a1 1 0 000 2v10a1 1 0 001 1h1v1a1 1 0 002 0v-1h8v1a1 1 0 002 0v-1h1a1 1 0 001-1V6a1 1 0 000-2H2z" />
  </svg>
);

const BathIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5zm0 2h10v8H5V6z"
      clipRule="evenodd"
    />
  </svg>
);

const PLACEHOLDER_IMAGE =
  'https://media.istockphoto.com/id/2155164659/photo/large-luxury-modern-bright-interiors-living-room-mockup-illustration-3d-rendering-image.jpg?s=2048x2048&w=is&k=20&c=tH-gw-ZrTkDKJLezm-GULIuq8oCvMP8fsdVA19DqRlw=';

const PropertyCard = ({ property }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <img
        src={ property.image || PLACEHOLDER_IMAGE}
        alt={property.title}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <p className="font-bold text-gray-900 text-lg">
          {property.price}
        </p>

        <p className="text-sm text-gray-700 underline mt-1 line-clamp-2">
          {property.title}
        </p>

        <div className="flex items-center text-gray-500 text-xs mt-2 space-x-3 hidden">
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
  );
};

export default PropertyCard;