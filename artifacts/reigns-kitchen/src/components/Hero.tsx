import React from 'react';

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
        src="/images/chef-hero-2.jpg"
        alt="Chef April Winston — Chef-crafted meals inspired by global flavors"
        className="w-full block"
        style={{ display: 'block', width: '100%', height: 'auto' }}
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

    </div>
  );
}
