"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductCard } from "@/components/store/ProductCard";
import { CollectionCard } from "@/components/store/CollectionCard";
import { NewsletterBar } from "@/components/store/NewsletterBar";
import Link from "next/link";

export function HomeClient() {
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const productsQuery = query(
          collection(db, "products"),
          where("status", "==", "Active"),
          limit(4)
        );
        const productsSnapshot = await getDocs(productsQuery);
        setProducts(productsSnapshot.docs.map(doc => ({ slug: doc.id, ...doc.data() })));

        const collectionsSnapshot = await getDocs(collection(db, "collections"));
        setCollections(collectionsSnapshot.docs.map(doc => ({ slug: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="flex flex-col min-h-screen">
      <section className="flex flex-col items-center justify-center p-8 relative overflow-hidden min-h-[90vh]">
        <div className="z-10 flex flex-col items-center justify-center text-center">
          <h1 className="font-twenly text-acid-green leading-none mb-6 tracking-tight" style={{ fontSize: 'clamp(80px, 14vw, 180px)' }}>
            KhUShKhUSh.
          </h1>
          <p className="text-pure-white text-xl md:text-3xl font-medium mb-12 animate-fade-in-up tracking-wider">
            Gen-z We're Coming!
          </p>
          <Link href="/shop">
            <button className="bg-acid-green text-void-black font-twenly text-3xl px-12 py-4 uppercase transition-all duration-300 border-2 border-transparent hover:bg-void-black hover:text-acid-green hover:border-acid-green">
              Shop Now &rarr;
            </button>
          </Link>
        </div>
        <div className="absolute bottom-0 w-full bg-acid-green text-void-black py-4 marquee-container border-y-4 border-void-black font-urdu text-2xl md:text-3xl font-bold z-10">
          <div className="marquee-content space-x-12 px-4 flex items-center">
            <span>دنیا گول ہے منافق ماحول ہے</span>
            <span>•</span>
            <span>بڑے لوگ</span>
            <span>•</span>
            <span>درمیانے افراد</span>
            <span>•</span>
            <span>نوجوان</span>
            <span>•</span>
            <span>موٹے افراد</span>
            <span>•</span>
            <span>دنیا گول ہے منافق ماحول ہے</span>
            <span>•</span>
            <span>بڑے لوگ</span>
            <span>•</span>
            <span>درمیانے افراد</span>
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
            {loading ? (
              [1, 2, 3, 4].map(n => <div key={n} className="bg-void-black border-2 border-gray-800 aspect-square animate-pulse" />)
            ) : collections.map((col: any) => (
              <CollectionCard key={col.slug} title={col.title} slug={col.slug} image={col.image} />
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
            {loading ? (
              [1, 2, 3, 4].map(n => <div key={n} className="bg-void-black border-2 border-gray-800 aspect-[4/5] animate-pulse" />)
            ) : products.map((product: any) => (
              <ProductCard key={product.slug} {...product} image={product.images?.[0] || ""} />
            ))}
          </div>
        </div>
      </section>
      <NewsletterBar />
    </main>
  );
}
