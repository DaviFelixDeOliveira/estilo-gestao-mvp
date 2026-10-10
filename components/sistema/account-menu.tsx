"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  User,
  Palette,
  KeyRound,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";

export interface AccountMenuProps {
  nome?: string | null;
  nomeMarca?: string | null;
  email?: string | null;
  compact?: boolean;
}

/**
 * Gera até 2 iniciais em maiúsculo a partir do nome ou e-mail do usuário.
 * Ex: "Davi Felix" -> "DF", "Carlos Silva" -> "CS", "davifelix@gmail.com" -> "DA"
 */
export function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  if (email && email.trim().length > 0) {
    const username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    if (username.length >= 2) {
      return username.slice(0, 2).toUpperCase();
    }
    return (username[0] || "U").toUpperCase();
  }

  return "EG";
}

/**
 * Gera iniciais para o nome da barbearia.
 * Exclui preposições comuns como "e", "&", "de", "da", "do".
 * Ex: "Estilo & Gestão" -> "EG", "Barbearia Vintage" -> "BV"
 */
export function getBarbershopInitials(businessName?: string | null): string {
  if (!businessName || !businessName.trim()) return "EG";
  const stopWords = new Set(["e", "&", "de", "da", "do", "dos", "das"]);
  const parts = businessName
    .trim()
    .split(/\s+/)
    .filter((w) => !stopWords.has(w.toLowerCase()));

  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1) {
    const clean = parts[0].replace(/[^a-zA-Z0-9]/g, "");
    return clean.slice(0, 2).toUpperCase() || "EG";
  }
  return "EG";
}

/**
 * Menu de Perfil / Card Inferior da Sidebar Desktop
 * Popover compacto abre exatamente acima do card no desktop.
 */
export function AccountMenu({
  nome,
  nomeMarca,
  email,
  compact = false,
}: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = nome?.trim() || nomeMarca?.trim() || email || "Sua conta";
  const displayEmail = email || "";
  const initials = getInitials(nome, email);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeMenu]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Menu suspenso (abre para cima na sidebar desktop) */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Opções da conta"
          aria-orientation="vertical"
          className={`absolute bottom-[calc(100%+8px)] z-50 p-1.5 bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl shadow-xl text-xs animate-fadeIn ${
            compact ? "left-0 w-60 sm:w-64" : "left-0 right-0 w-full min-w-[220px]"
          }`}
        >
          {/* Header do Menu */}
          <div className="px-3 py-2 border-b border-[#E2E2DD] dark:border-[#3F3F3B] mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#888882]">
              Sua conta
            </p>
            <p className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0] truncate mt-0.5">
              {displayName}
            </p>
            {displayEmail && (
              <p className="text-[11px] text-[#888882] truncate">
                {displayEmail}
              </p>
            )}
          </div>

          {/* Item 1: Perfil */}
          <Link
            href="/conta"
            role="menuitem"
            onClick={closeMenu}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] transition-colors"
          >
            <User className="w-4 h-4 shrink-0 text-[#888882]" aria-hidden="true" />
            <span>Perfil</span>
          </Link>

          {/* Item 2: Aparência */}
          <Link
            href="/conta"
            role="menuitem"
            onClick={closeMenu}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] transition-colors"
          >
            <Palette className="w-4 h-4 shrink-0 text-[#888882]" aria-hidden="true" />
            <span>Aparência</span>
          </Link>

          {/* Item 3: Alterar senha */}
          <Link
            href="/conta"
            role="menuitem"
            onClick={closeMenu}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] transition-colors"
          >
            <KeyRound className="w-4 h-4 shrink-0 text-[#888882]" aria-hidden="true" />
            <span>Alterar senha</span>
          </Link>

          {/* Divisor */}
          <div
            className="my-1 border-t border-[#E2E2DD] dark:border-[#3F3F3B]"
            role="separator"
            aria-hidden="true"
          />

          {/* Item 4: Sair */}
          <LogoutButton className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Sair</span>
          </LogoutButton>
        </div>
      )}

      {/* Botão de Trigger do Card de Conta */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Abrir opções da conta"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center gap-2.5 p-2 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors cursor-pointer text-left ${
          compact ? "justify-center p-1.5" : "justify-between"
        } ${isOpen ? "ring-1 ring-[#2F2F2D]/20 dark:ring-white/20" : ""}`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="w-8 h-8 rounded-full bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] flex items-center justify-center font-extrabold text-xs shrink-0 select-none shadow-2xs"
            aria-hidden="true"
          >
            {initials}
          </div>

          {!compact && (
            <div className="overflow-hidden leading-tight">
              <span className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] truncate">
                {displayName}
              </span>
              <span className="block text-[10px] text-[#666662] dark:text-[#B8B8B2] truncate">
                Sua conta
              </span>
            </div>
          )}
        </div>

        {!compact && (
          <ChevronUp
            className={`w-3.5 h-3.5 text-[#888882] shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  );
}

/**
 * Avatar do Topo Direito (Mobile Popover Compacto Fiel ao Print 3)
 * Abre um card flutuante compacto ancorado no topo direito, sem tela cheia ou bottom sheet.
 */
export function MobileUserAvatarMenu({
  nome,
  nomeMarca,
  email,
}: {
  nome?: string | null;
  nomeMarca?: string | null;
  email?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = nome?.trim() || nomeMarca?.trim() || email || "Sua conta";
  const displayEmail = email || "";
  const initials = getInitials(nome, email);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeMenu]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-8 h-8 rounded-full bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] font-extrabold text-xs flex items-center justify-center cursor-pointer hover:opacity-85 transition-opacity select-none shadow-2xs"
        title={`Sua conta (${displayName})`}
        aria-label={`Sua conta (${displayName})`}
      >
        {initials}
      </button>

      {/* Popover flutuante compacto estilo Print 3 */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Opções da conta"
          aria-orientation="vertical"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 max-w-[calc(100vw-2rem)] p-1.5 bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl shadow-2xl shadow-black/15 dark:shadow-black/50 text-xs animate-fadeIn"
        >
          {/* Header do Menu */}
          <div className="px-3 py-2 border-b border-[#E2E2DD] dark:border-[#3F3F3B] mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#888882]">
              Sua conta
            </p>
            <p className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0] truncate mt-0.5">
              {displayName}
            </p>
            {displayEmail && (
              <p className="text-[11px] text-[#888882] truncate">
                {displayEmail}
              </p>
            )}
          </div>

          {/* Item 1: Perfil */}
          <Link
            href="/conta"
            role="menuitem"
            onClick={closeMenu}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] transition-colors"
          >
            <User className="w-4 h-4 shrink-0 text-[#888882]" aria-hidden="true" />
            <span>Perfil</span>
          </Link>

          {/* Item 2: Aparência */}
          <Link
            href="/conta"
            role="menuitem"
            onClick={closeMenu}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] transition-colors"
          >
            <Palette className="w-4 h-4 shrink-0 text-[#888882]" aria-hidden="true" />
            <span>Aparência</span>
          </Link>

          {/* Item 3: Alterar senha */}
          <Link
            href="/conta"
            role="menuitem"
            onClick={closeMenu}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] transition-colors"
          >
            <KeyRound className="w-4 h-4 shrink-0 text-[#888882]" aria-hidden="true" />
            <span>Alterar senha</span>
          </Link>

          {/* Divisor */}
          <div
            className="my-1 border-t border-[#E2E2DD] dark:border-[#3F3F3B]"
            role="separator"
            aria-hidden="true"
          />

          {/* Item 4: Sair */}
          <LogoutButton className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Sair</span>
          </LogoutButton>
        </div>
      )}
    </div>
  );
}

// Alias de compatibilidade
export const TopUserAvatarMenu = MobileUserAvatarMenu;
export default AccountMenu;
