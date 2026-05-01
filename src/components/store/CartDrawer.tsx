"use client";

import { useCartStore } from '@/lib/cart';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-void-black/80 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[450px] bg-void-black border-l-4 border-acid-green z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b-2 border-pure-white">
          <h2 className="font-twenly text-3xl text-acid-green tracking-wide">CART.</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-pure-white hover:text-acid-green transition-colors"
          >
            <X size={32} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <p className="font-twenly text-2xl mb-4">YOUR CART IS EMPTY</p>
              <p className="font-urdu text-xl mb-6">دنیا گول ہے منافق ماحول ہے</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                KEEP SHOPPING
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-gray-800 pb-6">
                <div className="w-24 h-24 relative bg-card-bg brutalist-border-green flex-shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name_en} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">NO IMG</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-sans font-bold text-lg leading-tight uppercase">{item.name_en}</h3>
                      <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-500 transition-colors ml-2">
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <p className="font-urdu text-sm text-gray-400 mt-1">{item.name_ur}</p>
                    <div className="flex gap-2 mt-1">
                      <p className="font-urdu text-acid-green font-bold">{item.size}</p>
                      {item.color && (
                        <>
                          <span className="text-gray-600">•</span>
                          <p className="font-sans text-xs font-bold uppercase text-pure-white flex items-center">{item.color}</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center border border-pure-white">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.qty - 1))}
                        className="px-3 py-1 hover:bg-pure-white hover:text-void-black transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-1 font-bold font-sans">{item.qty}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                        className="px-3 py-1 hover:bg-pure-white hover:text-void-black transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="font-bold text-lg font-sans">Rs. {(item.price * item.qty).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t-2 border-pure-white bg-void-black">
            <div className="flex justify-between items-end mb-6">
              <span className="font-sans font-bold text-gray-400 uppercase tracking-widest text-sm">Subtotal</span>
              <span className="font-sans font-bold text-2xl text-acid-green">Rs. {getCartTotal().toLocaleString()}</span>
            </div>
            <Link href="/checkout" onClick={() => setIsOpen(false)}>
              <Button variant="primary" className="w-full h-16 text-2xl shadow-[4px_4px_0px_#FFFFFF]">
                CHECKOUT
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
