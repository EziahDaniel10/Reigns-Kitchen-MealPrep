import React from 'react';
import { Plus, Minus, Utensils, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type MenuItem, PRICES } from '@/data/menu';
import { useCart } from '@/store/use-cart';
import { formatPrice, cn } from '@/lib/utils';

interface MealCardProps {
  item: MenuItem;
  isFamilyMeal: boolean;
}

export function MealCard({ item, isFamilyMeal }: MealCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items[item.id];
  const quantity = cartItem?.quantity || 0;
  
  const price = isFamilyMeal ? PRICES.FAMILY : PRICES.INDIVIDUAL;

  const handleAdd = () => {
    addItem({
      id: item.id,
      name: item.name,
      price,
      isFamilyMeal
    });
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn(
        "relative flex flex-col justify-between bg-card rounded-2xl p-6 shadow-md shadow-black/5 border transition-all duration-300",
        quantity > 0 ? "border-accent ring-1 ring-accent shadow-accent/10" : "border-border/50 hover:border-accent/50 hover:shadow-lg"
      )}
    >
      <div>
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="text-xl font-bold text-foreground leading-tight">
            {item.name}
          </h3>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary whitespace-nowrap">
            {formatPrice(price)}
          </span>
        </div>

        {isFamilyMeal && (
          <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/20 text-accent-foreground text-xs font-semibold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            Serves 3–4
          </div>
        )}

        {item.description && (
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {item.description}
          </p>
        )}

        {item.sides && (
          <div className="flex items-start gap-2 text-sm font-medium text-foreground/80 bg-muted/50 p-3 rounded-xl mb-6 border border-border/50">
            <Utensils className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span>{item.sides}</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 flex items-center justify-end border-t border-border/40">
        <AnimatePresence mode="wait">
          {quantity === 0 ? (
            <motion.button
              key="add-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-2.5 bg-background border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add to Bundle
            </motion.button>
          ) : (
            <motion.div
              key="qty-counter"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 bg-primary text-primary-foreground rounded-xl p-1 shadow-md shadow-primary/20"
            >
              <button 
                onClick={() => updateQuantity(item.id, quantity - 1)}
                className="p-2 rounded-lg hover:bg-white/20 active:scale-90 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-bold text-lg leading-none">
                {quantity}
              </span>
              <button 
                onClick={() => updateQuantity(item.id, quantity + 1)}
                className="p-2 rounded-lg hover:bg-white/20 active:scale-90 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
