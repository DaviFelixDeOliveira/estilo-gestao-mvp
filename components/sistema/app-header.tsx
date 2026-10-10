"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { MobileUserAvatarMenu, getBarbershopInitials } from "./account-menu";

interface AppHeaderProps {
  nome?: string | null;
  nomeMarca?: string | null;
  email?: string | null;
  logoUrl?: string | null;
}

function getHeaderTitles(pathname: string): { title: string; breadcrumb: string } {
  if (pathname === "/dashboard") {
    return { title: "Dashboard", breadcrumb: "Dashboard" };
  }
  if (pathname === "/pdv/nova-venda" || pathname === "/pdv") {
    return { title: "Nova venda", breadcrumb: "Ponto de Venda / Nova venda" };
  }
  if (pathname === "/pdv/historico") {
    return { title: "Histórico de vendas", breadcrumb: "Ponto de Venda / Histórico de vendas" };
  }
  if (pathname.startsWith("/pdv")) {
    return { title: "Ponto de Venda", breadcrumb: "Ponto de Venda" };
  }
  if (pathname === "/operacao/servicos") {
    return { title: "Serviços", breadcrumb: "Operação / Serviços" };
  }
  if (pathname === "/operacao/produtos") {
    return { title: "Produtos", breadcrumb: "Operação / Produtos" };
  }
  if (pathname === "/operacao/estoque") {
    return { title: "Estoque", breadcrumb: "Operação / Estoque" };
  }
  if (pathname.startsWith("/operacao")) {
    return { title: "Operação", breadcrumb: "Operação" };
  }
  if (pathname === "/financeiro") {
    return { title: "Financeiro", breadcrumb: "Configurações / Negócio / Financeiro" };
  }
  if (pathname === "/configuracoes") {
    return { title: "Dados da barbearia", breadcrumb: "Configurações / Barbearia" };
  }
  if (pathname.startsWith("/configuracoes")) {
    return { title: "Configurações", breadcrumb: "Configurações" };
  }
  if (pathname.startsWith("/conta")) {
    return { title: "Perfil", breadcrumb: "Sua conta / Perfil" };
  }
  return { title: "Dashboard", breadcrumb: "Dashboard" };
}

export function AppHeader({
  nome,
  nomeMarca,
  email,
  logoUrl,
}: AppHeaderProps) {
  const pathname = usePathname();
  const { title, breadcrumb } = getHeaderTitles(pathname);
  const businessName = nomeMarca || "Estilo & Gestão";
  const barbershopInitials = getBarbershopInitials(businessName);

  return (
    <>
      {/* 1. Desktop Topbar (visível em lg: 1024px+) - Sem avatar de perfil no topo direito */}
      <header className="hidden lg:flex items-center justify-between h-16 border-b border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5]/90 dark:bg-[#181817]/90 backdrop-blur-md px-8 sticky top-0 z-30 transition-all duration-200">
        {/* Breadcrumb Path */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-[#666662] dark:text-[#B8B8B2]"
        >
          <Link
            href="/dashboard"
            className="hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer"
          >
            {businessName}
          </Link>
          <ChevronRight className="w-3 h-3 text-[#888882]" />
          <span className="text-[#2F2F2D] dark:text-white font-bold">
            {breadcrumb}
          </span>
        </nav>
      </header>

      {/* 2. Mobile Compact Header (visível em < lg) */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-white/95 dark:bg-[#222220]/95 backdrop-blur-md border-b border-[#E2E2DD] dark:border-[#3F3F3B] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`Logo da barbearia ${businessName}`}
              width={32}
              height={32}
              unoptimized
              className="w-8 h-8 rounded-xl object-cover shrink-0 border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] flex items-center justify-center font-extrabold text-xs tracking-wider shadow-xs select-none shrink-0"
              title={businessName}
            >
              {barbershopInitials}
            </div>
          )}

          <div className="flex flex-col overflow-hidden leading-tight min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0] leading-tight truncate">
              {title}
            </h1>
            <p className="text-[10px] text-[#666662] dark:text-[#B8B8B2] leading-none truncate mt-0.5">
              {businessName}
            </p>
          </div>
        </div>

        {/* Avatar no Mobile para abrir o Bottom Sheet de perfil */}
        <div className="flex items-center gap-2 shrink-0">
          <MobileUserAvatarMenu nome={nome} nomeMarca={nomeMarca} email={email} />
        </div>
      </header>
    </>
  );
}
