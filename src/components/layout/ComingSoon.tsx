"use client";

import { useEffect, useState } from "react";

export function ComingSoon() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-acid-green overflow-y-auto selection:bg-void-black selection:text-acid-green">
      {/* Fixed Background Elements */}
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden">
        {/* Brutalist Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-20 bg-void-black -rotate-1 transform origin-top-left" />
          <div className="absolute bottom-0 right-0 w-full h-20 bg-void-black -rotate-1 transform origin-bottom-right" />
          <div className="absolute top-1/4 -left-20 w-[120%] h-40 border-y-4 border-void-black rotate-3" />
          <div className="absolute bottom-1/4 -left-20 w-[120%] h-40 border-y-4 border-void-black -rotate-2" />
        </div>

        {/* Marquee effect for background */}
        <div className="absolute top-10 left-0 w-full overflow-hidden whitespace-nowrap opacity-20">
          <div className="inline-block font-twenly text-6xl md:text-8xl text-void-black font-black uppercase" style={{ animation: 'marquee 30s linear infinite' }}>
            KhushKhush. KhushKhush. KhushKhush. KhushKhush. KhushKhush. KhushKhush. KhushKhush. KhushKhush.
          </div>
        </div>
        <div className="absolute bottom-10 left-0 w-full overflow-hidden whitespace-nowrap opacity-20">
          <div className="inline-block font-twenly text-6xl md:text-8xl text-void-black font-black uppercase" style={{ animation: 'marquee-reverse 30s linear infinite' }}>
            RASTAY MEIN HAIN. RASTAY MEIN HAIN. RASTAY MEIN HAIN. RASTAY MEIN HAIN. RASTAY MEIN HAIN.
          </div>
        </div>

        {/* Floating Elements (Fixed) */}
        <div className="absolute top-[10%] right-[10%] w-12 h-12 bg-void-black rotate-12 animate-bounce hidden md:block" />
        <div className="absolute bottom-[15%] left-[5%] w-16 h-16 border-4 border-void-black -rotate-12 hidden md:block" />
        <div className="absolute top-1/2 right-[5%] font-twenly text-void-black text-4xl font-black rotate-90 opacity-20 hidden md:block">
          COMING SOON
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 min-h-screen py-20">
        <div className="flex-1 flex flex-col items-center justify-center">
        <div className="brutalist-border-green bg-void-black px-6 sm:px-8 py-3 sm:py-4 mb-6 sm:mb-8 transform -rotate-2 hover:rotate-0 transition-transform cursor-default max-w-fit mx-auto">
          <h1 className="font-twenly text-4xl sm:text-6xl md:text-8xl text-acid-green font-black tracking-tighter uppercase whitespace-nowrap">
            KhushKhush.
          </h1>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-urdu text-4xl sm:text-5xl md:text-7xl text-void-black font-bold leading-relaxed break-words">
            راستے میں ہیں
          </h2>
          <p className="font-twenly text-lg sm:text-xl md:text-2xl text-void-black font-bold uppercase tracking-widest mt-2 sm:mt-4">
            Something big is brewing.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-3 sm:gap-4">
          <div className="bg-void-black text-acid-green font-sans font-bold px-3 sm:px-4 py-1.5 sm:py-2 uppercase text-[10px] sm:text-sm border-2 border-void-black">
            BVIBE APPROVED
          </div>
          <div className="bg-void-black text-acid-green font-sans font-bold px-3 sm:px-4 py-1.5 sm:py-2 uppercase text-[10px] sm:text-sm border-2 border-void-black">
            EST. 2026
          </div>
        </div>

        <a 
          href="https://instagram.com/khushkhush.pk" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-8 group relative"
        >
          <div className="absolute inset-0 bg-void-black translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
          <div className="relative bg-pure-white border-2 border-void-black px-6 py-3 flex items-center gap-3 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-void-black">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <span className="font-twenly text-void-black text-xl font-black uppercase">
              ID CHECK KARO
            </span>
          </div>
        </a>
        </div>

        {/* Newsletter Section - Now after a scroll */}
        <div className="mt-20 w-full max-w-md mx-auto pb-12">
          <h3 className="font-urdu text-xl sm:text-2xl md:text-3xl text-void-black mb-4 font-bold leading-relaxed whitespace-nowrap sm:whitespace-normal">
            یہ فارم فل کردیں ہم آپکو بتا دیں گے
          </h3>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-pure-white border-2 border-void-black px-4 py-3 font-sans font-bold text-void-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-void-black/20"
              required
              disabled={status === "loading" || status === "success"}
            />
            <button 
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="bg-void-black text-acid-green font-twenly text-xl px-6 py-3 uppercase border-2 border-void-black hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "..." : status === "success" ? "DONE!" : "SUBMIT"}
            </button>
          </form>
          {status === "success" && (
            <p className="mt-2 text-void-black font-sans font-black uppercase text-xs animate-fade-in-up">
              Welcome to the inner circle.
            </p>
          )}
          {status === "error" && (
            <p className="mt-2 text-red-600 font-sans font-black uppercase text-xs">
              Error! Try again.
            </p>
          )}
          <div className="mt-8 text-center">
            <a 
              href="/auth/login" 
              className="inline-block font-sans font-bold text-xs uppercase tracking-widest text-void-black/70 hover:text-void-black border-b border-void-black/40 hover:border-void-black transition-colors"
            >
              Sign In / Admin Access →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
