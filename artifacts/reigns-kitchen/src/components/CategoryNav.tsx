import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CONFIG } from '@/data/menu';

export function CategoryNav() {
  const [activeId, setActiveId] = useState(CONFIG.categories[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const closest = visibleEntries.reduce((prev, curr) => 
            Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top) ? curr : prev
          );
          setActiveId(closest.target.id);
        }
      },
      { rootMargin: '-150px 0px -60% 0px' }
    );

    CONFIG.categories.forEach((cat) => {
      const el = document.getElementById(cat.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-16 z-40 bg-background border-b border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-1 px-4 py-2 w-max">
          {CONFIG.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollTo(cat.id)}
              className={cn(
                "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer",
                activeId === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-muted"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
