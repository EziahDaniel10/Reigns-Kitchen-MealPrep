import React from 'react';
import { CONFIG } from '@/data/menu';

export function PromoBanner() {
  return (
    <div className="w-full bg-accent text-accent-foreground text-center py-2.5 px-4 text-sm font-semibold shadow-sm">
      {CONFIG.promoBanner}
    </div>
  );
}
