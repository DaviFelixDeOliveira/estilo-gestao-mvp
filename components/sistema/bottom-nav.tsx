"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CreditCard,
  Layers,
  Settings,
} from "lucide-react";

const BOTTOM_NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
    exact: true,
  },
  {
    title: "PDV",
    href: "/pdv",
    icon: CreditCard,
  },
  {
    title: "Operação",
    href: "/operacao",
    icon: Layers,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação inferior mobile"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#1C1C1A]/95 backdrop-blur-lg border-t border-[#E2E2DD] dark:border-[#3F3F3B] grid grid-cols-4 items-center h-16 px-1 safe-bottom shadow-lg select-none"
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/") || (item.href === "/operacao" && pathname.startsWith("/operacao")) || (item.href === "/configuracoes" && (pathname.startsWith("/configuracoes") || pathname.startsWith("/financeiro")));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center justify-center py-1 transition-transform active:scale-95 cursor-pointer ${
              isActive
                ? "text-[#2F2F2D] dark:text-[#F4F4F0] font-bold"
                : "text-[#888882] dark:text-[#A1A1AA]"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 mb-0.5" />
              {isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#2F2F2D] dark:bg-emerald-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
