"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductCard } from "@/components/store/ProductCard";

interface Product {
  slug: string;
  name_en: string;
  name_ur: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  status: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(
          collection(db, "products"),
          where("status", "!=", "Draft")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data() as Product);
        // We can't orderBy on a different field when using a != inequality in Firestore,
        // so we sort locally or adjust the index. Local sort is fine for a small catalog.
        setProducts(data);
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
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-void-black border-2 border-gray-800 aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="font-twenly text-3xl text-gray-500 uppercase">NO PRODUCTS FOUND.</h2>
            <p className="font-sans text-gray-600 font-bold uppercase mt-2">Check back later for new drops.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product.slug}
                slug={product.slug}
                name_en={product.name_en}
                name_ur={product.name_ur}
                price={product.price}
                comparePrice={product.comparePrice}
                image={product.images?.[0] || ""}
                status={product.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
