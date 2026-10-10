"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Scissors, Home, RotateCcw, AlertOctagon } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Falha crítica global capturada:", error?.message);
  }, [error]);

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col justify-between bg-[#F4F4F0] dark:bg-[#181817] text-[#2F2F2D] dark:text-[#F4F4F0] p-4 sm:p-6 font-sans antialiased select-none">
        {/* Top Header */}
        <header className="w-full max-w-4xl mx-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2F2F2D] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
              <Scissors className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-sm tracking-tight block text-[#2F2F2D]">
                Gestão para Barbearias
              </span>
              <span className="text-[10px] text-[#666662] -mt-0.5 block">
                Sistema de Gestão
              </span>
            </div>
          </div>
        </header>

        {/* Main Card */}
        <main className="w-full max-w-lg mx-auto my-auto py-8">
          <div className="relative w-full bg-white border border-[#E2E2DD] rounded-2xl shadow-sm p-6 sm:p-9 text-center space-y-6 overflow-hidden">
            {/* Central Icon */}
            <div className="relative z-10 flex flex-col items-center pt-2">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center shadow-xs">
                <AlertOctagon className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF9F5] text-[#666662] text-[11px] font-semibold border border-[#E2E2DD] mt-4">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" aria-hidden="true" />
                <span>ERRO DO SISTEMA</span>
              </div>
            </div>

            {/* Heading & Text */}
            <div className="relative z-10 space-y-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2F2F2D]">
                Algo deu errado
              </h1>
              <p className="text-xs sm:text-sm text-[#666662] leading-relaxed max-w-sm mx-auto">
                O sistema encontrou uma falha inesperada. Tente recarregar a página.
              </p>
            </div>

            {/* Actions */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleReload}
                className="w-full sm:w-auto min-w-[180px] min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#2F2F2D] text-white hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Recarregar página</span>
              </button>

              <Link
                href="/"
                className="w-full sm:w-auto min-w-[160px] min-h-[44px] px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-white border border-[#E2E2DD] text-[#2F2F2D] hover:bg-[#FAF9F5] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <Home className="w-4 h-4 shrink-0 text-[#888882]" aria-hidden="true" />
                <span>Ir para o início</span>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-4xl mx-auto py-3 text-center text-xs text-[#888882]">
          <p>© {new Date().getFullYear()} Gestão para Barbearias. Todos os direitos reservados.</p>
        </footer>
      </body>
    </html>
  );
}
