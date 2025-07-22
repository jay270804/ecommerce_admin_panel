"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../hooks/useAuthStore";
import { useHasHydrated } from "../hooks/useHasHydrated";
import { Button } from "@/components/ui/button";
import React from "react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
  { href: "/categories", label: "Categories" },
  { href: "/brands", label: "Brands" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const hasHydrated = useHasHydrated();

  React.useEffect(() => {
    if (!hasHydrated) return;
    if (!user || user.role !== "admin") {
      router.replace("/login");
    }
  }, [user, router, hasHydrated]);

  if (!hasHydrated) {
    return <div>Loading...</div>;
  }
  if (!user || user.role !== "admin") {
    return null;
  }

  function handleLogout() {
    clearAuth();
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 min-w-[16rem] bg-card border-r flex flex-col py-8 px-4 gap-4">
        <div className="font-bold text-lg mb-8">Admin Panel</div>
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded transition-colors font-medium text-sm ${pathname === link.href ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* User email at the end of sidebar */}
        <div className="mt-auto pt-8 text-xs text-muted-foreground break-all">
          {user?.email && <span>{user.email}</span>}
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 border-b bg-background">
          <div className="text-xl font-semibold capitalize">
            {navLinks.find((l) => pathname?.includes(l.href.replace("/(admin)", "")))?.label || "Admin"}
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </header>
        <section className="flex-1 p-8 bg-background">
          {children}
        </section>
      </main>
    </div>
  );
}