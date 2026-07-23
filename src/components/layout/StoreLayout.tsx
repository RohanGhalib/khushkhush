"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/store/CartDrawer";

import { ComingSoon } from "./ComingSoon";
import { useAuthStore } from "@/lib/authStore";

import { useSearchParams } from "next/navigation";

const COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === "true";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAdmin: isUserAdmin, loading } = useAuthStore();
  const isAdminPath = pathname?.startsWith("/admin");
  const isAuthPath = pathname?.startsWith("/auth");
  const isPreview = searchParams?.get("preview") === "coming-soon";

  if (isAdminPath) {
    return <>{children}</>;
  }

  // If auth is loading, we wait. Or show Coming Soon as default.
  if (loading) {
    return null; // Or a loading spinner
  }

  // If coming soon is on, show it UNLESS the user is an admin or on an auth route (/auth/login)
  // Admins can force preview with ?preview=coming-soon
  if ((COMING_SOON && !isUserAdmin && !isAuthPath) || isPreview) {
    return <ComingSoon />;
  }

  return (
    <>
      <Navbar />
      <div className="flex-1 pt-20 flex flex-col">
        {children}
      </div>
      <CartDrawer />
      <Footer />
    </>
  );
}
