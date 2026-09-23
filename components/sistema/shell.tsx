"use client";

import { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { BottomNav } from "./bottom-nav";

interface ShellProps {
  children: React.ReactNode;
  nome?: string | null;
  nomeMarca?: string | null;
  email?: string | null;
}

export function Shell({ children, nome, nomeMarca, email }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  function handleToggleCollapse() {
    setCollapsed((prev) => !prev);
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-900/50 dark:text-zinc-100 flex flex-col">
      {/* Sidebar Desktop */}
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        nome={nome}
        nomeMarca={nomeMarca}
        email={email}
      />

      {/* Main Layout Area */}
      <div
        className={`flex flex-1 flex-col transition-all duration-200 ease-in-out ${
          collapsed ? "md:pl-[76px]" : "md:pl-[252px]"
        }`}
      >
        <AppHeader
          nome={nome}
          nomeMarca={nomeMarca}
          email={email}
        />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation Mobile */}
      <BottomNav />
    </div>
  );
}
