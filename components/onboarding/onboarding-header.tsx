"use client";

import {
  ArrowLeft,
  Check,
  Layers,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";

type OnboardingHeaderProps = {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick: (step: number) => void;
  onExit: () => void;
};

export function OnboardingHeader({
  currentStep,
  totalSteps,
  stepTitles,
  onStepClick,
  onExit,
}: OnboardingHeaderProps) {
  const progressPercent = Math.round(
    (currentStep / totalSteps) * 100
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E9E9E4] bg-[#FAF9F5]/95 backdrop-blur-md transition-colors duration-200 dark:border-white/10 dark:bg-[#0B0D0E]/95">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-18">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="-ml-2 cursor-pointer rounded-xl p-2 text-[#666662] transition-colors hover:bg-black/5 hover:text-[#1E1E1C] sm:hidden dark:text-[#A1A1AA] dark:hover:bg-white/5 dark:hover:text-white"
              title="Voltar"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E9E9E4] bg-white text-[#C92A2A] shadow-xs dark:border-white/10 dark:bg-[#18191E] dark:text-red-500">
                <Layers className="h-4 w-4" strokeWidth={2.4} />
              </div>

              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-bold tracking-tight leading-tight text-[#1E1E1C] dark:text-[#F4F4F0]">
                  Painel do Barbeiro
                </span>

                <span className="text-[11px] font-medium leading-tight text-[#666662] dark:text-[#A1A1AA]">
                  Configuração Inicial
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#666662] dark:text-[#A1A1AA] sm:hidden">
            <span>
              Passo {currentStep} de {totalSteps}
            </span>

            <span className="font-bold text-[#C92A2A] dark:text-red-400">
              ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LogoutButton />
          </div>
        </div>

        <div className="hidden border-t border-[#E9E9E4]/60 py-3 dark:border-white/5 sm:block">
          <nav
            aria-label="Progresso da configuração"
            className="flex items-center justify-between gap-2"
          >
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1;
              const isCurrent =
                stepNumber === currentStep;
              const isCompleted =
                stepNumber < currentStep;
              const isClickable =
                stepNumber <= currentStep;

              return (
                <button
                  key={title}
                  type="button"
                  disabled={!isClickable}
                  onClick={() =>
                    isClickable && onStepClick(stepNumber)
                  }
                  className={`flex flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-all ${
                    isClickable
                      ? "cursor-pointer"
                      : "cursor-default"
                  } ${
                    isCurrent
                      ? "bg-red-500/10 font-bold text-[#C92A2A] dark:bg-red-500/15 dark:text-red-400"
                      : isCompleted
                        ? "text-[#1E1E1C] hover:bg-black/5 dark:text-[#E4E4E0] dark:hover:bg-white/5"
                        : "text-[#8E8E89] dark:text-[#52525B]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isCurrent
                        ? "bg-[#C92A2A] text-white shadow-xs"
                        : isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-[#E9E9E4] text-[#666662] dark:bg-[#1E2024] dark:text-[#71717A]"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    ) : (
                      stepNumber
                    )}
                  </span>

                  <span className="truncate text-xs tracking-tight">
                    {title}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="h-1 w-full bg-[#E9E9E4] dark:bg-white/5">
        <div
          className="h-full bg-[#C92A2A] transition-all duration-300 ease-out dark:bg-red-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
}
