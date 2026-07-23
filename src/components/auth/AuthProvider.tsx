"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, setIsAdmin } = useAuthStore();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        checkAdminStatus(currentUser.id);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await checkAdminStatus(currentUser.id);
        if (posthog.__loaded) {
          posthog.identify(currentUser.id, {
            email: currentUser.email,
            name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name,
          });
        }
      } else {
        setIsAdmin(false);
        if (posthog.__loaded) posthog.reset();
        setLoading(false);
      }
    });

    async function checkAdminStatus(userId: string) {
      try {
        const { data: profile } = await supabase
          .from("users")
          .select("role, is_admin")
          .eq("id", userId)
          .single();

        const isAdminUser = !!(profile?.is_admin || profile?.role === "admin");
        setIsAdmin(isAdminUser);
      } catch (err) {
        console.error("Error verifying admin status:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, setIsAdmin]);

  return <>{children}</>;
}
