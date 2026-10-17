"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Check,
  ChevronRight,
  Monitor,
  Moon,
  Palette,
  Sun,
} from "lucide-react";

const opcoes = [
  {
    valor: "light",
    titulo: "Claro",
    descricao: "Aparencia clara",
    Icone: Sun,
  },
  {
    valor: "dark",
    titulo: "Escuro",
    descricao: "Aparencia escura",
    Icone: Moon,
  },
  {
    valor: "system",
    titulo: "Sistema",
    descricao: "Segue seu dispositivo",
    Icone: Monitor,
  },
] as const;

export function SeletorAparencia() {
  const { theme, setTheme } = useTheme();

  const [aberto, setAberto] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  return (
    <div className="min-w-0 rounded-xl border border-[#E2E2DD] bg-[#F9F9F7] dark:border-[#3F3F3B] dark:bg-[#2B2B29]">
      <button
        type="button"
        onClick={() => setAberto((anterior) => !anterior)}
        aria-expanded={aberto}
        aria-controls="opcoes-aparencia"
        className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-colors hover:bg-[#F0F0EC] dark:hover:bg-[#333331]"
      >
        <Palette className="h-4 w-4 shrink-0 text-[#666662] dark:text-[#B8B8B2]" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
            Aparência
          </p>

          <p className="mt-1 text-xs text-[#666662] dark:text-[#A1A1AA]">
            {montado
              ? theme === "light"
                ? "Tema claro"
                : theme === "system"
                  ? "Tema do dispositivo"
                  : "Tema escuro"
              : "Claro, Escuro ou Sistema"}
          </p>
        </div>

        <ChevronRight
          className={`h-4 w-4 shrink-0 text-[#888882] transition-transform ${
            aberto ? "rotate-90" : ""
          }`}
        />
      </button>

      {aberto && (
        <div
          id="opcoes-aparencia"
          className="space-y-2 border-t border-[#E2E2DD] p-3 dark:border-[#3F3F3B]"
        >
          {opcoes.map(({ valor, titulo, descricao, Icone }) => {
            const selecionado = montado && theme === valor;

            return (
              <button
                key={valor}
                type="button"
                disabled={!montado}
                aria-pressed={selecionado}
                onClick={() => setTheme(valor)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors disabled:opacity-50 ${
                  selecionado
                    ? "border-[#2F2F2D] bg-white dark:border-[#F4F4F0] dark:bg-[#181817]"
                    : "border-transparent hover:bg-white dark:hover:bg-[#333331]"
                }`}
              >
                <Icone className="h-4 w-4 shrink-0 text-[#666662] dark:text-[#B8B8B2]" />

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {titulo}
                  </span>

                  <span className="block text-xs text-[#666662] dark:text-[#A1A1AA]">
                    {descricao}
                  </span>
                </span>

                {selecionado && (
                  <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}