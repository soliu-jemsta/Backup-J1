import React from 'react';
import PolicyModal from './PolicyModal';

const sections = [
  {
    title: 'Why should you read this document?',
    body: [
      `During the course of dealing with us, we will ask you to provide us with detailed personal information relating to your existing circumstances, your financial situation and, in some cases, your health and family health history ("Your Personal Data"). This document explains what we will need to do with Your Personal Data, and the various rights you have in relation to it.`,
    ],
  },
  {
    title: 'What do we mean by "Your Personal Data"?',
    body: [
      `Your Personal Data means any information that describes or relates to your personal circumstances. It may identify you directly — for example your name, address, date of birth, National Insurance number — or indirectly, for example your employment situation, physical and mental health history, or any other information that could be associated with your cultural or social identity.`,
      `In the context of providing you with assistance in relation to your financial affairs, Your Personal Data may include:`,
    ],
    list: [
      'Title, names, date of birth, gender, nationality, civil/marital status, contact details, addresses and documents necessary to verify your identity',
      'Employment and remuneration information (salary/bonus schemes/overtime/sick pay/other benefits), employment history',
      'Bank account details, tax information, loans and credit commitments, personal credit history, sources of income and expenditure, family circumstances and details of dependents',
      'Health status and history, details of treatment and prognosis, medical reports',
      'Any pre-existing products and the terms and conditions relating to these',
    ],
  },
  {
    title: 'The basis upon which our Firm will deal with Your Personal Data',
    body: [
      `When we speak with you about your financial affairs, we do so on the basis that both parties are entering a contract for the supply of services. In order to perform that contract, and to arrange the products you require, we have the right to use Your Personal Data for the purposes detailed in this notice.`,
      `Alternatively, either in the course of initial discussions with you or when the contract between us has come to an end for whatever reason, we have the right to use Your Personal Data provided it is in our legitimate business interest to do so and your rights are not affected. For example, we may need to respond to requests from mortgage lenders, insurance providers and our Compliance Service Provider relating to the advice we have given to you, or to make contact with you to seek feedback on the service you received.`,
      `On occasion, we will use Your Personal Data for contractual responsibilities we owe our regulator, the Financial Conduct Authority, or for wider compliance with any legal or regulatory obligation to which we might be subject.`,
    ],
  },
  {
    title: 'The basis upon which we will process certain parts of Your Personal Data',
    body: [
      `Where you ask us to assist you with for example your insurance, in particular life insurance and insurance that may assist you in the event of an accident or illness, we will ask you information about your ethnic origin, your health and medical history (Your Special Data). We will record and use Your Special Data in order to make enquiries of providers in relation to insurance products that may meet your needs and to
provide you with advice/guidance regarding the suitability of any product that may be available to you.`,
      `If you have parental responsibility for children under 13, it is also likely that we will record information relating to those children and, potentially, their Special Data.`,
      `Arranging certain types of insurance may involve you disclosing historic or current criminal convictions or offences ("Criminal Disclosures"), relevant to activities such as underwriting, claims and fraud management. We use Special Data and any Criminal Disclosures in the same way as Your Personal Data generally, as set out in this notice, so that this information can be exchanged freely between insurance intermediaries like our Firm and insurance providers, enabling customers to secure the protection they need.`,
    ],
  },
  {
    title: 'How do we collect Your Personal Data?',
    body: [
      `We will collect and record Your Personal Data from a variety of sources, mainly directly from you — during our initial meetings or conversations to establish your circumstances, needs and preferences, provided verbally and in writing, including email.`,
      `We may also obtain information from third parties, for example credit checks, information from your employer, and searches of public information such as the voters roll. Where we use technology to assist in collecting Your Personal Data (for example software that verifies your credit status), we will only do this with your consent. For electronic ID checks, consent is not required, but we will inform you of how such software operates and why it is used.`,
    ],
  },
  {
    title: 'What happens to Your Personal Data when it is disclosed to us?',
    body: [`In the course of handling Your Personal Data, we will:`],
    list: [
      'Record and store Your Personal Data in our paper files, mobile devices and computer systems (websites, email, hard drives, cloud facilities), accessible only by employees and consultants within our Firm when necessary to provide our service and related administration',
      'Submit Your Personal Data to product providers and lenders, both on paper and online via secure portal, to progress any enquiry or application made on your behalf and deal with any related questions',
      'Use Your Personal Data to respond to queries about your financial affairs, or to inform you of developments relating to relevant products or policies',
    ],
  },
  {
    title: 'Sharing Your Personal Data',
    body: [`From time to time Your Personal Data will be shared with:`],
    list: [
      'Product providers and lenders',
      'Third parties who can assist with your enquiry or application, or support your identified needs — including our Compliance Advisers, product specialists, estate agents, and providers of legal services such as estate planners, conveyancers, surveyors and valuers, where relevant to your circumstances',
    ],
    bodyAfter: [
      `Your Personal Data is only shared for the purposes set out in this notice — to progress your enquiry and provide our professional services. This sharing does not entitle third parties to send you marketing or promotional messages.`,
    ],
  },
  {
    title: 'Security and retention of Your Personal Data',
    body: [
      `Your privacy is important to us and we keep Your Personal Data secure in accordance with our legal responsibilities, taking reasonable steps to safeguard it against unlawful or malicious access by third parties.`,
      `We also expect you to take reasonable steps to protect your own privacy when sending information to us — for example, avoiding unprotected email for confidential information, password-protecting or encrypting attachments, and using secure postage for original documents.`,
      `Your Personal Data will be retained electronically or in paper format for a minimum of six years, or indefinitely where we have a legal right to retain such information.`,
    ],
  },
  {
    title: 'Your rights in relation to Your Personal Data',
    body: [`You can:`],
    list: [
      'Request copies of Your Personal Data that is under our control',
      'Ask us to further explain how we use Your Personal Data',
      'Ask us to correct, delete, restrict or stop using Your Personal Data',
      'Ask us to send an electronic copy of Your Personal Data to another organisation',
      'Change or withdraw any consent you have provided for marketing purposes',
    ],
  },
  {
    title: 'How to contact us, and how to complain',
    body: [
      `If you have any questions about this notice, or wish to exercise any of the rights set out within it, please contact our firm via the details on our website and ask for the person responsible for data protection.`,
      `If we believe we have a legal right not to action your request as you have requested, we will inform you of this at the time. Please also contact us as soon as possible if you become aware of any unauthorised disclosure of Your Personal Data, so that we can investigate and meet our own regulatory obligations.`,
      `If you're not satisfied with our response, or believe our processing of your personal data does not comply with data protection law, you can complain to the Information Commissioner's Office (ICO):`,
    ],
    list: [
      'By writing to: Information Commissioner\u2019s Office, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF',
      'By calling: 0303 123 1113',
      'Via their website: ico.org.uk',
    ],
  },
  {
    title: 'Links to other websites',
    body: [
      `Our website may contain hyperlinks to websites owned and operated by third parties. This Privacy Policy does not apply to those other websites — we encourage you to read their privacy statements, as they govern the use of any personal data you provide when visiting them. We do not accept responsibility or liability for the privacy practices of third-party websites, and your use of such websites is at your own risk.`,
    ],
  },
  {
    title: 'Changes to this Privacy Policy',
    body: [
      `This Privacy Policy was last updated on 1 May 2025. It may be updated from time to time, so you may want to check it each time you provide personal data to us.`,
    ],
  },
];

const PrivacyPolicyModal = ({ isOpen, onClose }) => (
  <PolicyModal
    isOpen={isOpen}
    onClose={onClose}
    title="Privacy Policy"
    subtitle="Last updated 1 May 2025 · How Jemsta handles your personal data"
    intro="For details of our firm and how to contact us, please refer to our website footer."
    sections={sections}
  />
);

export default PrivacyPolicyModal;