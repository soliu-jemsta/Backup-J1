// src/hooks/normalizeProperty.js
//
// Single source of truth for turning a raw API property object into the
// shape PropertyCard / PropertyGrid / PropertyDetail expect. Shared by
// usePropertyListings.js and usePropertyDetail.js so the two never drift
// out of sync with each other or with the backend's field names.
//
// Field mapping is per the "Jemsta Public API" doc (Sept 2026), field
// reference section — ignoring the Next.js-specific parts of that doc,
// since this app fetches via src/api/auth.js's authFetch, not lib/api.ts.

const STATUS_LABELS = {
  available: 'Available',
  under_offer: 'Under Offer',
  sold: 'Sold',
  let: 'Let',
};

const STATUS_COLORS = {
  available: 'bg-emerald-600 text-white',
  under_offer: 'bg-amber-500 text-white',
  sold: 'bg-red-600 text-white',
  let: 'bg-gray-500 text-white',
};

const PROPERTY_TYPE_LABELS = {
  detached: 'Detached',
  semi_detached: 'Semi-Detached',
  terraced: 'Terraced',
  flat: 'Flat/Apartment',
  bungalow: 'Bungalow',
  other: 'Other',
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || status || null;
}

export function statusColorClass(status) {
  return STATUS_COLORS[status] || 'bg-gray-500 text-white';
}

export function propertyTypeLabel(propertyType) {
  return PROPERTY_TYPE_LABELS[propertyType] || propertyType || null;
}

function formatCurrency(amount) {
  if (amount == null) return null;
  const num = Number(amount);
  if (Number.isNaN(num)) return null;
  return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * `rent_amount` doubles as sale price too (per the field reference: "Monthly
 * rent or sale price as string") — the only thing that changes the display
 * is whether it's a rent or sale listing, via the "pcm" suffix.
 */
function formatPrice(raw) {
  const amount = formatCurrency(raw.rent_amount);
  if (!amount) return null;
  return raw.listing_type === 'rent' ? `${amount} pcm` : amount;
}

function sortByDisplayOrder(images) {
  if (!Array.isArray(images)) return [];
  return [...images].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

/**
 * Returns an ordered list of image URLs with the primary image first
 * (used as the card thumbnail via images[0]), followed by the rest in
 * display_order. Falls back to plain display_order if nothing is marked
 * primary, per the doc's fallback rule.
 */
function resolveImageList(images) {
  const sorted = sortByDisplayOrder(images).map((img) => img?.image).filter(Boolean);
  if (!Array.isArray(images) || images.length === 0) return [];

  const primary = images.find((img) => img.is_primary);
  if (!primary?.image) return sorted;

  return [primary.image, ...sorted.filter((url) => url !== primary.image)];
}

export function normalizeProperty(raw) {
  return {
    id: raw.id,
    images: resolveImageList(raw.images),
    price: formatPrice(raw),
    title: raw.name,
    address: raw.address,
    town: raw.town,
    postcode: raw.postcode,
    // Kept as `type` (not `listing_type`) to match what PropertyCard,
    // PropertyGrid, and PropertyDetail already read.
    type: raw.listing_type,
    propertyType: propertyTypeLabel(raw.property_type),
    tenure: raw.tenure,
    status: raw.status,
    statusLabel: statusLabel(raw.status),
    isVacant: raw.is_vacant,
    availableFrom: raw.available_from,
    beds: raw.bedrooms ?? null,
    baths: raw.bathrooms ?? null,
    // `listing` used to be a nested object (description/key_features) — the
    // backend restructuring moved both to top-level fields on the property.
    description: raw.description ?? null,
    features: raw.key_features ?? [],
    createdAt: raw.created_at,
  };
}