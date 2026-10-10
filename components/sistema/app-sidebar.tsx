"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CreditCard,
  Layers,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
} from "lucide-react";
import { AccountMenu, getBarbershopInitials } from "./account-menu";

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  nome?: string | null;
  nomeMarca?: string | null;
  email?: string | null;
  logoUrl?: string | null;
}

export function AppSidebar({
  collapsed,
  onToggleCollapse,
  nome,
  nomeMarca,
  email,
  logoUrl,
}: AppSidebarProps) {
  const pathname = usePathname();

  const businessName =
    (nomeMarca && nomeMarca.trim()) ||
    (nome && nome.trim()) ||
    "Barbearia";
  const barbershopInitials = getBarbershopInitials(businessName);

  const isPdvActive = pathname.startsWith("/pdv");
  const isOperacaoActive = pathname.startsWith("/operacao");
  const isConfigActive =
    pathname.startsWith("/configuracoes") ||
    pathname.startsWith("/financeiro");

  const [isPdvExpanded, setIsPdvExpanded] = useState<boolean>(true);
  const [isOperacaoExpanded, setIsOperacaoExpanded] = useState<boolean>(true);
  const [isConfigExpanded, setIsConfigExpanded] = useState<boolean>(isConfigActive);

  return (
    <aside
      aria-label="Navegação principal"
      className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 bg-white dark:bg-[#222220] border-r border-[#E2E2DD] dark:border-[#3F3F3B] transition-all duration-200 select-none ${
        collapsed ? "w-[76px]" : "w-[252px]"
      }`}
    >
      {/* 1. Brand Header */}
      <div
        className={`h-16 flex items-center border-b border-[#E2E2DD] dark:border-[#3F3F3B] px-3.5 relative ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`Logo da barbearia ${businessName}`}
              width={36}
              height={36}
              unoptimized
              className="w-9 h-9 rounded-xl object-cover shrink-0 border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] flex items-center justify-center font-extrabold text-xs tracking-wider shrink-0 shadow-xs select-none"
              title={businessName}
              aria-label={`Logo da barbearia ${businessName}`}
            >
              {barbershopInitials}
            </div>
          )}

          {!collapsed && (
            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="text-xs font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] truncate">
                {businessName}
              </span>
              <span className="text-[10px] text-[#666662] dark:text-[#B8B8B2] truncate">
                Gestão da barbearia
              </span>
            </div>
          )}
        </div>

        {/* Botão de Toggle da Sidebar */}
        {collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expandir menu lateral"
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 bg-white/95 dark:bg-[#222220]/95 transition-opacity cursor-pointer text-[#2F2F2D] dark:text-[#F4F4F0]"
            title="Expandir barra lateral"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Recolher menu lateral"
            className="p-1.5 rounded-lg text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] transition-colors cursor-pointer"
            title="Recolher barra lateral"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Navigation Menu Links */}
      <nav
        className="flex-1 p-2.5 space-y-1.5 overflow-y-auto"
        aria-label="Navegação do sistema"
      >
        {/* Item 1: Dashboard */}
        <Link
          href="/dashboard"
          title="Dashboard"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            pathname === "/dashboard"
              ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
              : "text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
          } ${collapsed ? "justify-center px-0" : ""}`}
        >
          <LayoutGrid className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {/* Item 2: PDV Group */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => {
              if (collapsed) {
                onToggleCollapse();
              } else {
                setIsPdvExpanded((prev) => !prev);
              }
            }}
            title="PDV"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isPdvActive
                ? collapsed
                  ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                  : "bg-[#FAF9F5] dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0]"
                : "text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
            } ${collapsed ? "justify-center px-0" : ""}`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 shrink-0" />
              {!collapsed && <span>PDV</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isPdvExpanded ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {!collapsed && isPdvExpanded && (
            <div className="ml-4 pl-3.5 mt-1 border-l border-[#E2E2DD] dark:border-[#3F3F3B] space-y-1 py-0.5">
              <Link
                href="/pdv/nova-venda"
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === "/pdv/nova-venda" || pathname === "/pdv"
                    ? "font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                    : "font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Nova venda
              </Link>
              <Link
                href="/pdv/historico"
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === "/pdv/historico"
                    ? "font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                    : "font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Histórico de vendas
              </Link>
            </div>
          )}
        </div>

        {/* Item 3: Operação Group */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => {
              if (collapsed) {
                onToggleCollapse();
              } else {
                setIsOperacaoExpanded((prev) => !prev);
              }
            }}
            title="Operação"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isOperacaoActive
                ? collapsed
                  ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                  : "bg-[#FAF9F5] dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0]"
                : "text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
            } ${collapsed ? "justify-center px-0" : ""}`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Operação</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isOperacaoExpanded ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {!collapsed && isOperacaoExpanded && (
            <div className="ml-4 pl-3.5 mt-1 border-l border-[#E2E2DD] dark:border-[#3F3F3B] space-y-1 py-0.5">
              <Link
                href="/operacao/servicos"
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === "/operacao/servicos"
                    ? "font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                    : "font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Serviços
              </Link>
              <Link
                href="/operacao/produtos"
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === "/operacao/produtos"
                    ? "font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                    : "font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Produtos
              </Link>
              <Link
                href="/operacao/categorias"
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === "/operacao/categorias"
                    ? "font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                    : "font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Categorias
              </Link>
              <Link
                href="/operacao/estoque"
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === "/operacao/estoque"
                    ? "font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                    : "font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Estoque
              </Link>
            </div>
          )}
        </div>

        {/* Item 4: Configurações Group */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => {
              if (collapsed) {
                onToggleCollapse();
              } else {
                setIsConfigExpanded((prev) => !prev);
              }
            }}
            title="Configurações"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isConfigActive
                ? collapsed
                  ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                  : "bg-[#FAF9F5] dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0]"
                : "text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
            } ${collapsed ? "justify-center px-0" : ""}`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Configurações</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isConfigExpanded ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {!collapsed && isConfigExpanded && (
            <div className="ml-4 pl-3.5 mt-1 border-l border-[#E2E2DD] dark:border-[#3F3F3B] space-y-1 py-0.5">
              <span className="block px-2.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-[#888882]">
                Negócio
              </span>
              <Link
                href="/financeiro"
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === "/financeiro"
                    ? "font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                    : "font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Financeiro
              </Link>
              <Link
                href="/dashboard"
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === "/relatorios"
                    ? "font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                    : "font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Relatórios
              </Link>
              <Link
                href="/configuracoes"
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === "/configuracoes/vitrine"
                    ? "font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                    : "font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Vitrine Digital
              </Link>

              <span className="block px-2.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#888882]">
                Barbearia
              </span>
              <Link
                href="/configuracoes"
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === "/configuracoes"
                    ? "font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                    : "font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Dados da barbearia
              </Link>
              <Link
                href="/configuracoes"
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === "/configuracoes/endereco"
                    ? "font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                    : "font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Endereço
              </Link>
              <Link
                href="/configuracoes"
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === "/configuracoes/horarios"
                    ? "font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                    : "font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Horários
              </Link>
              <Link
                href="/configuracoes"
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === "/configuracoes/pagamento"
                    ? "font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                    : "font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Formas de pagamento
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* 3. Rodapé com Card de Perfil do Usuário */}
      <div className="p-3 border-t border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] relative mt-auto">
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
