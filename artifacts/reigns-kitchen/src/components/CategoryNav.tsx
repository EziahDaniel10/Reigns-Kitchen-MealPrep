import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MENU } from '@/data/menu';

export function CategoryNav() {
  const [activeId, setActiveId] = useState(MENU[0].category);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the visible section
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // If multiple are visible, pick the one closest to the top
          const closest = visibleEntries.reduce((prev, curr) => 
            Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top) ? curr : prev
          );
          setActiveId(closest.target.id);
        }
      },
      { rootMargin: '-150px 0px -60% 0px' }
    );

    MENU.forEach((cat) => {
      const el = document.getElementById(cat.category);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // Smooth scroll offset by header height
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-6 overflow-x-auto no-scrollbar py-4">
          {MENU.map((cat) => (
            <button
              key={cat.category}
              onClick={() => scrollTo(cat.category)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out",
                activeId === cat.category 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {cat.category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
