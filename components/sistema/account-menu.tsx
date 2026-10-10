"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  User,
  Palette,
  KeyRound,
  ChevronUp,
  X,
  ChevronRight,
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
          <LogoutButton className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer" />
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
 * Avatar do Topo Direito (Desktop & Mobile)
 * No Mobile, abre o Bottom Sheet fiel ao AI Studio. No Desktop, abre o Dropdown elegante.
 */
export function TopUserAvatarMenu({
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

      {/* Dropdown Desktop (hidden on mobile, shown on lg) */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Opções da conta"
          className="hidden lg:block absolute right-0 top-full mt-2 z-50 w-60 p-1.5 bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl shadow-xl text-xs animate-fadeIn"
        >
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

          <Link
            href="/conta"
            role="menuitem"
            onClick={closeMenu}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] transition-colors"
          >
            <User className="w-4 h-4 shrink-0 text-[#888882]" />
            <span>Perfil</span>
          </Link>

          <Link
            href="/conta"
            role="menuitem"
            onClick={closeMenu}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] transition-colors"
          >
            <Palette className="w-4 h-4 shrink-0 text-[#888882]" />
            <span>Aparência</span>
          </Link>

          <Link
            href="/conta"
            role="menuitem"
            onClick={closeMenu}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-[#666662] dark:text-[#B8B8B2] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] transition-colors"
          >
            <KeyRound className="w-4 h-4 shrink-0 text-[#888882]" />
            <span>Alterar senha</span>
          </Link>

          <div
            className="my-1 border-t border-[#E2E2DD] dark:border-[#3F3F3B]"
            role="separator"
          />

          <LogoutButton className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer" />
        </div>
      )}

      {/* Bottom Sheet Mobile (visible on mobile < lg) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-account-menu-title"
          className="lg:hidden fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          {/* Backdrop click dismiss */}
          <div
            className="fixed inset-0 -z-10"
            onClick={closeMenu}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md bg-white dark:bg-[#1E1E1C] border-t border-[#E2E2DD] dark:border-[#3F3F3B] rounded-t-3xl p-5 shadow-2xl space-y-4 animate-scaleIn max-h-[calc(100vh-2rem)] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]">
            {/* Mobile Drag indicator */}
            <div className="w-12 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full mx-auto -mt-1 mb-2" />

            {/* Header: Avatar com iniciais, nome e e-mail */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2E2DD] dark:border-[#3F3F3B]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs select-none">
                  {initials}
                </div>
                <div className="overflow-hidden leading-tight min-w-0">
                  <p
                    id="mobile-account-menu-title"
                    className="text-[10px] font-bold uppercase tracking-wider text-[#888882]"
                  >
                    Sua conta
                  </p>
                  <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] truncate mt-0.5">
                    {displayName}
                  </p>
                  {displayEmail && (
                    <p className="text-xs text-[#888882] truncate mt-0.5">
                      {displayEmail}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                className="p-1.5 rounded-lg text-[#888882] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] transition-colors cursor-pointer shrink-0"
                aria-label="Fechar menu da conta"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Itens do Menu Mobile com descrição e ícone */}
            <div className="space-y-1.5 pt-1">
              {/* 1. Perfil */}
              <Link
                href="/conta"
                onClick={closeMenu}
                className="w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer text-left text-[#666662] dark:text-[#B8B8B2] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-[#2B2B29] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-[#888882]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                      Perfil
                    </span>
                    <span className="text-[11px] text-[#888882] block">
                      Dados da conta e e-mail
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#888882]" />
              </Link>

              {/* 2. Aparência */}
              <Link
                href="/conta"
                onClick={closeMenu}
                className="w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer text-left text-[#666662] dark:text-[#B8B8B2] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-[#2B2B29] flex items-center justify-center shrink-0">
                    <Palette className="w-4 h-4 text-[#888882]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                      Aparência
                    </span>
                    <span className="text-[11px] text-[#888882] block">
                      Tema claro, escuro ou automático
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#888882]" />
              </Link>

              {/* 3. Alterar senha */}
              <Link
                href="/conta"
                onClick={closeMenu}
                className="w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer text-left text-[#666662] dark:text-[#B8B8B2] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-[#2B2B29] flex items-center justify-center shrink-0">
                    <KeyRound className="w-4 h-4 text-[#888882]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                      Alterar senha
                    </span>
                    <span className="text-[11px] text-[#888882] block">
                      Redefinição segura de credenciais
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#888882]" />
              </Link>
            </div>

            {/* Separador e Logout */}
            <div className="pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
              <LogoutButton className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
