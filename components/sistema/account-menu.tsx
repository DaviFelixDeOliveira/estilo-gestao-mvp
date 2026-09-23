"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, LogOut, ChevronDown } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";

interface AccountMenuProps {
  nome?: string | null;
  nomeMarca?: string | null;
  email?: string | null;
  compact?: boolean;
}

export function AccountMenu({
  nome,
  nomeMarca,
  email,
  compact = false,
}: AccountMenuProps) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = nome || nomeMarca || "Minha Conta";
  const displaySub = nomeMarca && nome ? nomeMarca : email || "Barbeiro";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "B";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setAberto(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAberto(false);
      }
    }

    if (aberto) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [aberto]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setAberto((prev) => !prev)}
        aria-expanded={aberto}
        aria-haspopup="menu"
        aria-label="Menu da conta"
        className={`flex items-center gap-2 rounded-xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-600 ${
          compact
            ? "h-10 w-10 justify-center border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            : "w-full p-2 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-200 font-semibold text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
          {initials}
        </div>

        {!compact && (
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
              {displaySub}
            </p>
          </div>
        )}

        {!compact && (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform dark:text-zinc-500 ${
              aberto ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 bottom-full mb-2 z-50 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-2xl md:right-0 md:bottom-auto md:top-full md:mt-2"
        >
          <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
            <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {displayName}
            </p>
            {email && (
              <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                {email}
              </p>
            )}
          </div>

          <div className="py-1">
            <Link
              href="/conta"
              onClick={() => setAberto(false)}
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <User className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span>Sua conta</span>
            </Link>
          </div>

          <div className="border-t border-zinc-100 pt-1 dark:border-zinc-800">
            <LogoutButton className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40">
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </LogoutButton>
          </div>
        </div>
      )}
    </div>
  );
}
