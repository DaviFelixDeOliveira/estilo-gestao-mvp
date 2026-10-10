"use client";

import React from "react";
import Link from "next/link";

export type OperationTabId = "servicos" | "produtos" | "categorias" | "estoque";

interface OperationTabItem {
  id: OperationTabId;
  label: string;
  href: string;
}

const OPERATION_TABS: readonly OperationTabItem[] = [
  { id: "servicos", label: "Serviços", href: "/operacao/servicos" },
  { id: "produtos", label: "Produtos", href: "/operacao/produtos" },
  { id: "categorias", label: "Categorias", href: "/operacao/categorias" },
  { id: "estoque", label: "Estoque", href: "/operacao/estoque" },
] as const;

interface OperationTabsProps {
  activeTab: OperationTabId;
}

export function OperationTabs({ activeTab }: OperationTabsProps) {
  return (
    <nav
      aria-label="Abas da Operação"
      className="flex items-center p-1 rounded-2xl bg-[#EEEDE7] dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] w-full sm:w-fit overflow-x-auto gap-1 select-none"
    >
      {OPERATION_TABS.map((tab) => {
        const isActive = tab.id === activeTab;

        if (isActive) {
          return (
            <span
              key={tab.id}
              aria-current="page"
              className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs whitespace-nowrap text-center cursor-default"
            >
              {tab.label}
            </span>
          );
        }

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] transition-colors whitespace-nowrap text-center cursor-pointer"
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
