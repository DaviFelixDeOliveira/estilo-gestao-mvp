"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  Banknote,
  Check,
  CheckCircle2,
  CreditCard,
  Info,
  Loader2,
  MoreHorizontal,
  QrCode,
  RotateCcw,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

export type FormaPagamento =
  | "PIX"
  | "DINHEIRO"
  | "DEBITO"
  | "CREDITO"
  | "OUTRO";

type FormasPagamentoConfigProps = {
  formasPagamentoIniciais: FormaPagamento[];
};

const ORDEM_FIXA: FormaPagamento[] = [
  "PIX",
  "DINHEIRO",
  "DEBITO",
  "CREDITO",
  "OUTRO",
];

const CONFIG_METODOS: {
  codigo: FormaPagamento;
  nome: string;
  descricao: string;
  icone: typeof QrCode;
}[] = [
  {
    codigo: "PIX",
    nome: "Pix",
    descricao: "Pagamento instantâneo via QR Code ou chave.",
    icone: QrCode,
  },
  {
    codigo: "DINHEIRO",
    nome: "Dinheiro",
    descricao: "Pagamento presencial em cédulas.",
    icone: Banknote,
  },
  {
    codigo: "DEBITO",
    nome: "Cartão de Débito",
    descricao: "Débito automático na maquininha.",
    icone: CreditCard,
  },
  {
    codigo: "CREDITO",
    nome: "Cartão de Crédito",
    descricao: "Visa, Mastercard, Elo, etc.",
    icone: CreditCard,
  },
  {
    codigo: "OUTRO",
    nome: "Outros",
    descricao: "Vales, convênios e outros meios.",
    icone: MoreHorizontal,
  },
];

function normalizarLista(
  formas: FormaPagamento[] | null | undefined
): FormaPagamento[] {
  return ORDEM_FIXA.filter((forma) =>
    (formas ?? []).includes(forma)
  );
}

function conjuntosIguais(
  a: FormaPagamento[],
  b: FormaPagamento[]
) {
  if (a.length !== b.length) {
    return false;
  }

  const conjuntoB = new Set(b);
  return a.every((forma) => conjuntoB.has(forma));
}

export function FormasPagamentoConfig({
  formasPagamentoIniciais,
}: FormasPagamentoConfigProps) {
  const supabase = useMemo(() => createClient(), []);

  const [selecionadas, setSelecionadas] = useState<FormaPagamento[]>(
    () =>
      normalizarLista(
        formasPagamentoIniciais as FormaPagamento[] | null | undefined
      )
  );
  const [baseline, setBaseline] = useState<FormaPagamento[]>(
    () =>
      normalizarLista(
        formasPagamentoIniciais as FormaPagamento[] | null | undefined
      )
  );

  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    tipo: "sucesso" | "erro";
  } | null>(null);

  const [mostrarConfirmarSalvar, setMostrarConfirmarSalvar] =
    useState(false);
  const [mostrarConfirmarDescartar, setMostrarConfirmarDescartar] =
    useState(false);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  const metodosModificados = useMemo(() => {
    if (conjuntosIguais(selecionadas, baseline)) {
      return [];
    }

    const alterados: string[] = [];

    for (const metodo of CONFIG_METODOS) {
      const ativoAntes = baseline.includes(metodo.codigo);
      const ativoAgora = selecionadas.includes(metodo.codigo);

      if (ativoAntes !== ativoAgora) {
        alterados.push(metodo.nome);
      }
    }

    return alterados;
  }, [selecionadas, baseline]);

  const isDirty = metodosModificados.length > 0;

  const ativas = selecionadas.length;

  function alternar(codigo: FormaPagamento) {
    setSelecionadas((atuais) =>
      atuais.includes(codigo)
        ? atuais.filter((item) => item !== codigo)
        : [...atuais, codigo].sort(
            (a, b) =>
              ORDEM_FIXA.indexOf(a) - ORDEM_FIXA.indexOf(b)
          )
    );

    setErroGeral(null);
  }

  function validar() {
    if (selecionadas.length === 0) {
      setErroGeral(
        "Selecione pelo menos uma forma de pagamento."
      );
      return false;
    }

    setErroGeral(null);
    return true;
  }

  async function confirmarSalvar() {
    setMostrarConfirmarSalvar(false);

    if (!validar()) {
      return;
    }

    setSalvando(true);

    try {
      const { error } = await supabase.rpc(
        "update_barbershop_payment_methods",
        {
          p_formas_pagamento: ORDEM_FIXA.filter((forma) =>
            selecionadas.includes(forma)
          ),
        }
      );

      if (error) {
        setToast({
          message:
            "Não foi possível salvar as formas de pagamento. Tente novamente.",
          tipo: "erro",
        });
        return;
      }

      setBaseline([...selecionadas]);
      setErroGeral(null);
      setToast({
        message: "Formas de pagamento atualizadas com sucesso.",
        tipo: "sucesso",
      });
    } finally {
      setSalvando(false);
    }
  }

  function confirmarDescartar() {
    setSelecionadas([...baseline]);
    setErroGeral(null);
    setMostrarConfirmarDescartar(false);
    setToast({ message: "Alterações descartadas.", tipo: "sucesso" });
  }

  const botaoSalvarClasse =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm " +
    (isDirty && !salvando
      ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] hover:opacity-90 cursor-pointer active:scale-95"
      : "bg-[#E2E2DD]/70 dark:bg-[#3F3F3B]/60 text-[#888882] cursor-not-allowed");

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 max-w-full overflow-hidden">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 right-4 sm:right-6 z-[80] p-4 rounded-2xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-2xl border border-neutral-700 dark:border-neutral-200 flex items-center gap-3 animate-fadeIn"
        >
          {toast.tipo === "sucesso" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 dark:text-red-600 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-neutral-400 hover:text-white dark:hover:text-black p-1 cursor-pointer"
            aria-label="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {mostrarConfirmarSalvar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#222220] rounded-2xl p-6 border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Salvar alterações?
                </h3>
                <p className="text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                  As formas selecionadas ficam disponíveis no PDV e na
                  configuração da Vitrine Digital.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarConfirmarSalvar(false)}
                disabled={salvando}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#666662] dark:text-[#B8B8B2] hover:bg-[#EEEDE7] dark:hover:bg-[#2B2B29] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmarSalvar()}
                disabled={salvando}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] hover:opacity-90 transition-opacity cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                {salvando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{salvando ? "Salvando..." : "Salvar alterações"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarConfirmarDescartar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#222220] rounded-2xl p-6 border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Descartar alterações?
                </h3>
                <p className="text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5">
                  As formas de pagamento voltarão para as últimas salvas.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarConfirmarDescartar(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#666662] dark:text-[#B8B8B2] hover:bg-[#EEEDE7] dark:hover:bg-[#2B2B29] transition-colors cursor-pointer"
              >
                Continuar editando
              </button>
              <button
                type="button"
                onClick={confirmarDescartar}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                Descartar alterações
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
        {isDirty && (
          <button
            type="button"
            onClick={() => setMostrarConfirmarDescartar(true)}
            disabled={salvando}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white bg-white dark:bg-[#222220] hover:bg-[#EEEDE7] dark:hover:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Descartar</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (validar()) {
              setMostrarConfirmarSalvar(true);
            }
          }}
          disabled={salvando || !isDirty}
          className={botaoSalvarClasse + " w-full sm:w-auto justify-center"}
        >
          {salvando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>{salvando ? "Salvando..." : "Salvar alterações"}</span>
        </button>
      </div>

      {isDirty && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/25 dark:border-amber-400/25 flex items-start sm:items-center gap-3 animate-fadeIn">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
              Você possui alterações não salvas
            </p>
            <p className="text-[11px] sm:text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5">
              Formas com edições pendentes:{" "}
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {metodosModificados.join(", ")}
              </span>
            </p>
          </div>
        </div>
      )}

      {erroGeral && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{erroGeral}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F4F4F0] dark:border-[#2B2B29]">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Métodos aceitos
                </h2>
                <p className="text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5">
                  Ative as formas de pagamento que sua barbearia oferece aos
                  clientes.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0 self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {ativas} de {ORDEM_FIXA.length} ativas
              </span>
            </div>

            <div className="divide-y divide-[#E2E2DD] dark:divide-[#3F3F3B]">
              {CONFIG_METODOS.map(
                ({ codigo, nome, descricao, icone: Icone }) => {
                  const ativo = selecionadas.includes(codigo);

                  return (
                    <div
                      key={codigo}
                      className="py-4 sm:py-5 flex items-start sm:items-center justify-between gap-3.5"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            ativo
                              ? "bg-[#FAF9F5] dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-white border border-[#E2E2DD] dark:border-[#3F3F3B]"
                              : "bg-neutral-100 dark:bg-neutral-800 text-[#888882] border border-[#E2E2DD] dark:border-[#3F3F3B]"
                          }`}
                        >
                          <Icone className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs sm:text-sm font-bold tracking-tight ${
                                ativo
                                  ? "text-[#2F2F2D] dark:text-[#F4F4F0]"
                                  : "text-[#666662] dark:text-[#B8B8B2]"
                              }`}
                            >
                              {nome}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                ativo
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-neutral-100 dark:bg-neutral-800 text-[#888882] border border-[#E2E2DD] dark:border-[#3F3F3B]"
                              }`}
                            >
                              {ativo ? "Ativo" : "Inativo"}
                            </span>
                          </div>

                          <p className="text-[11px] sm:text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5 leading-relaxed break-words">
                            {descricao}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pt-0.5 sm:pt-0">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={ativo}
                          aria-label={`Ativar ou desativar ${nome}`}
                          disabled={salvando}
                          onClick={() => alternar(codigo)}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2F2F2D]/20 dark:focus:ring-white/20 disabled:opacity-50 ${
                            ativo
                              ? "bg-emerald-600 dark:bg-emerald-500"
                              : "bg-[#CFCFC8] dark:bg-[#555550]"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-1 left-1 ${
                              ativo ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Uso no PDV
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                As formas de pagamento salvas ficam disponíveis ao registrar
                pagamentos das vendas no PDV.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Info className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Vitrine Digital
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                As formas salvas são usadas na configuração da Vitrine Digital.
                A exibição na vitrine pública está prevista para uma etapa
                futura.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Store className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Outras configurações da barbearia
              </h3>
            </div>

            <div className="space-y-2">
              <Link
                href="/configuracoes/barbearia/dados"
                className="w-full p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between text-xs transition-colors text-left"
              >
                <span className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Dados da barbearia
                </span>
              </Link>
              <Link
                href="/configuracoes/barbearia/endereco"
                className="w-full p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between text-xs transition-colors text-left"
              >
                <span className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Endereço
                </span>
              </Link>
              <Link
                href="/configuracoes/barbearia/horarios"
                className="w-full p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between text-xs transition-colors text-left"
              >
                <span className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Horários de atendimento
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
