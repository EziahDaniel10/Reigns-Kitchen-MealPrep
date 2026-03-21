import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Minus, Trash2, X, ChevronLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/store/use-cart';
import { formatPrice } from '@/lib/utils';
import { CONFIG } from '@/data/menu';

type Screen = 'cart' | 'checkout' | 'success' | 'error';

interface OrderForm {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryWindow: string;
  allergies: string;
  note: string;
}

async function submitOrder(
  form: OrderForm,
  items: ReturnType<typeof useCart>['items'],
  subtotal: number
): Promise<{ success: boolean; orderNumber?: string; error?: string }> {
  const orderItems = Object.values(items).map(item => ({
    name: item.name,
    qty: parseInt(String(item.quantity), 10),
    price: Number(String(item.price).replace(/[^0-9.]/g, '')),
  }));

  const total = orderItems.reduce((sum, i) => {
    const cleanPrice = Number(String(i.price).replace(/[^0-9.]/g, ''));
    const cleanQty = parseInt(String(i.qty), 10);
    return sum + (cleanPrice * cleanQty);
  }, 0).toFixed(2);

  console.log('Cart items being submitted:', JSON.stringify(orderItems));
  console.log('Total being submitted:', total);

  const res = await fetch('/api/send-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail,
      deliveryAddress: form.deliveryAddress,
      deliveryWindow: form.deliveryWindow,
      allergies: form.allergies,
      deliveryType: 'Delivery',
      note: form.note,
      items: orderItems,
      total,
    }),
  });

  const data = await res.json();
  return data;
}

function CartItems({ onClose }: { onClose?: () => void }) {
  const { items, getSubtotal, updateQuantity, getBundleProgress } = useCart();
  const { totalMeals, isMinMet, mealsNeeded } = getBundleProgress();
  const subtotal = getSubtotal();
  const progressPercentage = Math.min((totalMeals / 10) * 100, 100);

  return (
    <>
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
              <span className="text-green-700">Bundle minimum met! Keep adding to save more.</span>
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
                <span className="font-medium text-sm text-foreground leading-tight">{item.name}</span>
                <span className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</span>
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
                  <span className="w-4 text-center text-xs font-semibold">{item.quantity}</span>
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
          <span className="text-xl font-bold text-foreground">{formatPrice(subtotal)}</span>
        </div>
        {!isMinMet && totalMeals > 0 && (
          <div className="text-xs text-amber-600 mb-3 text-center font-medium">
            Minimum 4 meals required to order
          </div>
        )}
      </div>
    </>
  );
}

function CheckoutForm({
  onBack,
  onSuccess,
  onError,
}: {
  onBack: () => void;
  onSuccess: (orderNumber: string) => void;
  onError: () => void;
}) {
  const { items, getSubtotal, getBundleProgress } = useCart();
  const { totalMeals } = getBundleProgress();
  const subtotal = getSubtotal();

  const [form, setForm] = useState<OrderForm>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    deliveryWindow: '',
    allergies: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async () => {
    if (!form.customerName.trim()) { setFieldError('Please enter your name.'); return; }
    if (!form.customerPhone.trim()) { setFieldError('Please enter your phone number.'); return; }
    if (!form.deliveryAddress.trim()) { setFieldError('Please enter your delivery address.'); return; }
    if (!form.deliveryWindow) { setFieldError('Please select a delivery window.'); return; }
    setFieldError('');
    setLoading(true);
    try {
      const result = await submitOrder(form, items, subtotal);
      if (result.success) {
        onSuccess(result.orderNumber ?? 'RK-???');
      } else {
        onError();
      }
    } catch {
      onError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4 px-5 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-serif font-bold text-lg">Your Details</h2>
      </div>

      {/* Order summary strip */}
      <div className="px-5 py-3 bg-muted/60 border-b border-border shrink-0 flex justify-between text-sm">
        <span className="text-muted-foreground">{totalMeals} meals</span>
        <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Full Name *</label>
          <input
            type="text"
            placeholder="Your name"
            value={form.customerName}
            onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Phone Number *</label>
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={form.customerPhone}
            onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Delivery Address *</label>
          <textarea
            placeholder="Street address, city, state, zip..."
            value={form.deliveryAddress}
            onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))}
            rows={2}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Email <span className="text-muted-foreground font-normal normal-case">(optional)</span>
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.customerEmail}
            onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
        </div>

        {/* Friday delivery info + window selector */}
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-3.5 space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-base mt-0.5">🚚</span>
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-1">Friday Delivery Schedule</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All orders deliver on <strong>Fridays</strong>. Select your preferred window — exact times may vary by route. We'll confirm your approximate time by <strong>Thursday evening</strong>.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
              Delivery Window *
            </label>
            <select
              value={form.deliveryWindow}
              onChange={e => setForm(f => ({ ...f, deliveryWindow: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all cursor-pointer"
            >
              <option value="">Select a time window...</option>
              <option value="10 a.m. – 1 p.m.">10 a.m. – 1 p.m.</option>
              <option value="1 p.m. – 4 p.m.">1 p.m. – 4 p.m.</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Allergies / Special Instructions <span className="text-muted-foreground font-normal normal-case">(optional)</span>
          </label>
          <textarea
            placeholder="e.g. nut allergy, no dairy, gluten-free..."
            value={form.allergies}
            onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))}
            rows={2}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Special Note <span className="text-muted-foreground font-normal normal-case">(optional)</span>
          </label>
          <textarea
            placeholder="Any other notes..."
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            rows={3}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
          />
        </div>

        {fieldError && (
          <p className="text-xs text-destructive font-medium">{fieldError}</p>
        )}
      </div>

      {/* Submit */}
      <div className="p-5 border-t border-border bg-card shrink-0">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-lg font-bold bg-[#25D366] text-white hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending Order...
            </>
          ) : (
            <>
              <span>📲</span>
              Send Order via WhatsApp
            </>
          )}
        </button>
        <p className="text-center text-xs text-muted-foreground mt-2">
          {CONFIG.orderDeadline}
        </p>
      </div>
    </>
  );
}

function SuccessScreen({ orderNumber, onClose }: { orderNumber: string; onClose: () => void }) {
  const { clearCart } = useCart();

  const handleClose = () => {
    clearCart();
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-card items-center justify-center px-6 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Order Received!</h2>
      <p className="text-sm font-semibold text-muted-foreground mb-1">Order #{orderNumber}</p>
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
        We've received your order and will confirm via WhatsApp, phone or email shortly.
      </p>
      <div className="mt-5 bg-muted/60 rounded-xl p-4 text-xs text-muted-foreground text-left w-full">
        <p>📅 Order deadline: {CONFIG.orderDeadline}</p>
        <p className="mt-1">🚗 {CONFIG.deliveryNote}</p>
      </div>
      <button
        onClick={handleClose}
        className="mt-6 w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all cursor-pointer"
      >
        Back to Menu
      </button>
    </div>
  );
}

function ErrorScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-card items-center justify-center px-6 text-center">
      <AlertCircle className="w-16 h-16 text-destructive mb-4" />
      <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        We couldn't send your order. Please try again or contact us directly.
      </p>
      <button
        onClick={onBack}
        className="mt-6 w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}

function CartPanel({ onClose }: { onClose?: () => void }) {
  const [screen, setScreen] = useState<Screen>('cart');
  const [orderNumber, setOrderNumber] = useState('');
  const { getBundleProgress } = useCart();
  const { isMinMet } = getBundleProgress();

  return (
    <div className="flex flex-col h-full bg-card relative">
      {screen === 'cart' && (
        <>
          <CartItems onClose={onClose} />
          {/* Proceed button lives outside CartItems so it can change screen */}
          <div className="px-5 pb-5 bg-card shrink-0">
            <button
              disabled={!isMinMet}
              onClick={() => isMinMet && setScreen('checkout')}
              className="w-full py-3 rounded-lg font-bold transition-all disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed bg-accent text-accent-foreground hover:brightness-110 cursor-pointer"
            >
              Proceed to Checkout →
            </button>
          </div>
        </>
      )}
      {screen === 'checkout' && (
        <CheckoutForm
          onBack={() => setScreen('cart')}
          onSuccess={(num) => { setOrderNumber(num); setScreen('success'); }}
          onError={() => setScreen('error')}
        />
      )}
      {screen === 'success' && (
        <SuccessScreen orderNumber={orderNumber} onClose={() => { setScreen('cart'); onClose?.(); }} />
      )}
      {screen === 'error' && (
        <ErrorScreen onBack={() => setScreen('checkout')} />
      )}
    </div>
  );
}

export function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { getBundleProgress, getSubtotal } = useCart();
  const { totalMeals } = getBundleProgress();

  return (
    <>
      {/* Desktop sticky sidebar */}
      <div className="hidden lg:block sticky top-32 w-80 shrink-0 rounded-xl bg-card shadow-xl border border-border overflow-hidden h-[calc(100vh-9rem)]">
        <CartPanel />
      </div>

      {/* Mobile */}
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
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-x-0 bottom-0 h-[90vh] z-50 rounded-t-2xl overflow-hidden bg-card"
              >
                <CartPanel onClose={() => setIsOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
