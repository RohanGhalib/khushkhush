"use client";

import { useAuthStore } from "@/lib/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, Tag, Users, Settings, Mail, LogOut, Ticket, ShoppingCart, UserCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (!isAdmin) {
        router.push("/account");
      }
    }
  }, [user, loading, isAdmin, router]);

  if (!mounted || loading || !user || !isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#0D0D0D]">
        <div className="font-urdu text-6xl text-acid-green mb-4">صبر کریں</div>
        <p className="font-twenly text-xl text-gray-500 uppercase tracking-[0.3em] animate-dots">Verifying your existence</p>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Collections", href: "/admin/collections", icon: Tag },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Khusbassadors", href: "/admin/ambassadors", icon: UserCheck },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#0D0D0D] text-pure-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-void-black border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="font-twenly text-3xl text-acid-green tracking-wide">
            KhUShKhUSh.
          </Link>
          <span className="block text-xs font-sans font-bold text-gray-500 mt-1 uppercase">Admin Portal</span>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 font-sans font-bold uppercase transition-colors rounded-sm",
                  isActive 
                    ? "bg-acid-green text-void-black" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-pure-white"
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/auth/login");
            }}
            className="flex items-center gap-3 px-4 py-3 font-sans font-bold uppercase text-red-500 hover:bg-red-500/10 w-full transition-colors rounded-sm"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
