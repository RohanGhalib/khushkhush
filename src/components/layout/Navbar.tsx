"use client";

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/lib/cart';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { setIsOpen, getCartCount } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <nav className="fixed top-0 w-full z-50 bg-void-black/90 backdrop-blur-sm border-b-2 border-pure-white px-6 py-4 flex items-center justify-between">
      <Link href="/" className="font-twenly text-3xl text-acid-green hover:text-pure-white transition-colors">
        KhUShKhUSh.
      </Link>
      
      <div className="flex items-center gap-6">
        <Link href="/shop" className="font-sans font-bold text-pure-white hover:text-acid-green uppercase">
          Shop
        </Link>
        <Link href="/collections/meme" className="font-sans font-bold text-pure-white hover:text-acid-green uppercase hidden md:block">
          Meme
        </Link>
        <Link href="/account" className="font-sans font-bold text-pure-white hover:text-acid-green uppercase hidden sm:block">
          Account
        </Link>
        
        <button 
          className="relative p-2 text-pure-white hover:text-acid-green transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <ShoppingCart size={24} strokeWidth={2.5} />
          {mounted && getCartCount() > 0 && (
            <Badge variant="acid" className="absolute -top-1 -right-2 px-1.5 py-0.5 min-w-[20px] justify-center text-[10px]">
              {getCartCount()}
            </Badge>
          )}
        </button>
      </div>
    </nav>
  );
}
