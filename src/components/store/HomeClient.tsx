"use client";

import { ProductCard } from "@/components/store/ProductCard";
import { CollectionCard } from "@/components/store/CollectionCard";
import { NewsletterBar } from "@/components/store/NewsletterBar";
import Link from "next/link";

interface HomeClientProps {
  products: any[];
  collections: any[];
}

/**
 * Pure client component — receives products and collections as props from
 * the ISR server component (app/(store)/page.tsx).
 */
export function HomeClient({ products, collections }: HomeClientProps) {
  return (
    <main className="flex flex-col min-h-screen">
      {/* UPGRADED HERO SECTION */}
      {/* UPGRADED HERO SECTION */}
      <section className="relative flex flex-col min-h-screen bg-void-black border-b-8 border-acid-green overflow-hidden">
        {/* Background Noise/Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--acid-green) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>

        {/* Massive Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] whitespace-nowrap overflow-hidden w-full text-center">
          <span className="font-twenly text-[40vw] font-black text-acid-green leading-none">
            KK.
          </span>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center justify-center">
          {/* Top Label */}
          <div className="bg-acid-green text-void-black font-sans font-black px-4 py-1 mb-8 uppercase tracking-[0.3em] text-xs md:text-sm animate-fade-in-up">
            Aggressive Streetwear Culture
          </div>

          {/* Staggered Main Heading */}
          <div className="relative mb-12 w-full flex justify-center">
            <div className="relative">
              <h1 className="font-twenly text-pure-white leading-[0.9] tracking-tighter flex flex-col items-center" style={{ fontSize: 'clamp(70px, 20vw, 240px)' }}>
                <span className="block transform -translate-x-4 md:-translate-x-12 hover:text-acid-green transition-colors cursor-default">
                  KhUSh
                </span>
                <span className="block transform translate-x-4 md:translate-x-12 text-acid-green">
                  KhUSh.
                </span>
              </h1>
              
              {/* Floating Brutalist Badge - Positioned over the 'h' */}
              <div className="absolute -top-8 -right-8 md:-top-12 md:-right-16 bg-pure-white text-void-black p-3 md:p-4 rotate-12 border-4 border-acid-green hidden sm:block z-20 shadow-[8px_8px_0px_rgba(200,255,0,0.5)]">
                <p className="font-twenly font-black text-xl md:text-2xl leading-none">
                  BVIBE<br/>EST. 2024
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16 w-full justify-between mt-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-urdu text-5xl md:text-7xl text-pure-white font-bold leading-[1.2] mb-4">
                نہ شرم، نہ لحاظ<br/>
                <span className="text-acid-green">صرف انداز</span>
              </h2>
            </div>

            <div className="flex flex-col items-center md:items-end gap-6">
              <p className="text-pure-white/80 text-lg md:text-xl font-bold uppercase tracking-widest text-center md:text-right max-w-xs leading-relaxed">
                Forget the mid. Wear the madness.
              </p>
              <Link href="/shop" className="group relative">
                <div className="absolute inset-0 bg-pure-white translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
                <button className="relative bg-acid-green text-void-black font-twenly text-3xl md:text-4xl px-8 md:px-12 py-4 md:py-5 uppercase border-2 border-void-black group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform">
                  Shop Drop 01 &rarr;
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Diagonal Marquee System - Optimized for Mobile */}
        <div className="relative w-full mt-auto pt-16 pb-16 md:pt-40 md:pb-40 overflow-visible select-none">
          {/* Secondary Patterned Stripe */}
          <div 
            className="absolute top-1/2 left-[-25vw] w-[150vw] h-14 md:h-20 bg-acid-green -rotate-2 md:-rotate-6 border-y-2 md:border-y-4 border-void-black z-10 opacity-60 -translate-y-1/2"
            style={{ 
              backgroundImage: 'radial-gradient(var(--void-black) 2px, transparent 2px)', 
              backgroundSize: '10px 10px' 
            }} 
          />

          {/* Primary Text Marquee */}
          <div className="relative left-[-25vw] w-[150vw] bg-acid-green text-void-black py-3 md:py-5 marquee-container border-y-4 md:border-y-8 border-void-black font-urdu text-3xl md:text-5xl font-black z-20 overflow-hidden rotate-1 md:rotate-2 shadow-[0px_0px_60px_rgba(0,0,0,0.6)]">
            <div className="marquee-content space-x-12 px-4 flex items-center">
              <span>دنیا گول ہے منافق ماحول ہے</span>
              <span className="font-twenly text-4xl md:text-6xl italic opacity-30">X X X</span>
              <span>صرف اصلی لوگ</span>
              <span className="font-twenly text-4xl md:text-6xl italic opacity-30">X X X</span>
              <span>کوئی ڈر نہیں</span>
              <span className="font-twenly text-4xl md:text-6xl italic opacity-30">X X X</span>
              <span>KHUSHKHUSH VIBE</span>
              <span className="font-twenly text-4xl md:text-6xl italic opacity-30">X X X</span>
              <span>دنیا گول ہے منافق ماحول ہے</span>
              <span className="font-twenly text-4xl md:text-6xl italic opacity-30">X X X</span>
              <span>صرف اصلی لوگ</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 bg-void-black z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12 border-b-2 border-gray-800 pb-4">
            <h2 className="font-twenly text-5xl md:text-6xl text-pure-white uppercase tracking-wide">
              Collections.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((col: any) => (
              <CollectionCard key={col.slug} title={col.title_en || col.title} slug={col.slug} image={col.image} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 bg-card-bg z-10 brutalist-border-green">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12 border-b-2 border-gray-800 pb-4">
            <h2 className="font-twenly text-5xl md:text-6xl text-acid-green uppercase tracking-wide">
              Latest Drop.
            </h2>
            <Link href="/shop" className="font-sans font-bold text-acid-green hover:text-pure-white uppercase tracking-widest hidden md:block">
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 font-sans uppercase">No products found.</div>
            ) : (
              products.map((product: any) => (
                <ProductCard key={product.slug} {...product} image={product.images?.[0] || ""} />
              ))
            )}
          </div>
        </div>
      </section>
      <NewsletterBar />
    </main>
  );
}
