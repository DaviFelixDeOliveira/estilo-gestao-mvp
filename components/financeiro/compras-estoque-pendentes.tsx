"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";

type CompraPendente = {
  id: string;
  produto_nome: string;
  quantidade: number;
  valor_previsto: number;
  data_vencimento: string | null;
  created_at: string;
};

type ListaCompras = { total: number; itens: CompraPendente[] };

function moeda(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function dataLocal(): string {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const pegar = (tipo: string) => partes.find((parte) => parte.type === tipo)?.value ?? "";
  return `${pegar("year")}-${pegar("month")}-${pegar("day")}`;
}

function formatarCentavos(value: string) {
  const digitos = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 12);
  return (Number(digitos || "0") / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function converterValor(valor: string): number {
  const numero = Number(valor.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(numero) ? Math.round(numero * 100) / 100 : NaN;
}

function formatarData(data: string | null): string {
  if (!data) return "Sem vencimento informado";
  const [ano, mes, dia] = data.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

export function ComprasEstoquePendentes({ onPaid }: { onPaid?: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [dados, setDados] = useState<ListaCompras>({ total: 0, itens: [] });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [selecionada, setSelecionada] = useState<CompraPendente | null>(null);
  const [valor, setValor] = useState("0,00");
  const [dataPagamento, setDataPagamento] = useState(dataLocal);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setErro(null);
    const { data, error } = await supabase.rpc("listar_compras_estoque_pendentes", {
      p_limite: 100,
    });
    if (error) {
      setErro("Não foi possível carregar as compras pendentes.");
      return;
    }
    const lista = data as ListaCompras | null;
    setDados({
      total: Number(lista?.total || 0),
      itens: Array.isArray(lista?.itens) ? lista.itens : [],
    });
  }, [supabase]);

  useEffect(() => {
    let ativo = true;
    async function iniciar() {
      try {
        await carregar();
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    void iniciar();
    return () => { ativo = false; };
  }, [carregar]);

  const abrirPagamento = (compra: CompraPendente) => {
    setErro(null);
    setSelecionada(compra);
    setValor(Number(compra.valor_previsto).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }));
    setDataPagamento(dataLocal());
  };

  const pagar = async () => {
    if (!selecionada || salvando) return;
    const total = converterValor(valor);
    if (!Number.isFinite(total) || total <= 0) {
      setErro("Informe um valor pago maior que zero.");
      return;
    }
    if (!dataPagamento) {
      setErro("Informe a data do pagamento.");
      return;
    }
    if (dataPagamento > dataLocal()) {
      setErro("A data do pagamento não pode ser futura.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const { error } = await supabase.rpc("pagar_compra_estoque_pendente", {
        p_compra_id: selecionada.id,
        p_valor_pago: total,
        p_data_pagamento: dataPagamento,
      });
      if (error) throw error;
      setSelecionada(null);
      await carregar();
      onPaid?.();
    } catch (e: unknown) {
      const mensagem = e instanceof Error ? e.message : "Falha ao registrar pagamento.";
      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
            Compras de estoque pendentes ({dados.total})
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2]">
            Compras recebidas, mas ainda não pagas. Elas só entram nas Saídas ao confirmar o pagamento.
          </p>
        </div>
        <button type="button" onClick={() => void carregar()}
          className="rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] px-3 py-2 text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
          Atualizar
        </button>
      </div>

      {erro && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{erro}</p>}
      {carregando ? (
        <p className="text-sm text-[#666662] dark:text-[#B8B8B2]">Carregando compras...</p>
      ) : dados.itens.length === 0 ? (
        <p className="text-sm text-[#666662] dark:text-[#B8B8B2]">Nenhuma compra de estoque pendente.</p>
      ) : (
        <div className="space-y-2">
          {dados.itens.map((compra) => (
            <div key={compra.id} className="rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-bold text-sm text-[#2F2F2D] dark:text-[#F4F4F0]">
                  {compra.produto_nome} — {compra.quantidade} un.
                </p>
                <p className="text-xs text-[#666662] dark:text-[#B8B8B2] mt-1">
                  Previsto: {moeda(Number(compra.valor_previsto))} · Vencimento: {formatarData(compra.data_vencimento)}
                </p>
              </div>
              <button type="button" onClick={() => abrirPagamento(compra)}
                className="rounded-xl px-3.5 py-2 bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold">
                Marcar como paga
              </button>
            </div>
          ))}
          {dados.total > dados.itens.length && (
            <p className="text-xs text-[#666662]">Exibindo as 100 compras mais recentes.</p>
          )}
        </div>
      )}

      {selecionada && typeof document !== "undefined" && createPortal(
        <div role="dialog" aria-modal="true" aria-labelledby="pagar-compra-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3">
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative w-full max-w-md bg-white dark:bg-[#20201E] rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 id="pagar-compra-title" className="text-lg font-bold text-[#2F2F2D] dark:text-white">
              Confirmar pagamento da compra
            </h3>
            <p className="text-sm text-[#666662] dark:text-[#B8B8B2]">
              {selecionada.produto_nome} — {selecionada.quantidade} un. Previsão: {moeda(Number(selecionada.valor_previsto))}.
              O estoque não será alterado novamente.
            </p>
            {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
            <label className="block space-y-1 text-sm text-[#2F2F2D] dark:text-[#F4F4F0]">
              <span className="font-semibold">Valor efetivamente pago (R$) *</span>
              <input type="text" inputMode="numeric" value={valor}
                onChange={(e) => setValor(formatarCentavos(e.target.value))}
                className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-[#181817] dark:border-[#3F3F3B]" />
            </label>
            <label className="block space-y-1 text-sm text-[#2F2F2D] dark:text-[#F4F4F0]">
              <span className="font-semibold">Data do pagamento *</span>
              <input type="date" value={dataPagamento} max={dataLocal()} onChange={(e) => setDataPagamento(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-[#181817] dark:border-[#3F3F3B]" />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" disabled={salvando} onClick={() => { setSelecionada(null); setErro(null); }}
                className="border px-4 py-2 rounded-xl text-sm dark:border-[#3F3F3B] dark:text-white">Voltar</button>
              <button type="button" disabled={salvando} onClick={() => void pagar()}
                className="px-4 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-sm font-bold disabled:opacity-50">
                {salvando ? "Registrando..." : "Confirmar pagamento"}
              </button>
            </div>
          </div>
        </div>, document.body
      )}
    </section>
  );
}
