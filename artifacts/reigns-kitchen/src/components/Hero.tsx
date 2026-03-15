import React from 'react';
import { CONFIG } from '@/data/menu';

export function Hero() {
  const scrollToMenu = () => {
    const el = document.getElementById('chef-comfort');
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-primary w-full overflow-hidden">
      {/* Mobile: stacked layout — image on top, text below */}
      <div className="flex flex-col md:flex-row md:items-stretch md:min-h-[520px]">

        {/* Image — top on mobile, right on desktop */}
        <div className="order-1 md:order-2 w-full md:w-[48%] relative">
          <div className="h-52 sm:h-64 md:h-full relative">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&q=80"
              alt="Delicious healthy meal"
              className="w-full h-full object-cover md:rounded-bl-[4rem]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-transparent to-primary/40 md:bg-gradient-to-r md:from-primary/70 md:to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Text — bottom on mobile, left on desktop */}
        <div className="order-2 md:order-1 flex-1 px-5 sm:px-8 lg:px-12 py-8 md:py-16 flex flex-col justify-center">
          <div className="mb-4 inline-flex">
            <span className="bg-accent/20 border border-accent/40 text-accent text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {CONFIG.weekLabel}
            </span>
          </div>

          <h1 className="font-serif font-bold leading-tight mb-3">
            <span className="text-accent italic block text-4xl sm:text-5xl md:text-6xl">Chef-Crafted</span>
            <span className="text-primary-foreground block text-4xl sm:text-5xl md:text-6xl">Meal Prep</span>
          </h1>

          <p className="text-base sm:text-xl font-bold text-accent mb-1">
            {CONFIG.tagline}
          </p>

          <p className="text-primary-foreground/70 text-sm sm:text-base mb-4">
            {CONFIG.subTagline}
          </p>

          <p className="text-primary-foreground/50 text-xs sm:text-sm max-w-md mb-6 leading-relaxed hidden sm:block">
            {CONFIG.heroDescription}
          </p>

          <div>
            <button
              onClick={scrollToMenu}
              className="bg-secondary text-secondary-foreground px-6 sm:px-8 py-3 rounded text-xs sm:text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all active:scale-95"
            >
              ORDER THIS WEEK'S MENU
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
