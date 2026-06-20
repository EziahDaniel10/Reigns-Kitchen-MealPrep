// ✅ ACTIVE — SEAFOOD POP-UP BRANDING PAGE
import React from 'react';
import { Link } from 'wouter';
import { SEAFOOD_MENU } from '@/data/seafood-menu';

const GOLD = '#c9a84c';
const GOLD2 = '#D4AF37';

function BrushHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <span
        style={{
          background: '#111111',
          color: '#ffffff',
          fontWeight: 900,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '5px 20px 5px 14px',
          display: 'inline-block',
          fontSize: '0.85rem',
          clipPath: 'polygon(0 0, 100% 0, 96% 100%, 0 100%)',
        }}
      >
        {children}
      </span>
    </div>
  );
}

function GoldBrushHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <span
        style={{
          background: GOLD2,
          color: '#111111',
          fontWeight: 900,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '5px 20px 5px 14px',
          display: 'inline-block',
          fontSize: '0.85rem',
          clipPath: 'polygon(0 0, 100% 0, 96% 100%, 0 100%)',
        }}
      >
        {children}
      </span>
    </div>
  );
}

function MenuRow({
  name,
  description,
  price,
  priceNote,
  badge,
  addOnNote,
}: {
  name: string;
  description: string;
  price: number;
  priceNote?: string;
  badge?: string | null;
  addOnNote?: string;
}) {
  return (
    <div className="py-2.5 border-b border-gray-100 last:border-0">
      {badge === 'House Favorite' && (
        <p style={{ color: GOLD, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>
          ★ House Favorite
        </p>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm uppercase tracking-wide text-black leading-tight flex items-center gap-1.5 flex-wrap">
            {name}
            {badge === 'Vegan' && (
              <span style={{ color: '#2d7a2d', fontSize: '0.65rem', border: '1px solid #2d7a2d', borderRadius: '3px', padding: '1px 5px', fontWeight: 700, letterSpacing: '0.08em' }}>
                🌿 VEGAN
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
          {addOnNote && (
            <p style={{ color: GOLD, fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>{addOnNote}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span style={{ color: GOLD, fontWeight: 800, fontSize: '1.1rem' }}>
            {priceNote ?? `$${price % 1 === 0 ? price : price.toFixed(2)}`}
          </span>
        </div>
      </div>
    </div>
  );
}

function SimpleRow({ name, price }: { name: string; price: number }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-black font-medium">{name}</span>
      <span className="text-sm font-bold" style={{ color: GOLD }}>${price % 1 === 0 ? price : price.toFixed(2)}</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#FFFDF7', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Brand Header ─────────────────────────────── */}
      <header className="text-center pt-8 pb-6 px-4">
        <div className="flex items-center justify-center mb-1">
          <img src="/images/logo.png" alt="Reigns Kitchen" style={{ height: '90px', objectFit: 'contain' }} />
        </div>
        <div className="flex items-center justify-center gap-3 my-1">
          <div style={{ height: '1px', width: '40px', background: GOLD }} />
          <p style={{ color: GOLD, fontWeight: 800, letterSpacing: '0.35em', fontSize: '0.7rem', textTransform: 'uppercase' }}>
            KITCHEN
          </p>
          <div style={{ height: '1px', width: '40px', background: GOLD }} />
        </div>
        <p style={{ color: '#222', fontWeight: 600, letterSpacing: '0.2em', fontSize: '0.7rem', textTransform: 'uppercase', marginTop: '4px' }}>
          {SEAFOOD_MENU.tagline}
        </p>
        <p style={{ color: GOLD, fontStyle: 'italic', fontFamily: "'Great Vibes', cursive", fontSize: '1.6rem', marginTop: '4px' }}>
          {SEAFOOD_MENU.thankYouNote}
        </p>
        <div className="mt-5">
          <Link href="/order">
            <a
              style={{
                background: '#111',
                color: '#fff',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '12px 36px',
                display: 'inline-block',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                textDecoration: 'none',
              }}
            >
              Pre-Order Now →
            </a>
          </Link>
        </div>
      </header>

      {/* ── Gold divider ─────────────────────────────── */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

      {/* ── Menu Table ───────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left — MAINS */}
          <div className="md:col-span-2">
            <BrushHeader>MAINS</BrushHeader>
            <div>
              {SEAFOOD_MENU.mains.map((item) => (
                <MenuRow
                  key={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  priceNote={item.priceNote}
                  badge={item.badge}
                  addOnNote={item.addOn ? `${item.addOn.label} +$${item.addOn.price}` : undefined}
                />
              ))}
            </div>
          </div>

          {/* Right — ADD-ONS, SIDES, DESSERTS, DRINKS */}
          <div className="space-y-6">

            {/* ADD-ONS */}
            <div>
              <GoldBrushHeader>ADD-ONS</GoldBrushHeader>
              <div className="py-2 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold text-sm uppercase tracking-wide">{SEAFOOD_MENU.comboAddOn.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{SEAFOOD_MENU.comboAddOn.description}:</p>
                    {SEAFOOD_MENU.comboAddOn.choices.map((c) => (
                      <p key={c} className="text-xs text-gray-500">• {c}</p>
                    ))}
                  </div>
                  <span style={{ color: GOLD, fontWeight: 800, fontSize: '1rem', whiteSpace: 'nowrap' }}>
                    +${SEAFOOD_MENU.comboAddOn.price}
                  </span>
                </div>
              </div>
            </div>

            {/* SIDES */}
            <div>
              <GoldBrushHeader>SIDES</GoldBrushHeader>
              {SEAFOOD_MENU.sides.map((s) => (
                <SimpleRow key={s.id} name={s.name} price={s.price} />
              ))}
            </div>

            {/* DESSERTS */}
            <div>
              <GoldBrushHeader>DESSERTS</GoldBrushHeader>
              {SEAFOOD_MENU.desserts.map((d) => (
                <SimpleRow key={d.id} name={d.name} price={d.price} />
              ))}
            </div>

            {/* DRINKS */}
            <div>
              <GoldBrushHeader>DRINKS</GoldBrushHeader>
              {SEAFOOD_MENU.drinks.map((d) => (
                <SimpleRow key={d.id} name={d.name} price={d.price} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom strips ───────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <div style={{ border: `1px solid ${GOLD}`, padding: '10px 14px' }}>
            <p style={{ fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '6px' }}>
              SIDE UPGRADES
            </p>
            {SEAFOOD_MENU.sideUpgrades.map((u) => (
              <p key={u.label} className="text-xs text-center text-gray-700">{u.label} <span style={{ color: GOLD, fontWeight: 700 }}>+${u.price.toFixed(2)}</span></p>
            ))}
          </div>
          <div style={{ border: `1px solid ${GOLD}`, padding: '10px 14px' }}>
            <p style={{ fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '6px' }}>
              SAUCE OPTIONS
            </p>
            <p className="text-xs text-center text-gray-700">{SEAFOOD_MENU.sauceOptions.join(' · ')}</p>
          </div>
        </div>

        {/* ── Pre-Order Callout ────────────────────────── */}
        <div style={{ border: `2px solid ${GOLD}`, marginTop: '2rem', padding: '1.5rem', textAlign: 'center' }}>
          <GoldBrushHeader>PRE-ORDER IS AVAILABLE!</GoldBrushHeader>
          <p style={{ fontSize: '0.9rem', color: '#333', marginTop: '8px' }}>
            {SEAFOOD_MENU.preorderNote}
          </p>
          <Link href="/order">
            <a
              style={{
                display: 'inline-block',
                marginTop: '14px',
                background: '#111',
                color: '#fff',
                padding: '10px 28px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Start My Order →
            </a>
          </Link>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────── */}
      <footer
        style={{
          background: '#111',
          color: '#fff',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '2rem',
        }}
      >
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
          📱 FOLLOW ME {SEAFOOD_MENU.instagram.toUpperCase()}
        </span>
        <span style={{ color: GOLD, fontStyle: 'italic', fontFamily: "'Great Vibes', cursive", fontSize: '1.2rem' }}>
          Royal Flavor. Made With Love.
        </span>
      </footer>
    </div>
  );
}
