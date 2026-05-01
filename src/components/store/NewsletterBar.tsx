"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function NewsletterBar() {
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

  return (
    <div className="w-full bg-acid-green py-16 px-6 relative overflow-hidden brutalist-border-green">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
        <h2 className="font-twenly text-4xl md:text-5xl text-void-black mb-4 uppercase">
          JOIN THE DROP LIST.
        </h2>
        <p className="font-sans font-bold text-void-black text-lg mb-8 uppercase tracking-wide">
          Be the first to know. No spam. Just heat.
        </p>
        
        <form onSubmit={handleSubscribe} className="w-full max-w-lg flex flex-col sm:flex-row gap-4">
          <Input 
            type="email" 
            placeholder="ENTER YOUR EMAIL" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-pure-white border-void-black text-void-black placeholder:text-gray-500 focus-visible:border-void-black"
            required
            disabled={status === "loading" || status === "success"}
          />
          <Button 
            type="submit" 
            variant="primary" 
            className="sm:w-auto w-full bg-void-black text-acid-green border-void-black hover:bg-pure-white hover:text-void-black hover:border-pure-white"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? "..." : status === "success" ? "JOINED!" : "SUBSCRIBE"}
          </Button>
        </form>
        {status === "error" && <p className="text-red-600 font-sans font-bold uppercase mt-4 text-sm">Failed to subscribe. Try again.</p>}
      </div>
    </div>
  );
}
