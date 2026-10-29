// src/Admin/Property/Propertyoptions.js
//
// Shared option lists + label/badge helpers for the fields added by the
// new properties API (see Jemsta Public API doc, Sept 2026 — Field
// Reference section). Kept separate from src/hooks/normalizeProperty.js,
// which is wired to the public site's contextP/AuthContext — the admin
// portal uses its own context/AuthContext and works with the raw API
// field names directly (property.bedrooms, not property.beds), so it
// gets its own small helper file instead of sharing that one.

export const LISTING_TYPE_OPTIONS = [
  { value: 'rent', label: 'Rent' },
  { value: 'sale', label: 'Sale' },
];

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'detached', label: 'Detached' },
  { value: 'semi_detached', label: 'Semi-Detached' },
  { value: 'terraced', label: 'Terraced' },
  { value: 'flat', label: 'Flat/Apartment' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'other', label: 'Other' },
];

export const TENURE_OPTIONS = [
  { value: 'freehold', label: 'Freehold' },
  { value: 'leasehold', label: 'Leasehold' },
];

export const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'under_offer', label: 'Under Offer' },
  { value: 'sold', label: 'Sold' },
  { value: 'let', label: 'Let' },
];

// Outline-pill style to match the existing "Active" badge on the admin
// detail page, rather than the solid badges used on the public site.
export const STATUS_BADGE_CLASSES = {
  available: 'border-emerald-600 text-emerald-600',
  under_offer: 'border-amber-500 text-amber-600',
  sold: 'border-red-600 text-red-600',
  let: 'border-gray-400 text-gray-500',
};

const labelFrom = (options, value) => options.find((o) => o.value === value)?.label || value || '—';

export const listingTypeLabel = (value) => labelFrom(LISTING_TYPE_OPTIONS, value);
export const propertyTypeLabel = (value) => labelFrom(PROPERTY_TYPE_OPTIONS, value);
export const tenureLabel = (value) => labelFrom(TENURE_OPTIONS, value);
export const statusLabel = (value) => labelFrom(STATUS_OPTIONS, value);
export const statusBadgeClass = (value) => STATUS_BADGE_CLASSES[value] || 'border-gray-300 text-gray-500';