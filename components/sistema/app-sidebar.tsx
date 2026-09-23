"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Layers } from "lucide-react";
import { MAIN_NAVIGATION_ITEMS } from "./navigation-items";
import { AccountMenu } from "./account-menu";

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  nome?: string | null;
  nomeMarca?: string | null;
  email?: string | null;
}

export function AppSidebar({
  collapsed,
  onToggleCollapse,
  nome,
  nomeMarca,
  email,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Navegação principal"
      className={`fixed top-0 bottom-0 left-0 z-30 hidden md:flex flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-200 ease-in-out ${
        collapsed ? "w-[76px]" : "w-[252px]"
      }`}
    >
      {/* Topo / Marca Neutra e Toggle */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-100 px-3.5 dark:border-zinc-900">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? "w-full justify-center" : ""}`}>
          <div className="relative group">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-sm shadow-xs transition-transform ${
                collapsed ? "group-hover:opacity-0 group-focus-within:opacity-0" : ""
              }`}
              aria-hidden="true"
            >
              <Layers className="h-5 w-5" />
            </div>

            {collapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Expandir barra lateral"
                className="absolute inset-0 hidden group-hover:flex group-focus-within:flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1 truncate">
              <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {nomeMarca || "Gestão"}
              </span>
              <span className="block truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                Painel do Barbeiro
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Recolher barra lateral"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Lista de Navegação Principal */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
        {MAIN_NAVIGATION_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.title : undefined}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-600 ${
                collapsed ? "justify-center px-0" : ""
              } ${
                isActive
                  ? "bg-zinc-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-950"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive
                    ? "text-white dark:text-zinc-950"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              />

              {!collapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé / Conta */}
      <div className="shrink-0 border-t border-zinc-100 p-2.5 dark:border-zinc-900">
        <AccountMenu
          nome={nome}
          nomeMarca={nomeMarca}
          email={email}
          compact={collapsed}
        />
      </div>
    </aside>
  );
}
