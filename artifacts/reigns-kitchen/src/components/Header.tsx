import React from 'react';

export function Header() {
  return (
    <header className="relative bg-primary text-primary-foreground py-16 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Restaurant dining room" 
          className="w-full h-full object-cover opacity-30 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        <div className="inline-block p-4 border border-accent/30 rounded-2xl bg-primary/40 backdrop-blur-sm shadow-2xl shadow-black/20 mb-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary-foreground drop-shadow-md">
            Reigns <span className="text-accent italic">Kitchen</span>
          </h1>
        </div>
        <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl font-light tracking-wide">
          Craft your perfect meal bundle. Upscale comfort food and performance fuel, freshly prepared.
        </p>
      </div>
    </header>
  );
}
