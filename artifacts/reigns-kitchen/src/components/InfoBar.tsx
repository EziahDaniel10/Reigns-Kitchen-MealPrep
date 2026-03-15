import React, { useState } from 'react';
import { CONFIG } from '@/data/menu';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export function InfoBar() {
  const [activeBundle, setActiveBundle] = useState<number | null>(CONFIG.bundles.find(b => b.highlighted)?.meals || null);

  return (
    <div className="bg-background border-b border-border py-5 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="font-bold text-foreground text-sm">
            Order Deadline: {CONFIG.orderDeadline}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pickup or Delivery: {CONFIG.deliveryNote}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {CONFIG.bundles.map((bundle) => {
            const isActive = activeBundle === bundle.meals;
            return (
              <button
                key={bundle.meals}
                onClick={() => setActiveBundle(bundle.meals)}
                className={cn(
                  "border rounded-full px-4 py-1.5 text-sm cursor-pointer transition-all flex items-center gap-1.5",
                  isActive 
                    ? "border-accent bg-accent/10 text-foreground font-semibold" 
                    : "border-border text-muted-foreground hover:border-accent/50"
                )}
              >
                {isActive && <Check className="w-3.5 h-3.5 text-accent" />}
                {bundle.meals} Meals ${bundle.price}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
