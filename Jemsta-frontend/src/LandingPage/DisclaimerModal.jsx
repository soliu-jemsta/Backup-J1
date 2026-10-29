import React from 'react';
import PolicyModal from './PolicyModal';

const sections = [
  {
    title: 'Introduction',
    body: [
      `This disclaimer governs your use of our website; by using our website, you accept this disclaimer in full. If you disagree with any part of this disclaimer, you must not use our website.`,
    ],
  },
  {
    title: 'Intellectual property rights',
    body: [
      `Unless otherwise stated, we or our licensors own the intellectual property rights in the website and material on the website. Subject to the licence below, all these intellectual property rights are reserved.`,
    ],
  },
  {
    title: 'Licence to use website',
    body: [
      `You may view, download for caching purposes only, and print pages from the website for your own personal use, subject to the restrictions below. You must not:`,
    ],
    list: [
      'Republish material from this website (including republication on another website)',
      'Sell, rent or otherwise sub-license material from the website',
      'Show any material from the website in public',
      'Reproduce, duplicate, copy or otherwise exploit material on our website for a commercial purpose',
      'Edit or otherwise modify any material on the website',
      'Redistribute material from this website, except for content specifically and expressly made available for redistribution such as our newsletter',
    ],
    bodyAfter: [`Where content is specifically made available for redistribution, it may only be redistributed within your business.`],
  },
  {
    title: 'Limitations of warranties and liability',
    body: [
      `Whilst we endeavour to ensure that the information on this website is correct, we do not warrant its completeness or accuracy, nor do we commit to ensuring that the website remains available or that the material on the website is kept up-to-date.`,
      `To the maximum extent permitted by applicable law we exclude all representations, warranties and conditions relating to this website and its use (including, without limitation, any warranties implied by law of satisfactory quality, fitness for purpose and/or the use of reasonable care and skill).`,
      `Nothing in this disclaimer (or elsewhere on our website) will exclude or limit our liability for fraud, for death or personal injury caused by our negligence, or for any other liability which cannot be excluded or limited under applicable law. Subject to this, our liability to you in relation to your use of our website, whether in contract, tort (including negligence) or otherwise, will be limited as follows:`,
    ],
    list: [
      'To the extent that the website and the information and services on it are provided free of charge, we will not be liable for any loss or damage of any nature',
      'We will not be liable for any consequential, indirect or special loss or damage',
      'We will not be liable for any loss of profit, income, revenue, anticipated savings, contracts, business, goodwill, reputation, data, or information',
    ],
  },
  {
    title: 'Variation',
    body: [
      `We may revise this disclaimer from time to time. The revised disclaimer will apply to the use of our website from the date of publication of the revised disclaimer on our website. Please check this page regularly to ensure you are familiar with the current version.`,
    ],
  },
  {
    title: 'Entire agreement',
    body: [
      `This disclaimer, together with our privacy policy, constitutes the entire agreement between you and us in relation to your use of our website, and supersedes all previous agreements in respect of your use of this website.`,
    ],
  },
  {
    title: 'Law and jurisdiction',
    body: [
      `This disclaimer will be governed by and construed in accordance with English law, and any disputes relating to this disclaimer will be subject to the non-exclusive jurisdiction of the courts of England and Wales.`,
    ],
  },
  {
    title: 'Registrations, authorisations and our details',
    body: [
      `Jemsta Estate Agency is a trading name of Stanley Adekola, authorised and regulated by the Financial Conduct Authority under registration number 811337.`,
      `Our registered address is Ty Cynon House, Navigation Park, Abercynon, CF45 4SN. You can contact us by email at admin@jemsta.co.uk.`,
    ],
  },
  {
    title: 'Complaint handling procedure',
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
    list: [
      'Any service or product we have arranged for you',
      'How your personal data has been processed',
      'How your request for access to data has been handled',
      'How your complaint has been handled',
      'An appeal against any decision made following a complaint',
    ],
    bodyAfter: [
      `Any complaints received will be passed to the Compliance Officer immediately for resolution. Following receipt of a complaint, the Compliance Officer will write to you within 3 business days, confirming the details of the complaint and what the firm intends to do to try to resolve it — the case will be closed if resolved.`,
      `Where this is not possible, a written acknowledgement will be issued to the complainant within 5 business days, setting out the basis or understanding of the complaint.`,
    ],
  },
];

const DisclaimerModal = ({ isOpen, onClose }) => (
  <PolicyModal
    isOpen={isOpen}
    onClose={onClose}
    title="Website Disclaimer"
    subtitle="Terms governing your use of the Jemsta website"
    sections={sections}
  />
);

export default DisclaimerModal;