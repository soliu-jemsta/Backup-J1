import React, { useState, useEffect, useRef } from 'react';

// ── Configure your Calendly event URLs here ───────────────────────────────────
const APPOINTMENT_TYPES = {
  home_visit: {
    label: 'Home Visit',
    description: 'One of our agents will come to you.',
    icon: '🏠',
    topics: [
      {
        value: 'property_viewing',
        label: 'Property Viewing',
        description: 'View a rental or sale property in person.',
        calendlyUrl: 'https://calendly.com/sawlew',
        requiresAddress: true,
      },
    ],
  },
  phone_call: {
    label: 'Phone Call',
    description: 'We\'ll call you at your preferred time.',
    icon: '📞',
    topics: [
      {
        value: 'tenancy_enquiry',
        label: 'Tenancy Enquiry',
        description: 'Questions about existing or new tenancy agreements.',
        calendlyUrl: 'https://calendly.com/sawlew',
        requiresAddress: false,
      },
      {
        value: 'landlord_consultation',
        label: 'Landlord Consultation',
        description: 'List your property or discuss management options.',
        calendlyUrl: 'https://calendly.com/sawlew',
        requiresAddress: false,
      },
      {
        value: 'sales_valuation',
        label: 'Sales Valuation',
        description: 'Get a professional valuation for your property.',
        calendlyUrl: 'https://calendly.com/sawlew',
        requiresAddress: false,
      },
      {
        value: 'general_enquiry',
        label: 'General Enquiry',
        description: 'Any other question or conversation.',
        calendlyUrl: 'https://calendly.com/sawlew',
        requiresAddress: false,
      },
    ],
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const CalendlyWidget = ({ url, name, email, phone, appointmentType, address }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!url || !containerRef.current) return;

    const params = new URLSearchParams({
      hide_event_type_details: '1',
      hide_gdpr_banner: '1',
      primary_color: '1a3c5e',
      name,
      email,
      // a1, a2, a3 map to the 1st, 2nd, 3rd custom Invitee Questions
      // on the Calendly event type (in the order you created them).
      // Order: Phone → Appointment Type → Address
      a1: phone,
      a2: appointmentType,
      a3: address || '',
    });

    const fullUrl = `${url}?${params.toString()}`;

    const initWidget = () => {
      if (window.Calendly && containerRef.current) {
        // Clear first so switching topics renders fresh
        containerRef.current.innerHTML = '';
        window.Calendly.initInlineWidget({
          url: fullUrl,
          parentElement: containerRef.current,
          prefill: { name, email, customAnswers: { a1: phone, a2: appointmentType, a3: address || '' } },
        });
      }
    };

    const existingScript = document.getElementById('calendly-script');
    if (!existingScript) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.id = 'calendly-script';
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      initWidget();
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [url, name, email, phone, appointmentType, address]);

  return (
    <div
      ref={containerRef}
      style={{ minWidth: '320px', height: '700px' }}
      className="w-full rounded-xl overflow-hidden"
    />
  );
};

// ── Reusable field wrapper ────────────────────────────────────────────────────
const Field = ({ label, required, error, hint, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const inputClass = (error) =>
  `w-full border rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition ${
    error ? 'border-red-400' : 'border-gray-300'
  }`;

// ── Main component ────────────────────────────────────────────────────────────
const BookOnline = () => {
  const [step, setStep] = useState(1);

  // Form state
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [phone, setPhone]                 = useState('');
  const [appointmentType, setAppointmentType] = useState(''); // 'home_visit' | 'phone_call'
  const [topic, setTopic]                 = useState('');
  const [address, setAddress]             = useState('');

  // Errors
  const [errors, setErrors] = useState({});

  // Derived
  const typeConfig    = appointmentType ? APPOINTMENT_TYPES[appointmentType] : null;
  const topicOptions  = typeConfig ? typeConfig.topics : [];
  const selectedTopic = topicOptions.find((t) => t.value === topic);
  const needsAddress  = selectedTopic?.requiresAddress ?? false;

  // When appointment type changes, clear the topic selection
  const handleTypeChange = (val) => {
    setAppointmentType(val);
    setTopic('');
    setAddress('');
    setErrors((e) => ({ ...e, appointmentType: '', topic: '' }));
  };

  const validate = () => {
    const e = {};
    if (!name.trim())    e.name  = 'Please enter your full name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'Please enter a valid email address.';
    if (!phone.trim())   e.phone = 'Please enter a phone number so we can reach you.';
    if (!appointmentType) e.appointmentType = 'Please select how you\'d like to meet.';
    if (!topic)           e.topic = 'Please select a topic.';
    if (needsAddress && !address.trim())
      e.address = 'Please enter the property address for the home visit.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (validate()) setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-blue-50 pt-32">

      {/* Hero */}
      <div className="py-14 px-4 text-primary text-center">
        {/* <p className="text-xs uppercase tracking-widest mb-2 opacity-70 font-medium">
          Jemsta Estate Agency
        </p> */}
        <h1 className="text-5xl font-bold text-gray-900">Book an Appointment</h1>
        <p className="mt-6 text-lg text-gray-600 max-w-4xl mx-auto leading-8">
          Choose how you'd like to connect. We'll confirm instantly and send a calendar
          invite straight to your inbox.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-10 gap-3">
          {[{ n: 1, label: 'Your details' }, { n: 2, label: 'Pick a time' }].map(({ n, label }, i) => (
            <React.Fragment key={n}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                  ${step >= n ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-300'}`}>
                  {step > n
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    : n}
                </div>
                <span className={`text-xs font-medium ${step >= n ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
              </div>
              {i === 0 && (
                <div className={`flex-1 max-w-[80px] h-0.5 mb-5 rounded transition-colors ${step > 1 ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: Details ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Tell us about you</h2>
              <p className="text-gray-500 text-sm">
                We'll use these to confirm your booking and send a calendar invite.
              </p>
            </div>

            {/* Name */}
            <Field label="Full name" required error={errors.name}>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((err) => ({ ...err, name: '' })); }}
                placeholder="e.g. Stanley Adekola"
                className={inputClass(errors.name)}
              />
            </Field>

            {/* Email */}
            <Field label="Email address" required error={errors.email} hint="Your confirmation and calendar invite will be sent here.">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((err) => ({ ...err, email: '' })); }}
                placeholder="e.g. stanley@example.com"
                className={inputClass(errors.email)}
              />
            </Field>

            {/* Phone */}
            <Field label="Phone number" required error={errors.phone} hint="So we can reach you if needed.">
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setErrors((err) => ({ ...err, phone: '' })); }}
                placeholder="e.g. +44 7700 900000"
                className={inputClass(errors.phone)}
              />
            </Field>

            {/* Appointment type — card selector */}
            <Field label="How would you like to meet?" required error={errors.appointmentType}>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {Object.entries(APPOINTMENT_TYPES).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTypeChange(key)}
                    className={`rounded-xl border-2 p-4 text-left transition-all
                      ${appointmentType === key
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className="text-2xl mb-2">{config.icon}</div>
                    <div className={`font-semibold text-sm ${appointmentType === key ? 'text-primary' : 'text-gray-800'}`}>
                      {config.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{config.description}</div>
                  </button>
                ))}
              </div>
            </Field>

            {/* Topic dropdown — only shown once type is selected */}
            {appointmentType && (
              <Field label="What is this appointment about?" required error={errors.topic}>
                <select
                  value={topic}
                  onChange={(e) => { setTopic(e.target.value); setErrors((err) => ({ ...err, topic: '' })); }}
                  className={`${inputClass(errors.topic)} appearance-none bg-white ${!topic ? 'text-gray-400' : 'text-gray-800'}`}
                >
                  <option value="" disabled>Select a topic...</option>
                  {topicOptions.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {selectedTopic && (
                  <p className="text-xs text-gray-500 mt-1.5">{selectedTopic.description}</p>
                )}
              </Field>
            )}

            {/* Address — only shown for Home Visit topics that require it */}
            {needsAddress && (
              <Field
                label="Property / home address"
                required
                error={errors.address}
                hint="The address our agent will visit."
              >
                <textarea
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setErrors((err) => ({ ...err, address: '' })); }}
                  placeholder="e.g. 14 Grosvenor Road, London, SW1V 3QA"
                  rows={3}
                  className={`${inputClass(errors.address)} resize-none`}
                />
              </Field>
            )}

            <button
              onClick={handleContinue}
              className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all"
            >
              Choose a date and time →
            </button>
          </div>
        )}

        {/* ── STEP 2: Calendly embed ── */}
        {step === 2 && selectedTopic && (
          <div className="space-y-4">

            {/* Summary card */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-6 py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Booking for</p>
                  <p className="font-semibold text-gray-800">{name}</p>
                  <p className="text-sm text-gray-500">{email}</p>
                  <p className="text-sm text-gray-500">{phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Appointment</p>
                  <p className="font-semibold text-gray-800">
                    {typeConfig.icon} {typeConfig.label}
                  </p>
                  <p className="text-sm text-gray-500">{selectedTopic.label}</p>
                  {address && (
                    <p className="text-sm text-gray-500 max-w-[200px]">{address}</p>
                  )}
                </div>
                <button
                  onClick={handleBack}
                  className="text-sm text-primary underline underline-offset-2 whitespace-nowrap self-start"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Calendly widget */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Pick a date and time</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  All times shown in your local timezone. A confirmation email will be sent
                  to <span className="font-medium text-gray-700">{email}</span> once confirmed.
                </p>
              </div>
              <div className="p-4">
                <CalendlyWidget
                  url={selectedTopic.calendlyUrl}
                  name={name}
                  email={email}
                  phone={phone}
                  appointmentType={`${typeConfig.label} — ${selectedTopic.label}`}
                  address={address}
                />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default BookOnline;