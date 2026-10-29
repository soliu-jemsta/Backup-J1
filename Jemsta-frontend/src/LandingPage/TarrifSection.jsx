import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TIERS = [
  {
    key: 'letOnly',
    label: 'Let Only',
    name: 'Tenant Find',
    tone: '#1F4B3A',
    fee: '10% pa or £834',
    feeNote: 'whichever is higher, inc. VAT',
    tagline: 'Ideal for hands-on landlords',
    features: [
      'Marketing on OnTheMarket & portals',
      'Accompanied viewings',
      'Tenant referencing & credit checks',
      'Tenancy agreement setup',
      'Deposit registration',
    ],
  },
  {
    key: 'rentCollection',
    label: 'Bronze',
    name: 'Rent Collection',
    tone: '#9C6B3E',
    fee: '8% pm',
    feeNote: 'inc. VAT',
    tagline: 'Income handled, you manage the property',
    features: [
      'Monthly rent collection',
      'Arrears chasing',
      'Monthly statements',
      'Annual rent review guidance',
    ],
  },
  {
    key: 'fullyManaged',
    label: 'Silver',
    name: 'Fully Managed',
    tone: '#8A93A0',
    fee: '15% pm',
    feeNote: 'inc. VAT',
    tagline: 'Core offer — everything handled',
    badge: 'Most chosen',
    features: [
      'Everything in Tenant Find + Rent Collection',
      'Maintenance coordination',
      'Contractor management',
      'Quarterly inspections',
      'Compliance reminders (Gas / EICR / EPC)',
    ],
  },
  {
    key: 'premium',
    label: 'Gold',
    name: 'Premium Management',
    tone: '#B8912F',
    fee: '10% pm',
    feeNote: 'inc. VAT',
    tagline: 'For portfolio landlords & Mortgage2Match clients',
    features: [
      'Everything in Fully Managed',
      '24/7 emergency response',
      'Legal expenses & rent guarantee (optional add-on)',
      'Annual portfolio review',
      'Dedicated account manager',
    ],
  },
];

// rows: [label, letOnly, rentCollection, fullyManaged, premium]
const COMPARISON_ROWS = [
  ['Marketing (OnTheMarket exposure)', true, true, true, true],
  ['Accompanied viewings', true, true, true, true],
  ['Tenant referencing & credit checks', true, true, true, true],
  ['Tenancy agreement setup', true, true, true, true],
  ['Deposit registration', true, true, true, true],
  ['Monthly rent collection', false, true, true, true],
  ['Arrears chasing', false, true, true, true],
  ['Monthly statements', false, true, true, true],
  ['Annual rent review guidance', false, true, true, true],
  ['Tenant liaison & issue handling', false, true, true, true],
  ['Maintenance coordination', false, false, true, true],
  ['Contractor management', false, false, true, true],
  ['Quarterly inspections', false, false, true, true],
  ['Compliance reminders (Gas / EICR / EPC)', false, false, true, true],
  ['24/7 emergency response', false, false, false, true],
  ['Legal expenses & rent guarantee*', false, false, false, true],
  ['Annual portfolio review', false, false, false, true],
  ['Priority maintenance turnaround', false, false, false, true],
  ['Dedicated account manager', false, false, false, true],
];

const ADDITIONAL_FEES = [
  ['Tenant referencing (per tenant)', '£75'],
  ['Inventory & check-in', '£180'],
  ['Check-out report', '£150'],
  ['Tenancy renewal', '£120'],
  ['Section 8 / 21 / 173 / 157 notice service', '£120'],
  ['Maintenance arrangement fee', '15% of contractor fee'],
  ['Gas Safety Certificate', '£120'],
  ['EICR (Electrical Installation Condition Report)', '£180'],
  ['Tenancy setup', '£695'],
  ['Rent guarantee insurance (annually)', '£295'],
];

function Mark({ on }) {
  if (!on) return <span className="text-[#B9BDAE]">–</span>;
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full"
      style={{ backgroundColor: '#1F4B3A1A' }}
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
        <path d="M3 8.5L6.2 11.5L13 4.5" stroke="#1F4B3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

const TariffSection = () => {
  const [showFull, setShowFull] = useState(false);

  return (
    <section className="py-16 bg-gray-100" style={{ fontFamily: "'Inter', sans-serif", color: '#1C1F1B' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          {/* <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#1F4B3A' }}>
            Tariff · South Wales
          </p> */}
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Letting & property management, priced plainly.
          </h2>
          <p className="text-gray-600 max-w-4xl mx-auto">
            Four tiers of service, from finding a tenant to running your whole
            portfolio. Every fee below is inclusive of VAT.
          </p>
        </div>

        {/* Tier plaques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              className="relative flex flex-col rounded-sm bg-white overflow-hidden"
              style={{ boxShadow: '0 1px 2px rgba(28,31,27,0.06), 0 8px 24px rgba(28,31,27,0.05)' }}
            >
              {/* plaque header */}
              <div className="relative px-5 pt-4 pb-5" style={{ backgroundColor: tier.tone }}>
                <div className="absolute top-2.5 left-3 h-1.5 w-1.5 rounded-full bg-white/35" />
                <div className="absolute top-2.5 right-3 h-1.5 w-1.5 rounded-full bg-white/35" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 mb-1">
                  {tier.label}
                </p>
                <p className="text-white text-lg" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                  {tier.name}
                </p>
              </div>

              {tier.badge && (
                <span
                  className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm bg-white"
                  style={{ color: tier.tone }}
                >
                  {tier.badge}
                </span>
              )}

              <div className="flex flex-col flex-1 px-5 py-5">
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: 'tabular-nums' }} className="text-2xl mb-0.5">
                  {tier.fee}
                </p>
                <p className="text-xs mb-4" style={{ color: '#7A7E72' }}>{tier.feeNote}</p>
                <p className="text-sm mb-4" style={{ color: '#4B4F46' }}>{tier.tagline}</p>

                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm leading-snug">
                      <span className="mt-1 h-1 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: tier.tone }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* <a
                  href="#contact"
                  className="text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                  style={{ color: tier.tone }}
                >
                  Choose {tier.name} <span aria-hidden>→</span>
                </a> */}
              </div>
            </div>
          ))}
        </div>

        {/* Toggle full comparison */}
        <div className='w-full flex items-center justify-between gap-6 mb-6'>
            <button
            onClick={() => setShowFull((s) => !s)}
            className="text-lg font-medium underline underline-offset-4 mb-8"
            style={{ color: '#08357b', textDecorationColor: '#08357b' }}
            >
            {showFull ? 'Hide full feature comparison' : 'Compare every feature across tiers'}
            </button>

            <Link to="/tarrif"
            className="text-lg font-medium underline underline-offset-4 mb-8 ml-6"
            style={{ color: '#08357b', textDecorationColor: '#08357b' }}
            >
            View full tariff details
            </Link>
        </div>

        {showFull && (
          <div className="mb-16 overflow-x-auto rounded-sm bg-white" style={{ boxShadow: '0 1px 2px rgba(28,31,27,0.06)' }}>
            <table className="w-full text-sm border-collapse min-w-[720px]">
              <thead>
                <tr style={{ borderBottom: '1px solid #D8DCCF' }}>
                  <th className="sticky left-0 bg-white text-left font-medium px-5 py-3" style={{ color: '#7A7E72' }}>
                    Service
                  </th>
                  {TIERS.map((t) => (
                    <th key={t.key} className="px-4 py-3 text-center font-medium" style={{ color: t.tone }}>
                      {t.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(([label, a, b, c, d], i) => (
                  <tr key={label} style={{ borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid #EEF0E9' : 'none' }}>
                    <td className="sticky left-0 bg-white px-5 py-3">{label}</td>
                    <td className="px-4 py-3 text-center"><Mark on={a} /></td>
                    <td className="px-4 py-3 text-center"><Mark on={b} /></td>
                    <td className="px-4 py-3 text-center"><Mark on={c} /></td>
                    <td className="px-4 py-3 text-center"><Mark on={d} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-5 py-3 text-xs" style={{ color: '#7A7E72', borderTop: '1px solid #EEF0E9' }}>
              * Legal expenses cover and rent guarantee available as an optional add-on with the Premium (Gold) package.
            </p>
          </div>
        )}

        {/* Additional fees */}
        <div className="max-w-2xl mx-auto hidden">
          <h3 className="text-xl mb-1" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
            Additional fees
          </h3>
          <p className="text-sm mb-5" style={{ color: '#7A7E72' }}>
            Charged as they apply, on top of your management fee. All figures inc. VAT.
          </p>
          <dl>
            {ADDITIONAL_FEES.map(([label, price], i) => (
              <div
                key={label}
                className="flex items-baseline justify-between py-2.5"
                style={{ borderBottom: i < ADDITIONAL_FEES.length - 1 ? '1px solid #E3E5DB' : 'none' }}
              >
                <dt className="text-sm pr-4">{label}</dt>
                <dd
                  className="text-sm whitespace-nowrap"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: 'tabular-nums' }}
                >
                  {price}
                </dd>
              </div>
            ))}
          </dl>
        </div>

      </div>
    </section>
  );
};

export default TariffSection;