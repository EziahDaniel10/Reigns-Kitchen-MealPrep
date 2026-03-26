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
    <section className="w-full cursor-pointer" onClick={handleCTA}>
      <img
        src="/images/family-meals-banner.jpg"
        alt="Feed the Whole Family — Starting at $54.99. Chef-crafted meals feeding up to 4 people. Order Family Meals."
        className="w-full block object-cover"
        style={{ maxHeight: 520 }}
        loading="lazy"
      />
    </section>
  );
}
