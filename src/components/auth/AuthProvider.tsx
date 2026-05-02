"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, setIsAdmin } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Fetch the ID token and get its claims
          const tokenResult = await user.getIdTokenResult();
          const hasAdminClaim = !!tokenResult.claims.admin;
          setIsAdmin(hasAdminClaim);
        } catch (error) {
          console.error("Error fetching claims:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, setIsAdmin]);

  return <>{children}</>;
}
