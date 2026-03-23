import React, { useState } from 'react';
import { CONFIG } from '@/data/menu';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export function InfoBar() {
  const [activeBundle, setActiveBundle] = useState<number | null>(CONFIG.bundles.find(b => b.highlighted)?.meals || null);

  return (
    <div className="bg-background border-b border-border w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Deadline info */}
        <div className="py-3 border-b border-border/50">
          <p className="font-bold text-foreground text-xs sm:text-sm">
            Order Deadline: {CONFIG.orderDeadline}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {CONFIG.deliveryNote}
          </p>
        </div>

        {/* Bundle pills */}
        <div className="py-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1 shrink-0">
              Bundle Deals:
            </span>
            {CONFIG.bundles.map((bundle) => {
              const isActive = activeBundle === bundle.meals;
              return (
                <button
                  key={bundle.meals}
                  onClick={() => setActiveBundle(bundle.meals)}
                  className={cn(
                    "border rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap",
                    isActive
                      ? "border-accent bg-accent/10 text-foreground font-semibold"
                      : "border-border text-muted-foreground hover:border-accent/50"
                  )}
                >
                  {isActive && <Check className="w-3 h-3 text-accent" />}
                  <span className="font-semibold">{bundle.meals} Meals</span>
                  <span className="text-muted-foreground">${bundle.price}</span>
                  {bundle.highlighted && (
                    <span className="bg-accent text-accent-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {bundle.label}
                    </span>
                  )}
                </button>
              );
            })}
            <span className="text-xs text-muted-foreground ml-1 italic">
              +$3 per Signature meal · Chef's Featured not included
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
