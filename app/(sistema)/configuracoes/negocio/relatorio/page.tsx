"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  Calendar,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  RespostaDadosRelatorio,
  PeriodoRelatorio,
} from "@/components/relatorios/types";
import { EvolutionChart } from "@/components/relatorios/evolution-chart";
import { LucratividadeView } from "@/components/relatorios/lucratividade-view";
import { ExportModal } from "@/components/relatorios/export-modal";

function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  } catch {
    return dateStr;
  }
}

export default function RelatoriosPage() {
  const supabase = useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] = useState<"visao-geral" | "lucratividade">("visao-geral");
  const [periodo, setPeriodo] = useState<PeriodoRelatorio>("mes");

  const hojeISO = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Datas para o período personalizado
  const [customInicio, setCustomInicio] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  });
  const [customFim, setCustomFim] = useState(hojeISO);

  // Modal de período personalizado
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [tempInicio, setTempInicio] = useState(customInicio);
  const [tempFim, setTempFim] = useState(customFim);
  const [customErro, setCustomErro] = useState<string | null>(null);

  // Modal de exportação
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Feedback e Loading
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [dados, setDados] = useState<RespostaDadosRelatorio | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(
    null
  );

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  // Calcula o intervalo de datas (p_inicio e p_fim) de acordo com o período selecionado
  const dateRange = useMemo(() => {
    const now = new Date();
    const hojeStr = now.toISOString().split("T")[0];

    if (periodo === "hoje") {
      return { inicio: hojeStr, fim: hojeStr, label: "Hoje" };
    }

    if (periodo === "semana") {
      const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      return {
        inicio: monday.toISOString().split("T")[0],
        fim: hojeStr,
        label: "Esta semana",
      };
    }

    if (periodo === "mes") {
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const nomeMes = now.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
      const ano2Digitos = String(now.getFullYear()).slice(-2);
      return {
        inicio: inicioMes,
        fim: hojeStr,
        label: `Mês de ${nomeMes}. ${ano2Digitos}`,
      };
    }

    if (periodo === "ano") {
      const inicioAno = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
      return {
        inicio: inicioAno,
        fim: hojeStr,
        label: `Ano de ${now.getFullYear()}`,
      };
    }

    // personalizado
    return {
      inicio: customInicio,
      fim: customFim,
      label: `${formatDateDisplay(customInicio)} a ${formatDateDisplay(customFim)}`,
    };
  }, [periodo, customInicio, customFim]);

  // Carrega os dados reais do Supabase via RPC
  const carregarRelatorio = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const { data, error } = await supabase.rpc("obter_dados_relatorio", {
        p_inicio: dateRange.inicio,
        p_fim: dateRange.fim,
      });

      if (error) throw error;

      if (data) {
        setDados(data as unknown as RespostaDadosRelatorio);
      }
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string; details?: string; hint?: string };
      const comCodigo = e?.code ? ` (código ${e.code})` : "";
      const msg = e?.message
        ? `${e.message}${comCodigo}`
        : "Erro ao carregar dados do relatório.";
      console.error("Relatórios: falha ao carregar dados", err);
      setErro(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  }, [supabase, dateRange, showToast]);

  useEffect(() => {
    let ativo = true;

    async function fetchData() {
      try {
        const { data, error } = await supabase.rpc("obter_dados_relatorio", {
          p_inicio: dateRange.inicio,
          p_fim: dateRange.fim,
        });

        if (!ativo) return;
        if (error) throw error;

        if (data) {
          setDados(data as unknown as RespostaDadosRelatorio);
        }
      } catch (err: unknown) {
        if (!ativo) return;
        const e = err as { code?: string; message?: string; details?: string; hint?: string };
        const comCodigo = e?.code ? ` (código ${e.code})` : "";
        const msg = e?.message
          ? `${e.message}${comCodigo}`
          : "Erro ao carregar dados do relatório.";
        console.error("Relatórios: falha ao carregar dados", err);
        setErro(msg);
        showToast(msg, "error");
      } finally {
        if (ativo) {
          setLoading(false);
          setIsFiltering(false);
        }
      }
    }

    fetchData();

    return () => {
      ativo = false;
    };
  }, [supabase, dateRange, showToast]);

  const handleSelectPeriodo = (p: PeriodoRelatorio) => {
    if (p === "personalizado") {
      setTempInicio(customInicio);
      setTempFim(customFim);
      setCustomErro(null);
      setIsCustomModalOpen(true);
      return;
    }
    setIsFiltering(true);
    setPeriodo(p);
  };

  const handleAplicarPeriodoPersonalizado = () => {
    setCustomErro(null);

    if (!tempInicio || !tempFim) {
      setCustomErro("Selecione as datas inicial e final.");
      return;
    }

    if (tempInicio > hojeISO || tempFim > hojeISO) {
      setCustomErro("O período selecionado não pode incluir datas futuras.");
      return;
    }

    if (tempInicio > tempFim) {
      setCustomErro("A data inicial não pode ser posterior à data final.");
      return;
    }

    setCustomInicio(tempInicio);
    setCustomFim(tempFim);
    setIsCustomModalOpen(false);
    setIsFiltering(true);
    setPeriodo("personalizado");
    showToast("Período personalizado aplicado.");
  };

  // Categoria de maior saída para o rodapé explicativo
  const maiorSaidaCategoria = useMemo(() => {
    if (!dados || !dados.saidasPorCategoria || dados.saidasPorCategoria.length === 0) return null;
    return dados.saidasPorCategoria[0];
  }, [dados]);

  // Forma de pagamento de maior volume
  const maiorEntradaPagamento = useMemo(() => {
    if (!dados || !dados.entradasPorPagamento || dados.entradasPorPagamento.length === 0) return null;
    return dados.entradasPorPagamento[0];
  }, [dados]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-12 max-w-full overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[80] p-3.5 rounded-xl bg-[#2F2F2D] dark:bg-[#20201E] text-white text-xs sm:text-sm font-semibold shadow-2xl border border-neutral-700 flex items-center gap-2.5 animate-fadeIn"
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-neutral-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. HEADER (Título, Badge e Subtítulo) */}
      {/* ======================================================== */}
      <header className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
            Relatórios
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEEDE7] dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2] border border-[#E2E2DD] dark:border-[#3F3F3B]">
            Gerencial
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2]">
          Analise as vendas, entradas, saídas e resultados da sua barbearia por período.
        </p>
      </header>

      {/* ======================================================== */}
      {/* 2. BOTÃO EXPORTAR */}
      {/* ======================================================== */}
      <div>
        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          disabled={loading || !dados}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs font-bold rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] hover:bg-black dark:hover:bg-white shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-50"
        >
          <ArrowDownToLine className="w-4 h-4 shrink-0" />
          <span>Exportar</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. FILTROS DE PERÍODO (Hoje, Semana, Mês, Ano, Personalizado) */}
      {/* ======================================================== */}
      <section className="space-y-2 max-w-full">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-full">
          {(
            [
              { label: "Hoje", val: "hoje" },
              { label: "Semana", val: "semana" },
              { label: "Mês", val: "mes" },
              { label: "Ano", val: "ano" },
              { label: "Personalizado", val: "personalizado" },
            ] as const
          ).map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => handleSelectPeriodo(item.val)}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer truncate ${
                periodo === item.val
                  ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs font-bold"
                  : "bg-white dark:bg-[#20201E] text-[#666662] dark:text-[#B8B8B2] border border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400"
              }`}
            >
              {item.label}
              {item.val === "personalizado" && periodo === "personalizado" && (
                <span className="ml-1 text-[10px] opacity-80">
                  ({formatDateDisplay(customInicio)} - {formatDateDisplay(customFim)})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading Feedback: "Aplicando filtro..." */}
        {isFiltering && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-md animate-fadeIn w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>Aplicando filtro...</span>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 4. ABAS DE NAVEGAÇÃO: [ Visão geral ] [ Lucratividade ] */}
      {/* ======================================================== */}
      <section className="flex items-center gap-2 border-b border-[#E2E2DD] dark:border-[#3F3F3B] pb-2 max-w-full">
        <button
          type="button"
          onClick={() => setActiveTab("visao-geral")}
          className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "visao-geral"
              ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
              : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white bg-transparent"
          }`}
        >
          Visão geral
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("lucratividade")}
          className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "lucratividade"
              ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
              : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white bg-transparent"
          }`}
        >
          Lucratividade
        </button>
      </section>

      {/* ======================================================== */}
      {/* 5. ESTADO DE ERRO OU CARREGAMENTO */}
      {/* ======================================================== */}
      {erro && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs sm:text-sm text-red-800 dark:text-red-300 space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>Não foi possível carregar os dados do relatório.</span>
          </div>
          <p>{erro}</p>
          <button
            type="button"
            onClick={carregarRelatorio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tentar novamente</span>
          </button>
        </div>
      )}

      {loading && !dados && (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-xs text-[#888882]">
          <Loader2 className="w-6 h-6 animate-spin text-[#2F2F2D] dark:text-[#F4F4F0]" />
          <span>Carregando indicadores do relatório...</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. CONTEÚDO PRINCIPAL (COM REF PARA EXPORTAÇÃO) */}
      {/* ======================================================== */}
      {!loading && dados && (
        <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === "visao-geral" && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn max-w-full overflow-hidden">
              {/* Summary KPI Cards */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 max-w-full">
                {/* Faturamento */}
                <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs flex flex-col justify-between min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#888882] truncate">
                    Faturamento
                  </span>
                  <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] mt-1 sm:mt-1.5 tracking-tight truncate">
                    {formatMoney(dados.metrics.faturamento)}
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#666662] dark:text-[#B8B8B2] mt-2 pt-2 border-t border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70 truncate">
                    {dados.metrics.quantidadeVendas} vendas no período.
                  </p>
                </div>

                {/* Entradas */}
                <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-emerald-200/80 dark:border-emerald-950/60 shadow-xs flex flex-col justify-between min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 truncate">
                      Entradas
                    </span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" />
                  </div>
                  <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 sm:mt-1.5 tracking-tight truncate">
                    {formatMoney(dados.metrics.entradas)}
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#666662] dark:text-[#B8B8B2] mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-950/60 truncate">
                    Entradas em caixa.
                  </p>
                </div>

                {/* Saídas */}
                <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-amber-200/80 dark:border-amber-950/60 shadow-xs flex flex-col justify-between min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 truncate">
                      Saídas
                    </span>
                    <TrendingDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 ml-1" />
                  </div>
                  <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 sm:mt-1.5 tracking-tight truncate">
                    {formatMoney(dados.metrics.saidas)}
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#666662] dark:text-[#B8B8B2] mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-950/60 truncate">
                    Gastos registrados.
                  </p>
                </div>

                {/* Resultado Estimado */}
                <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs flex flex-col justify-between min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#888882] truncate">
                      Resultado estimado
                    </span>
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        dados.metrics.resultado >= 0
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                          : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                      }`}
                    >
                      {dados.metrics.resultado >= 0 ? "Positivo" : "Negativo"}
                    </span>
                  </div>
                  <div
                    className={`text-lg sm:text-2xl lg:text-3xl font-extrabold mt-1 sm:mt-1.5 tracking-tight truncate ${
                      dados.metrics.resultado >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatMoney(dados.metrics.resultado)}
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#666662] dark:text-[#B8B8B2] mt-2 pt-2 border-t border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70 truncate">
                    Saldo após saídas.
                  </p>
                </div>
              </section>

              {/* Faixa de Volume Operacional */}
              <section className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs max-w-full">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-[#666662] dark:text-[#B8B8B2]">Serviços realizados:</span>
                  <strong className="font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {dados.metrics.servicosRealizados} atendimentos
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-[#666662] dark:text-[#B8B8B2]">Bebidas vendidas:</span>
                  <strong className="font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {dados.metrics.bebidasVendidas} unidades
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-[#666662] dark:text-[#B8B8B2]">Outros produtos:</span>
                  <strong className="font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {dados.metrics.produtosVendidos} unidades
                  </strong>
                </div>
              </section>

              {dados.metrics.quantidadeVendas === 0 && (
                <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-dashed border-[#E2E2DD] dark:border-[#3F3F3B] text-xs text-[#888882] text-center">
                  Nenhuma venda registrada neste período — os indicadores acima estão zerados.
                </div>
              )}

              {/* Gráfico de Evolução Temporal com ApexCharts */}
              <EvolutionChart
                pontos={dados.evolucaoTemporal}
                periodoLabel={dateRange.label}
                inicio={dateRange.inicio}
                fim={dateRange.fim}
              />

              {/* Cards Analíticos de Origem e Pagamento */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-full">
                {/* Card 1: Faturamento por origem */}
                <article className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        Faturamento por origem
                      </h3>
                      <span className="text-[11px] text-[#888882]">
                        Total: {formatMoney(dados.metrics.faturamento)}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#666662] dark:text-[#B8B8B2] mb-4">
                      Contribuição por tipo de venda na receita bruta.
                    </p>

                    <div className="space-y-3.5">
                      {dados.faturamentoPorOrigem.map((item) => (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-[#2F2F2D] dark:text-[#F4F4F0]">{item.name}</span>
                            <span className="text-[#666662] dark:text-[#B8B8B2]">
                              {formatMoney(item.amount)}{" "}
                              <strong className="text-[#2F2F2D] dark:text-[#F4F4F0] ml-1">
                                ({item.percentage}%)
                              </strong>
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden">
                            <div
                              className="h-full bg-[#2F2F2D] dark:bg-[#F4F4F0] rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, item.percentage)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 mt-4 border-t border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70 text-[11px] text-[#888882]">
                    Serviços continuam como principal fonte da receita.
                  </div>
                </article>

                {/* Card 2: Entradas por forma de pagamento */}
                <article className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        Entradas por forma de pagamento
                      </h3>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        100% recebido
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#666662] dark:text-[#B8B8B2] mb-4">
                      Distribuição dos valores recebidos por meio de pagamento.
                    </p>

                    <div className="space-y-3.5">
                      {dados.entradasPorPagamento.length === 0 ? (
                        <div className="py-4 text-center text-xs text-[#888882]">
                          Nenhum pagamento registrado no período.
                        </div>
                      ) : (
                        dados.entradasPorPagamento.map((item) => (
                          <div key={item.name} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-[#2F2F2D] dark:text-[#F4F4F0]">{item.name}</span>
                              <span className="text-[#666662] dark:text-[#B8B8B2]">
                                {formatMoney(item.amount)}{" "}
                                <strong className="text-[#2F2F2D] dark:text-[#F4F4F0] ml-1">
                                  ({item.percentage}%)
                                </strong>
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, item.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="pt-3 mt-4 border-t border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70 text-[11px] text-[#888882]">
                    {maiorEntradaPagamento && maiorEntradaPagamento.amount > 0
                      ? `${maiorEntradaPagamento.percentage}% dos recebimentos no período foram via ${maiorEntradaPagamento.name}.`
                      : "Nenhum recebimento registrado no período."}
                  </div>
                </article>
              </section>

              {/* Card 3: Saídas por categoria */}
              <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-3 max-w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Saídas por categoria
                  </h3>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                    Total: {formatMoney(dados.metrics.saidas)}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#666662] dark:text-[#B8B8B2]">
                  Veja onde os gastos da barbearia ficaram concentrados.
                </p>

                <div className="space-y-3.5 pt-1">
                  {dados.saidasPorCategoria.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#888882]">
                      Nenhuma saída registrada no período.
                    </div>
                  ) : (
                    dados.saidasPorCategoria.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-[#2F2F2D] dark:text-[#F4F4F0]">{item.name}</span>
                          <span className="text-[#666662] dark:text-[#B8B8B2]">
                            {formatMoney(item.amount)}{" "}
                            <strong className="text-[#2F2F2D] dark:text-[#F4F4F0] ml-1">
                              ({item.percentage}%)
                            </strong>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-3 mt-4 border-t border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70 text-[11px] text-[#888882]">
                  {maiorSaidaCategoria && maiorSaidaCategoria.amount > 0
                    ? `${maiorSaidaCategoria.name} representou ${String(maiorSaidaCategoria.percentage).replace(".", ",")}% das saídas no período.`
                    : "Nenhuma saída registrada no período."}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: LUCRATIVIDADE */}
          {activeTab === "lucratividade" && (
            <LucratividadeView
              itens={dados.itensLucratividade}
              categorias={dados.categoriasLucratividade}
              destaques={dados.destaques}
            />
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL: PERÍODO PERSONALIZADO COM VALIDAÇÕES */}
      {/* ======================================================== */}
      {isCustomModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn"
          >
            <div onClick={() => setIsCustomModalOpen(false)} className="fixed inset-0 bg-transparent" />

            <div className="relative w-full max-w-sm bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl shadow-2xl p-5 space-y-4 z-10 my-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Período Personalizado
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="w-7 h-7 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {customErro && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs font-bold text-red-700 dark:text-red-400">
                  {customErro}
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Data inicial:
                  </label>
                  <input
                    type="date"
                    max={hojeISO}
                    value={tempInicio}
                    onChange={(e) => setTempInicio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Data final:
                  </label>
                  <input
                    type="date"
                    max={hojeISO}
                    value={tempFim}
                    onChange={(e) => setTempFim(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAplicarPeriodoPersonalizado}
                  className="px-3 py-1.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold hover:bg-black dark:hover:bg-white transition-colors"
                >
                  Aplicar período
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* 8. MODAL DE EXPORTAÇÃO REAL COM JSDPF E HTML2CANVAS */}
      {/* ======================================================== */}
      {dados && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          dados={dados}
          abaAtiva={activeTab}
          periodoLabel={dateRange.label}
          onSuccess={(msg) => showToast(msg, "success")}
        />
      )}
    </div>
  );
}
