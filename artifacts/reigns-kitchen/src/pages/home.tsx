import React from 'react';
import { Header } from '@/components/Header';
import { CategoryNav } from '@/components/CategoryNav';
import { MealCard } from '@/components/MealCard';
import { CartSidebar } from '@/components/CartSidebar';
import { MENU } from '@/data/menu';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-32 lg:pb-0">
      <Header />
      <CategoryNav />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12 mb-20 flex gap-8 relative items-start">
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="space-y-24">
            {MENU.map((category) => (
              <section 
                key={category.category} 
                id={category.category} 
                className="scroll-mt-32"
              >
                <div className="mb-8 border-b-2 border-border/60 pb-4">
                  <h2 className="text-3xl md:text-4xl font-serif text-primary">
                    {category.category}
                  </h2>
                  {category.familyNote && (
                    <p className="text-muted-foreground mt-2 font-medium tracking-wide">
                      {category.familyNote}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.items.map((item) => (
                    <MealCard 
                      key={item.id} 
                      item={item} 
                      isFamilyMeal={category.category === "Family Meals"} 
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Sidebar Cart */}
        <CartSidebar />
        
      </main>
    </div>
  );
}
