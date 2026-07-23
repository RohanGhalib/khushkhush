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
      {/* HIGH-ENERGY BRUTALIST HERO SECTION (MATCHING COMING SOON DESIGN) */}
      <section className="relative flex flex-col min-h-[90vh] bg-acid-green text-void-black border-b-8 border-void-black overflow-hidden selection:bg-void-black selection:text-acid-green">
        
        {/* Brutalist Background Geometric Lines & Marquees */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Angle Background Slashes */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-0 left-0 w-full h-20 bg-void-black -rotate-1 transform origin-top-left" />
            <div className="absolute bottom-0 right-0 w-full h-20 bg-void-black -rotate-1 transform origin-bottom-right" />
            <div className="absolute top-1/4 -left-20 w-[120%] h-36 border-y-4 border-void-black rotate-3" />
            <div className="absolute bottom-1/4 -left-20 w-[120%] h-36 border-y-4 border-void-black -rotate-2" />
          </div>

          {/* Background Marquee 1 (Top) */}
          <div className="absolute top-12 left-0 w-full overflow-hidden whitespace-nowrap opacity-20">
            <div className="inline-block font-twenly text-6xl md:text-9xl text-void-black font-black uppercase" style={{ animation: 'marquee 28s linear infinite' }}>
              KhushKhush. KhushKhush. KhushKhush. KhushKhush. KhushKhush. KhushKhush. KhushKhush. KhushKhush.
            </div>
          </div>

          {/* Background Marquee 2 (Bottom) */}
          <div className="absolute bottom-12 left-0 w-full overflow-hidden whitespace-nowrap opacity-20">
            <div className="inline-block font-twenly text-6xl md:text-9xl text-void-black font-black uppercase" style={{ animation: 'marquee-reverse 28s linear infinite' }}>
              GEN-Z MEME CULTURE. NO MID CLOTHES. DROP 01 LIVE. GEN-Z MEME CULTURE. NO MID CLOTHES.
            </div>
          </div>

          {/* Floating Brutalist Accents */}
          <div className="absolute top-[12%] right-[8%] w-12 h-12 bg-void-black rotate-12 animate-bounce hidden md:block" />
          <div className="absolute bottom-[18%] left-[6%] w-16 h-16 border-4 border-void-black -rotate-12 hidden md:block" />
          <div className="absolute top-1/2 right-[4%] font-twenly text-void-black text-5xl font-black rotate-90 opacity-20 hidden lg:block tracking-widest">
            DROP 01 LIVE
          </div>
        </div>

        {/* Hero Main Content Container */}
        <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 flex flex-col items-center justify-center text-center">

          {/* Iconic Coming Soon Style Logo Box */}
          <div className="bg-void-black px-6 sm:px-12 py-4 sm:py-6 mb-6 sm:mb-8 transform -rotate-2 hover:rotate-0 transition-transform duration-300 cursor-default max-w-fit mx-auto border-4 border-void-black shadow-[10px_10px_0px_rgba(0,0,0,0.85)]">
            <h1 className="font-twenly text-5xl sm:text-7xl md:text-9xl text-acid-green font-black tracking-tighter uppercase whitespace-nowrap leading-none">
              KhushKhush.
            </h1>
          </div>

          {/* English Subtitle */}
          <div className="flex flex-col items-center gap-2 max-w-3xl">
            <p className="font-twenly text-lg sm:text-2xl md:text-3xl text-void-black font-black uppercase tracking-widest mt-1">
              FORGET THE MID. WEAR THE MADNESS.
            </p>
          </div>

          {/* Badges Row */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
            <div className="bg-void-black text-acid-green font-sans font-black px-4 py-2 uppercase text-xs sm:text-sm border-2 border-void-black shadow-[4px_4px_0px_#000000]">
              BVIBE APPROVED
            </div>
            <div className="bg-void-black text-acid-green font-sans font-black px-4 py-2 uppercase text-xs sm:text-sm border-2 border-void-black shadow-[4px_4px_0px_#000000]">
              EST. 2026
            </div>
            <div className="bg-void-black text-acid-green font-sans font-black px-4 py-2 uppercase text-xs sm:text-sm border-2 border-void-black shadow-[4px_4px_0px_#000000]">
              GEN-Z MEME CULTURE
            </div>
          </div>

          {/* Call To Action Button */}
          <Link href="/shop" className="mt-10 group relative inline-block">
            <div className="absolute inset-0 bg-void-black translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-200" />
            <div className="relative bg-pure-white border-4 border-void-black px-8 sm:px-12 py-4 sm:py-5 flex items-center gap-3 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-200">
              <span className="font-twenly text-void-black text-2xl sm:text-4xl font-black uppercase tracking-tight">
                SHOP DROP 01 &rarr;
              </span>
            </div>
          </Link>
        </div>

        {/* Animated Marquee Strip at Bottom of Hero */}
        <div className="relative w-full bg-void-black text-acid-green py-4 border-t-4 border-void-black text-2xl md:text-4xl font-black z-20 overflow-hidden whitespace-nowrap shadow-[0px_-4px_20px_rgba(0,0,0,0.5)]">
          <div className="marquee-content space-x-12 px-4 flex items-center">
            <span className="font-urdu">دنیا گول ہے منافق ماحول ہے</span>
            <span className="font-twenly text-3xl md:text-5xl italic opacity-40 text-pure-white">X X X</span>
            <span className="font-urdu">صرف اصلی لوگ</span>
            <span className="font-twenly text-3xl md:text-5xl italic opacity-40 text-pure-white">X X X</span>
            <span className="font-urdu">کوئی ڈر نہیں</span>
            <span className="font-twenly text-3xl md:text-5xl italic opacity-40 text-pure-white">X X X</span>
            <span className="font-twenly text-3xl md:text-5xl uppercase tracking-wider font-black text-acid-green">KHUSHKHUSH VIBE</span>
            <span className="font-twenly text-3xl md:text-5xl italic opacity-40 text-pure-white">X X X</span>
            <span className="font-urdu">دنیا گول ہے منافق ماحول ہے</span>
            <span className="font-twenly text-3xl md:text-5xl italic opacity-40 text-pure-white">X X X</span>
            <span className="font-urdu">صرف اصلی لوگ</span>
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
