"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function OrderConfirmedPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-card-bg flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-void-black p-8 md:p-12 border-4 border-acid-green text-center brutalist-border relative overflow-hidden">
        
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-acid-green" />
        
        <h1 className="font-twenly text-5xl md:text-6xl text-pure-white mb-6 uppercase tracking-widest mt-4">
          ORDER CONFIRMED.
        </h1>
        
        <p className="font-sans font-bold text-gray-400 text-lg uppercase mb-2">
          Your order ID is:
        </p>
        <p className="font-mono text-2xl text-acid-green font-bold mb-8 bg-acid-green/10 inline-block px-4 py-2 border border-acid-green">
          #{params.id}
        </p>

        <p className="font-sans font-bold text-pure-white mb-12">
          We've received your order and are getting it ready to drop.<br/>
          You will pay <span className="text-acid-green">Cash on Delivery</span> when the package arrives.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full shadow-[4px_4px_0px_#FFFFFF]">
              CONTINUE SHOPPING
            </Button>
          </Link>
          <Link href="/account/orders" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              VIEW ORDERS
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
