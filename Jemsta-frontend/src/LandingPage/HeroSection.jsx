import React, { useState } from 'react';
import HeroImage from '../assets/imgs/Hero.png';
import { useNavigate } from 'react-router-dom';

// Adjust these to match your actual route paths for the sales/letting listing pages.
const SEARCH_ROUTES = {
    'For Sale': '/sales',
    'To Let': '/rent',
};

const HeroSection = () => {
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('For Sale');
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        const destination = SEARCH_ROUTES[searchType] || '/sales';
        const params = new URLSearchParams();
        if (query.trim()) params.set('q', query.trim());
        navigate(params.toString() ? `${destination}?${params.toString()}` : destination);
    };

    return (
        <section className="relative h-screen bg-cover bg-center" style={{
            backgroundImage: `linear-gradient(#0000009e, #00000066), url(${HeroImage})`
        }}>
            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-7xl mx-auto px-4">
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                        Your Trusted Estate Agency for Sales, Lettings & Management.
                    </h1>
                    <p className="text-lg font-semibold md:text-lg mt-6 mb-12 text-white">
                        Proven results, transparent pricing, and a tailored approach for buyers, renters, and investors.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                        <div className="flex bg-white rounded-full shadow-lg overflow-hidden">

                            {/* Dropdown */}
                            <div className="px-6 py-4 bg-gray-200">
                                <select
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                    className="bg-transparent text-gray-700 focus:outline-none"
                                >
                                    <option>For Sale</option>
                                    <option>To Let</option>
                                </select>
                            </div>

                            {/* Input */}
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Enter an address, city, neighborhood, or Postal code."
                                className="flex-1 px-6 py-4 focus:outline-none text-gray-700"
                            />

                            {/* Search Button */}
                            <button
                                type="submit"
                                className="bg-primary text-white px-6 py-4 flex items-center justify-center rounded-r-full hover:opacity-90 transition"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                                    />
                                </svg>
                            </button>

                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;