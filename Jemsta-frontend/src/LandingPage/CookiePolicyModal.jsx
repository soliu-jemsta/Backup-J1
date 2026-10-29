import React from 'react';
import PolicyModal from './PolicyModal';

const sections = [
  {
    title: 'What are cookies and how do they work?',
    body: [
      `Cookies are small bits of text that are downloaded to your computer or mobile device when you visit a website. Your browser sends these cookies back to the website every time you visit again, so it can recognise you and tailor what you see on screen.`,
      `Some cookies are essential so you can move around the website and use its features. Without these cookies, some services you've asked for can't be provided. These cookies don't gather information about you that could be used for marketing or remembering where you've been on the internet.`,
    ],
  },
    {
    title: 'Some of the cookies we use',
    body: [
      `Certain cookies are necessary in order for you to use our websites. These are used ‘in-session’ each time you visit and then expire when you leave the site. They’re not stored on your computer and they don’t contain any personal data.`,`However, you can delete them via your browser if you wish to, but this will restrict the functions that you’re able to carry out on our sites.`,
    ],
  },
  {
    title: 'Session cookies',
    body: [
      `These enable you to carry out some essential functions on our sites, such as maintaining log in details for the session or a transaction. They also help by minimising the need to transfer information across the internet. They are not stored on your computer and they expire when you terminate your browser session or logout of certain areas.`,
    ],
  },
  {
    title: 'Secure cookies',
    body: [
      `A secure cookie is only used when a browser is visiting a server via HTTPS, ensuring that the cookie is always encrypted when transmitting from client to server. This makes the cookie less likely to be exposed to cookie theft via eavesdropping.`,
    ],
  },
  {
    title: 'Persistent cookies',
    body: [
      `These are used to persist a user’s preference across e.g. setting items such as the open status of the carousel, and remain until the expiry date and time set by the web server (or otherwise manually deleted by the user).`,
    ],
  },
  {
    title: 'Analytics',
    body: [
      `We like to keep track of what pages and links are popular and which ones don’t get used so much to help us keep our sites relevant and up to date. It’s also very useful to be able to identify trends of how people navigate (find their way through) our sites and help us provide a more friendly solution.`,
    ],
  },
  {
    title: 'Third-party cookies',
    body: [
      `Google Analytics tracking (and most web tracking software) uses cookies to provide meaningful reports about site visitors. Google Analytics cookies do not collect personal data about website visitors.`,
    ],
  },
  {
    title: 'Managing your cookies',
    body: [
      `You'll find more information about cookies at www.allaboutcookies.org, which gives details on how to delete cookies from your computer. For information on how to do this on your mobile phone browser, please see your handset manual.`,
    ],
  },
];

const CookiePolicyModal = ({ isOpen, onClose }) => (
  <PolicyModal
    isOpen={isOpen}
    onClose={onClose}
    title="Cookie Policy"
    subtitle="How Jemsta uses cookies on this website"
    intro="Cookies are used on our site to ensure that we give you the best experience on our website. If you continue without changing your settings, we'll assume that you are happy to receive all cookies on our website. Some cookies are essential so you can move around the website and use its features. Without these cookies, some services you’ve asked for can’t be provided. These cookies don’t gather information about you that could be used for marketing or remembering where you’ve been on the internet."
    sections={sections}
  />
);

export default CookiePolicyModal;