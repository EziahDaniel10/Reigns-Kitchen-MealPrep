import React from 'react';
import { CONFIG } from '@/data/menu';

export function Hero() {
  const scrollToMenu = () => {
    const el = document.getElementById('standard-meals');
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '580px' }}>
      <img
        src="/images/chef-hero.jpg"
        alt="Chef April Winston — Reigns Kitchen"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Gradient — darkens bottom to blend the CTA area cleanly */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.15) 100%)' }} />

      {/* Week badge — top left, doesn't overlap image text */}
      <div className="absolute top-6 left-6 z-10">
        <span className="border border-[#c9a84c]/70 text-[#c9a84c] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-black/30 backdrop-blur-sm">
          {CONFIG.weekLabel}
        </span>
      </div>

      {/* CTA button — bottom center, reinforces image's CTA */}
      <div className="absolute bottom-10 left-0 right-0 z-10 flex justify-center">
        <button
          onClick={scrollToMenu}
          className="bg-[#c9a84c] text-[#1a1a1a] px-10 py-4 rounded text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 shadow-lg"
        >
          ORDER THIS WEEK'S MENU
        </button>
      </div>
    </div>
  );
}
