"use client";

import { useAuthStore } from "@/lib/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <p className="font-twenly text-4xl text-acid-green animate-pulse tracking-widest">LOADING...</p>
      </div>
    );
  }

  const navItems = [
    { name: "Profile", href: "/account" },
    { name: "Orders", href: "/account/orders" },
    { name: "The Khata", href: "/account/vault" },
    { name: "Wishlist", href: "/account/wishlist" },
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 flex flex-col md:flex-row gap-12 mt-8">
      <aside className="w-full md:w-64 flex-shrink-0">
        <h1 className="font-twenly text-4xl text-pure-white mb-8 tracking-wide">ACCOUNT.</h1>
        <nav className="flex flex-col gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "font-sans font-bold uppercase text-lg transition-colors pb-2 border-b-2",
                  isActive 
                    ? "text-acid-green border-acid-green" 
                    : "text-gray-400 border-transparent hover:text-pure-white hover:border-pure-white"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      
      <main className="flex-1 bg-card-bg p-6 md:p-10 brutalist-border relative">
        {children}
      </main>
    </div>
  );
}
