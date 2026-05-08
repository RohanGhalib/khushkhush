"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import {
  getUserProfile,
  updateUserProfile,
  KHUSBASSADOR_CONFIG,
  fetchKhusbassadorConfig,
  type KhusbassadorConfig,
} from "@/lib/firestore";
import { KhushCoinIcon } from "@/components/ambassador/KhushCoinIcon";
import { track } from "@/lib/track";

interface ServerCoupon {
  valid: true;
  code: string;
  type: "percent" | "fixed";
  discountAmount: number;
  finalDiscount: number;
}

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
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ServerCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0);
  const [coinsToRedeem, setCoinsToRedeem] = useState(0);
  const [config, setConfig] = useState<KhusbassadorConfig>(KHUSBASSADOR_CONFIG);

  useEffect(() => {
    let cancelled = false;
    fetchKhusbassadorConfig().then((c) => {
      if (!cancelled) setConfig(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Pre-fill from Auth and fetch saved profile
  useEffect(() => {
    if (user) {
      const timer = window.setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          fullName: prev.fullName || user.displayName || "",
          email: prev.email || user.email || "",
        }));
      }, 0);

      const fetchProfile = async () => {
        setLoadingProfile(true);
        try {
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
            setCoinBalance(Number(profile.khushCoins) || 0);
          }
        } finally {
          setLoadingProfile(false);
        }
      };
      fetchProfile();
      return () => window.clearTimeout(timer);
    } else if (!loadingAuth) {
      const timer = window.setTimeout(() => {
        setLoadingProfile(false);
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [user, loadingAuth]);

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

  useEffect(() => {
    if (items.length > 0 && !isSuccess) {
      track.beginCheckout({
        itemCount: items.reduce((s, i) => s + i.qty, 0),
        subtotal: getCartTotal(),
      });
    }
    // Only fire once per checkout session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0 && !isSuccess) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const subtotal = getCartTotal();
  const shipping = 200;

  // Discount is always the server-verified value — cannot be spoofed by the client
  const couponDiscount = appliedCoupon?.finalDiscount ?? 0;
  const coinCap = Math.floor((subtotal * config.maxCoinRedemptionPercent) / 100);
  const maxCoins = Math.max(0, Math.min(coinBalance, coinCap, Math.max(0, subtotal - couponDiscount)));
  const safeCoinsToRedeem = Math.min(coinsToRedeem, maxCoins);
  const discount = couponDiscount + safeCoinsToRedeem;
  const total = Math.max(0, subtotal + shipping - discount);

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;
    setCouponLoading(true);

    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setCouponError(data.error || "FAILED TO APPLY");
        return;
      }

      if (!data.valid) {
        setCouponError(data.error || "INVALID COUPON");
        return;
      }

      setAppliedCoupon(data as ServerCoupon);
      setCouponCode("");
    } catch {
      setCouponError("FAILED TO APPLY");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    setLoading(true);

    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      
      // Create order via secure Server API
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          userId: user.uid,
          customerInfo: formData,
          items: items,
          subtotal: subtotal,
          shipping: shipping,
          couponCode: appliedCoupon?.code || null,
          referralCode: referralCode.trim() || null,
          coinsToRedeem: safeCoinsToRedeem,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to create order");
      }

      const { orderId, total: finalTotal } = result;
      
      // Update User Profile with the latest info (client-side update is fine for convenience)
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
      
      // Trigger Order Confirmation Email (fire-and-forget)
      fetch("/api/emails/order-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId,
          customerEmail: formData.email,
          customerName: formData.fullName,
          total: finalTotal,
          items: items,
        }),
      }).catch(err => console.error("Failed to send receipt email:", err));

      track.purchase({
        orderId,
        total: finalTotal,
        itemCount: items.reduce((s, i) => s + i.qty, 0),
        referralCode: referralCode.trim() || null,
        couponCode: appliedCoupon?.code || null,
      });

      // Clear cart and redirect
      setIsSuccess(true);
      clearCart();
      router.push(`/order/${orderId}/confirmed`);
    } catch (error: unknown) {
      console.error("Error creating order:", error);
      alert(error instanceof Error ? error.message : "Failed to process order. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card-bg relative">
      {/* Sarcastic Loading Overlay */}
      {loadingProfile && (
        <div className="fixed inset-0 z-50 bg-void-black/90 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="font-urdu text-7xl text-acid-green mb-4">صبر کریں</div>
          <p className="font-twenly text-xl text-gray-500 uppercase tracking-[0.3em] animate-dots">
            GATHERING YOUR DETAILS
          </p>
        </div>
      )}
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
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                  />
                  <Button
                    variant="outline"
                    className="h-10 text-[10px] px-4"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading ? "..." : "APPLY"}
                  </Button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{couponError}</p>}
              </div>
            ) : (
              <div className="mb-6 flex justify-between items-center bg-acid-green/10 border border-acid-green p-3">
                <p className="text-xs font-bold text-acid-green uppercase tracking-widest">
                  COUPON: {appliedCoupon.code} (-{appliedCoupon.type === "percent" ? `${appliedCoupon.discountAmount}%` : `Rs.${appliedCoupon.discountAmount}`})
                </p>
                <button onClick={() => setAppliedCoupon(null)} className="text-acid-green text-[10px] font-black underline">REMOVE</button>
              </div>
            )}

            <div className="mb-6">
              <label className="mb-2 block font-sans text-[10px] font-black uppercase tracking-widest text-gray-500">
                Khusbassador Code
              </label>
              <Input
                placeholder="REFERRAL CODE"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="h-10 text-xs tracking-widest"
              />
              <p className="mt-1 font-sans text-[10px] font-bold uppercase text-gray-500">
                Valid codes apply the ambassador discount at checkout.
              </p>
            </div>

            {coinBalance > 0 && (
              <div className="mb-6 border-2 border-acid-green bg-acid-green/5 p-4">
                <div className="flex items-center gap-3">
                  <KhushCoinIcon size={36} />
                  <div className="flex-1">
                    <p className="font-sans text-[10px] font-black uppercase tracking-widest text-acid-green">
                      KhushCoins available
                    </p>
                    <p className="font-twenly text-2xl uppercase text-pure-white">
                      {coinBalance.toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoinsToRedeem(maxCoins)}
                    className="border-2 border-acid-green px-3 py-2 font-twenly text-xs uppercase text-acid-green hover:bg-acid-green hover:text-void-black"
                  >
                    MAX
                  </button>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxCoins}
                  step={10}
                  value={safeCoinsToRedeem}
                  onChange={(e) => setCoinsToRedeem(Number(e.target.value))}
                  disabled={maxCoins === 0}
                  className="mt-3 w-full accent-acid-green disabled:opacity-50"
                />
                <div className="mt-1 flex items-center justify-between font-sans text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-500">
                    Spend {safeCoinsToRedeem.toLocaleString()} = -Rs. {safeCoinsToRedeem.toLocaleString()}
                  </span>
                  <span className="text-gray-500">
                    Cap: {config.maxCoinRedemptionPercent}% of subtotal
                  </span>
                </div>
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
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="font-urdu text-2xl">صبر کریں</span>
                  <span className="animate-dots"></span>
                </div>
              ) : "CONFIRM ORDER"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
