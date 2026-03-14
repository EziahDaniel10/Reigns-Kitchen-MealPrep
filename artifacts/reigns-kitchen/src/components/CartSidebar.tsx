import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, CheckCircle2, ChevronRight, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/store/use-cart';
import { formatPrice } from '@/lib/utils';

interface CartContentProps {
  onClose?: () => void;
}

function CartContent({ onClose }: CartContentProps) {
  const { items, getTotalItems, getSubtotal, updateQuantity, clearCart } = useCart();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  const handleSubmit = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      clearCart();
      setIsSubmitted(false);
      onClose?.();
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-serif text-primary mb-4">Bundle Confirmed!</h2>
        <p className="text-muted-foreground text-lg">
          Your Reigns Kitchen bundle has been submitted successfully. We'll start prepping your fuel!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card shadow-2xl relative">
      <div className="flex items-center justify-between p-6 border-b border-border bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-serif font-bold m-0">Your Bundle</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-2">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Bundle is empty</h3>
            <p className="text-muted-foreground">Start building your perfect meal bundle! 🍽️</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {Object.values(items).map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="flex flex-col gap-3 pb-6 border-b border-border/60 last:border-0"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-semibold text-foreground leading-tight flex-1">
                      {item.name}
                    </h4>
                    <span className="font-bold text-primary">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} each
                    </div>
                    
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 rounded hover:bg-background transition-colors text-foreground"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-destructive" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 rounded hover:bg-background transition-colors text-foreground"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="p-6 bg-background border-t border-border mt-auto">
        <div className="flex justify-between items-center mb-6">
          <span className="text-muted-foreground font-medium">Grand Total</span>
          <span className="text-3xl font-serif font-bold text-primary">
            {formatPrice(subtotal)}
          </span>
        </div>
        <button
          disabled={totalItems === 0}
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-accent text-accent-foreground hover:brightness-110 shadow-lg shadow-accent/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          Submit Bundle
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { getTotalItems, getSubtotal } = useCart();
  const totalItems = getTotalItems();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-[400px] shrink-0 sticky top-24 h-[calc(100vh-8rem)] rounded-3xl overflow-hidden border-2 border-border shadow-2xl">
        <CartContent />
      </div>

      {/* Mobile Floating Button & Bottom Sheet */}
      <div className="lg:hidden">
        <AnimatePresence>
          {totalItems > 0 && !isOpen && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 inset-x-4 z-50"
            >
              <button
                onClick={() => setIsOpen(true)}
                className="w-full bg-primary text-primary-foreground p-4 rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-between font-bold text-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-accent text-accent-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">
                    {totalItems}
                  </div>
                  <span>View Bundle</span>
                </div>
                <span>{formatPrice(getSubtotal())}</span>
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
                className="fixed inset-x-0 bottom-0 h-[85vh] z-50 rounded-t-3xl overflow-hidden"
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
