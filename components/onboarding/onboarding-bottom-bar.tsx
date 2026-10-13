"use client";

import {
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";

type OnboardingBottomBarProps = {
  isFirstStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onContinue: () => void;
};

export function OnboardingBottomBar({
  isFirstStep,
  isSubmitting,
  onBack,
  onContinue,
}: OnboardingBottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E9E9E4] bg-[#FAF9F5]/95 p-3 backdrop-blur-md dark:border-white/10 dark:bg-[#0B0D0E]/95 sm:p-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="hidden cursor-pointer items-center gap-2 rounded-xl border border-[#D5D4CD] bg-white px-5 py-3 text-xs font-bold text-[#1E1E1C] shadow-xs transition-all hover:bg-[#F4F4F0] active:scale-95 sm:inline-flex dark:border-white/10 dark:bg-[#18191E] dark:text-white dark:hover:bg-[#20232A] sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4" />

          <span>{isFirstStep ? "Início" : "Voltar"}</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={isSubmitting}
          className="group flex cursor-pointer items-center gap-2 rounded-xl bg-[#C92A2A] px-6 py-3 text-xs font-bold text-white shadow-md shadow-red-950/20 transition-all hover:bg-[#B42318] hover:shadow-lg hover:shadow-red-900/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:px-8 sm:text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              <span>Continuar</span>
            </>
          ) : (
            <>
              <span>Continuar</span>

              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
