import React from 'react';
import { Link } from 'wouter';
import { UtensilsCrossed } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
        <UtensilsCrossed className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-5xl font-serif font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        We couldn't find the page you're looking for. It might have been moved or removed.
      </p>
      <Link 
        href="/" 
        className="px-8 py-3 bg-accent text-accent-foreground rounded-xl font-bold hover:brightness-110 shadow-lg shadow-accent/20 transition-all hover:-translate-y-1"
      >
        Back to the Kitchen
      </Link>
    </div>
  );
}
