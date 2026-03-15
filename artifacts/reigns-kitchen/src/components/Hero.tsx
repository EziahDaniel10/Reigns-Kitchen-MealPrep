import React from 'react';
import { CONFIG } from '@/data/menu';

export function Hero() {
  return (
    <div className="bg-primary min-h-[520px] w-full flex flex-col-reverse md:flex-row items-center md:items-stretch overflow-hidden">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col justify-center max-w-2xl mx-auto w-full">
        <div className="mb-6 inline-flex">
          <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {CONFIG.weekLabel}
          </span>
        </div>
        
        <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight mb-4">
          <span className="text-accent italic block">Chef-Crafted</span>
          <span className="text-primary-foreground block">Meal Prep</span>
        </h1>
        
        <p className="text-xl font-bold text-accent mb-2">
          {CONFIG.tagline}
        </p>
        
        <p className="text-primary-foreground/70 text-lg mb-6">
          {CONFIG.subTagline}
        </p>
        
        <p className="text-primary-foreground/50 text-sm max-w-md mb-8 leading-relaxed">
          {CONFIG.heroDescription}
        </p>
        
        <div>
          <button 
            onClick={() => {
              const el = document.getElementById('chef-comfort');
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 120;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
            className="bg-secondary text-secondary-foreground px-8 py-3 rounded text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all"
          >
            ORDER THIS WEEK'S MENU
          </button>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto relative">
        <img 
          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&q=80" 
          alt="Delicious healthy meal" 
          className="w-full h-full object-cover md:rounded-bl-[4rem]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary md:from-transparent to-transparent md:bg-gradient-to-r md:from-primary h-full w-full pointer-events-none" />
      </div>
    </div>
  );
}
