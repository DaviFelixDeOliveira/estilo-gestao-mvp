"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { BottomNav } from "./bottom-nav";


interface ShellProps {
  children: React.ReactNode;
  nome?: string | null;
  nomeMarca?: string | null;
  email?: string | null;
  logoUrl?: string | null;
}

export function Shell({
  children,
  nome,
  nomeMarca,
  email,
  logoUrl,
}: ShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const animarTransicaoPagina =
    /^\/(dashboard|pdv|operacao|configuracoes)(\/|$)/.test(pathname);

  function handleToggleCollapse() {
    setCollapsed((prev) => !prev);
  }

  return (
    <div className="min-h-screen bg-[#F4F4F0] dark:bg-[#181817] text-[#2F2F2D] dark:text-[#F4F4F0] flex flex-col font-sans transition-colors duration-200 overflow-x-hidden w-full max-w-full min-w-0">
      {/* 1. Sidebar Desktop (lg: 1024px+) */}

      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        nome={nome}
        nomeMarca={nomeMarca}
        email={email}
        logoUrl={logoUrl}
      />

      {/* 2. Main Layout Area */}
      <div
        className={`flex flex-1 flex-col transition-all duration-200 ease-in-out w-full max-w-full min-w-0 ${
          collapsed ? "lg:pl-[76px]" : "lg:pl-[252px]"
        }`}
      >
        <AppHeader
          nome={nome}
          nomeMarca={nomeMarca}
          email={email}
          logoUrl={logoUrl}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8 pb-24 lg:pb-12 w-full max-w-full min-w-0">
          <div
            key={pathname}
            className={`mx-auto max-w-6xl w-full ${
              animarTransicaoPagina ? "transicao-pagina-entrada" : ""
            }`}
          >
            {children}
          </div>
        </main>
      </div>

      {/* 3. Bottom Navigation Mobile (< lg) */}
      <BottomNav />
    </div>
  );
}
