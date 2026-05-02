"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserDocument } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        // Ensure user document exists
        const isNewUser = await createUserDocument(user.uid, { 
          email: user.email || "", 
          name: user.displayName || "Unknown", 
        });

        if (isNewUser) {
          // Send Welcome Email
          fetch("/api/emails/welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              customerEmail: user.email, 
              customerName: user.displayName || "Grip Master" 
            }),
          }).catch(console.error);
        }
      }

      router.push("/account");
    } catch (err: any) {
      setError(err.message || "Failed to log in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-void-black p-8 brutalist-border-green relative flex flex-col items-center text-center">
        <h1 className="font-twenly text-5xl text-acid-green mb-4 uppercase tracking-wide">
          Login.
        </h1>
        <p className="font-sans font-bold text-pure-white mb-8">
          Join the gang to manage your orders.
        </p>
        
        {error && (
          <div className="w-full bg-red-600 text-pure-white p-3 mb-6 font-bold font-sans uppercase text-sm border-2 border-pure-white">
            {error}
          </div>
        )}

        <Button 
          variant="primary" 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full h-16 shadow-[4px_4px_0px_#FFFFFF]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="font-urdu text-2xl">صبر کریں</span>
              <span className="animate-dots"></span>
            </div>
          ) : "SIGN IN WITH GOOGLE"}
        </Button>
      </div>
    </div>
  );
}
