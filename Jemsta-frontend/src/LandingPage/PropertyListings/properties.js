/**
 * properties.js
 * ---------------------------------------------------------------
 * This is the single source of truth for every property shown on
 * the site. Add, edit, or remove entries here — every listing page
 * and the property detail page reads from this file, so nothing
 * else needs to change when you update it.
 *
 * FIELD GUIDE
 * id          — unique slug, used in the URL: /property/:id
 * type        — "rent" | "sale"
 * status      — short badge text, e.g. "Available", "New", "Let Agreed"
 * title       — headline used on the card and detail page
 * price       — display string, e.g. "£1,450 / month" or "£425,000"
 * address     — one-line address
 * location    — { lat, lng } — optional, only needed if you later add a map
 * beds/baths  — numbers
 * areaSqft    — number, floor area
 * description — 2–4 sentence summary, shown on the detail page
 * features    — array of short strings (amenities / highlights)
 * images      — array of image URLs, first one is used as the card thumbnail
 * agent       — { name, phone, email } — optional, shown on the detail page
 * featured    — true/false, lets you pin a property to the top later if you want
 */

export const properties = [
  {
    id: "willow-court-2b",
    type: "rent",
    status: "Available Now",
    title: "Bright Two-Bed Apartment, Willow Court",
    price: "£1,450 / month",
    address: "14 Willow Court, Manchester M4 5AB",
    beds: 2,
    baths: 1,
    areaSqft: 780,
    description:
      "A well-proportioned two-bedroom apartment on the third floor of a converted mill building, with exposed brick, tall windows, and a private balcony overlooking the courtyard. Close to tram links and the city centre.",
    features: [
      "Private balcony",
      "Exposed brick interior",
      "Secure entry system",
      "Bike storage",
      "Unfurnished",
      "Pets considered",
    ],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1600&auto=format&fit=crop",
    ],
    agent: { name: "Jemsta Lettings Team", phone: "0161 000 0000", email: "lettings@jemsta.co.uk" },
    featured: true,
  },
  {
    id: "orchard-lane-house",
    type: "sale",
    status: "New Listing",
    title: "Three-Bed Semi on Orchard Lane",
    price: "£325,000",
    address: "22 Orchard Lane, Stockport SK3 9HT",
    beds: 3,
    baths: 2,
    areaSqft: 1120,
    description:
      "A refurbished semi-detached family home with a south-facing garden, open-plan kitchen-diner, and off-road parking for two cars. Walking distance to well-regarded primary schools.",
    features: [
      "South-facing garden",
      "Open-plan kitchen-diner",
      "Off-road parking (x2)",
      "Downstairs WC",
      "Loft conversion",
      "Double glazing throughout",
    ],
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=1600&auto=format&fit=crop",
    ],
    agent: { name: "Jemsta Sales Team", phone: "0161 000 0001", email: "sales@jemsta.co.uk" },
    featured: false,
  },
  {
    id: "riverside-studio",
    type: "rent",
    status: "Available Now",
    title: "Riverside Studio Apartment",
    price: "£895 / month",
    address: "3 Quayside Walk, Salford M50 3XY",
    beds: 1,
    baths: 1,
    areaSqft: 420,
    description:
      "A compact, light-filled studio with floor-to-ceiling windows facing the river. Ideal for a professional wanting a low-maintenance base close to MediaCity.",
    features: [
      "River views",
      "Floor-to-ceiling windows",
      "Concierge",
      "Gym access",
      "Furnished",
      "No pets",
    ],
    images: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1600&auto=format&fit=crop",
    ],
    agent: { name: "Jemsta Lettings Team", phone: "0161 000 0000", email: "lettings@jemsta.co.uk" },
    featured: false,
  },
  {
    id: "elm-street-townhouse",
    type: "sale",
    status: "Under Offer",
    title: "Four-Bed Townhouse, Elm Street",
    price: "£498,000",
    address: "9 Elm Street, Didsbury M20 2GH",
    beds: 4,
    baths: 3,
    areaSqft: 1640,
    description:
      "A stylish end-of-terrace townhouse across three floors, with a top-floor principal suite, landscaped rear garden, and a home office. Moments from Didsbury village.",
    features: [
      "Principal suite with en-suite",
      "Landscaped garden",
      "Home office / study",
      "Utility room",
      "Underfloor heating (ground floor)",
      "EV charging point",
    ],
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=1600&auto=format&fit=crop",
    ],
    agent: { name: "Jemsta Sales Team", phone: "0161 000 0001", email: "sales@jemsta.co.uk" },
    featured: true,
  },
];

// Convenience helpers — import these instead of filtering `properties`
// by hand in every component, so the logic only lives in one place.
export const getPropertiesByType = (type) =>
  properties.filter((property) => property.type === type);

export const getPropertyById = (id) =>
  properties.find((property) => property.id === id);
