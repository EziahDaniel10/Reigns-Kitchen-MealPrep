import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Minus, Trash2, X, MessageCircle } from 'lucide-react';
import { useCart } from '@/store/use-cart';
import { formatPrice } from '@/lib/utils';
import { CONFIG } from '@/data/menu';

function buildWhatsAppUrl(items: ReturnType<typeof useCart>['items'], subtotal: number, weekLabel: string): string {
  const lines: string[] = [];
  lines.push(`🍽️ *REIGNS KITCHEN ORDER — ${weekLabel.toUpperCase()}*`);
  lines.push('');
  lines.push('*My Order:*');
  Object.values(items).forEach(item => {
    lines.push(`• ${item.name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`);
  });
  lines.push('');
  lines.push(`*Order Total: ${formatPrice(subtotal)}*`);
  lines.push('');
  lines.push('Please confirm availability and my pickup/delivery details. Thank you! 🙏');
  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`;
}

function CartContent({ onClose }: { onClose?: () => void }) {
  const { items, getSubtotal, updateQuantity, getBundleProgress, clearCart } = useCart();
  const { totalMeals, isMinMet, mealsNeeded } = getBundleProgress();
  
  const subtotal = getSubtotal();

  const progressPercentage = Math.min((totalMeals / 10) * 100, 100);

  return (
    <div className="flex flex-col h-full bg-card relative">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-accent" />
          <h2 className="font-serif font-bold text-lg">Your Order</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
            {totalMeals} {totalMeals === 1 ? 'item' : 'items'}
          </span>
          {onClose && (
            <button onClick={onClose} className="p-1 -mr-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Bundle Progress */}
      {totalMeals > 0 && (
        <div className="px-5 py-4 bg-muted/50 border-b border-border shrink-0">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-semibold">{totalMeals} meals selected</span>
          </div>
          
          <div className="relative h-2 bg-border rounded-full mb-3 overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
            {/* Bundle markers */}
            {[4, 5, 8, 10].map(point => (
              <div 
                key={point}
                className="absolute top-0 h-full w-0.5 bg-background z-10"
                style={{ left: `${(point / 10) * 100}%` }}
              />
            ))}
          </div>
          
          <div className="text-xs font-medium">
            {!isMinMet ? (
              <span className="text-amber-600">
                Add {mealsNeeded} more {mealsNeeded === 1 ? 'meal' : 'meals'} to start your order
              </span>
            ) : (
              <span className="text-green-700">
                Bundle minimum met! Keep adding to save more.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {totalMeals === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70 mt-10">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground">Start building your bundle!</h3>
            <p className="text-sm text-muted-foreground mt-1">Add 4+ meals to place an order</p>
          </div>
        ) : (
          Object.values(items).map(item => (
            <div key={item.id} className="flex flex-col gap-2 pb-4 border-b border-border/50 last:border-0">
              <div className="flex justify-between gap-3">
                <span className="font-medium text-sm text-foreground leading-tight">
                  {item.name}
                </span>
                <span className="font-semibold text-sm">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">{formatPrice(item.price)} each</span>
                <div className="flex items-center gap-2 bg-muted/50 rounded p-0.5">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-background transition-colors text-foreground cursor-pointer"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-destructive" /> : <Minus className="w-3 h-3" />}
                  </button>
                  <span className="w-4 text-center text-xs font-semibold">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-background transition-colors text-foreground cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-border bg-card shrink-0">
        <div className="flex justify-between items-center mb-3">
          <span className="text-muted-foreground font-medium">Total</span>
          <span className="text-xl font-bold text-foreground">
            {formatPrice(subtotal)}
          </span>
        </div>
        
        {!isMinMet && totalMeals > 0 && (
          <div className="text-xs text-amber-600 mb-3 text-center font-medium">
            Minimum 4 meals required to order
          </div>
        )}

        <button
          disabled={!isMinMet}
          onClick={() => {
            if (!isMinMet) return;
            const url = buildWhatsAppUrl(items, subtotal, CONFIG.weekLabel);
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
          className="w-full py-3 rounded-lg font-bold transition-all disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed bg-[#25D366] text-white hover:brightness-110 cursor-pointer flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Send Order via WhatsApp
        </button>
        
        {isMinMet && (
          <p className="text-center text-xs text-muted-foreground mt-2">
            Tapping above opens WhatsApp with your order pre-filled
          </p>
        )}
      </div>
    </div>
  );
}

export function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { getBundleProgress, getSubtotal } = useCart();
  const { totalMeals } = getBundleProgress();

  return (
    <>
      <div className="hidden lg:block sticky top-32 w-80 shrink-0 rounded-xl bg-card shadow-xl border border-border overflow-hidden h-[calc(100vh-9rem)]">
        <CartContent />
      </div>

      <div className="lg:hidden">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 inset-x-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-background/95 to-transparent"
            >
              <button
                onClick={() => setIsOpen(true)}
                className="w-full bg-primary text-primary-foreground p-4 rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-between font-bold cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-accent text-accent-foreground w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
                    {totalMeals}
                  </div>
                  <span className="text-base">{totalMeals === 0 ? 'Start My Order' : 'View Order'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {totalMeals > 0 && (
                    <span className="text-accent font-bold">{formatPrice(getSubtotal())}</span>
                  )}
                  <span className="text-primary-foreground/60 text-sm">›</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-x-0 bottom-0 h-[85vh] z-50 rounded-t-2xl overflow-hidden bg-card"
              >
                <CartContent onClose={() => setIsOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
