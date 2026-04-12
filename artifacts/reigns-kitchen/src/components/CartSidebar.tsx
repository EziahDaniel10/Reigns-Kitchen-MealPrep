import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Minus, Trash2, X, ChevronLeft, CheckCircle, Loader2, AlertCircle, Lock, Tag } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { useCart } from '@/store/use-cart';
import { useUI } from '@/store/use-ui';
import { formatPrice } from '@/lib/utils';
import { CONFIG } from '@/data/menu';

type Screen = 'cart' | 'checkout' | 'payment' | 'success' | 'error';

const TAX_RATE = 0.06;

function getMinDeliveryFriday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const daysUntilFriday = dayOfWeek === 5 ? 7 : (5 - dayOfWeek + 7) % 7;
  const friday = new Date(today);
  friday.setDate(today.getDate() + daysUntilFriday);
  return friday;
}

interface OrderForm {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryWindow: string;
  allergies: string;
  note: string;
}

const EMPTY_FORM: OrderForm = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  deliveryAddress: '',
  deliveryDate: '',
  deliveryWindow: '',
  allergies: '',
  note: '',
};

function CartItems({
  onClose,
  deliveryType,
  setDeliveryType,
  deliveryFee,
  tax,
}: {
  onClose?: () => void;
  deliveryType: 'delivery' | 'pickup';
  setDeliveryType: (t: 'delivery' | 'pickup') => void;
  deliveryFee: number;
  tax: number;
}) {
  const { items, getSubtotal, updateQuantity, getBundleProgress } = useCart();
  const { totalMeals, isMinMet, mealsNeeded } = getBundleProgress();
  const subtotal = getSubtotal();
  const progressPercentage = Math.min((totalMeals / 10) * 100, 100);

  return (
    <>
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

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {totalMeals === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70 mt-10">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground">Start building your bundle!</h3>
            <p className="text-sm text-muted-foreground mt-1">Add meals to start your order</p>
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

      <div className="p-5 border-t border-border bg-card shrink-0">
        <div className="flex rounded-lg overflow-hidden border border-border mb-4">
          <button
            onClick={() => setDeliveryType('delivery')}
            className={`flex-1 py-2 text-xs font-semibold transition-colors cursor-pointer ${deliveryType === 'delivery' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
          >
            🚗 Delivery
          </button>
          <button
            onClick={() => setDeliveryType('pickup')}
            className={`flex-1 py-2 text-xs font-semibold transition-colors cursor-pointer border-l border-border ${deliveryType === 'pickup' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
          >
            🏪 Pickup — Free
          </button>
        </div>

        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{deliveryType === 'delivery' ? 'Delivery fee' : 'Pickup'}</span>
            <span className="text-foreground">
              {deliveryType === 'pickup' ? 'Free' : 'By distance'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (6%)</span>
            <span className="text-foreground">{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-border">
            <span className="font-semibold text-foreground">Subtotal + Tax</span>
            <span className="text-xl font-bold text-foreground">{formatPrice(subtotal + tax)}</span>
          </div>
        </div>
        {!isMinMet && totalMeals > 0 && (
          <div className="text-xs text-amber-600 mt-3 text-center font-medium">
            Minimum 4 meals required to order
          </div>
        )}
      </div>
    </>
  );
}

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  description?: string | null;
  discountType: string;
  discountValue: number;
}

function CheckoutForm({
  onBack,
  onValidated,
  initialForm,
  deliveryType,
  deliveryFee,
  tax,
  appliedCoupon,
  onCouponChange,
}: {
  onBack: () => void;
  onValidated: (form: OrderForm, fee: number) => void;
  initialForm: OrderForm;
  deliveryType: 'delivery' | 'pickup';
  deliveryFee: number;
  tax: number;
  appliedCoupon: AppliedCoupon | null;
  onCouponChange: (c: AppliedCoupon | null) => void;
}) {
  const { getSubtotal, getBundleProgress } = useCart();
  const { totalMeals } = getBundleProgress();
  const subtotal = getSubtotal();
  const { openContact } = useUI();

  const minFriday = getMinDeliveryFriday();
  const isCutoffDay = new Date().getDay() === 5;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [fieldError, setFieldError] = useState('');
  const [checkingAddress, setCheckingAddress] = useState(false);
  const [outOfRange, setOutOfRange] = useState(false);
  const [couponInput, setCouponInput] = useState(appliedCoupon?.code ?? '');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        onCouponChange({
          code: data.coupon.code,
          discountAmount: data.coupon.discountAmount,
          description: data.coupon.description,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
        });
        setCouponError('');
      } else {
        setCouponError(data.error ?? 'Invalid coupon code');
      }
    } catch {
      setCouponError('Could not validate coupon. Please try again.');
    }
    setCouponLoading(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const label = date.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      });
      setForm(f => ({ ...f, deliveryDate: label }));
    } else {
      setForm(f => ({ ...f, deliveryDate: '' }));
    }
  };

  const handleContinue = async () => {
    if (!form.customerName.trim()) { setFieldError('Please enter your name.'); return; }
    if (!form.customerPhone.trim()) { setFieldError('Please enter your phone number.'); return; }
    if (deliveryType === 'delivery') {
      if (!form.deliveryAddress.trim()) { setFieldError('Please enter your delivery address.'); return; }
      if (!form.deliveryDate) { setFieldError('Please select a delivery date.'); return; }
      if (!form.deliveryWindow) { setFieldError('Please select a delivery window.'); return; }
    }
    if (!form.customerEmail.trim()) { setFieldError('Please enter your email address.'); return; }
    setFieldError('');
    setOutOfRange(false);

    if (deliveryType === 'delivery') {
      setCheckingAddress(true);
      try {
        const res = await fetch(`/api/delivery-fee?address=${encodeURIComponent(form.deliveryAddress)}`);
        const data = await res.json();
        setCheckingAddress(false);
        if (!data.success) {
          setFieldError(data.error ?? 'Could not verify your address. Please check it and try again.');
          return;
        }
        if (data.outOfRange) {
          setOutOfRange(true);
          return;
        }
        onValidated(form, data.fee);
      } catch {
        setCheckingAddress(false);
        setFieldError('Could not verify your address. Please check your connection and try again.');
      }
    } else {
      onValidated(form, 0);
    }
  };

  return (
    <>
      <div className="bg-primary text-primary-foreground py-4 px-5 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-serif font-bold text-lg">Your Details</h2>
      </div>

      <div className="px-5 py-3 bg-muted/60 border-b border-border shrink-0">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">
            {totalMeals} meals · {deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
          </span>
          <span className="font-bold text-foreground">{formatPrice(subtotal + tax)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {deliveryType === 'delivery' ? 'Delivery fee calculated by distance + 6% tax' : 'Incl. 6% tax · free pickup'}
        </p>
      </div>

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

        {deliveryType === 'delivery' ? (
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
        ) : (
          <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-foreground">
            <p className="font-semibold mb-1">🏪 Pickup selected</p>
            <p className="text-xs text-muted-foreground leading-relaxed">We'll send you our pickup address and your ready-time via WhatsApp after your order is confirmed.</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Email *</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.customerEmail}
            onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
        </div>

        {deliveryType === 'delivery' && (
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-3.5 space-y-3">
            <p className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
              <span>📅</span> Delivery Date *
            </p>

            {isCutoffDay && (
              <div className="rounded-md px-3 py-2 text-xs leading-relaxed bg-amber-50 border border-amber-200 text-amber-800">
                <strong>⚠️ Today is the order cutoff (Friday).</strong> Same-day delivery is not available — please select next Friday below.
              </div>
            )}

            <div className="rk-calendar flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                defaultMonth={minFriday}
                disabled={[
                  { before: minFriday },
                  { after: minFriday },
                  (d: Date) => d.getDay() !== 5,
                ]}
              />
            </div>

            {selectedDate && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800">
                <span className="font-bold text-base">✓</span>
                <span>Delivery: <strong>{form.deliveryDate}</strong></span>
              </div>
            )}

            <p className="text-xs text-muted-foreground leading-relaxed">
              Deliveries every Friday. Same-day orders not accepted. The next available date is highlighted above.
            </p>

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
              <p className="mt-1.5 text-xs text-muted-foreground">We'll confirm your approximate time by <strong>Thursday evening</strong>.</p>
            </div>
          </div>
        )}

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
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed bg-muted/40 rounded-md p-2.5">
            ⚠️ If no allergy or dietary information is provided, the order will be prepared as standard. Reigns Kitchen is not responsible for any allergic reactions or dietary concerns that were not disclosed at the time of ordering. <em>Reigns Kitchen operates in a kitchen that handles common allergens and is not an allergen-free facility.</em>
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Delivery Instructions <span className="text-muted-foreground font-normal normal-case">(optional)</span>
          </label>
          <textarea
            placeholder="Any other notes..."
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            rows={3}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
          />
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Include gate codes, call box numbers, preferred drop-off location, or instructions (e.g., ring doorbell, leave at door).
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Coupon Code <span className="text-muted-foreground font-normal normal-case">(optional)</span>
          </label>
          {appliedCoupon ? (
            <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-sm" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
              <div className="flex items-center gap-2" style={{ color: '#166534' }}>
                <Tag className="w-3.5 h-3.5 shrink-0" />
                <span className="font-bold">{appliedCoupon.code}</span>
                <span>— {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `$${appliedCoupon.discountValue.toFixed(2)}`} off (−${appliedCoupon.discountAmount.toFixed(2)})</span>
              </div>
              <button onClick={() => { onCouponChange(null); setCouponInput(''); setCouponError(''); }} className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                onKeyDown={async e => { if (e.key === 'Enter') { e.preventDefault(); await handleApplyCoupon(); } }}
                placeholder="Enter code..."
                className="flex-1 border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={!couponInput.trim() || couponLoading}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-accent text-accent hover:bg-accent/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
              </button>
            </div>
          )}
          {couponError && <p className="mt-1.5 text-xs text-destructive">{couponError}</p>}
        </div>

        {fieldError && (
          <p className="text-xs text-destructive font-medium">{fieldError}</p>
        )}

        {outOfRange && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
            <p className="font-semibold text-amber-800 mb-1">Outside our standard delivery area</p>
            <p className="text-amber-700 text-xs leading-relaxed mb-2">
              Your address is more than 15 miles away. Please contact us for a custom delivery quote.
            </p>
            <button
              onClick={() => openContact('form')}
              className="text-xs font-semibold underline underline-offset-2 text-amber-800 hover:opacity-80 cursor-pointer"
            >
              Contact us for a quote →
            </button>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-border bg-card shrink-0">
        <button
          onClick={handleContinue}
          disabled={checkingAddress}
          className="w-full py-3 rounded-lg font-bold bg-accent text-accent-foreground hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {checkingAddress ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking your address…
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Continue to Payment
            </>
          )}
        </button>
        <p className="text-center text-xs text-muted-foreground mt-2">
          {CONFIG.orderDeadline}
        </p>
        <div className="mt-3 text-xs text-muted-foreground leading-relaxed border-t border-border pt-3 space-y-1">
          <p>Please provide all necessary delivery details to ensure a smooth delivery.</p>
        </div>
      </div>
    </>
  );
}

function PaymentScreen({
  onBack,
  onSuccess,
  onError,
  formData,
  deliveryType,
  deliveryFee,
  tax,
  appliedCoupon,
}: {
  onBack: () => void;
  onSuccess: (orderNumber: string) => void;
  onError: () => void;
  formData: OrderForm;
  deliveryType: 'delivery' | 'pickup';
  deliveryFee: number;
  tax: number;
  appliedCoupon: AppliedCoupon | null;
}) {
  const { items, getSubtotal, getBundleProgress } = useCart();
  const { totalMeals } = getBundleProgress();
  const subtotal = getSubtotal();
  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + deliveryFee + tax - discount);
  const totalCents = Math.round(total * 100);

  const cardRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [sqReady, setSqReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let card: any;
    const appId = import.meta.env.VITE_SQUARE_APP_ID;
    const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

    async function initSquare() {
      if (!(window as any).Square) {
        setError('Payment system not available. Please refresh the page and try again.');
        return;
      }
      try {
        const payments = (window as any).Square.payments(appId, locationId);
        card = await payments.card({
          style: {
            '.input-container': {
              borderColor: '#e2e8f0',
              borderRadius: '8px',
            },
            '.input-container.is-focus': {
              borderColor: '#c9a84c',
            },
            '.input-container.is-error': {
              borderColor: '#ef4444',
            },
            '.message-text': {
              color: '#6b7280',
            },
            '.message-icon': {
              color: '#6b7280',
            },
            input: {
              backgroundColor: '#ffffff',
              color: '#0f172a',
            },
          },
        });
        await card.attach('#sq-card-container');
        cardRef.current = card;
        setSqReady(true);
      } catch (e) {
        console.error('Square init error:', e);
        setError('Could not load payment form. Please try again.');
      }
    }

    initSquare();

    return () => {
      if (card) {
        card.destroy().catch(() => {});
      }
    };
  }, []);

  const handlePay = async () => {
    if (!cardRef.current || !sqReady) return;
    setError('');
    setLoading(true);
    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== 'OK') {
        const msg = result.errors?.[0]?.message ?? 'Card verification failed. Please check your card details.';
        setError(msg);
        setLoading(false);
        return;
      }

      const orderItems = Object.values(items).map(item => ({
        name: item.name,
        qty: parseInt(String(item.quantity), 10),
        price: Number(String(item.price).replace(/[^0-9.]/g, '')),
      }));

      const res = await fetch('/api/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail,
          deliveryAddress: deliveryType === 'delivery' ? formData.deliveryAddress : undefined,
          deliveryDate: deliveryType === 'delivery' ? formData.deliveryDate : undefined,
          deliveryWindow: deliveryType === 'delivery' ? formData.deliveryWindow : undefined,
          allergies: formData.allergies,
          deliveryType: deliveryType === 'delivery' ? 'Delivery' : 'Pickup',
          deliveryFee,
          tax,
          note: formData.note,
          items: orderItems,
          total: total.toFixed(2),
          paymentToken: result.token,
          totalCents,
          couponCode: appliedCoupon?.code ?? null,
          discountAmount: discount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(data.orderNumber ?? 'RK-???');
      } else {
        setError(data.error ?? 'Payment failed. Please try again.');
        setLoading(false);
      }
    } catch {
      onError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-primary text-primary-foreground py-4 px-5 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-serif font-bold text-lg">Secure Payment</h2>
      </div>

      <div className="px-5 py-3 bg-muted/60 border-b border-border shrink-0">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">
            {totalMeals} meals · {deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
          </span>
          <span className="font-bold text-foreground">{formatPrice(total)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {deliveryType === 'delivery' ? 'Incl. $12 delivery + 6% tax' : 'Incl. 6% tax · free pickup'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">
            Card Details
          </label>

          {!sqReady && !error && (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading secure payment form...</span>
            </div>
          )}

          <div
            id="sq-card-container"
            className={sqReady ? 'block' : 'hidden'}
            style={{ minHeight: 89 }}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>{deliveryType === 'delivery' ? 'Delivery fee' : 'Pickup'}</span>
            <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Free'}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (6%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between font-medium" style={{ color: '#16a34a' }}>
              <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {appliedCoupon?.code}</span>
              <span>−{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-foreground text-sm pt-1.5 border-t border-border">
            <span>Total charged today</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>Your card is encrypted and never stored. Powered by Square.</span>
        </div>
      </div>

      <div className="p-5 border-t border-border bg-card shrink-0">
        <button
          onClick={handlePay}
          disabled={loading || !sqReady}
          className="w-full py-3.5 rounded-lg font-bold bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-base"
          style={{ background: sqReady && !loading ? '#1a2235' : undefined }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Pay {formatPrice(total)}
            </>
          )}
        </button>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Secure · Encrypted · Powered by Square
        </p>
        <button
          onClick={() => onSuccess('RK-PREVIEW-001')}
          className="w-full mt-3 py-1.5 rounded text-xs text-muted-foreground border border-dashed border-border hover:border-accent hover:text-accent transition-all cursor-pointer"
        >
          👁 Preview confirmation screen (demo only)
        </button>
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
      <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Order Confirmed!</h2>
      <p className="text-sm font-semibold text-muted-foreground mb-1">Order #{orderNumber}</p>
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
        Your payment was received and your order is confirmed. We'll be in touch via WhatsApp or email shortly.
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
        We couldn't process your order. Please try again or contact us directly.
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

function ContactModal({ onClose, defaultTab = 'quick' }: { onClose: () => void; defaultTab?: 'quick' | 'form' }) {
  const [tab, setTab] = useState<'quick' | 'form'>(defaultTab);
  const [cf, setCf] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async () => {
    if (!cf.name.trim() || !cf.message.trim()) { setSubmitError('Name and message are required.'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cf),
      });
      const data = await res.json();
      if (data.success) setSubmitted(true);
      else setSubmitError(data.error ?? 'Failed to send. Please try again.');
    } catch { setSubmitError('Network error. Please try again.'); }
    setSubmitting(false);
  };

  const inputClass = 'w-full border border-white/20 rounded-lg px-3 py-2.5 text-sm bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/60 transition-all';

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl p-6 pb-8"
        style={{ background: '#1a2235' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-bold" style={{ color: '#F5F5DC' }}>Contact Us</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
            <X className="w-4 h-4" style={{ color: '#F5F5DC' }} />
          </button>
        </div>

        <div className="flex gap-1 mb-4 bg-white/10 rounded-lg p-1">
          {(['quick', 'form'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer" style={{ background: tab === t ? '#c9a84c' : 'transparent', color: tab === t ? '#1a2235' : 'rgba(245,245,220,0.7)' }}>
              {t === 'quick' ? 'Quick Contact' : 'Send a Message'}
            </button>
          ))}
        </div>

        {tab === 'quick' && (
          <div className="space-y-3">
            <a href={`https://wa.me/${CONFIG.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 cursor-pointer" style={{ background: '#25D366', color: '#fff' }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.85L.054 23.454a.75.75 0 0 0 .918.919l5.683-1.49A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.504-5.24-1.385l-.374-.217-3.875 1.016 1.029-3.764-.237-.389A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              WhatsApp
            </a>
            <a href={`sms:${CONFIG.contactPhone}`} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 cursor-pointer" style={{ background: '#3b82f6', color: '#fff' }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>
              Text Message
            </a>
            <button onClick={() => setTab('form')} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 cursor-pointer border-none" style={{ background: '#c9a84c', color: '#fff' }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
              Send a Message
            </button>
          </div>
        )}

        {tab === 'form' && (
          submitted ? (
            <div className="text-center py-6">
              <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#4ade80' }} />
              <p className="font-semibold text-lg" style={{ color: '#F5F5DC' }}>Message Sent!</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(245,245,220,0.65)' }}>Chef April will get back to you shortly.</p>
              <button onClick={onClose} className="mt-4 px-6 py-2 rounded-lg text-sm font-semibold cursor-pointer" style={{ background: '#c9a84c', color: '#1a2235' }}>Close</button>
            </div>
          ) : (
            <div className="space-y-3">
              <input className={inputClass} placeholder="Your name *" value={cf.name} onChange={e => setCf(f => ({ ...f, name: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className={inputClass} placeholder="Email" value={cf.email} onChange={e => setCf(f => ({ ...f, email: e.target.value }))} />
                <input className={inputClass} placeholder="Phone" value={cf.phone} onChange={e => setCf(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <textarea className={inputClass} placeholder="Your message *" rows={3} value={cf.message} onChange={e => setCf(f => ({ ...f, message: e.target.value }))} style={{ resize: 'none' }} />
              {submitError && <p className="text-xs" style={{ color: '#fca5a5' }}>{submitError}</p>}
              <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-50 transition-all hover:brightness-110" style={{ background: '#c9a84c', color: '#1a2235' }}>
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function CartPanel({ onClose }: { onClose?: () => void }) {
  const [screen, setScreen] = useState<Screen>('cart');
  const [orderNumber, setOrderNumber] = useState('');
  const [formData, setFormData] = useState<OrderForm>(EMPTY_FORM);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const { contactOpen, contactDefaultTab, openContact, closeContact } = useUI();
  const { getBundleProgress, getSubtotal } = useCart();
  const { isMinMet } = getBundleProgress();
  const subtotal = getSubtotal();
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));

  const handleDeliveryTypeChange = (type: 'delivery' | 'pickup') => {
    setDeliveryType(type);
    setDeliveryFee(0);
  };

  return (
    <div className="flex flex-col h-full bg-card relative">
      {screen === 'cart' && (
        <>
          <CartItems
            onClose={onClose}
            deliveryType={deliveryType}
            setDeliveryType={handleDeliveryTypeChange}
            deliveryFee={deliveryFee}
            tax={tax}
          />
          <div className="px-5 pb-5 bg-card shrink-0">
            <button
              disabled={!isMinMet}
              onClick={() => isMinMet && setScreen('checkout')}
              className="w-full py-3 rounded-lg font-bold transition-all disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed bg-accent text-accent-foreground hover:brightness-110 cursor-pointer"
            >
              Proceed to Checkout →
            </button>
            <p className="text-center text-xs mt-3" style={{ color: 'rgba(100,100,110,0.9)' }}>
              Have questions about your order?{' '}
              <button
                onClick={() => openContact('quick')}
                className="underline underline-offset-2 font-medium cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: '#c9a84c' }}
              >
                Contact us
              </button>
            </p>
          </div>
        </>
      )}
      {screen === 'checkout' && (
        <CheckoutForm
          onBack={() => setScreen('cart')}
          onValidated={(form, fee) => { setFormData(form); setDeliveryFee(fee); setScreen('payment'); }}
          initialForm={formData}
          deliveryType={deliveryType}
          deliveryFee={deliveryFee}
          tax={tax}
          appliedCoupon={appliedCoupon}
          onCouponChange={setAppliedCoupon}
        />
      )}
      {screen === 'payment' && (
        <PaymentScreen
          onBack={() => setScreen('checkout')}
          onSuccess={(num) => { setOrderNumber(num); setScreen('success'); }}
          onError={() => setScreen('error')}
          formData={formData}
          deliveryType={deliveryType}
          deliveryFee={deliveryFee}
          tax={tax}
          appliedCoupon={appliedCoupon}
        />
      )}
      {screen === 'success' && (
        <SuccessScreen orderNumber={orderNumber} onClose={() => { setScreen('cart'); onClose?.(); }} />
      )}
      {screen === 'error' && (
        <ErrorScreen onBack={() => setScreen('payment')} />
      )}
      {contactOpen && <ContactModal onClose={closeContact} defaultTab={contactDefaultTab} />}
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
        <CartPanel />
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
