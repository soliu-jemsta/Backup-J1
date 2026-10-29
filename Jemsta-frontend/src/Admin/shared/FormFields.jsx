import React from 'react';

// Label + text input
export const FormInput = ({ label, placeholder, type = 'text', value, onChange, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-800">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2.5 border rounded-lg text-sm
        placeholder-gray-400 focus:outline-none focus:ring-2
        ${error
          ? 'border-red-500 focus:ring-red-200'
          : 'border-primaryGreen focus:ring-primaryGreen focus:ring-opacity-30'
        }`}
      {...props}
    />
    {error && (
      <span className="text-xs text-red-500">{error}</span>
    )}
  </div>
);

// Label + number spinner input
export const FormSpinner = ({ label, placeholder, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-800">{label}</label>
    <input
      type="number"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 border border-primaryGreen rounded-lg text-sm
        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:ring-opacity-30"
    />
  </div>
);

// Label + select dropdown
export const FormSelect = ({ label, options = [], value, onChange, placeholder, error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-800">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 border rounded-lg text-sm
          text-gray-600 bg-white appearance-none focus:outline-none
          focus:ring-2 focus:ring-opacity-30
          ${error
            ? 'border-red-500 focus:ring-red-200'
            : 'border-primaryGreen focus:ring-primaryGreen'
          }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

// Label + textarea
export const FormTextarea = ({ label, placeholder, value, onChange, rows = 5 }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-800">{label}</label>
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 border border-primaryGreen rounded-lg text-sm
        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:ring-opacity-30 resize-none"
    />
  </div>
);

// Browse file button inside an input-like box
export const FormFilePicker = ({ label, accept, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-800">{label}</label>
    <div className="flex items-center border border-primaryGreen rounded-lg overflow-hidden">
      <label className="px-4 py-2.5 bg-primaryGreen text-white text-sm font-medium cursor-pointer hover:bg-green-800 transition-colors whitespace-nowrap">
        Browse {label?.includes('Doc') ? 'Documents' : 'Image'}
        <input type="file" accept={accept} onChange={onChange} className="hidden" />
      </label>
    </div>
  </div>
);


// UK Address autocomplete using OpenStreetMap Nominatim (free, no API key)
export const GoogleAddressInput = ({ label, value, onChange, onSelectDetails, error }) => {
  const [query, setQuery] = React.useState(value || '');
  const [suggestions, setSuggestions] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const debounceRef = React.useRef(null);
  const containerRef = React.useRef(null);

  // Sync external value changes (e.g. openEdit populating the form)
  React.useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setOpen(false);
    setSuggestions([]);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: val,
            format: 'json',
            addressdetails: 1,
            limit: 6,
            countrycodes: 'gb',
          }),
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSelect = (suggestion) => {
    const address = suggestion.display_name;
    setQuery(address);
    onChange(address);
    setSuggestions([]);
    setOpen(false);

    if (onSelectDetails) {
      const a = suggestion.address || {};
      onSelectDetails({
        postcode: a.postcode || '',
        // Nominatim uses different keys depending on settlement size —
        // fall back down the chain until something usable turns up.
        town: a.city || a.town || a.village || a.suburb || a.county || '',
      });
    }
  };

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Start typing a UK address..."
          autoComplete="off"
          className={`w-full px-4 py-2.5 border rounded-lg text-sm
            placeholder-gray-400 focus:outline-none focus:ring-2
            ${error
              ? 'border-red-500 focus:ring-red-200'
              : 'border-primaryGreen focus:ring-primaryGreen focus:ring-opacity-30'
            }`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {loading
            ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
          }
        </span>

        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li
                key={s.place_id ?? i}
                onMouseDown={() => handleSelect(s)}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-primaryGreen cursor-pointer border-b border-gray-100 last:border-0"
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

// Cancel / Submit button pair
export const ModalActions = ({ onCancel, onSubmit, submitLabel = 'Submit', loading = false }) => (
  <div className="flex items-center justify-center gap-4 mt-8">
    <button
      type="button"
      onClick={onCancel}
      className="px-10 py-2.5 border border-primaryGreen rounded-full text-primaryGreen
        text-sm font-medium hover:bg-green-50 transition-colors"
    >
      Cancel
    </button>
    <button
      type="button"
      onClick={onSubmit}
      disabled={loading}
      className="px-10 py-2.5 bg-primaryGreen rounded-full text-white
        text-sm font-medium hover:bg-green-800 disabled:opacity-60 transition-colors"
    >
      {loading ? 'Saving...' : submitLabel}
    </button>
  </div>
);