import React, { useState } from 'react';

const TIERS = [
  {
    key: 'letOnly',
    label: 'Let Only',
    name: 'Tenant Find',
    tone: '#1F4B3A',
    fee: '10% of annual rent or £834',
    feeNote: 'whichever is higher, inc. VAT',
    tagline: 'Ideal for landlords who will manage the contract-holder and property themselves after move-in.',
    bullets: [
      'Marketing on OnTheMarket and/or equivalent portals selected by Jemsta.',
      'Applicant enquiries, accompanied viewings and applicant pre-vetting.',
      'Referencing and credit checks for proposed contract-holders.',
      'Preparation of the appropriate Welsh occupation contract written statement and standard move-in documentation.',
      'Receipt/protection/registration of the security deposit where Jemsta is instructed to handle it.',
      'Handover to the landlord at commencement; ongoing management is not included.',
    ],
  },
  {
    key: 'rentCollection',
    label: 'Bronze',
    name: 'Rent Collection',
    tone: '#9C6B3E',
    fee: '8% of rent collected',
    feeNote: 'inc. VAT',
    tagline: 'For landlords who manage the property but want Jemsta to administer rent collection.',
    bullets: [
      'Monthly collection of rent received through Jemsta.',
      'Routine arrears chasing and payment reminders.',
      'Monthly landlord remittance statements.',
      'Annual rent review guidance.',
      'Does not include repairs, inspections, compliance management or general contract-holder management unless separately instructed.',
    ],
  },
  {
    key: 'fullyManaged',
    label: 'Silver',
    name: 'Fully Managed',
    tone: '#8A93A0',
    fee: '15% of rent collected',
    feeNote: 'inc. VAT',
    tagline: "Jemsta's core full-management service.",
    badge: 'Most chosen',
    bullets: [
      'Includes the Tenant Find service for new lets and the Rent Collection service during management.',
      'Routine maintenance reporting, coordination and contractor liaison within the agreed financial authority.',
      'Quarterly routine property inspections, subject to lawful notice and access.',
      'Compliance reminders for matters such as gas safety, EICR and EPC expiry.',
      'Day-to-day contract-holder liaison and management of reported property issues.',
      'Major works/project management and third-party contractor costs are not included unless expressly stated or separately agreed.',
    ],
  },
  {
    key: 'premium',
    label: 'Gold',
    name: 'Premium Management',
    tone: '#B8912F',
    fee: '10% of rent collected*',
    feeNote: 'inc. VAT, where eligibility is confirmed in writing',
    tagline: 'Preferential enhanced service for qualifying portfolio landlords and/or eligible Mortgage2Match clients.',
    bullets: [
      'Everything included in Fully Managed / Silver.',
      '24/7 emergency reporting response and priority triage.',
      'Priority maintenance handling.',
      'Annual portfolio review, including rent/yield discussion.',
      'Dedicated account management.',
      "Rent guarantee/legal expenses cover is available only as an optional add-on and remains subject to the insurer/provider's eligibility, terms, exclusions and claims requirements.",
    ],
    footnote: '* Premium / Gold is a preferential management rate for qualifying portfolio landlords and/or eligible Mortgage2Match clients. Eligibility and the agreed rate must be confirmed in writing before instruction.',
  },
];

const ADDITIONAL_FEES = [
  {
    service: 'Applicant referencing / credit checks',
    fee: '£75 per applicant',
    detail: 'Only when requested outside a package that already includes referencing.',
  },
  {
    service: 'Inventory and check-in report',
    fee: '£180 per property',
    detail: 'Preparation/arrangement of an inventory and schedule of condition with check-in record, where separately instructed.',
  },
  {
    service: 'Check-out report',
    fee: '£150 per property',
    detail: 'End-of-occupation condition report against the available inventory/schedule of condition, where separately instructed.',
  },
  {
    service: 'New fixed-term / replacement occupation-contract documentation',
    fee: '£120',
    detail: 'Administrative preparation of agreed replacement or new fixed-term documentation where this is a separate landlord instruction. No fee is charged merely because a fixed-term contract becomes periodic by operation of law.',
  },
  {
    service: 'Statutory notice preparation and service',
    fee: '£120 per notice',
    detail: 'Preparation and service of an appropriate prescribed housing/possession/breach notice where Jemsta is authorised and it is lawful for us to do so. Court fees, solicitor/barrister costs and advocacy are not included.',
  },
  {
    service: 'Major works / project management',
    fee: '15% of contractor/project cost',
    detail: 'Applies only to separately instructed major works, refurbishment or project management outside routine management. The 15% Jemsta fee is inclusive of VAT and will be agreed before work starts.',
  },
  {
    service: 'Gas Safety Certificate',
    fee: '£120 standard charge',
    detail: 'Standard property visit/certificate where arranged by Jemsta. Additional appliances, remedial works, specialist access or contractor variations will be quoted before instruction.',
  },
  {
    service: 'Electrical Installation Condition Report (EICR)',
    fee: '£180 standard charge',
    detail: 'Standard EICR arranged by Jemsta. Remedial electrical works and exceptional property/installation requirements are additional and will be quoted.',
  },
  {
    service: 'Rent Guarantee Insurance',
    fee: '£295 per year',
    detail: 'Optional add-on only. Subject to eligibility, policy terms, exclusions and claims requirements; cover is not guaranteed until accepted by the provider.',
  },
];

const TERMS = [
  {
    title: 'Fees before instruction',
    body: "Landlords must be given details of fees and expenses, the terms of business, the duration of the management agreement and the extent of Jemsta's financial authority before appointing Jemsta. The signed Terms of Business/Property Management Agreement governs the final agreed service.",
  },
  {
    title: 'VAT and calculation',
    body: 'All amounts in this tariff are inclusive of VAT. Percentage management fees are calculated on rent actually collected unless the signed agreement expressly states another lawful basis. The Tenant Find fee is calculated as 10% of annual rent, subject to a minimum fee of £834.',
  },
  {
    title: 'No hidden or duplicate charges',
    body: 'A fee included within a package will not also be charged as an additional standalone fee for the same work. Any new or varied fee must be clearly disclosed and agreed in writing where required before it becomes payable.',
  },
  {
    title: 'Repairs and financial authority',
    body: "Repairs, maintenance and emergency expenditure are governed by the financial-authority limit in the signed management agreement. Contractor invoices are separate from Jemsta's own fee unless the tariff/agreement expressly states otherwise.",
  },
  {
    title: 'Sub-agents and contractors',
    body: "Where appointment of a sub-agent for letting/management activity is not already authorised by the signed agreement, Jemsta will obtain the landlord's authorisation before appointment. Routine trade contractors may be instructed in accordance with the repair authority given by the landlord.",
  },
  {
    title: 'Contract-holder fees',
    body: 'This is a landlord tariff. Jemsta will not pass landlord fees to a contract-holder where doing so would amount to a prohibited payment under Welsh law. Any payment requested from a contract-holder must be a permitted payment or otherwise lawfully recoverable.',
  },
  {
    title: 'Possession and notices',
    body: 'Jemsta will use the Renting Homes (Wales) Act 2016 framework and the prescribed Welsh forms/procedures applicable at the time. References to old England/Wales tenancy notices such as section 21 should not be treated as a Welsh possession route for occupation contracts.',
  },
  {
    title: 'Complaints and redress',
    body: 'Jemsta Estate Agency operates an internal complaints procedure and is a member of the Property Redress Scheme. Details of the complaints procedure and independent redress are available on request.',
  },
];

const FONT_SERIF = "'Fraunces', serif";
const FONT_MONO = "'IBM Plex Mono', monospace";

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
      fill="none"
    >
      <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TarrifDetail = () => {
  const [activeTier, setActiveTier] = useState(TIERS[2].key);
  const [openTerm, setOpenTerm] = useState(null);

  const tier = TIERS.find((t) => t.key === activeTier);

  return (
    <section className="bg-blue-50 pt-32 min-h-screen" style={{ fontFamily: "'Inter', sans-serif", color: '#1C1F1B' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center py-14">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            The full landlord tariff, in detail.
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            What each package includes, what's charged separately, and the terms that
            govern every fee below. All figures inclusive of VAT.
          </p>
        </div>

        {/* Important fee information callout */}
        <div
          className="mb-12 px-6 py-5 rounded-sm bg-white"
          style={{ boxShadow: '0 1px 2px rgba(28,31,27,0.06), 0 8px 24px rgba(28,31,27,0.05)', borderLeft: '3px solid #1F4B3A' }}
        >
          <p className="text-sm leading-relaxed" style={{ color: '#4B4F46' }}>
            <span className="font-semibold" style={{ color: '#1C1F1B' }}>Important fee information. </span>
            This tariff is intended to be read with Jemsta Estate Agency's signed Terms of
            Business/Property Management Agreement. All landlord fees and expenses must be
            disclosed before instruction. Where a cost cannot be fixed in advance, the method
            of calculation is stated. No additional fee will be charged unless it is included
            in the signed agreement, this tariff, or separately agreed in writing before the
            cost is incurred.
          </p>
        </div>

        {/* Package details — tier selector */}
        <div className="mb-16">
          <h3 className="text-xl mb-5" style={{ fontFamily: FONT_SERIF, fontWeight: 600 }}>
            Package details
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {TIERS.map((t) => {
              const active = t.key === activeTier;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTier(t.key)}
                  className="relative text-left rounded-sm px-4 py-3 transition-colors"
                  style={{
                    backgroundColor: active ? t.tone : '#FFFFFF',
                    boxShadow: '0 1px 2px rgba(28,31,27,0.06)',
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-0.5"
                    style={{ color: active ? 'rgba(255,255,255,0.75)' : '#7A7E72' }}
                  >
                    {t.label}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: active ? '#FFFFFF' : '#1C1F1B', fontFamily: FONT_SERIF, fontWeight: 600 }}
                  >
                    {t.name}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="rounded-sm bg-white overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(28,31,27,0.06), 0 8px 24px rgba(28,31,27,0.05)' }}>
            <div className="relative px-6 pt-5 pb-6" style={{ backgroundColor: tier.tone }}>
              {tier.badge && (
                <span
                  className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm bg-white"
                  style={{ color: tier.tone }}
                >
                  {tier.badge}
                </span>
              )}
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 mb-1">
                {tier.label}
              </p>
              <p className="text-white text-xl mb-3" style={{ fontFamily: FONT_SERIF, fontWeight: 600 }}>
                {tier.name}
              </p>
              <p className="text-white/90 text-sm max-w-xl">{tier.tagline}</p>
            </div>

            <div className="px-6 py-6">
              <p style={{ fontFamily: FONT_MONO, fontVariantNumeric: 'tabular-nums' }} className="text-2xl mb-0.5">
                {tier.fee}
              </p>
              <p className="text-xs mb-6" style={{ color: '#7A7E72' }}>{tier.feeNote}</p>

              <ul className="space-y-3">
                {tier.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <span className="mt-1.5 h-1 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: tier.tone }} />
                    <span style={{ color: '#33362F' }}>{b}</span>
                  </li>
                ))}
              </ul>

              {tier.footnote && (
                <p className="mt-5 pt-5 text-xs leading-relaxed" style={{ color: '#7A7E72', borderTop: '1px solid #EEF0E9' }}>
                  {tier.footnote}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Additional / standalone fees */}
        <div className="mb-16">
          <h3 className="text-xl mb-1" style={{ fontFamily: FONT_SERIF, fontWeight: 600 }}>
            Additional / standalone landlord fees
          </h3>
          <p className="text-sm mb-5" style={{ color: '#7A7E72' }}>
            These charges apply only where the service is not already included in the
            landlord's chosen package, or where the landlord separately instructs Jemsta to
            provide it. Jemsta will not charge twice for the same service.
          </p>

          <div className="rounded-sm bg-white divide-y" style={{ boxShadow: '0 1px 2px rgba(28,31,27,0.06), 0 8px 24px rgba(28,31,27,0.05)', borderColor: '#EEF0E9' }}>
            {ADDITIONAL_FEES.map((row) => (
              <div key={row.service} className="px-6 py-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div className="sm:max-w-md">
                  <p className="text-sm font-medium">{row.service}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: '#7A7E72' }}>{row.detail}</p>
                </div>
                <p
                  className="text-sm whitespace-nowrap sm:pl-4"
                  style={{ fontFamily: FONT_MONO, fontVariantNumeric: 'tabular-nums', color: '#1C1F1B' }}
                >
                  {row.fee}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Terms & RSW compliance */}
        <div className="mb-16">
          <h3 className="text-xl mb-1" style={{ fontFamily: FONT_SERIF, fontWeight: 600 }}>
            Terms & Rent Smart Wales compliance
          </h3>
          <p className="text-sm mb-5" style={{ color: '#7A7E72' }}>
            The provisions that govern how fees on this tariff are charged and disclosed.
          </p>

          <div className="rounded-sm bg-white divide-y" style={{ boxShadow: '0 1px 2px rgba(28,31,27,0.06), 0 8px 24px rgba(28,31,27,0.05)', borderColor: '#EEF0E9' }}>
            {TERMS.map((term, i) => {
              const open = openTerm === i;
              return (
                <div key={term.title}>
                  <button
                    onClick={() => setOpenTerm(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <span className="text-sm font-medium flex items-baseline gap-3">
                      <span style={{ fontFamily: FONT_MONO, color: '#7A7E72' }}>{String(i + 1).padStart(2, '0')}</span>
                      {term.title}
                    </span>
                    <span style={{ color: '#7A7E72' }}>
                      <ChevronIcon open={open} />
                    </span>
                  </button>
                  {open && (
                    <div className="px-6 pb-4 -mt-1">
                      <p className="text-sm leading-relaxed max-w-2xl" style={{ color: '#4B4F46' }}>
                        {term.body}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer / document control */}
        <div className="text-center border-t pt-8" style={{ borderColor: '#D8DCCF' }}>
          <p className="text-xs mb-4" style={{ color: '#7A7E72' }}>
            Document control: revised 30 August 2026. This tariff is reviewed whenever Jemsta
            changes a fee, package, Terms of Business provision or relevant Welsh regulatory
            requirement.
          </p>
          {/* <p className="text-sm font-medium">Jemsta UK Ltd trading as Jemsta Estate Agency</p>
          <p className="text-xs mt-1" style={{ color: '#7A7E72' }}>
            Business Development Centre, Ty Cynon House, Navigation Park, Abercynon CF45 4SN
          </p>
          <p className="text-xs mt-1" style={{ color: '#7A7E72' }}>
            admin@jemsta.co.uk &nbsp;|&nbsp; www.jemsta.co.uk &nbsp;|&nbsp; 01443 842731
          </p>
          <p className="text-xs mt-3" style={{ color: '#7A7E72' }}>
            Rent Smart Wales licensed agent &nbsp;|&nbsp; Property Redress Scheme member
          </p> */}
        </div>

      </div>
    </section>
  );
};

export default TarrifDetail;