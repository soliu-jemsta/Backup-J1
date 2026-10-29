import React, { useState } from 'react';
import JemstaLogo from '../assets/imgs/jemLogo.png';
import Facebook from '../assets/imgs/facebook.png';
import Instagram from '../assets/imgs/instagram.png';
import Twitter from '../assets/imgs/twitter.png';
import LinkedIn from '../assets/imgs/linkedin.png';
import { Link } from 'react-router-dom';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import CookiePolicyModal from './CookiePolicyModal'; // rename file to CookiePolicyModal.jsx when you can
import DisclaimerModal from './DisclaimerModal';
import TOUModal from './TOUModal';
import ComplaintPolicy from './ComplaintPolicy';

const Footer = () => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isCookieOpen, setIsCookieOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isTOUOpen, setIsTOUOpen] = useState(false);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <img
              src={JemstaLogo}
              alt="Jemsta Real Estate Logo"
              className="h-24 w-auto mb-4"
            />
            <p className="text-gray-300 mb-4">
              ...making your dreams come home
            </p>
            <div className="flex space-x-4">
              <Link to="https://facebook.com/jemstaukltd" className="text-gray-300 hover:text-white transition-colors">
                <img src={Facebook} alt="" />
              </Link>
              <Link
                to="https://www.linkedin.com/company/jemsta/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <img src={LinkedIn} alt="" />
              </Link>
              <Link to="" className="hidden text-gray-300 hover:text-white transition-colors">
                <img src={Twitter} alt="" />
              </Link>
              <Link to="https://www.instagram.com/jemstaukltd/" className="text-gray-300 hover:text-white transition-colors">
                <img src={Instagram} alt="" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="" className="text-gray-300 hover:text-white transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="sales" className="text-gray-300 hover:text-white transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="tarrif" className="text-gray-300 hover:text-white transition-colors">
                  Tarrif
                </Link>
              </li>
              <li>
                <Link to="" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-start">
                <svg className="w-8 h-8 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                Ty Cynon House, Navigation Park, Abercynon, CF45 4SN
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                01443842731
              </p>
              <Link to="mailto:info@jemsta.co.uk" className="flex items-center">
                <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                info@jemsta.co.uk
              </Link>
            </div>
          </div>
        </div>

        <hr className="border-primary-800 mt-8" />

        <p className="text-gray-300 text-sm my-8 text-center">
          Jemsta Estate Agency is a trading name of Jemsta UK Ltd. Jemsta UK Ltd is
          registered in England and Wales with company number 11342464.
          <br />
          A member of Property Redress Scheme (PRS). VAT registration number 354 258
          295.
          <br />
          Registered office, Ty Cynon House, Navigation Park, Abercynon, CF45 4SN
        </p>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © Copyright 2024 Jemsta Estate Agency. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setIsDisclaimerOpen(true)}
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Disclaimer
            </button>
            <button 
              type="button" 
              onClick={() => setIsComplaintOpen(true)}
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Complaint Policy
            </button>
            <button
              type="button"
              onClick={() => setIsCookieOpen(true)}
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Cookie Policy
            </button>

             <button
              type="button"
              onClick={() => setIsTOUOpen(true)}
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Terms of Use
            </button>
            
          </div>
        </div>
      </div>

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <CookiePolicyModal
        isOpen={isCookieOpen}
        onClose={() => setIsCookieOpen(false)}
      />
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
      <TOUModal
        isOpen={isTOUOpen}
        onClose={() => setIsTOUOpen(false)}
      />
      <ComplaintPolicy isOpen={isComplaintOpen} onClose={() => setIsComplaintOpen(false)} />
    </footer>
  );
};

export default Footer;