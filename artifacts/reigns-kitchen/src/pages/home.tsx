import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { InfoBar } from '@/components/InfoBar';
import { PromoBanner } from '@/components/PromoBanner';
import { FamilyBanner } from '@/components/FamilyBanner';
import { CategoryNav } from '@/components/CategoryNav';
import { MealCard } from '@/components/MealCard';
import { CartSidebar } from '@/components/CartSidebar';
import { Footer } from '@/components/Footer';
import { CONFIG } from '@/data/menu';

function FamilyPricingBar() {
  return (
    <div
      className="rounded-xl mb-6 md:mb-8 overflow-hidden"
      style={{ background: '#1a2235' }}
    >
      {/* Price tiers */}
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/10">
        {[
          { label: '1 Meal', price: '$54.99' },
          { label: '2 Meals', price: '$99.99' },
          { label: '3 Meals', price: '$139.99' },
        ].map(({ label, price }) => (
          <div
            key={label}
            className="flex-1 flex flex-col items-center justify-center py-4 px-6 gap-0.5"
          >
            <span style={{ color: '#F5F5DC', fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.7 }}>
              {label}
            </span>
            <span style={{ color: '#c9a84c', fontWeight: 700, fontSize: '1.4rem' }}>
              {price}
            </span>
          </div>
        ))}
      </div>
      {/* Description */}
      <div
        className="px-6 py-4 border-t text-center space-y-1"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <p style={{ color: '#F5F5DC', fontSize: '0.9rem', opacity: 0.85 }}>
          Chef-crafted, ready-to-heat meals designed for sharing
        </p>
        <p style={{ color: '#c9a84c', fontStyle: 'italic', fontSize: '0.88rem' }}>
          "Skip cooking this week — let us feed the whole family"
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  let globalIndex = 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <Hero />
      <InfoBar />
      <PromoBanner />
      <FamilyBanner />
      <CategoryNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 md:py-12">
        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0 space-y-14 md:space-y-20 pb-28 lg:pb-8">
            {CONFIG.categories.map((category) => (
              <section key={category.id} id={category.id} className="scroll-mt-36">
                <div className="flex flex-col mb-5 md:mb-8">
                  <h2 className="font-serif text-2xl md:text-3xl text-primary font-bold">
                    {category.name}
                  </h2>
                  <p className="italic text-muted-foreground mt-1 text-sm">
                    {category.subtitle}
                  </p>
                </div>

                {category.isFamily && <FamilyPricingBar />}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {category.items.map((item) => {
                    const currentIndex = globalIndex++;
                    return (
                      <MealCard
                        key={item.id}
                        item={item}
                        itemIndex={currentIndex}
                        isFamily={category.isFamily}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          <CartSidebar />
        </div>
      </main>

      <Footer />
    </div>
  );
}
