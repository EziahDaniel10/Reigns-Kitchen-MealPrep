import React from 'react';
import { CONFIG } from '@/data/menu';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 px-8 w-full z-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="mb-4">
          <h2 className="font-serif text-2xl font-bold tracking-wider mb-1">
            Reigns Kitchen
          </h2>
          <p className="text-accent font-medium">
            {CONFIG.tagline}
          </p>
        </div>
        
        <p className="text-sm text-primary-foreground/60 max-w-md mb-8">
          Fresh meals prepared weekly. Pickup or delivery available.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/50 mb-8">
          <a href="#" className="hover:text-primary-foreground transition-colors">Weekly Menu</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">How It Works</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">About Us</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">Contact</a>
        </div>
        
        <div className="text-xs text-primary-foreground/40 border-t border-white/10 pt-8 w-full">
          &copy; 2026 Reigns Kitchen. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
