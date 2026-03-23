import React from 'react';

export function FamilyBanner() {
  const handleCTA = () => {
    const tab = document.querySelector('[data-category="family"]') as HTMLButtonElement | null;
    tab?.click();
    setTimeout(() => {
      const section = document.getElementById('family');
      if (section) {
        const y = section.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <section
      style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1f0e 100%)' }}
      className="w-full"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[500px]">
        {/* Left — food photo */}
        <div className="w-full md:w-1/2 md:min-h-[500px] h-[280px] md:h-auto overflow-hidden flex-shrink-0">
          <img
            src="https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?w=800&auto=format&fit=crop"
            alt="Family meal prep containers"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Right — text content */}
        <div className="flex flex-col justify-center px-8 py-10 md:px-14 md:py-16 md:w-1/2">
          {/* Badge */}
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-5 w-fit"
            style={{
              background: '#c9a84c',
              color: '#1a1a1a',
              borderRadius: 20,
              padding: '4px 14px',
            }}
          >
            NEW!
          </span>

          {/* Headline */}
          <h2
            className="font-serif font-bold leading-tight mb-4"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              color: '#ffffff',
              lineHeight: 1.1,
            }}
          >
            Feed the<br />Whole Family
          </h2>

          {/* Price */}
          <p
            className="font-bold mb-4"
            style={{
              color: '#c9a84c',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            }}
          >
            Starting at $49.99
          </p>

          {/* Description */}
          <p
            className="mb-8"
            style={{
              color: '#d4d4d4',
              fontSize: '1rem',
              lineHeight: 1.6,
              maxWidth: 380,
            }}
          >
            Chef-crafted meals feeding up to 4 people.
            <br />Ready to heat and serve!
          </p>

          {/* CTA Button */}
          <div className="flex flex-col items-start gap-2">
            <button
              onClick={handleCTA}
              className="transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: '#c9a84c',
                color: '#1a1a1a',
                fontWeight: 800,
                padding: '16px 32px',
                borderRadius: 8,
                fontSize: '1rem',
                letterSpacing: '0.05em',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ORDER FAMILY MEALS →
            </button>
            <p
              style={{
                color: '#c9a84c',
                fontStyle: 'italic',
                fontSize: '0.9rem',
                marginTop: 8,
              }}
            >
              Limited weekly availability
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
