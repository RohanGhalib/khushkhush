"use client";

import { useWishlistStore } from "@/lib/wishlistStore";
import { ProductCard } from "@/components/store/ProductCard";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function UserWishlistPage() {
  const { items } = useWishlistStore();

  return (
    <div>
      <h2 className="font-twenly text-3xl text-acid-green mb-8 uppercase tracking-wide border-b-2 border-gray-800 pb-4">
        Your Wishlist.
      </h2>

      {items.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center opacity-50">
          <Heart size={64} className="mb-6 text-gray-700" />
          <p className="font-twenly text-2xl mb-4 text-pure-white">YOUR WISHLIST IS EMPTY.</p>
          <p className="font-urdu text-xl text-gray-500">دنیا گول ہے منافق ماحول ہے</p>
          <Link href="/shop" className="mt-8 text-acid-green font-bold uppercase hover:underline">
            Discover Items &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ProductCard 
              key={item.slug}
              slug={item.slug}
              name_en={item.name_en}
              name_ur={item.name_ur}
              price={item.price}
              image={item.image}
              status="Active" // Assuming active if it's in wishlist
            />
          ))}
        </div>
      )}
    </div>
  );
}
