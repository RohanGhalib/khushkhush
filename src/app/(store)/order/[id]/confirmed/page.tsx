"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function OrderConfirmedPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  
  return (
    <div className="min-h-screen bg-void-black flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Meme Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
        <h1 className="font-twenly text-[25vw] leading-none text-acid-green whitespace-nowrap rotate-[-10deg]">
          MADDI TYAR RAKHO. MADDI TYAR RAKHO.
        </h1>
      </div>

      <div className="max-w-3xl w-full bg-void-black p-8 md:p-16 border-8 border-pure-white text-center relative z-10 shadow-[15px_15px_0px_#C8FF00]">
        
        {/* Animated Accent */}
        <div className="absolute -top-4 -left-4 bg-acid-green text-void-black px-6 py-2 font-twenly text-2xl rotate-[-2deg] brutalist-border">
          SUCCESS!
        </div>

        <h1 className="font-twenly text-6xl md:text-8xl text-acid-green mb-8 uppercase leading-none tracking-tighter">
          ORDER RECEIVED.
        </h1>

        <div className="mb-12">
          <p className="font-urdu text-5xl md:text-7xl text-pure-white mb-4 leading-relaxed">
            مڈی تیار رکھو!
          </p>
          <p className="font-sans font-bold text-gray-400 text-lg uppercase tracking-widest">
            (MADDI TYAR RAKHO)
          </p>
        </div>
        
        <div className="bg-acid-green/10 p-6 border-2 border-dashed border-acid-green mb-12">
          <p className="font-sans font-bold text-gray-400 text-sm uppercase mb-2">
            Your Order Ticket:
          </p>
          <p className="font-mono text-3xl md:text-4xl text-acid-green font-black tracking-wider">
            #{params.id.substring(0, 10).toUpperCase()}
          </p>
        </div>

        <div className="space-y-6 mb-12 text-left md:text-center">
          <p className="font-sans font-black text-xl text-pure-white uppercase leading-tight">
            We've locked in your gear. <br className="hidden md:block" />
            Pay <span className="bg-acid-green text-void-black px-2">CASH ON DELIVERY</span> when it drops at your door.
          </p>
          <p className="font-sans font-bold text-gray-500 text-sm uppercase">
            A confirmation email is flying to your inbox right now.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full h-16 px-12 text-xl shadow-[6px_6px_0px_#FFFFFF]">
              CONTINUE SHOPPING
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full h-16 px-12 text-xl border-gray-700 hover:border-acid-green">
              BACK TO HOME
            </Button>
          </Link>
        </div>

        {/* Bottom Small Print */}
        <p className="mt-12 font-urdu text-gray-600 text-xl">
          دنیا گول ہے منافق ماحول ہے
        </p>
      </div>
    </div>
  );
}
