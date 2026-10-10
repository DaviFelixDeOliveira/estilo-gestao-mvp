"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Theme =
  | "CLARO"
  | "ESCURO"
  | "SISTEMA";

type AppearanceStepProps = {
  initialTheme: Theme;
};

const TEMAS: {
  codigo: Theme;
  nome: string;
  descricao: string;
}[] = [
  {
    codigo: "SISTEMA",
    nome: "Usar tema do dispositivo",
    descricao:
      "Acompanha automaticamente a preferência clara ou escura do dispositivo.",
  },
  {
    codigo: "CLARO",
    nome: "Claro",
    descricao:
      "Mantém o sistema sempre com aparência clara.",
  },
  {
    codigo: "ESCURO",
    nome: "Escuro",
    descricao:
      "Mantém o sistema sempre com aparência escura.",
  },
];

export function AppearanceStep({
  initialTheme,
}: AppearanceStepProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const router = useRouter();

  const [tema, setTema] =
    useState<Theme>(initialTheme);

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (salvando) {
      return;
    }

    setErro("");
    setSalvando(true);

    try {
      const { data, error } =
        await supabase.rpc(
          "save_onboarding_step_6",
          {
            p_tema: tema,
          }
        );

      if (error) {
        console.error(
          "Erro ao concluir onboarding:",
          error.message
        );

        throw new Error(
          "Não foi possível concluir a configuração. Verifique os dados das etapas anteriores e tente novamente."
        );
      }

      if (data !== true) {
        throw new Error(
          "Resposta inválida ao concluir a configuração."
        );
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a configuração."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-7"
    >
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Escolha a aparência do sistema
        </h3>

        <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Você poderá alterar essa preferência
          novamente nas configurações.
        </p>

        <div className="mt-4 grid gap-3">
          {TEMAS.map((item) => {
            const selecionado =
              tema === item.codigo;

            return (
              <button
                key={item.codigo}
                type="button"
                onClick={() =>
                  setTema(item.codigo)
                }
                className={`rounded-xl border p-4 text-left transition ${
                  selecionado
                    ? "border-red-600/40 bg-red-50/60 dark:border-red-500/40 dark:bg-red-950/20"
                    : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      selecionado
                        ? "border-red-600 dark:border-red-500"
                        : "border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {selecionado && (
                      <div className="h-2.5 w-2.5 rounded-full bg-red-600 dark:bg-red-500" />
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.nome}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-zinc-600 dark:text-zinc-400">
                      {item.descricao}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Tudo pronto
        </h3>

        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Ao concluir, sua configuração inicial
          será finalizada e você será levado ao
          painel do sistema.
        </p>
      </div>

      {erro && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {erro}
        </p>
      )}

      <div className="flex justify-end border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:from-red-500 hover:to-red-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvando
            ? "Concluindo..."
            : "Concluir configuração"}
        </button>
      </div>
    </form>
  );
}
