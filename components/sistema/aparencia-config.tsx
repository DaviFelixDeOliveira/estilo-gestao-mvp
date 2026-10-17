"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Check,
  ChevronRight,
  Info,
  Laptop,
  Moon,
  Save,
  Sun,
} from "lucide-react";

type Tema = "light" | "dark" | "system";

const opcoes = [
  {
    valor: "light",
    titulo: "Claro",
    descricao: "Usa sempre o tema claro.",
    Icone: Sun,
  },
  {
    valor: "dark",
    titulo: "Escuro",
    descricao: "Usa sempre o tema escuro.",
    Icone: Moon,
  },
  {
    valor: "system",
    titulo: "Sistema",
    descricao: "Segue automaticamente o tema do seu dispositivo.",
    Icone: Laptop,
  },
] as const;

function PreviaJanela({ escuro }: { escuro: boolean }) {
  return (
    <div
      className={`flex h-full min-w-0 flex-col rounded-xl border p-2.5 ${
        escuro
          ? "border-[#3A3A38] bg-[#171717]"
          : "border-[#E2E2DD] bg-[#F8F8F6]"
      }`}
    >
      <div className="flex gap-1.5">
        <span
          className={`h-2 w-8 rounded-full ${
            escuro ? "bg-[#3D3D3B]" : "bg-[#D8D8D2]"
          }`}
        />
        <span
          className={`h-2 w-4 rounded-full ${
            escuro ? "bg-[#30302E]" : "bg-[#E6E6E0]"
          }`}
        />
      </div>

      <div className="mt-5 space-y-2">
        <div
          className={`h-2 w-4/5 rounded-full ${
            escuro ? "bg-[#3D3D3B]" : "bg-[#D8D8D2]"
          }`}
        />
        <div
          className={`h-2 w-3/5 rounded-full ${
            escuro ? "bg-[#30302E]" : "bg-[#E6E6E0]"
          }`}
        />
      </div>

      <div
        className={`mt-auto flex h-7 items-center gap-2 rounded-lg border px-2 ${
          escuro
            ? "border-[#383836] bg-[#242422]"
            : "border-[#E2E2DD] bg-white"
        }`}
      >
        <span
          className={`h-3 w-3 shrink-0 rounded-full ${
            escuro ? "bg-[#E5E5E0]" : "bg-[#30302E]"
          }`}
        />
        <span
          className={`h-1.5 w-12 rounded-full ${
            escuro ? "bg-[#484846]" : "bg-[#D8D8D2]"
          }`}
        />
      </div>
    </div>
  );
}

function PreviaTema({ tema }: { tema: Tema }) {
  if (tema === "system") {
    return (
      <div className="grid h-32 grid-cols-2 gap-1 overflow-hidden rounded-xl">
        <PreviaJanela escuro={false} />
        <PreviaJanela escuro />
      </div>
    );
  }

  return (
    <div className="h-32">
      <PreviaJanela escuro={tema === "dark"} />
    </div>
  );
}

function aplicarPreviaTema(tema: Tema) {
  const escuro =
    tema === "dark" ||
    (tema === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const html = document.documentElement;

  html.classList.remove("light", "dark");
  html.classList.add(escuro ? "dark" : "light");
  html.style.colorScheme = escuro ? "dark" : "light";
}
export function AparenciaConfig({
  temaInicial,
}: {
  temaInicial: string | null;
}) {
  const temaBanco: Tema =
    temaInicial === "CLARO"
      ? "light"
      : temaInicial === "ESCURO"
        ? "dark"
        : "system";

  const { setTheme } = useTheme();
  const supabase = useMemo(() => createClient(), []);

  const [montado, setMontado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [temaSalvo, setTemaSalvo] = useState<Tema>(temaBanco);
  const [temaEscolhido, setTemaEscolhido] = useState<Tema>(temaBanco);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [sistemaEscuro, setSistemaEscuro] = useState(false);
  const temaConfirmadoRef = useRef<Tema>(temaBanco);

  const inicializadoRef = useRef(false);

  useEffect(() => {
    if (inicializadoRef.current) return;

    inicializadoRef.current = true;
    setTheme(temaBanco);
    setMontado(true);
  }, [setTheme, temaBanco]);

  useEffect(() => {
    const consulta = window.matchMedia("(prefers-color-scheme: dark)");

    const atualizar = () => {
      setSistemaEscuro(consulta.matches);
    };

    atualizar();
    consulta.addEventListener("change", atualizar);

    return () => {
      consulta.removeEventListener("change", atualizar);
    };
  }, []);

  useEffect(() => {
    if (montado) {
      aplicarPreviaTema(temaEscolhido);
    }
  }, [montado, temaEscolhido, sistemaEscuro]);

  useEffect(() => {
    return () => {
      aplicarPreviaTema(temaConfirmadoRef.current);
    };
  }, []);
  const temaSelecionado = temaEscolhido;

  const temaAtivo =
    temaEscolhido === "dark" ||
    (temaEscolhido === "system" && sistemaEscuro)
      ? "Modo Escuro"
      : "Modo Claro";

  const haAlteracoes = temaEscolhido !== temaSalvo;

  const podeEscolher = montado && !salvando;

  function selecionarTema(valor: Tema) {
    if (!podeEscolher) return;

    setTemaEscolhido(valor);
    aplicarPreviaTema(valor);
    setMensagem("");
    setErro("");
  }

  async function confirmarPreferencia() {
    if (!haAlteracoes || salvando || !montado) return;

    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      const valoresBanco: Record<Tema, string> = {
        light: "CLARO",
        dark: "ESCURO",
        system: "SISTEMA",
      };

      const { error } = await supabase.rpc(
        "update_account_theme",
        { p_tema: valoresBanco[temaEscolhido] }
      );

      if (error) {
        throw error;
      }

      temaConfirmadoRef.current = temaEscolhido;
      setTheme(temaEscolhido);
      setTemaSalvo(temaEscolhido);
      setMensagem(
        "Sua preferência de aparência foi salva com sucesso."
      );
    } catch (error) {
      const detalhe =
        error instanceof Error
          ? error.message
          : "Erro desconhecido.";

      setErro(`Não foi possível salvar: ${detalhe}`);
    } finally {
      setSalvando(false);
    }
  }
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xs text-[#888882] dark:text-[#A1A1AA]">
            <Link
              href="/configuracoes/conta/perfil"
              className="hover:underline"
            >
              Sua conta
            </Link>

            <ChevronRight className="h-3.5 w-3.5" />

            <span className="font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
              Aparência
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#2F2F2D] sm:text-3xl dark:text-[#F4F4F0]">
            Aparência
          </h1>

          <p className="mt-1 text-sm text-[#666662] dark:text-[#B8B8B2]">
            Escolha como o Estilo e Gestão aparece para você.
          </p>
        </div>

        <button
          type="button"
          disabled={!podeEscolher || !haAlteracoes}
          onClick={confirmarPreferencia}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2F2F2D] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-black disabled:opacity-50 sm:w-auto dark:bg-[#F4F4F0] dark:text-[#181817] dark:hover:bg-white"
        >
          <Save className="h-4 w-4" />
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </header>

      {(erro || mensagem) && (
        <div
          role={erro ? "alert" : "status"}
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            erro
              ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {erro || mensagem}
        </div>
      )}


      <section className="rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-xs sm:p-7 dark:border-[#3F3F3B] dark:bg-[#222220]">
        <div className="flex flex-col gap-3 border-b border-[#E2E2DD] pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#3F3F3B]">
          <div>
            <h2 className="text-lg font-bold text-[#1C1C1A] dark:text-[#F4F4F0]">
              Tema do sistema
            </h2>

            <p className="mt-1 text-xs text-[#666662] dark:text-[#A1A1AA]">
              Selecione uma opção. A mudança é aplicada imediatamente em todo o sistema.
            </p>
          </div>

          <span className="w-fit rounded-lg bg-[#F4F4F0] px-3 py-2 text-xs text-[#666662] dark:bg-[#2B2B29] dark:text-[#A1A1AA]">
            Visual ativo:{" "}
            <strong className="text-[#2F2F2D] dark:text-[#F4F4F0]">
              {temaAtivo}
            </strong>
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {opcoes.map(({ valor, titulo, descricao, Icone }) => {
            const selecionado = montado && temaSelecionado === valor;

            return (
              <button
                key={valor}
                type="button"
                disabled={!podeEscolher}
                aria-pressed={selecionado}
                onClick={() => selecionarTema(valor)}
                className={`relative flex min-w-0 flex-col rounded-2xl border-2 p-4 text-left transition-colors disabled:opacity-60 ${
                  selecionado
                    ? "border-[#2F2F2D] bg-[#F4F4F0] dark:border-[#F4F4F0] dark:bg-[#2B2B29]"
                    : "border-[#E2E2DD] bg-[#FAFAF8] hover:border-[#9A9A94] dark:border-[#3F3F3B] dark:bg-[#1C1C1A] dark:hover:border-[#777771]"
                }`}
              >
                {selecionado && (
                  <span className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#2F2F2D] text-white dark:bg-[#F4F4F0] dark:text-[#181817]">
                    <Check className="h-4 w-4" />
                  </span>
                )}

                <div className="w-full">
                  <PreviaTema tema={valor} />
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <Icone className="h-4 w-4 text-[#666662] dark:text-[#A1A1AA]" />

                  <span className="text-sm font-bold text-[#1C1C1A] dark:text-[#F4F4F0]">
                    {titulo}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-[#666662] dark:text-[#B8B8B2]">
                  {descricao}
                  {valor === "system" && montado && (
                    <span>
                      {" "}
                      (atualmente {sistemaEscuro ? "Escuro" : "Claro"}).
                    </span>
                  )}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#E2E2DD] bg-[#F4F4F0] p-4 dark:border-[#3F3F3B] dark:bg-[#2B2B29]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#777771] dark:text-[#A1A1AA]" />

          <div>
            <p className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
              Padrão do Sistema Inteligente
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#666662] dark:text-[#B8B8B2]">
              Ao escolher Sistema, o Estilo e Gestão acompanha automaticamente o tema do seu computador ou celular. Se você mudar a aparência do dispositivo, o painel também será atualizado.
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />

          <div>
            <p className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
              Somente o seu painel
            </p>

            <p className="mt-1 text-xs leading-relaxed text-[#666662] dark:text-[#B8B8B2]">
              Esta preferência altera apenas seu painel neste navegador. A Vitrine pública da barbearia não muda.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}