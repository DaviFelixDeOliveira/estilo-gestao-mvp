
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";

export function CancelarExclusaoButton() {
  const router = useRouter();

  const [cancelando, setCancelando] = useState(false);
  const [erro, setErro] = useState("");
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!erro) return;

    const timeout = window.setTimeout(() => {
      setErro("");
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [erro]);

  async function cancelarExclusao() {
    if (cancelando) return;

    setErro("");
    setCancelando(true);

    try {
      const resposta = await fetch(
        "/api/conta/exclusao/cancelar",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok || !dados.sucesso) {
        setErro(
          dados.erro ||
            "Não foi possível cancelar a exclusão. Tente novamente."
        );
        return;
      }

      // A solicitação foi cancelada no servidor.
      // Agora o usuário pode voltar ao sistema.
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setErro(
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
      );
    } finally {
      setCancelando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={cancelarExclusao}
        disabled={cancelando}
        className="mt-6 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2F2F2D] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#444440] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#F4F4F0] dark:text-[#181817] dark:hover:bg-white"
      >
        {cancelando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Cancelando exclusão...
          </>
        ) : (
          <>
            <RotateCcw className="h-4 w-4" />
            Cancelar exclusão
          </>
        )}
      </button>

      <p className="mt-3 text-center text-xs leading-5 text-[#888882]">
        Você pode cancelar enquanto estiver dentro do
        prazo de recuperação de 30 dias.
      </p>

      {montado &&
        erro &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 top-5 z-[9999] flex justify-center px-4 sm:inset-x-auto sm:right-6 sm:px-0">
            <div
              role="alert"
              className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-red-200 bg-white p-4 shadow-2xl dark:border-red-900 dark:bg-[#2D2222] sm:w-[400px]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Não foi possível cancelar
                </p>

                <p className="mt-1 text-xs leading-relaxed text-[#777772] dark:text-[#B8B8B2]">
                  {erro}
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar mensagem"
                onClick={() => setErro("")}
                className="rounded-lg p-1 text-[#888882] transition-colors hover:bg-[#F4F4F0] dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
