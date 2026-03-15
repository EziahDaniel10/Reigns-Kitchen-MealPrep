import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { InfoBar } from '@/components/InfoBar';
import { PromoBanner } from '@/components/PromoBanner';
import { CategoryNav } from '@/components/CategoryNav';
import { MealCard } from '@/components/MealCard';
import { CartSidebar } from '@/components/CartSidebar';
import { Footer } from '@/components/Footer';
import { CONFIG } from '@/data/menu';

export default function Home() {
  let globalIndex = 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <Hero />
      <InfoBar />
      <PromoBanner />
      <CategoryNav />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <div className="flex gap-8 items-start relative">
          <div className="flex-1 min-w-0 space-y-20 pb-20">
            {CONFIG.categories.map((category) => (
              <section key={category.id} id={category.id} className="scroll-mt-36">
                <div className="flex flex-col mb-8">
                  <h2 className="font-serif text-3xl text-primary font-bold">{category.name}</h2>
                  <p className="italic text-muted-foreground mt-1">{category.subtitle}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

          <div className="hidden lg:block">
            <CartSidebar />
          </div>
        </div>
      </main>

      <Footer />
      
      <div className="lg:hidden">
        <CartSidebar />
      </div>
    </div>
  );
}
