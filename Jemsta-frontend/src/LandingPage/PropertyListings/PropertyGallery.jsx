import { useEffect, useState, useCallback } from 'react';

const ChevronLeft = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const PropertyGallery = ({ images = [], title = '' }) => {
  const [index, setIndex] = useState(0);
  const hasImages = images.length > 0;

  const goTo = useCallback(
    (i) => {
      if (!hasImages) return;
      setIndex(((i % images.length) + images.length) % images.length);
    },
    [images.length, hasImages]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  if (!hasImages) {
    return (
      <div className="w-full aspect-[4/3] md:aspect-[16/10] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
        No images available
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 group">
        <img
          key={images[index]}
          src={images[index]}
          alt={`${title} — photo ${index + 1} of ${images.length}`}
          className="w-full h-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === index}
              className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === index ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyGallery;
