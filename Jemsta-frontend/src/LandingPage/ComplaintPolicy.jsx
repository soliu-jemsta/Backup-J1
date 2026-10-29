import React from 'react';

import PolicyModal from './PolicyModal';

const sections = [
  {
    title: 'How to register a complaint',

    body: [
      `If you wish to register a complaint, please write to Jemsta Estate Agency, Ty Cynon House, Navigation Park, Abercynon, CF45 4SN, UK, or telephone (+44) 01443 842731.`,

      <>
        A summary of our internal complaints handling procedures, designed to ensure
        that all complaints are dealt with reasonably, fairly, and promptly, is
        available upon request. If we are unable to resolve your complaint to your
        satisfaction, you may be entitled to refer the matter to{' '}
        <strong>Property Redress</strong> for independent consideration.

        <br />
        <br />

        <strong>Property Redress</strong>
        <br />
        Limelight, 1st Floor, Studio 3
        <br />
        Elstree Way, Borehamwood
        <br />
        Hertfordshire, WD6 1JH

        <br />
        <br />

        <strong>Email:</strong>{' '}
        <a
          href="mailto:info@propertyredress.co.uk"
          className="text-primary hover:underline"
        >
          info@propertyredress.co.uk
        </a>

        <br />

        <strong>Telephone:</strong> 0333 321 9418
      </>,
    ],
  },

  {
    title: 'What you can complain about',

    body: [`You are able to complain to Jemsta Estate Agency about:`],

    list: [
      'Any service or product we have arranged for you',
      'How your personal data has been processed',
      'How your request for access to data has been handled',
      'How your complaint has been handled',
      'An appeal against any decision made following a complaint',
    ],
  },

  {
    title: 'How we handle complaints',

    body: [
      `Jemsta Estate Agency will ensure that any complaints received by you will be passed to the Compliance Officer immediately for resolution.`,

      `Following receipt of a complaint, the Compliance Officer will write to you within 3 business days (by the close of the third full day), stating that the complaint has been received, confirming the details of the complaint and what the firm intends to do to try and resolve the complaint. If resolved, the case will be closed.`,

      `Where this is not possible, a written acknowledgement will be issued to the complainant within 5 business days and will set out the basis, or understanding, of the complaint.`,
    ],
  },
];

const ComplaintPolicy = ({ isOpen, onClose }) => (
  <PolicyModal
    isOpen={isOpen}
    onClose={onClose}
    title="Complaint Handling Procedures"
    subtitle="How Jemsta Estate Agency handles complaints"
    intro="We are committed to handling complaints reasonably and promptly. Please use the details below to register a complaint or to request a summary of our internal procedures."
    sections={sections}
  />
);

export default ComplaintPolicy;