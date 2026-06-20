// ✅ ACTIVE — SEAFOOD POP-UP ORDER APP
import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'wouter';
import { ShoppingCart, X, Plus, Minus, ChevronLeft, CheckCircle, Loader2, Star, Leaf } from 'lucide-react';
import { SEAFOOD_MENU, type MainItem, type SimpleItem } from '@/data/seafood-menu';

const GOLD = '#c9a84c';

// ── Types ──────────────────────────────────────────────────────────────────

type Modifiers = {
  combo: boolean;
  comboDrink: string;
  hushPuppies: boolean;
  sideUpgrade: string;
  sauce: string;
};

type CartLine = {
  cartId: string;
  name: string;
  basePrice: number;
  modifiers: Modifiers | null;
  modifierPrice: number;
  qty: number;
  lineTotal: number;
};

type CheckoutForm = {
  name: string;
  phone: string;
  email: string;
  pickupTime: string;
  note: string;
};

// ── Utilities ──────────────────────────────────────────────────────────────

function calcModifierPrice(mod: Modifiers, item: MainItem): number {
  let extra = 0;
  if (mod.combo) extra += SEAFOOD_MENU.comboAddOn.price;
  if (mod.hushPuppies && item.addOn) extra += item.addOn.price;
  if (mod.sideUpgrade) {
    const tier = SEAFOOD_MENU.sideUpgrades.find((s) => s.label === mod.sideUpgrade);
    if (tier) extra += tier.price;
  }
  return extra;
}

function formatModifiers(mod: Modifiers | null): string {
  if (!mod) return '';
  const parts: string[] = [];
  if (mod.combo) parts.push(`Combo (${mod.comboDrink})`);
  if (mod.hushPuppies) parts.push('+ Hush Puppies');
  if (mod.sideUpgrade) parts.push(mod.sideUpgrade);
  if (mod.sauce) parts.push(`Sauce: ${mod.sauce}`);
  return parts.join(' · ');
}

function generatePickupSlots(): string[] {
  const slots: string[] = [];
  const now = new Date();
  const totalMins = now.getHours() * 60 + now.getMinutes();
  const startMins = Math.ceil((totalMins + 30) / 30) * 30;
  for (let i = 0; i < 20; i++) {
    const slotMins = startMins + i * 30;
    const h = Math.floor(slotMins / 60) % 24;
    const m = slotMins % 60;
    if (h > 22) break;
    const period = h >= 12 ? 'PM' : 'AM';
    const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
    slots.push(`${dh}:${m === 0 ? '00' : '30'} ${period}`);
  }
  return slots;
}

const fp = (n: number) => `$${n.toFixed(2)}`;

// ── Item Modal ──────────────────────────────────────────────────────────────

function MainItemModal({
  item,
  onClose,
  onAdd,
}: {
  item: MainItem;
  onClose: () => void;
  onAdd: (line: Omit<CartLine, 'cartId'>) => void;
}) {
  const defaultMod: Modifiers = { combo: false, comboDrink: SEAFOOD_MENU.comboAddOn.choices[0], hushPuppies: false, sideUpgrade: '', sauce: '' };
  const [mod, setMod] = useState<Modifiers>(defaultMod);
  const [qty, setQty] = useState(1);

  const modPrice = calcModifierPrice(mod, item);
  const unitPrice = item.price + modPrice;
  const lineTotal = unitPrice * qty;

  const handleAdd = () => {
    onAdd({ name: item.name, basePrice: item.price, modifiers: mod, modifierPrice: modPrice, qty, lineTotal });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl z-10 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-base text-black">{item.name}</h2>
              {item.badge === 'House Favorite' && (
                <span style={{ color: GOLD, fontSize: '0.65rem', fontWeight: 700 }}><Star className="w-3 h-3 inline" /> House Favorite</span>
              )}
              {item.badge === 'Vegan' && (
                <span style={{ color: '#2d7a2d', fontSize: '0.65rem', fontWeight: 700 }}><Leaf className="w-3 h-3 inline" /> Vegan</span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            <p className="font-bold mt-1" style={{ color: GOLD }}>{fp(item.price)}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 shrink-0 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Make It a Combo */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
              <div>
                <p className="font-semibold text-sm">{SEAFOOD_MENU.comboAddOn.label} <span style={{ color: GOLD }}>+{fp(SEAFOOD_MENU.comboAddOn.price)}</span></p>
                <p className="text-xs text-gray-500">{SEAFOOD_MENU.comboAddOn.description}</p>
              </div>
              <input
                type="checkbox"
                checked={mod.combo}
                onChange={(e) => setMod((m) => ({ ...m, combo: e.target.checked }))}
                className="w-4 h-4 accent-yellow-600"
              />
            </label>
            {mod.combo && (
              <div className="px-4 pb-4 space-y-1 bg-gray-50 border-t border-gray-100">
                {SEAFOOD_MENU.comboAddOn.choices.map((c) => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="comboDrink"
                      checked={mod.comboDrink === c}
                      onChange={() => setMod((m) => ({ ...m, comboDrink: c }))}
                      className="accent-yellow-600"
                    />
                    <span className="text-sm">{c}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Add-On (hush puppies) */}
          {item.addOn && (
            <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
              <div>
                <p className="font-semibold text-sm">{item.addOn.label} <span style={{ color: GOLD }}>+{fp(item.addOn.price)}</span></p>
              </div>
              <input
                type="checkbox"
                checked={mod.hushPuppies}
                onChange={(e) => setMod((m) => ({ ...m, hushPuppies: e.target.checked }))}
                className="w-4 h-4 accent-yellow-600"
              />
            </label>
          )}

          {/* Side Upgrade */}
          {item.hasSideUpgrade && (
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="font-semibold text-sm mb-2">Side Upgrade (optional)</p>
              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="sideUpgrade" checked={mod.sideUpgrade === ''} onChange={() => setMod((m) => ({ ...m, sideUpgrade: '' }))} className="accent-yellow-600" />
                  <span className="text-sm">Keep included sides</span>
                </label>
                {SEAFOOD_MENU.sideUpgrades.map((u) => (
                  <label key={u.label} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="sideUpgrade" checked={mod.sideUpgrade === u.label} onChange={() => setMod((m) => ({ ...m, sideUpgrade: u.label }))} className="accent-yellow-600" />
                    <span className="text-sm">{u.label} <span style={{ color: GOLD }}>+{fp(u.price)}</span></span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sauce */}
          <div>
            <p className="font-semibold text-sm mb-1.5">Sauce (optional, free)</p>
            <select
              value={mod.sauce}
              onChange={(e) => setMod((m) => ({ ...m, sauce: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            >
              <option value="">No sauce</option>
              {SEAFOOD_MENU.sauceOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Quantity</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
              <span className="font-bold w-5 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100">
          <button
            onClick={handleAdd}
            className="w-full py-3 rounded-xl font-bold text-white text-sm cursor-pointer hover:brightness-110 transition-all"
            style={{ background: '#111' }}
          >
            Add to Cart — {fp(lineTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}

function SimpleItemModal({
  item,
  onClose,
  onAdd,
}: {
  item: SimpleItem;
  onClose: () => void;
  onAdd: (line: Omit<CartLine, 'cartId'>) => void;
}) {
  const [qty, setQty] = useState(1);
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl z-10 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-base">{item.name}</h2>
            <p className="font-bold" style={{ color: GOLD }}>{fp(item.price)}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center justify-between mb-5">
          <p className="font-semibold text-sm">Quantity</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
            <span className="font-bold w-5 text-center">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <button
          onClick={() => { onAdd({ name: item.name, basePrice: item.price, modifiers: null, modifierPrice: 0, qty, lineTotal: item.price * qty }); onClose(); }}
          className="w-full py-3 rounded-xl font-bold text-white text-sm cursor-pointer hover:brightness-110"
          style={{ background: '#111' }}
        >
          Add to Cart — {fp(item.price * qty)}
        </button>
      </div>
    </div>
  );
}

// ── Cart ────────────────────────────────────────────────────────────────────

function CartContents({
  cart,
  onQtyChange,
  onRemove,
  total,
  onCheckout,
}: {
  cart: CartLine[];
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  total: number;
  onCheckout: () => void;
}) {
  if (cart.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Your cart is empty</p>
      </div>
    );
  }
  return (
    <>
      <div className="space-y-3 flex-1 overflow-y-auto">
        {cart.map((line) => (
          <div key={line.cartId} className="border-b border-gray-100 pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight">{line.name}</p>
                {line.modifiers && formatModifiers(line.modifiers) && (
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{formatModifiers(line.modifiers)}</p>
                )}
                <p className="text-xs font-bold mt-1" style={{ color: GOLD }}>{fp(line.lineTotal)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => onQtyChange(line.cartId, line.qty - 1)} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                <span className="text-sm font-bold w-4 text-center">{line.qty}</span>
                <button onClick={() => onQtyChange(line.cartId, line.qty + 1)} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                <button onClick={() => onRemove(line.cartId)} className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-50 text-red-400 ml-1"><X className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 pt-3 mt-3">
        <div className="flex justify-between font-bold mb-3">
          <span>Total</span>
          <span style={{ color: GOLD }}>{fp(total)}</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full py-3 rounded-xl font-bold text-white text-sm cursor-pointer hover:brightness-110 transition-all"
          style={{ background: '#111' }}
        >
          Proceed to Checkout →
        </button>
      </div>
    </>
  );
}

// ── Checkout Form ───────────────────────────────────────────────────────────

function Checkout({
  cart,
  total,
  onBack,
  onSuccess,
}: {
  cart: CartLine[];
  total: number;
  onBack: () => void;
  onSuccess: (orderNumber: string) => void;
}) {
  const slots = useMemo(() => generatePickupSlots(), []);
  const [form, setForm] = useState<CheckoutForm>({ name: '', phone: '', email: '', pickupTime: slots[0] ?? '', note: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Please enter your name.'); return; }
    if (!form.phone.trim()) { setError('Please enter your phone number.'); return; }
    if (!form.email.trim()) { setError('Please enter your email address.'); return; }
    if (!form.pickupTime) { setError('Please select a pickup time.'); return; }
    setError('');
    setLoading(true);

    const items = cart.map((line) => ({
      name: line.name,
      qty: line.qty,
      price: line.basePrice,
      lineTotal: line.lineTotal,
      modifiers: line.modifiers ? formatModifiers(line.modifiers) : '',
    }));

    try {
      const res = await fetch('/api/seafood-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items, total: total.toFixed(2) }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.orderNumber ?? 'RK-???');
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not connect. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all';
  const labelClass = 'block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="font-bold text-base">Your Details</h2>
      </div>

      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 text-sm flex justify-between">
        <span className="text-gray-600">{cart.length} item{cart.length !== 1 ? 's' : ''} · Pickup</span>
        <span className="font-bold" style={{ color: GOLD }}>{fp(total)}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input className={inputClass} placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Phone Number *</label>
          <input className={inputClass} type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Email Address *</label>
          <input className={inputClass} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Pickup Time *</label>
          <select className={inputClass} value={form.pickupTime} onChange={(e) => setForm((f) => ({ ...f, pickupTime: e.target.value }))}>
            {slots.length === 0 ? (
              <option>No slots available — please call us</option>
            ) : (
              slots.map((s) => <option key={s}>{s}</option>)
            )}
          </select>
          <p className="text-xs text-gray-400 mt-1">Next available 30-minute slots from now</p>
        </div>
        <div>
          <label className={labelClass}>Special Instructions</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder="Allergies, special requests..."
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          />
        </div>

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white text-sm cursor-pointer hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: '#111' }}
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing order…</> : `Place Order — ${fp(total)}`}
        </button>
      </div>
    </div>
  );
}

// ── Success ─────────────────────────────────────────────────────────────────

function SuccessScreen({ orderNumber, onClose }: { orderNumber: string; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
      <CheckCircle className="w-16 h-16 mb-4" style={{ color: GOLD }} />
      <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
      <p className="text-gray-600 text-sm mb-1">Order <span className="font-bold text-black">{orderNumber}</span></p>
      <p className="text-gray-500 text-sm mb-6">We've sent a confirmation to your email. See you soon!</p>
      <p className="text-sm italic mb-6" style={{ color: GOLD, fontFamily: "'Great Vibes', cursive", fontSize: '1.3rem' }}>
        Royal Flavor. Made With Love.
      </p>
      <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer hover:brightness-110" style={{ background: '#111', color: '#fff' }}>
        Order Again
      </button>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

type Category = 'mains' | 'sides' | 'desserts' | 'drinks';

export default function OrderPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedMain, setSelectedMain] = useState<MainItem | null>(null);
  const [selectedSimple, setSelectedSimple] = useState<SimpleItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('mains');
  const [screen, setScreen] = useState<'menu' | 'checkout' | 'success'>('menu');
  const [orderNumber, setOrderNumber] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  const total = useMemo(() => cart.reduce((s, l) => s + l.lineTotal, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart]);

  const addLine = useCallback((line: Omit<CartLine, 'cartId'>) => {
    setCart((c) => [...c, { ...line, cartId: `${Date.now()}-${Math.random()}` }]);
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setCart((c) => c.filter((l) => l.cartId !== id));
    } else {
      setCart((c) => c.map((l) => l.cartId === id ? { ...l, qty, lineTotal: (l.basePrice + l.modifierPrice) * qty } : l));
    }
  }, []);

  const removeLine = useCallback((id: string) => {
    setCart((c) => c.filter((l) => l.cartId !== id));
  }, []);

  const handleSuccess = (num: string) => { setOrderNumber(num); setScreen('success'); };
  const handleReset = () => { setCart([]); setScreen('menu'); setOrderNumber(''); setCartOpen(false); };

  const categories: { key: Category; label: string }[] = [
    { key: 'mains', label: 'Mains' },
    { key: 'sides', label: 'Sides' },
    { key: 'desserts', label: 'Desserts' },
    { key: 'drinks', label: 'Drinks' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
              <img src="/images/logo.png" alt="Reigns Kitchen" className="h-9 object-contain" />
            </a>
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white text-sm cursor-pointer hover:brightness-110 transition-all"
            style={{ background: '#111' }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-black" style={{ background: GOLD }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Category Tabs ───────────────────────────────── */}
      <div className="sticky top-[57px] z-20 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 flex gap-0 overflow-x-auto scrollbar-hide">
          {categories.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className="px-5 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-all border-b-2"
              style={activeCategory === key
                ? { borderColor: GOLD, color: '#111' }
                : { borderColor: 'transparent', color: '#888' }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex gap-6 items-start">

        {/* Menu items */}
        <div className="flex-1 min-w-0 pb-28 lg:pb-0">
          {activeCategory === 'mains' && (
            <div className="space-y-3">
              {SEAFOOD_MENU.mains.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start gap-3 cursor-pointer hover:border-yellow-300 transition-all"
                  onClick={() => setSelectedMain(item)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm">{item.name}</p>
                      {item.badge === 'House Favorite' && <span className="text-xs font-bold" style={{ color: GOLD }}><Star className="w-3 h-3 inline" /> Fav</span>}
                      {item.badge === 'Vegan' && <span className="text-xs font-bold text-green-600"><Leaf className="w-3 h-3 inline" /> Vegan</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
                    {item.addOn && <p className="text-xs mt-1" style={{ color: GOLD }}>{item.addOn.label} +{fp(item.addOn.price)}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold" style={{ color: GOLD }}>{item.priceNote ?? fp(item.price)}</p>
                    <button className="mt-1 w-7 h-7 rounded-full flex items-center justify-center text-white cursor-pointer" style={{ background: '#111' }}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeCategory !== 'mains' && (
            <div className="space-y-3">
              {SEAFOOD_MENU[activeCategory].map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-yellow-300 transition-all"
                  onClick={() => setSelectedSimple(item as SimpleItem)}
                >
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.name}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <p className="font-bold" style={{ color: GOLD }}>{fp(item.price)}</p>
                    <button className="w-7 h-7 rounded-full flex items-center justify-center text-white cursor-pointer" style={{ background: '#111' }}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop cart sidebar */}
        <div className="hidden lg:flex flex-col w-80 sticky top-32 bg-white rounded-2xl border border-gray-100 p-4 max-h-[calc(100vh-10rem)] overflow-hidden">
          <h3 className="font-bold text-base mb-3 pb-2 border-b border-gray-100">Your Order</h3>
          <div className="flex-1 overflow-y-auto">
            <CartContents cart={cart} onQtyChange={updateQty} onRemove={removeLine} total={total} onCheckout={() => setScreen('checkout')} />
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-20 lg:hidden">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-between px-5 cursor-pointer shadow-lg hover:brightness-110"
            style={{ background: '#111' }}
          >
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: GOLD, color: '#111' }}>{cartCount}</span>
            <span>View Cart</span>
            <span style={{ color: GOLD }}>{fp(total)}</span>
          </button>
        </div>
      )}

      {/* Mobile cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="relative bg-white rounded-t-2xl z-10 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-base">Your Order</h3>
              <button onClick={() => setCartOpen(false)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <CartContents cart={cart} onQtyChange={updateQty} onRemove={removeLine} total={total} onCheckout={() => { setCartOpen(false); setScreen('checkout'); }} />
            </div>
          </div>
        </div>
      )}

      {/* Checkout overlay */}
      {screen === 'checkout' && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-white w-full max-w-md h-[95vh] md:h-auto md:max-h-[90vh] rounded-t-2xl md:rounded-2xl z-10 flex flex-col overflow-hidden">
            <Checkout cart={cart} total={total} onBack={() => setScreen('menu')} onSuccess={handleSuccess} />
          </div>
        </div>
      )}

      {/* Success overlay */}
      {screen === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <SuccessScreen orderNumber={orderNumber} onClose={handleReset} />
        </div>
      )}

      {/* Item modals */}
      {selectedMain && <MainItemModal item={selectedMain} onClose={() => setSelectedMain(null)} onAdd={addLine} />}
      {selectedSimple && <SimpleItemModal item={selectedSimple} onClose={() => setSelectedSimple(null)} onAdd={addLine} />}
    </div>
  );
}
