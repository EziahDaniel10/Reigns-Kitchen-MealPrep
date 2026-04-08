import React from 'react';
import { Link, useLocation } from 'wouter';
import { useUI } from '@/store/use-ui';

export function Navbar() {
  const { openContact } = useUI();
  const [location, navigate] = useLocation();

  const scrollToMenu = () => {
    const el = document.getElementById('standard-meals');
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      window.location.href = '/';
    }
  };

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location === '/') {
      openContact('form');
    } else {
      navigate('/');
      setTimeout(() => openContact('form'), 300);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary w-full border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center cursor-pointer">
          <img
            src="/images/logo.png"
            alt="Reigns Kitchen"
            className="h-16 w-auto object-contain"
          />
        </Link>

        <div className="hidden md:flex items-center gap-6 text-primary-foreground/70 text-sm font-medium">
          <Link href="/" className="hover:text-primary-foreground transition-colors cursor-pointer">Weekly Menu</Link>
          <Link href="/about" className="hover:text-primary-foreground transition-colors cursor-pointer">About Us</Link>
          <button
            onClick={handleContact}
            className="hover:text-primary-foreground transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            Contact
          </button>
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
