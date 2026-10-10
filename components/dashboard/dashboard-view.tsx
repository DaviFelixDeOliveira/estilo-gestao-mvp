"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  X,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Scissors,
  Coffee,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FinancialCards, ChartSeries } from "./financial-cards";
import { OperationalCards } from "./operational-cards";
import { QuickActions } from "./quick-actions";
import { LowStockModal, ProdutoEstoqueBaixo } from "./low-stock-modal";

export type PeriodFilter = "hoje" | "semana" | "mes" | "ano" | "personalizado";

interface ResumoFinanceiro {
  total_entradas: number;
  total_saidas: number;
  resultado_estimado: number;
  quantidade_vendas: number;
}

interface TrendPoint {
  label: string;
  faturamento: number;
  entradas: number;
  saidas: number;
  resultado: number;
}

interface ItemOperacionalAgregado {
  name: string;
  type: "servicos" | "bebidas" | "produtos";
  qty: number;
  total: number;
  unitPrice: number;
}

function getTodayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatBRL(val: number | null | undefined): string {
  if (val === null || val === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val);
}

function formatDateDisplay(dateISO: string): string {
  if (!dateISO) return "";
  const parts = dateISO.split("-");
  if (parts.length < 3) return dateISO;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function DashboardView() {
  const supabase = useMemo(() => createClient(), []);

  const [activePeriod, setActivePeriod] = useState<PeriodFilter>("hoje");
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // Séries do gráfico
  const [chartSeries, setChartSeries] = useState<ChartSeries>("faturamento");

  // Modais
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [customDateError, setCustomDateError] = useState<string | null>(null);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [operationalDetailModal, setOperationalDetailModal] = useState<
    "servicos" | "bebidas" | "produtos" | null
  >(null);

  const todayStr = getTodayISO();
  const [tempStartDate, setTempStartDate] = useState(todayStr);
  const [tempEndDate, setTempEndDate] = useState(todayStr);

  // Estados de dados
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [financeiro, setFinanceiro] = useState<ResumoFinanceiro>({
    total_entradas: 0,
    total_saidas: 0,
    resultado_estimado: 0,
    quantidade_vendas: 0,
  });

  const [servicosRealizados, setServicosRealizados] = useState(0);
  const [bebidasVendidas, setBebidasVendidas] = useState(0);
  const [produtosVendidos, setProdutosVendidos] = useState(0);
  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState<
    ProdutoEstoqueBaixo[]
  >([]);

  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [operationalBreakdown, setOperationalBreakdown] = useState<
    ItemOperacionalAgregado[]
  >([]);

  // Computa as datas ativas
  const activeDateRange = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    if (activePeriod === "hoje") {
      return { inicio: today, fim: today };
    }
    if (activePeriod === "semana") {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      const startY = d.getFullYear();
      const startM = String(d.getMonth() + 1).padStart(2, "0");
      const startD = String(d.getDate()).padStart(2, "0");
      return { inicio: `${startY}-${startM}-${startD}`, fim: today };
    }
    if (activePeriod === "mes") {
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      const lastDayStr = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
      return { inicio: `${year}-${month}-01`, fim: lastDayStr };
    }
    if (activePeriod === "ano") {
      return { inicio: `${year}-01-01`, fim: `${year}-12-31` };
    }
    if (activePeriod === "personalizado" && customDateRange) {
      return { inicio: customDateRange.start, fim: customDateRange.end };
    }
    return { inicio: today, fim: today };
  }, [activePeriod, customDateRange]);

  // Carregar dados reais do Supabase
  useEffect(() => {
    let ativo = true;

    async function buscarDados() {
      setLoading(true);
      setErro(null);

      const { inicio, fim } = activeDateRange;

      try {
        // 1. Resumo financeiro via RPC do Supabase
        const { data: resumoData, error: resumoError } = await supabase.rpc(
          "obter_resumo_financeiro",
          {
            p_inicio: inicio,
            p_fim: fim,
          }
        );

        if (!ativo) return;

        if (resumoError) {
          console.error("Erro ao obter resumo financeiro:", resumoError.message);
        } else if (resumoData) {
          const res = resumoData as {
            total_entradas?: number | string;
            total_saidas?: number | string;
            resultado_estimado?: number | string;
            quantidade_vendas?: number;
          };

          setFinanceiro({
            total_entradas: Number(res.total_entradas ?? 0),
            total_saidas: Number(res.total_saidas ?? 0),
            resultado_estimado: Number(res.resultado_estimado ?? 0),
            quantidade_vendas: Number(res.quantidade_vendas ?? 0),
          });
        }

        // 2. Vendas e itens no período
        const startDateTime = `${inicio}T00:00:00.000Z`;
        const endDateTime = `${fim}T23:59:59.999Z`;

        const { data: vendasData, error: vendasError } = await supabase
          .from("vendas")
          .select(`
            id,
            status,
            total_liquido,
            total_bruto,
            ocorrida_em,
            created_at,
            venda_itens (
              id,
              tipo,
              nome_snapshot,
              quantidade,
              preco_unitario_snapshot,
              subtotal_snapshot,
              produto_id
            )
          `)
          .eq("status", "CONCLUIDA")
          .gte("ocorrida_em", startDateTime)
          .lte("ocorrida_em", endDateTime)
          .order("ocorrida_em", { ascending: true });

        if (!ativo) return;

        // 3. Despesas do período pela coluna correta 'data_despesa'
        const { data: despesasData } = await supabase
          .from("despesas")
          .select("id, valor, data_despesa, created_at")
          .gte("data_despesa", inicio)
          .lte("data_despesa", fim);

        if (!ativo) return;

        // 4. Produtos e categorias para identificar bebidas vs outros produtos e estoque baixo
        const { data: produtosData } = await supabase
          .from("produtos")
          .select(`
            id,
            nome,
            estoque_atual,
            estoque_minimo,
            preco_venda,
            ativo,
            categoria_id,
            categorias_produto (
              id,
              nome
            )
          `)
          .eq("ativo", true);

        if (!ativo) return;

        // Mapear produtos que são bebidas
        const bebidasIds = new Set<string>();
        if (produtosData) {
          produtosData.forEach((p) => {
            const cat = p.categorias_produto as unknown as
              | { id: string; nome: string }
              | Array<{ id: string; nome: string }>
              | null;
            const catNome = Array.isArray(cat)
              ? (cat[0]?.nome || "").toLowerCase()
              : (cat?.nome || "").toLowerCase();
            const prodNome = (p.nome || "").toLowerCase();
            if (
              catNome.includes("bebida") ||
              catNome.includes("cerveja") ||
              catNome.includes("refrigerante") ||
              prodNome.includes("cerveja") ||
              prodNome.includes("refrigerante") ||
              prodNome.includes("água") ||
              prodNome.includes("suco") ||
              prodNome.includes("energético")
            ) {
              bebidasIds.add(p.id);
            }
          });

          // Produtos com estoque baixo
          const itensBaixos = produtosData
            .filter(
              (p) =>
                p.estoque_minimo !== null &&
                p.estoque_minimo !== undefined &&
                p.estoque_atual <= p.estoque_minimo
            )
            .map((p) => ({
              id: p.id,
              nome: p.nome,
              estoque_atual: Number(p.estoque_atual ?? 0),
              estoque_minimo: Number(p.estoque_minimo ?? 0),
              preco_venda: Number(p.preco_venda ?? 0),
            }));

          setProdutosEstoqueBaixo(itensBaixos);
        }

        // Processar itens operacionais
        let countServicos = 0;
        let countBebidas = 0;
        let countProdutos = 0;
        const breakdownMap: Record<string, ItemOperacionalAgregado> = {};

        if (vendasData && !vendasError) {
          vendasData.forEach((venda) => {
            const itens = venda.venda_itens as Array<{
              id: string;
              tipo: string;
              nome_snapshot: string;
              quantidade: number;
              preco_unitario_snapshot: number;
              subtotal_snapshot: number;
              produto_id: string | null;
            }> | null;

            if (itens) {
              itens.forEach((it) => {
                const qty = Number(it.quantidade ?? 1);
                const total = Number(it.subtotal_snapshot ?? 0);
                const unitPrice = Number(it.preco_unitario_snapshot ?? 0);
                const name = it.nome_snapshot || "Item";

                let targetType: "servicos" | "bebidas" | "produtos" = "produtos";
                if (it.tipo === "SERVICO") {
                  targetType = "servicos";
                  countServicos += qty;
                } else if (it.produto_id && bebidasIds.has(it.produto_id)) {
                  targetType = "bebidas";
                  countBebidas += qty;
                } else {
                  targetType = "produtos";
                  countProdutos += qty;
                }

                const key = `${targetType}_${name}`;
                if (!breakdownMap[key]) {
                  breakdownMap[key] = {
                    name,
                    type: targetType,
                    qty: 0,
                    total: 0,
                    unitPrice,
                  };
                }
                breakdownMap[key].qty += qty;
                breakdownMap[key].total += total;
              });
            }
          });
        }

        setServicosRealizados(countServicos);
        setBebidasVendidas(countBebidas);
        setProdutosVendidos(countProdutos);
        setOperationalBreakdown(Object.values(breakdownMap));

        // 5. Construir os pontos do Gráfico de Evolução no Período
        const points = gerarPontosGrafico(
          activePeriod,
          inicio,
          fim,
          vendasData || [],
          despesasData || []
        );
        setTrendData(points);
      } catch (err) {
        if (!ativo) return;
        console.error("Erro ao carregar dados do dashboard:", err);
        setErro("Não foi possível carregar todas as métricas do período.");
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    void buscarDados();

    return () => {
      ativo = false;
    };
  }, [activePeriod, activeDateRange, supabase]);

  // HÁ DADOS se houver vendas, entradas OU despesas/saídas
  const hasData =
    financeiro.quantidade_vendas > 0 ||
    financeiro.total_entradas > 0 ||
    financeiro.total_saidas > 0;

  const handlePeriodChange = (period: PeriodFilter) => {
    if (period === "personalizado") {
      setIsCustomDateModalOpen(true);
    } else {
      setActivePeriod(period);
    }
  };

  const handleApplyCustomDate = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomDateError(null);

    if (!tempStartDate || !tempEndDate) {
      setCustomDateError("Informe a data inicial e a data final.");
      return;
    }

    if (tempEndDate < tempStartDate) {
      setCustomDateError("A data final não pode ser anterior à data inicial.");
      return;
    }

    if (tempStartDate > todayStr || tempEndDate > todayStr) {
      setCustomDateError("Não é permitido selecionar datas futuras.");
      return;
    }

    setCustomDateRange({ start: tempStartDate, end: tempEndDate });
    setActivePeriod("personalizado");
    setIsCustomDateModalOpen(false);
  };

  // Itens filtrados para o modal operacional
  const filteredOperationalBreakdown = useMemo(() => {
    if (!operationalDetailModal) return [];
    return operationalBreakdown
      .filter((item) => item.type === operationalDetailModal)
      .sort((a, b) => b.qty - a.qty);
  }, [operationalDetailModal, operationalBreakdown]);

  // Total apurado no topo do gráfico de evolução
  const totalApuradoGrafico = useMemo(() => {
    if (chartSeries === "faturamento" || chartSeries === "entradas") {
      return {
        valor: financeiro.total_entradas,
        texto: formatBRL(financeiro.total_entradas),
        cor: "text-blue-600 dark:text-blue-400",
      };
    }
    if (chartSeries === "saidas") {
      return {
        valor: financeiro.total_saidas,
        texto: formatBRL(financeiro.total_saidas),
        cor: "text-rose-600 dark:text-rose-400",
      };
    }
    // Resultado
    const res = financeiro.resultado_estimado;
    let cor = "text-[#2F2F2D] dark:text-[#F4F4F0]";
    if (res > 0) cor = "text-emerald-600 dark:text-emerald-400";
    else if (res < 0) cor = "text-rose-600 dark:text-rose-400";

    return {
      valor: res,
      texto: formatBRL(res),
      cor,
    };
  }, [chartSeries, financeiro]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn relative w-full max-w-full min-w-0 overflow-x-hidden">
      {/* ======================================================== */}
      {/* 1. HEADER LIMPO E INFORMATIVO */}
      {/* ======================================================== */}
      <section className="space-y-1.5 pb-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2] max-w-3xl leading-relaxed">
          Acompanhe o desempenho da sua barbearia, visualize vendas, entradas, saídas, resultado estimado e indicadores importantes da operação.
        </p>
      </section>

      {/* ======================================================== */}
      {/* 2. FILTRO DE PERÍODO (Segmented Control + Personalizado) */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 max-w-full">
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented control */}
          <div
            role="tablist"
            aria-label="Filtro de período da Dashboard"
            className="inline-flex items-center gap-1 p-1 bg-[#EEEDE7] dark:bg-[#222220] rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] select-none"
          >
            {(["hoje", "semana", "mes", "ano"] as const).map((period) => {
              const labelMap = {
                hoje: "Hoje",
                semana: "Semana",
                mes: "Mês",
                ano: "Ano",
              };
              const isActive = activePeriod === period;
              return (
                <button
                  key={period}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-xs"
                      : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white"
                  }`}
                >
                  {labelMap[period]}
                </button>
              );
            })}
          </div>

          {/* Botão Personalizado */}
          <button
            type="button"
            onClick={() => setIsCustomDateModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activePeriod === "personalizado" && customDateRange
                ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] border-transparent shadow-xs"
                : "bg-white dark:bg-[#222220] border-[#E2E2DD] dark:border-[#3F3F3B] text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {activePeriod === "personalizado" && customDateRange
                ? `${formatDateDisplay(customDateRange.start)} → ${formatDateDisplay(customDateRange.end)}`
                : "Personalizado"}
            </span>
          </button>
        </div>

        {/* Indicador de carregamento ou contexto ativo */}
        <div className="flex items-center gap-3 text-xs text-[#666662] dark:text-[#B8B8B2]">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] animate-pulse">
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              <span>Atualizando dados...</span>
            </span>
          ) : (
            <span className="truncate">
              {activePeriod === "personalizado" && customDateRange
                ? `Intervalo ativo: ${formatDateDisplay(customDateRange.start)} até ${formatDateDisplay(customDateRange.end)}`
                : `Período ativo: ${formatDateDisplay(activeDateRange.inicio)} até ${formatDateDisplay(activeDateRange.fim)}`}
            </span>
          )}
        </div>
      </div>

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {erro}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. QUATRO CARDS FINANCEIROS GRANDES */}
      {/* ======================================================== */}
      <FinancialCards
        faturamento={financeiro.total_entradas}
        entradas={financeiro.total_entradas}
        saidas={financeiro.total_saidas}
        resultado={financeiro.resultado_estimado}
        quantidadeVendas={financeiro.quantidade_vendas}
        hasData={hasData}
        loading={loading}
        activeSeries={chartSeries}
        onSelectSeries={setChartSeries}
      />

      {/* ======================================================== */}
      {/* 4. QUATRO CARDS OPERACIONAIS MENORES */}
      {/* ======================================================== */}
      <OperationalCards
        servicosRealizados={servicosRealizados}
        bebidasVendidas={bebidasVendidas}
        produtosVendidos={produtosVendidos}
        estoqueBaixoCount={produtosEstoqueBaixo.length}
        loading={loading}
        onOpenOperationalDetail={setOperationalDetailModal}
        onOpenLowStockModal={() => setIsLowStockModalOpen(true)}
      />

      {/* ======================================================== */}
      {/* 5. MAIN SPLIT: GRÁFICO (ESQUERDA 8) + OPERAR & ESTOQUE (DIREITA 4) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-full min-w-0">
        {/* Coluna do Gráfico (8 Cols) */}
        <div className="lg:col-span-8 space-y-6 max-w-full min-w-0">
          <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-5 max-w-full min-w-0 overflow-hidden">
            {/* Header do Gráfico com seletor de série */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-full min-w-0">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Evolução no período
                </h2>
                <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
                  Série ativa: <strong className="uppercase text-[#2F2F2D] dark:text-white">{chartSeries}</strong>
                </p>
              </div>

              {/* Segmented series switcher */}
              <div className="flex items-center gap-1 p-1 bg-[#EEEDE7] dark:bg-[#2B2B29] rounded-xl text-xs font-bold select-none overflow-x-auto max-w-full">
                {(["faturamento", "entradas", "saidas", "resultado"] as const).map((s) => {
                  const labelMap = {
                    faturamento: "Faturamento",
                    entradas: "Entradas",
                    saidas: "Saídas",
                    resultado: "Resultado",
                  };

                  const isActive = chartSeries === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setChartSeries(s)}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "bg-white dark:bg-[#222220] text-[#2F2F2D] dark:text-white shadow-xs"
                          : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white"
                      }`}
                    >
                      {labelMap[s]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Container do Gráfico */}
            {!hasData && !loading ? (
              /* Empty state fiel ao AI Studio */
              <div className="h-64 rounded-xl border border-dashed border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#1E1E1C] p-6 flex flex-col items-center justify-center text-center space-y-2.5">
                <div className="w-12 h-12 rounded-xl bg-[#EEEDE7] dark:bg-[#2B2B29] flex items-center justify-center text-[#888882] dark:text-[#B8B8B2]">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Nenhuma movimentação encontrada neste período
                </h3>
                <p className="text-xs text-[#666662] dark:text-[#B8B8B2] max-w-sm leading-relaxed">
                  Ao finalizar vendas no PDV ou lançar despesas, o gráfico de evolução consolidará aqui o fluxo da sua barbearia.
                </p>
              </div>
            ) : (
              /* Gráfico SVG com barras responsivas e sem vazar */
              <div className="h-64 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#1E1E1C] p-3.5 sm:p-5 flex flex-col justify-between max-w-full min-w-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#666662] dark:text-[#B8B8B2] min-w-0 max-w-full">
                  <span className="truncate">Distribuição ao longo do período</span>
                  <span className={`font-extrabold shrink-0 ${totalApuradoGrafico.cor}`}>
                    Total apurado: {totalApuradoGrafico.texto}
                  </span>
                </div>

                {/* Barras SVG com container protegido de overflow */}
                <div className="w-full overflow-x-auto overflow-y-hidden pb-1 max-w-full min-w-0 scrollbar-none">
                  <div className="h-36 sm:h-40 flex items-end justify-around gap-1 sm:gap-2.5 pt-3 px-1 border-b border-[#E2E2DD] dark:border-[#3F3F3B] min-w-full">
                    {trendData.map((point, idx) => {
                      const values = trendData.map((p) => Math.abs(p[chartSeries]));
                      const maxVal = Math.max(...values, 10);
                      const val = point[chartSeries];
                      const absVal = Math.abs(val);
                      const heightPercent = absVal === 0 ? 8 : Math.max(12, Math.round((absVal / maxVal) * 100));

                      // Cor por série
                      let barColor = "bg-blue-600 dark:bg-blue-500";
                      let textLabel = `R$ ${val.toFixed(0)}`;

                      if (chartSeries === "entradas") {
                        barColor = "bg-emerald-600 dark:bg-emerald-500";
                        textLabel = `R$ ${val.toFixed(0)}`;
                      } else if (chartSeries === "saidas") {
                        barColor = "bg-rose-600 dark:bg-rose-500";
                        textLabel = `R$ ${absVal.toFixed(0)}`;
                      } else if (chartSeries === "resultado") {
                        if (val < 0) {
                          barColor = "bg-rose-600 dark:bg-rose-500";
                          textLabel = `-R$ ${absVal.toFixed(0)}`;
                        } else if (val > 0) {
                          barColor = "bg-emerald-600 dark:bg-emerald-500";
                          textLabel = `R$ ${val.toFixed(0)}`;
                        } else {
                          barColor = "bg-neutral-400 dark:bg-neutral-600";
                          textLabel = "R$ 0";
                        }
                      }

                      return (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center gap-1 h-full justify-end group max-w-[54px] sm:max-w-[64px] min-w-[32px]"
                        >
                          <span className={`text-[9px] sm:text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-full ${
                            chartSeries === "saidas" || (chartSeries === "resultado" && val < 0)
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-neutral-600 dark:text-neutral-300"
                          }`}>
                            {textLabel}
                          </span>
                          <div
                            className={`w-full rounded-t-md sm:rounded-t-lg transition-all duration-300 ${barColor} ${absVal === 0 ? "opacity-30" : "opacity-90 hover:opacity-100"}`}
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="text-[9px] sm:text-[10px] font-bold text-[#888882] mt-0.5 truncate max-w-full text-center leading-tight">
                            {point.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#888882] pt-1">
                  <span>Início do intervalo</span>
                  <span>Encerramento</span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Coluna Direita (4 Cols): Comece a operar + Situação do estoque */}
        <div className="lg:col-span-4 space-y-6 max-w-full min-w-0">
          {/* Painel Comece a operar */}
          <QuickActions />

          {/* Painel Situação do estoque */}
          <section className="p-5 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-3 max-w-full min-w-0">
            <div>
              <h2 className="text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Situação do estoque
              </h2>
              <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
                Monitoramento de itens com estoque baixo
              </p>
            </div>

            {produtosEstoqueBaixo.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-xs leading-relaxed text-[#666662] dark:text-[#B8B8B2]">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-[#2F2F2D] dark:text-white block font-bold">
                    Nenhum alerta de estoque baixo.
                  </strong>
                  Todos os itens cadastrados estão acima da margem mínima ou ainda não possuem limite definido.
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs leading-relaxed text-[#666662] dark:text-[#B8B8B2]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Aviso: há produtos com estoque baixo</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLowStockModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    Ver mais
                  </button>
                </div>
                <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2]">
                  Existem {produtosEstoqueBaixo.length} produtos abaixo da margem mínima estabelecida.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. MODAL: DETALHAMENTO DE ITENS OPERACIONAIS */}
      {/* ======================================================== */}
      {operationalDetailModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="operational-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="w-full max-w-lg bg-white dark:bg-[#222220] rounded-2xl shadow-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] p-5 sm:p-6 space-y-4 max-h-[85vh] flex flex-col animate-slideUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E2DD] dark:border-[#3F3F3B]">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    operationalDetailModal === "servicos"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : operationalDetailModal === "bebidas"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  }`}
                >
                  {operationalDetailModal === "servicos" && <Scissors className="w-4 h-4" />}
                  {operationalDetailModal === "bebidas" && <Coffee className="w-4 h-4" />}
                  {operationalDetailModal === "produtos" && <ShoppingBag className="w-4 h-4" />}
                </div>
                <div>
                  <h3
                    id="operational-modal-title"
                    className="text-base font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]"
                  >
                    {operationalDetailModal === "servicos" && "Serviços Realizados"}
                    {operationalDetailModal === "bebidas" && "Bebidas Vendidas"}
                    {operationalDetailModal === "produtos" && "Outros Produtos Vendidos"}
                  </h3>
                  <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2]">
                    Movimentação apurada no período ativo
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOperationalDetailModal(null)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de itens agregados */}
            <div className="divide-y divide-[#EEEEEA] dark:divide-[#3F3F3B] overflow-y-auto flex-1 pr-1 space-y-1">
              {filteredOperationalBreakdown.length === 0 ? (
                <div className="py-8 text-center space-y-1.5 text-xs text-[#888882]">
                  <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Nenhum item registrado no período selecionado.
                  </p>
                  <p className="text-[11px]">
                    Registre novas vendas no PDV para alimentar os indicadores operacionais.
                  </p>
                </div>
              ) : (
                filteredOperationalBreakdown.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0] text-sm">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2] mt-0.5">
                        {item.qty} {item.qty === 1 ? "unidade" : "unidades"} • {formatBRL(item.unitPrice)} cada
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-sm text-[#2F2F2D] dark:text-white block">
                        {formatBRL(item.total)}
                      </span>
                      <span className="text-[10px] text-neutral-400">Total gerado</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#EEEEEA] dark:border-[#3F3F3B]">
              <Link
                href="/pdv"
                onClick={() => setOperationalDetailModal(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <span>Abrir PDV</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setOperationalDetailModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL: FILTRO DE PERÍODO PERSONALIZADO */}
      {/* ======================================================== */}
      {isCustomDateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-period-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="w-full max-w-sm bg-white dark:bg-[#222220] rounded-2xl shadow-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] p-5 space-y-4 animate-slideUp">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E2DD] dark:border-[#3F3F3B]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2F2F2D] dark:text-[#F4F4F0]" />
                <h3
                  id="custom-period-modal-title"
                  className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]"
                >
                  Selecionar período personalizado
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomDateModalOpen(false)}
                className="text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyCustomDate} className="space-y-3">
              {customDateError && (
                <p className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium">
                  {customDateError}
                </p>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Data Inicial <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  max={todayStr}
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs text-[#2F2F2D] dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Data Final <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  max={todayStr}
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs text-[#2F2F2D] dark:text-white focus:outline-none"
                />
              </div>

              <p className="text-[10px] text-[#888882] leading-tight">
                * Não é permitido selecionar datas futuras. Vendas anteriores são permitidas.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomDateModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#666662] dark:text-[#B8B8B2] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2F2F2D] hover:bg-[#3A3A38] dark:bg-[#F4F4F0] dark:hover:bg-[#E9E9E4] text-white dark:text-[#181817] text-xs font-bold transition-all shadow-xs"
                >
                  Aplicar período
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. MODAL: PRODUTOS COM ESTOQUE BAIXO */}
      {/* ======================================================== */}
      <LowStockModal
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
        produtos={produtosEstoqueBaixo}
      />
    </div>
  );
}

// Função auxiliar para gerar pontos do gráfico com dados reais
function gerarPontosGrafico(
  periodo: PeriodFilter,
  inicio: string,
  fim: string,
  vendas: Array<{
    total_liquido?: number | null;
    total_bruto?: number | null;
    ocorrida_em?: string | null;
    created_at?: string | null;
  }>,
  despesas: Array<{
    valor?: number | null;
    data_despesa?: string | null;
    created_at?: string | null;
  }>
): TrendPoint[] {
  if (periodo === "hoje") {
    // 6 blocos horários do dia
    const slots = [
      { label: "08h - 10h", startH: 8, endH: 10 },
      { label: "10h - 12h", startH: 10, endH: 12 },
      { label: "12h - 14h", startH: 12, endH: 14 },
      { label: "14h - 16h", startH: 14, endH: 16 },
      { label: "16h - 18h", startH: 16, endH: 18 },
      { label: "18h - 22h", startH: 18, endH: 22 },
    ];

    return slots.map((slot, idx) => {
      let fat = 0;
      let sai = 0;

      vendas.forEach((v) => {
        const d = new Date(v.ocorrida_em || v.created_at || "");
        const h = d.getHours();
        if (h >= slot.startH && h < slot.endH) {
          fat += Number(v.total_liquido ?? v.total_bruto ?? 0);
        }
      });

      despesas.forEach((dp) => {
        if (dp.created_at) {
          const d = new Date(dp.created_at);
          const h = d.getHours();
          if (h >= slot.startH && h < slot.endH) {
            sai += Number(dp.valor ?? 0);
          }
        } else if (idx === 0) {
          sai += Number(dp.valor ?? 0);
        }
      });

      return {
        label: slot.label,
        faturamento: fat,
        entradas: fat,
        saidas: sai,
        resultado: fat - sai,
      };
    });
  }

  if (periodo === "semana") {
    // 7 dias retroativos a partir de hoje
    const points: TrendPoint[] = [];
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateKey = `${y}-${m}-${day}`;
      const diaNome = diasSemana[d.getDay()];

      let fat = 0;
      let sai = 0;

      vendas.forEach((v) => {
        const vDate = (v.ocorrida_em || v.created_at || "").slice(0, 10);
        if (vDate === dateKey) {
          fat += Number(v.total_liquido ?? v.total_bruto ?? 0);
        }
      });

      despesas.forEach((dp) => {
        const dpDate = (dp.data_despesa || dp.created_at || "").slice(0, 10);
        if (dpDate === dateKey) {
          sai += Number(dp.valor ?? 0);
        }
      });

      points.push({
        label: `${diaNome} ${day}`,
        faturamento: fat,
        entradas: fat,
        saidas: sai,
        resultado: fat - sai,
      });
    }

    return points;
  }

  if (periodo === "mes") {
    // 4 semanas do mês corrente
    const slots = [
      { label: "Sem 1", startD: 1, endD: 7 },
      { label: "Sem 2", startD: 8, endD: 14 },
      { label: "Sem 3", startD: 15, endD: 21 },
      { label: "Sem 4", startD: 22, endD: 31 },
    ];

    return slots.map((slot) => {
      let fat = 0;
      let sai = 0;

      vendas.forEach((v) => {
        const d = new Date(v.ocorrida_em || v.created_at || "");
        const day = d.getDate();
        if (day >= slot.startD && day <= slot.endD) {
          fat += Number(v.total_liquido ?? v.total_bruto ?? 0);
        }
      });

      despesas.forEach((dp) => {
        const dStr = dp.data_despesa || dp.created_at || "";
        const parts = dStr.split("-");
        const day = parts.length >= 3 ? parseInt(parts[2], 10) : new Date(dStr).getDate();
        if (day >= slot.startD && day <= slot.endD) {
          sai += Number(dp.valor ?? 0);
        }
      });

      return {
        label: slot.label,
        faturamento: fat,
        entradas: fat,
        saidas: sai,
        resultado: fat - sai,
      };
    });
  }

  if (periodo === "ano") {
    // 12 meses
    const meses = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez",
    ];

    return meses.map((nome, idx) => {
      let fat = 0;
      let sai = 0;

      vendas.forEach((v) => {
        const d = new Date(v.ocorrida_em || v.created_at || "");
        if (d.getMonth() === idx) {
          fat += Number(v.total_liquido ?? v.total_bruto ?? 0);
        }
      });

      despesas.forEach((dp) => {
        const dStr = dp.data_despesa || dp.created_at || "";
        const parts = dStr.split("-");
        const mesIdx = parts.length >= 2 ? parseInt(parts[1], 10) - 1 : new Date(dStr).getMonth();
        if (mesIdx === idx) {
          sai += Number(dp.valor ?? 0);
        }
      });

      return {
        label: nome,
        faturamento: fat,
        entradas: fat,
        saidas: sai,
        resultado: fat - sai,
      };
    });
  }

  // Personalizado
  const startDate = new Date(inicio);
  const endDate = new Date(fim);
  const diffDays = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1
  );

  if (diffDays <= 7) {
    const points: TrendPoint[] = [];
    for (let i = 0; i < diffDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateKey = `${y}-${m}-${day}`;

      let fat = 0;
      let sai = 0;

      vendas.forEach((v) => {
        const vDate = (v.ocorrida_em || v.created_at || "").slice(0, 10);
        if (vDate === dateKey) {
          fat += Number(v.total_liquido ?? v.total_bruto ?? 0);
        }
      });

      despesas.forEach((dp) => {
        const dpDate = (dp.data_despesa || dp.created_at || "").slice(0, 10);
        if (dpDate === dateKey) {
          sai += Number(dp.valor ?? 0);
        }
      });

      points.push({
        label: `${day}/${m}`,
        faturamento: fat,
        entradas: fat,
        saidas: sai,
        resultado: fat - sai,
      });
    }
    return points;
  }

  // Se > 7 dias, divide em 4 blocos
  const step = Math.ceil(diffDays / 4);
  const points: TrendPoint[] = [];
  for (let b = 0; b < 4; b++) {
    const bStart = new Date(startDate);
    bStart.setDate(bStart.getDate() + b * step);
    const bEnd = new Date(startDate);
    bEnd.setDate(Math.min(endDate.getDate(), bStart.getDate() + step - 1));

    const sDay = String(bStart.getDate()).padStart(2, "0");
    const eDay = String(bEnd.getDate()).padStart(2, "0");

    let fat = 0;
    let sai = 0;

    vendas.forEach((v) => {
      const d = new Date(v.ocorrida_em || v.created_at || "");
      if (d >= bStart && d <= bEnd) {
        fat += Number(v.total_liquido ?? v.total_bruto ?? 0);
      }
    });

    despesas.forEach((dp) => {
      const dStr = dp.data_despesa || dp.created_at || "";
      const d = new Date(dStr);
      if (d >= bStart && d <= bEnd) {
        sai += Number(dp.valor ?? 0);
      }
    });

    points.push({
      label: `${sDay} a ${eDay}`,
      faturamento: fat,
      entradas: fat,
      saidas: sai,
      resultado: fat - sai,
    });
  }

  return points;
}
