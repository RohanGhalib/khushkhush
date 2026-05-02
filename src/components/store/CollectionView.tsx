"use client";

import { ProductCard } from "@/components/store/ProductCard";

/**
 * Pure client component — receives products as props from
 * the ISR server component (collections/[slug]/page.tsx).
 */
export function CollectionView({ slug, products }: { slug: string; products: any[] }) {
  return (
    <div className="min-h-screen bg-card-bg">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="mb-12 border-b-2 border-gray-800 pb-4">
          <h1 className="font-twenly text-5xl md:text-7xl text-acid-green uppercase tracking-wide">
            {slug}.
          </h1>
          <p className="font-sans font-bold text-gray-400 uppercase tracking-widest mt-2">
            Collection Archive
          </p>
        </div>

        {products.length === 0 ? (
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
