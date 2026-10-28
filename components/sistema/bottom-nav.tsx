"use client";

import Link from "next/link";
import { usePlanoNormal } from "./plano-context";
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
    title: "Ponto de Venda",
    href: "/pdv",
    icon: CreditCard,
  },
  {
    title: "Operação",
    href: "/operacao/servicos",
    icon: Layers,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

const FREE_NAV_ITEMS: typeof BOTTOM_NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutGrid, exact: true },
  { title: "Operação", href: "/operacao/servicos", icon: Layers },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
  { title: "Assinatura", href: "/minha-assinatura", icon: CreditCard },
];

function itemEstaAtivo(
  pathname: string,
  item: (typeof BOTTOM_NAV_ITEMS)[number]
) {
  if (item.exact) {
    return pathname === item.href;
  }

  if (item.href === "/operacao/servicos") {
    return pathname.startsWith("/operacao");
  }

  if (item.href === "/configuracoes") {
    return (
      pathname.startsWith("/configuracoes") ||
      pathname.startsWith("/financeiro")
    );
  }

  return (
    pathname === item.href ||
    pathname.startsWith(item.href + "/")
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const planoNormal = usePlanoNormal();
  const itens = planoNormal ? BOTTOM_NAV_ITEMS : FREE_NAV_ITEMS;

  const indiceAtivo = itens.findIndex((item) =>
    itemEstaAtivo(pathname, item)
  );

  return (
    <nav
      aria-label="Navegação inferior mobile"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#1C1C1A]/95 backdrop-blur-lg border-t border-[#E2E2DD] dark:border-[#3F3F3B] grid grid-cols-4 items-center h-16 px-1 safe-bottom shadow-lg select-none"
    >
      {/* Indicador que desliza entre as opções */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-2 h-2 w-2 rounded-full bg-[#2F2F2D] dark:bg-emerald-400 transition-[left,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
          indiceAtivo >= 0 ? "opacity-100" : "opacity-0"
        }`}
        style={{
          left: `calc(${((Math.max(indiceAtivo, 0) + 0.5) / itens.length) * 100}% + 9px)`,
        }}
      />

      {itens.map((item) => {
        const isActive = itemEstaAtivo(pathname, item);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex min-w-0 flex-col items-center justify-center py-1 transition-[color,transform] duration-200 active:scale-95 cursor-pointer ${
              isActive
                ? "text-[#2F2F2D] dark:text-[#F4F4F0] font-bold"
                : "text-[#888882] dark:text-[#A1A1AA]"
            }`}
          >
            <Icon
              className={`w-5 h-5 mb-0.5 transition-transform duration-200 ease-out motion-reduce:transition-none ${
                isActive ? "scale-110" : "scale-100"
              }`}
            />
            <span className="text-[10px] tracking-tight">
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}