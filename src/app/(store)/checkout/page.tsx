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
import { getUserProfile, updateUserProfile } from "@/lib/firestore";

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user, loading: loadingAuth } = useAuthStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  // Pre-fill from Auth and Fetch saved profile
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.displayName || "",
        email: prev.email || user.email || "",
      }));

      const fetchProfile = async () => {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setFormData(prev => ({
            ...prev,
            fullName: prev.fullName || profile.name || "",
            phone: prev.phone || profile.phone || "",
            address: prev.address || profile.address || "",
            city: prev.city || profile.city || "",
            postalCode: prev.postalCode || profile.postalCode || "",
          }));
        }
      };
      fetchProfile();
    }
  }, [user]);

  // Redirect if cart is empty or user not logged in
  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push("/auth/login?redirect=/checkout");
      return;
    }
    if (items.length === 0 && !isSuccess) {
      router.push("/shop");
    }
  }, [items, router, isSuccess, user, loadingAuth]);

  if (items.length === 0) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode) return;

    try {
      const { getDoc, doc } = await import("firebase/firestore");
      const couponRef = doc(db, "coupons", couponCode.toUpperCase());
      const snapshot = await getDoc(couponRef);

      if (!snapshot.exists()) {
        setCouponError("INVALID COUPON");
        return;
      }

      const data = snapshot.data();
      if (data.status !== "Active") {
        setCouponError("COUPON EXPIRED");
        return;
      }

      setAppliedCoupon(data);
      setCouponCode("");
    } catch (error) {
      setCouponError("FAILED TO APPLY");
    }
  };

  const subtotal = getCartTotal();
  const shipping = 200;
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percent") {
      discount = (subtotal * appliedCoupon.discountAmount) / 100;
    } else {
      discount = appliedCoupon.discountAmount;
    }
  }

  const total = Math.max(0, subtotal + shipping - discount);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) return;
    try {
      const orderData = JSON.parse(JSON.stringify({
        userId: user.uid,
        customerInfo: formData,
        items: items,
        subtotal: subtotal,
        shipping: shipping,
        discount: discount,
        appliedCoupon: appliedCoupon?.code || null,
        total: total,
        status: "Pending",
        paymentMethod: "COD",
        createdAt: new Date().toISOString(),
      }));
      
      orderData.createdAt = serverTimestamp();

      const docRef = await addDoc(collection(db, "orders"), orderData);
      
      // Update User Profile with the latest info
      try {
        await updateUserProfile(user.uid, {
          name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        });
      } catch (profileError) {
        console.error("Failed to update profile:", profileError);
      }
      
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

  // Final price calculation (already handled above)

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

            {/* Coupon Section */}
            {!appliedCoupon ? (
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input 
                    placeholder="COUPON CODE" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="h-10 text-xs tracking-widest"
                  />
                  <Button variant="outline" className="h-10 text-[10px] px-4" onClick={handleApplyCoupon}>APPLY</Button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{couponError}</p>}
              </div>
            ) : (
              <div className="mb-6 flex justify-between items-center bg-acid-green/10 border border-acid-green p-3">
                <p className="text-xs font-bold text-acid-green uppercase tracking-widest">
                  COUPON: {appliedCoupon.code} (-{appliedCoupon.type === 'percent' ? `${appliedCoupon.discountAmount}%` : `Rs.${appliedCoupon.discountAmount}`})
                </p>
                <button onClick={() => setAppliedCoupon(null)} className="text-acid-green text-[10px] font-black underline">REMOVE</button>
              </div>
            )}

            <div className="space-y-3 font-sans font-bold uppercase text-sm border-t border-gray-800 pt-6 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-pure-white">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-pure-white">Rs. {shipping.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-acid-green">
                  <span>Discount</span>
                  <span>- Rs. {discount.toLocaleString()}</span>
                </div>
              )}
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
