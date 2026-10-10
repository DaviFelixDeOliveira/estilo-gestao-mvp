"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scissors, Home, ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] dark:bg-[#181817] text-[#2F2F2D] dark:text-[#F4F4F0] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200 select-none">
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between pt-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F2F2D] dark:focus-visible:ring-white rounded-lg p-1"
          aria-label="Ir para a página inicial"
        >
          <div className="w-8 h-8 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] flex items-center justify-center font-extrabold text-xs shadow-xs transition-transform group-hover:scale-105">
            <Scissors className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-sm tracking-tight block text-[#2F2F2D] dark:text-[#F4F4F0]">
              Gestão para Barbearias
            </span>
            <span className="text-[10px] text-[#666662] dark:text-[#B8B8B2] -mt-0.5 block">
              Sistema de Gestão
            </span>
          </div>
        </Link>
      </header>

      {/* Main 404 Card */}
      <main className="w-full max-w-lg mx-auto my-auto py-8">
        <div className="relative w-full bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl shadow-sm p-6 sm:p-9 text-center space-y-6 overflow-hidden animate-fadeIn">
          {/* Decorative Glow */}
          <div
            className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-neutral-200/40 dark:bg-neutral-800/20 blur-2xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-neutral-200/40 dark:bg-neutral-800/20 blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          {/* 404 Watermark & Icon */}
          <div className="relative z-10 flex flex-col items-center pt-2">
            <div className="relative flex items-center justify-center">
              <span
                className="font-black text-6xl sm:text-7xl text-[#EEEDE7] dark:text-[#2B2B29] tracking-tighter select-none"
                aria-hidden="true"
              >
                404
              </span>
              <div className="absolute w-16 h-16 rounded-2xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] text-[#2F2F2D] dark:text-[#F4F4F0] flex items-center justify-center shadow-xs">
                <Compass className="w-8 h-8 text-[#888882]" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF9F5] dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2] text-[11px] font-semibold border border-[#E2E2DD] dark:border-[#3F3F3B] mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#888882]" aria-hidden="true" />
              <span>ERRO 404</span>
            </div>
          </div>

          {/* Heading & Text */}
          <div className="relative z-10 space-y-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
              Página não encontrada
            </h1>
            <p className="text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2] leading-relaxed max-w-sm mx-auto">
              O endereço pode estar incorreto ou a página pode não existir.
            </p>
          </div>

          {/* Actions */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto min-w-[180px] min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Ir para o início</span>
            </Link>

            <button
              type="button"
              onClick={handleGoBack}
              className="w-full sm:w-auto min-w-[140px] min-h-[44px] px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-white dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#383835] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 shrink-0 text-[#888882]" aria-hidden="true" />
              <span>Voltar</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto py-3 text-center text-xs text-[#888882]">
        <p>© {new Date().getFullYear()} Gestão para Barbearias. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
