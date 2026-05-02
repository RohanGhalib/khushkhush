"use client";

import { ProductCard } from "@/components/store/ProductCard";

interface Product {
  slug: string;
  name_en: string;
  name_ur: string;
  price: number;
  status: string;
  images: string[];
  [key: string]: unknown;
}

interface ShopGridProps {
  products: Product[];
}

/**
 * Pure client component — receives already-fetched products as props from
 * the ISR server component (shop/page.tsx). Handles only rendering & interactivity.
 */
export function ShopGrid({ products }: ShopGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <h2 className="font-twenly text-3xl text-gray-500 uppercase">NO PRODUCTS FOUND.</h2>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          {...product}
          image={product.images?.[0] || ""}
        />
      ))}
    </div>
  );
}
