import React from 'react';
import { Crown } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-primary w-full border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-6 h-6 text-accent" />
          <span className="font-serif text-primary-foreground text-xl font-bold tracking-wide">
            Reigns Kitchen
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-primary-foreground/70 text-sm font-medium">
          <a href="#" className="hover:text-primary-foreground transition-colors">Weekly Menu</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">About Us</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">Contact</a>
        </div>
        
        <div>
          <button 
            onClick={() => {
              const el = document.getElementById('chef-comfort');
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 120;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
            className="bg-accent text-accent-foreground px-5 py-2 rounded-full text-sm font-bold hover:brightness-110 transition-all shadow-md"
          >
            Start My Order
          </button>
        </div>
      </div>
    </nav>
  );
}
