"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  // Redirect if cart is empty (but not if we just finished checkout)
  useEffect(() => {
    if (items.length === 0 && !isSuccess) {
      router.push("/shop");
    }
  }, [items, router, isSuccess]);

  if (items.length === 0) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = JSON.parse(JSON.stringify({
        userId: user?.uid || null,
        customerInfo: formData,
        items: items,
        subtotal: getCartTotal(),
        shipping: 200,
        total: getCartTotal() + 200,
        status: "Pending",
        paymentMethod: "COD",
        createdAt: new Date().toISOString(), // Use ISO string for guest compatibility if needed, or stick to serverTimestamp
      }));
      
      // Re-add serverTimestamp after JSON cleaning (JSON doesn't support it)
      orderData.createdAt = serverTimestamp();

      const docRef = await addDoc(collection(db, "orders"), orderData);
      
      // Trigger Order Confirmation Email
      try {
        await fetch("/api/emails/order-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: docRef.id,
            customerEmail: formData.email,
            customerName: formData.fullName,
            total: orderData.total,
            items: items,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError);
      }

      // Clear cart and redirect
      setIsSuccess(true);
      clearCart();
      router.push(`/order/${docRef.id}/confirmed`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to process order. Please try again.");
      setLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const shipping = 200;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-card-bg">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        
        {/* Left: Checkout Form */}
        <div>
          <h1 className="font-twenly text-4xl md:text-5xl uppercase text-acid-green mb-8 tracking-wide">
            CHECKOUT.
          </h1>

          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
            <div className="bg-void-black p-6 border-2 border-gray-800 space-y-4 brutalist-border">
              <h2 className="font-sans font-bold uppercase text-pure-white mb-4 tracking-widest border-b border-gray-800 pb-2">
                Contact
              </h2>
              
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Email</label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Phone</label>
                <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="03XX XXXXXXX" />
              </div>
            </div>

            <div className="bg-void-black p-6 border-2 border-gray-800 space-y-4 brutalist-border">
              <h2 className="font-sans font-bold uppercase text-pure-white mb-4 tracking-widest border-b border-gray-800 pb-2">
                Shipping
              </h2>
              
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Full Name</label>
                <Input name="fullName" value={formData.fullName} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Address</label>
                <Input name="address" value={formData.address} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-400">City</label>
                  <Input name="city" value={formData.city} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Postal Code</label>
                  <Input name="postalCode" value={formData.postalCode} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="bg-void-black p-6 border-2 border-gray-800 space-y-4 brutalist-border">
              <h2 className="font-sans font-bold uppercase text-pure-white mb-4 tracking-widest border-b border-gray-800 pb-2">
                Payment
              </h2>
              
              <div className="border-2 border-acid-green bg-acid-green/10 p-4 flex items-center justify-between">
                <span className="font-sans font-bold uppercase text-acid-green">Cash on Delivery (COD)</span>
                <span className="w-4 h-4 rounded-full bg-acid-green relative after:content-[''] after:absolute after:w-2 after:h-2 after:bg-void-black after:rounded-full after:top-1 after:left-1" />
              </div>
              <p className="font-sans text-sm text-gray-400 uppercase mt-2">
                Pay in cash when your order arrives.
              </p>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-void-black p-6 md:p-8 border-4 border-pure-white shadow-[8px_8px_0px_#C8FF00]">
            <h2 className="font-twenly text-3xl uppercase text-pure-white mb-6 border-b border-gray-800 pb-4">
              ORDER SUMMARY.
            </h2>
            
            <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 bg-card-bg border border-gray-800 flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name_en} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">IMG</div>
                    )}
                    <span className="absolute -top-2 -right-2 bg-pure-white text-void-black font-bold font-sans text-xs w-6 h-6 flex items-center justify-center rounded-full">
                      {item.qty}
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-sans font-bold uppercase text-sm leading-tight text-pure-white mb-1">{item.name_en}</h3>
                    <p className="font-urdu text-xs text-gray-400">{item.name_ur}</p>
                    <p className="font-urdu text-acid-green font-bold text-xs mt-1">{item.size}</p>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-sans font-bold text-sm text-pure-white">
                      Rs. {(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 font-sans font-bold uppercase text-sm border-t border-gray-800 pt-6 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-pure-white">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-pure-white">Rs. {shipping.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-gray-800 pt-6 mb-8">
              <span className="font-sans font-bold uppercase text-lg text-pure-white">Total</span>
              <span className="font-sans font-black text-3xl text-acid-green">
                Rs. {total.toLocaleString()}
              </span>
            </div>

            <Button 
              type="submit" 
              form="checkout-form"
              variant="primary" 
              className="w-full h-16 text-xl"
              disabled={loading}
            >
              {loading ? "PROCESSING..." : "CONFIRM ORDER"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
