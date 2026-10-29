import React, { useEffect, useState } from 'react';

const PolicyModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  intro,
  sections = [],
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [openSection, setOpenSection] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // allow the element to mount before animating in
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsVisible(true))
      );
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Reset open section when modal opens
  useEffect(() => {
    if (isOpen) {
      setOpenSection(0);
    }
  }, [isOpen]);

  const handleTransitionEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="policy-modal-title"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Slide-up panel */}
      <div
        className={`relative w-full max-w-4xl bg-white rounded-t-2xl shadow-2xl flex flex-col
          h-[92vh] md:h-[88vh]
          transform transition-transform duration-300 ease-out
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        onTransitionEnd={handleTransitionEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 bg-primary rounded-t-2xl shrink-0" />
          {/* <span className="h-1 w-10 rounded-full bg-white/40" /> */}


        {/* Header */}
        <div className="bg-primary text-white px-5 sm:px-8 pb-5 pt-1 shrink-0 rounded-t-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="policy-modal-title"
                className="text-xl sm:text-2xl font-semibold"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-gray-300 text-sm mt-1">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title || 'policy'}`}
              className="shrink-0 rounded-full p-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 bg-gray-50">
          {intro && (
            <p className="text-gray-600 text-sm mb-6">{intro}</p>
          )}

          <div className="space-y-3">
            {sections.map((section, idx) => {
              const open = openSection === idx;
              return (
                <div
                  key={section.title}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenSection(open ? -1 : idx)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-primary text-sm sm:text-base">
                      {idx + 1}. {section.title}
                    </span>
                    <svg
                      className={`w-5 h-5 text-primary shrink-0 transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      open
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 sm:px-5 pb-5 text-gray-600 text-sm leading-relaxed space-y-3">
                        {section.body?.map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                        {section.list && (
                          <ul className="list-disc pl-5 space-y-1.5">
                            {section.list.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        )}
                        {section.bodyAfter?.map((p, i) => (
                          <p key={`after-${i}`}>{p}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-200 bg-white px-5 sm:px-8 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-primary-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;