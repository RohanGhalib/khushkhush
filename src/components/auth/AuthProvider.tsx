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
          const tokenResult = await user.getIdTokenResult();
          const hasAdminClaim = !!tokenResult.claims.admin;
          const isHardcodedAdmin = user.email === "muhammadrohanghalib@gmail.com";
          setIsAdmin(hasAdminClaim || isHardcodedAdmin);
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
