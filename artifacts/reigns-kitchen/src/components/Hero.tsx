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
    <div className="relative w-full">
      {/* Full-width hero image — the design lives inside the photo */}
      <img
        src="/images/chef-hero.jpg"
        alt="Chef April Winston — Chef-crafted meals inspired by global flavors"
        className="w-full block"
        style={{ maxHeight: '640px', objectFit: 'cover', objectPosition: 'center center' }}
      />

      {/* Invisible functional button overlaid on the image's purple "Order" button */}
      <button
        onClick={scrollToMenu}
        className="absolute cursor-pointer"
        style={{
          left: '5.5%',
          top: '41%',
          width: '33%',
          height: '10%',
          background: 'transparent',
          border: 'none',
        }}
        aria-label="Order this week's menu"
      />

      {/* Week label badge — top left corner */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <span className="border border-white/40 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-black/25 backdrop-blur-sm">
          {CONFIG.weekLabel}
        </span>
      </div>
    </div>
  );
}
