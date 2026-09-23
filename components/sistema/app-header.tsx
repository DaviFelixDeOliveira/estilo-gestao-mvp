"use client";

import { usePathname } from "next/navigation";
import { Layers } from "lucide-react";
import { MAIN_NAVIGATION_ITEMS, ACCOUNT_NAVIGATION_ITEMS } from "./navigation-items";
import { AccountMenu } from "./account-menu";

interface AppHeaderProps {
  nome?: string | null;
  nomeMarca?: string | null;
  email?: string | null;
}

export function AppHeader({ nome, nomeMarca, email }: AppHeaderProps) {
  const pathname = usePathname();

  const allItems = [...MAIN_NAVIGATION_ITEMS, ...ACCOUNT_NAVIGATION_ITEMS];
  const currentItem = allItems.find((item) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/")
  );

  const pageTitle = currentItem?.title || "Painel";

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 md:px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
      {/* Mobile Top Header */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
          <Layers className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
            {pageTitle}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
            {nomeMarca || "Barbearia"}
          </span>
        </div>
      </div>

      {/* Desktop Header Content */}
      <div className="hidden md:flex items-center gap-3">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Right Action (Mobile Account Menu Trigger) */}
      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <AccountMenu
            nome={nome}
            nomeMarca={nomeMarca}
            email={email}
            compact
          />
        </div>
      </div>
    </header>
  );
}
