import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero banner */}
        <div className="bg-primary py-16 px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-3">
            About Reigns Kitchen
          </h1>
          <p className="text-accent text-lg font-medium">
            Chef-Driven. Culture-Rooted. Always Elevated.
          </p>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Chef intro */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start mb-16">
            <div className="w-full md:w-80 shrink-0">
              <img
                src="/images/chef-hero-2.jpg"
                alt="Chef April Winston"
                className="w-full rounded-2xl object-cover shadow-lg"
                style={{ maxHeight: '420px', objectPosition: 'center top' }}
              />
            </div>

            <div className="flex-1">
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">
                Meet Your Chef
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
                Chef April Winston
              </h2>

              <div className="prose prose-sm max-w-none text-foreground/80 space-y-4 leading-relaxed">
                <p>
                  Chef April Winston is the visionary behind Reigns Kitchen, a Washington, DC–based culinary brand known for bold flavors, elevated comfort food, and globally inspired meals.
                </p>
                <p>
                  With a passion for both culture and cuisine, Chef April has built Reigns Kitchen into more than just a meal prep service — it's a chef-driven experience designed to bring high-quality, flavorful meals into everyday life. Her approach blends Southern, Creole, and international influences, creating dishes that feel both familiar and exciting.
                </p>
                <p>
                  Chef April's work has been recognized on <strong>FOX5's Lion Lunch Hour</strong> and she has contributed to <strong>Gordon Ramsay's Secret Service Restaurant</strong>. She has also partnered with organizations such as the Greater Washington Urban League, corporate clients, and community initiatives, consistently delivering food that reflects excellence, creativity, and care.
                </p>
              </div>
            </div>
          </div>

          {/* Brand statement */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#1a2235' }}>
            <div className="px-8 py-10 md:px-14 md:py-12">
              <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-widest mb-4">
                Our Philosophy
              </p>
              <blockquote className="font-serif text-2xl md:text-3xl text-white leading-snug mb-6">
                "Every meal is crafted with intention — from ingredient selection to final presentation."
              </blockquote>
              <div className="space-y-3 text-white/70 text-sm leading-relaxed max-w-2xl">
                <p>
                  At Reigns Kitchen, the goal is the same whether you're ordering weekly meal prep or enjoying a specialty chef feature: to provide food that nourishes, excites, and feels like it was made just for you.
                </p>
                <p>
                  Reigns Kitchen stands for quality, consistency, and culture — bringing people together through food that is both accessible and elevated.
                </p>
                <p className="text-[#c9a84c] font-medium italic">
                  Welcome to the experience.
                </p>
              </div>
            </div>
          </div>

          {/* Recognition */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "FOX5 Lion Lunch Hour", desc: "Recognized for culinary excellence and bold flavors on local television." },
              { title: "Gordon Ramsay's Secret Service", desc: "Contributed expertise to one of television's most acclaimed culinary productions." },
              { title: "Greater Washington Urban League", desc: "Community partnerships delivering food that reflects excellence and care." },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="rounded-xl p-6 border border-border bg-card"
              >
                <h4 className="font-serif font-bold text-primary text-base mb-2">{title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 text-center">
            <p className="text-muted-foreground mb-5 text-base">
              Ready to experience chef-crafted meals delivered to your door every Friday?
            </p>
            <a
              href="/"
              className="inline-block bg-[#c9a84c] text-[#1a1a1a] px-8 py-4 rounded font-bold uppercase tracking-wider hover:brightness-110 transition-all text-sm"
            >
              View This Week's Menu →
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
