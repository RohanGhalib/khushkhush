"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/account`;
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (signInError) throw signInError;
    } catch (err: any) {
      setError(err.message || "Failed to log in with Google.");
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
