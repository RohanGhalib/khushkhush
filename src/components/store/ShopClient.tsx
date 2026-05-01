"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductCard } from "@/components/store/ProductCard";

export function ShopClient() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, "products"), where("status", "!=", "Draft"));
        const snapshot = await getDocs(q);
        setProducts(snapshot.docs.map(doc => ({ slug: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-card-bg">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="mb-12 border-b-2 border-gray-800 pb-4">
          <h1 className="font-twenly text-5xl md:text-7xl text-acid-green uppercase tracking-wide">
            SHOP ALL.
          </h1>
          <p className="font-sans font-bold text-gray-400 uppercase tracking-widest mt-2">
            The Complete Archive
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => <div key={n} className="bg-void-black border-2 border-gray-800 aspect-[4/5] animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="font-twenly text-3xl text-gray-500 uppercase">NO PRODUCTS FOUND.</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.slug} {...product} image={product.images?.[0] || ""} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
