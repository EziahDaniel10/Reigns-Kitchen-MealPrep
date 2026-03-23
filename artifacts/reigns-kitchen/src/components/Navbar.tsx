import React from 'react';
import { Crown } from 'lucide-react';
import { Link } from 'wouter';

export function Navbar() {
  const scrollToMenu = () => {
    const el = document.getElementById('standard-meals');
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      window.location.href = '/';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary w-full border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Crown className="w-6 h-6 text-accent" />
          <span className="font-serif text-primary-foreground text-xl font-bold tracking-wide">
            Reigns Kitchen
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-primary-foreground/70 text-sm font-medium">
          <Link href="/" className="hover:text-primary-foreground transition-colors cursor-pointer">Weekly Menu</Link>
          <Link href="/about" className="hover:text-primary-foreground transition-colors cursor-pointer">About Us</Link>
          <a href="mailto:catering@reignskitchen.com" className="hover:text-primary-foreground transition-colors">Contact</a>
        </div>

        <div>
          <button
            onClick={scrollToMenu}
            className="bg-accent text-accent-foreground px-5 py-2 rounded-full text-sm font-bold hover:brightness-110 transition-all shadow-md cursor-pointer"
          >
            Start My Order
          </button>
        </div>
      </div>
    </nav>
  );
}
