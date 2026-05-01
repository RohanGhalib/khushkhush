import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/wishlistStore";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  slug: string;
  name_en: string;
  name_ur: string;
  price: number;
  comparePrice?: number | null;
  image: string;
  status: string;
}

export function ProductCard({ slug, name_en, name_ur, price, comparePrice, image, status }: ProductCardProps) {
  const isSoldOut = status === "Sold Out";
  const isOnSale = comparePrice && comparePrice > price;
  const { toggleItem, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(slug);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleItem({ slug, name_en, name_ur, price, image });
  };

  return (
    <Link href={`/product/${slug}`} className="group block bg-void-black border-2 border-gray-800 hover:border-acid-green transition-colors relative overflow-hidden flex flex-col h-full">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {isSoldOut && (
          <span className="bg-red-600 text-pure-white font-sans font-bold text-xs px-2 py-1 uppercase tracking-widest border border-pure-white">
            Sold Out
          </span>
        )}
        {isOnSale && !isSoldOut && (
          <span className="bg-acid-green text-void-black font-sans font-bold text-xs px-2 py-1 uppercase tracking-widest border border-void-black">
            Sale
          </span>
        )}
      </div>

      <button 
        onClick={handleWishlist}
        className={cn(
          "absolute top-4 right-4 z-10 p-2 border-2 transition-all",
          isWishlisted 
            ? "bg-acid-green border-acid-green text-void-black" 
            : "bg-void-black/50 backdrop-blur-md border-gray-800 text-pure-white hover:border-acid-green"
        )}
      >
        <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full bg-[#1A1A1A] overflow-hidden">
        {image ? (
          <Image 
            src={image} 
            alt={name_en} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-twenly text-gray-700 text-xl">NO IMG</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 border-t-2 border-gray-800 group-hover:border-acid-green transition-colors">
        <h3 className="font-sans font-bold text-lg leading-tight uppercase text-pure-white group-hover:text-acid-green transition-colors line-clamp-1">
          {name_en}
        </h3>
        <p className="font-urdu text-sm text-gray-400 mt-1 line-clamp-1">{name_ur}</p>
        
        <div className="mt-auto pt-4 flex items-center gap-3">
          <p className="font-sans font-bold text-xl text-pure-white">
            Rs. {price.toLocaleString()}
          </p>
          {isOnSale && (
            <p className="font-sans font-bold text-sm text-gray-500 line-through">
              Rs. {comparePrice.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
