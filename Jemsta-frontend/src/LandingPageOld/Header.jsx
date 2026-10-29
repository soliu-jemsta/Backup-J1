import React, { useState } from 'react';
import JemLogo from '../assets/imgs/jemLogo.png';
import { Link } from 'react-router-dom';

const Header = () => {
  const [showLoginCard, setShowLoginCard] = useState(false);
  return (
    <header className="bg-transparent py-4 w-full absolute z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="flex items-center justify-between h-24">
          {/* Logo and Tagline */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img 
                src={JemLogo} 
                alt="Jemsta Real Estate Logo" 
                className="h-24 w-auto"
              />
              <p className="text-xs mt-1">...making your dreams come home</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
              Rent
            </a>
            <a href="#" className="hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
              Sales
            </a>
            <a href="#" className="hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
              Book Online
            </a>
            <a href="#" className="hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
              About Us
            </a>
          </nav>

          {/* Login Button */}
          <div className="flex items-center">
            <button onClick={() => setShowLoginCard(!showLoginCard)} className="bg-white text-primary px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              Login
            </button>
          </div>
        </div>
      </div>
      {showLoginCard && (
            <div className='bg-amber-100 w-full max-w-7xl mx-auto px-4 relative z-40'>
                <div className='bg-white w-fit px-4 py-2 absolute top-[-10px] right-8 rounded-lg shadow-lg cursor-pointer flex flex-col gap-2'>
                    <Link to="/login/landlord" onClick={() => setShowLoginCard(false)} className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors cursor-pointer">Login as Landlord</Link>
                    <Link to="/login/tenant" onClick={() => setShowLoginCard(false)} className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors cursor-pointer">Login as Tenant</Link>
                </div>
            </div>
            )}
    </header>
  );
};

export default Header;
