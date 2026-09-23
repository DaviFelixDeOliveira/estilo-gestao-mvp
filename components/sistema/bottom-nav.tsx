"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAVIGATION_ITEMS } from "./navigation-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação inferior mobile"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-zinc-200 bg-white/95 backdrop-blur-md px-2 pt-1 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] dark:border-zinc-800 dark:bg-zinc-950/95"
    >
      <div className="grid grid-cols-4 items-center justify-around gap-1">
        {MAIN_NAVIGATION_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[48px] min-w-[44px] flex-col items-center justify-center rounded-xl py-1 text-[11px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-600 ${
                isActive
                  ? "text-zinc-950 dark:text-white font-semibold"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <div
                className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="mt-0.5 tracking-tight truncate max-w-full px-1">
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
