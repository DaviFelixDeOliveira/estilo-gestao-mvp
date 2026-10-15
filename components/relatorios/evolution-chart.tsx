"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type ApexCharts from "apexcharts";
import type { ApexOptions } from "apexcharts";
import type { PontoEvolucaoTemporal } from "./types";

export type MetricaGrafico = "faturamento" | "entradas" | "saidas" | "resultado";
export type Granularidade = "tudo" | "dia" | "semana" | "mes" | "ano";
export type EscalaSerie = "dia" | "semana" | "mes" | "ano";

interface EvolutionChartProps {
  pontos: PontoEvolucaoTemporal[];
  periodoLabel: string;
  inicio?: string;
  fim?: string;
}

interface PontoSerie {
  ts: number;
  label: string;
  faturamento: number;
  entradas: number;
  saidas: number;
  resultado: number;
}

interface JanelaVisivel {
  min: number;
  max: number;
}

const METRICAS_CONFIG: Record<
  MetricaGrafico,
  { label: string; color: string; lightBg: string; darkBg: string }
> = {
  faturamento: {
    label: "Faturamento",
    color: "#3B82F6",
    lightBg: "bg-blue-50 text-blue-700 border-blue-200",
    darkBg: "dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
  },
  entradas: {
    label: "Entradas",
    color: "#10B981",
    lightBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    darkBg: "dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  },
  saidas: {
    label: "Saídas",
    color: "#F59E0B",
    lightBg: "bg-amber-50 text-amber-700 border-amber-200",
    darkBg: "dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  },
  resultado: {
    label: "Resultado estimado",
    color: "#8B5CF6",
    lightBg: "bg-purple-50 text-purple-700 border-purple-200",
    darkBg: "dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900",
  },
};

const GRANULARIDADES: { val: Granularidade; label: string }[] = [
  { val: "tudo", label: "Tudo" },
  { val: "dia", label: "Dia" },
  { val: "semana", label: "Semana" },
  { val: "mes", label: "Mês" },
  { val: "ano", label: "Ano" },
];

const MAX_METRICAS = 3;
const DIA_MS = 24 * 60 * 60 * 1000;

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function duasDigitos(n: number): string {
  return String(n).padStart(2, "0");
}

function dataParaTS(data: string): number {
  const [y, m, d] = data.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1).getTime();
}

function labelDiaCurto(ts: number): string {
  const d = new Date(ts);
  return `${duasDigitos(d.getDate())}/${duasDigitos(d.getMonth() + 1)}`;
}

function segundaDaSemana(ts: number): number {
  const d = new Date(ts);
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  const nova = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
  return nova.getTime();
}

function inicioDoMes(ts: number): { ts: number; label: string } {
  const d = new Date(ts);
  const mesCurto = d.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
  return {
    ts: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
    label: `${mesCurto}/${String(d.getFullYear()).slice(-2)}`,
  };
}

function inicioDoAno(ts: number): { ts: number; label: string } {
  const d = new Date(ts);
  return { ts: new Date(d.getFullYear(), 0, 1).getTime(), label: String(d.getFullYear()) };
}

// Converte os pontos diários da RPC para a escala desejada.
// A RPC entrega apenas dados diários (sem horários), então:
// - "ano" agrega por mês; "mes" mostra os dias; "semana" agrega em blocos de 7 dias
// - "dia" mostra cada dia do período (ou o total único quando o período é de 1 dia)
// - "tudo" escolhe a melhor escala automaticamente (anos -> meses -> dias)
function montarSerie(pontos: PontoEvolucaoTemporal[], granularidade: Granularidade): PontoSerie[] {
  if (pontos.length === 0) return [];

  let escala: EscalaSerie;
  if (granularidade === "tudo") {
    const tsList = pontos.map((p) => dataParaTS(p.data));
    const minAno = new Date(Math.min(...tsList)).getFullYear();
    const maxAno = new Date(Math.max(...tsList)).getFullYear();
    const spanMs = Math.max(...tsList) - Math.min(...tsList);
    if (maxAno - minAno >= 1) escala = "ano";
    else if (spanMs > 62 * DIA_MS) escala = "mes";
    else escala = "dia";
  } else if (granularidade === "ano") escala = "mes";
  else if (granularidade === "semana") escala = "semana";
  else escala = "dia";

  const mapa = new Map<string, PontoSerie>();

  const acumular = (chave: string, ts: number, label: string, p: PontoEvolucaoTemporal) => {
    const atual = mapa.get(chave) || {
      ts,
      label,
      faturamento: 0,
      entradas: 0,
      saidas: 0,
      resultado: 0,
    };
    atual.faturamento += p.faturamento;
    atual.entradas += p.entradas;
    atual.saidas += p.saidas;
    atual.resultado += p.resultado;
    mapa.set(chave, atual);
  };

  for (const p of pontos) {
    const diaTs = dataParaTS(p.data);
    if (escala === "semana") {
      const seg = segundaDaSemana(diaTs);
      acumular(`s${seg}`, seg, `Sem ${labelDiaCurto(seg)}`, p);
    } else if (escala === "mes") {
      const m = inicioDoMes(diaTs);
      acumular(`m${m.ts}`, m.ts, m.label, p);
    } else if (escala === "ano") {
      const a = inicioDoAno(diaTs);
      acumular(`a${a.ts}`, a.ts, a.label, p);
    } else {
      acumular(`d${diaTs}`, diaTs, labelDiaCurto(diaTs), p);
    }
  }

  return Array.from(mapa.values()).sort((a, b) => a.ts - b.ts);
}

export function EvolutionChart({
  pontos,
  periodoLabel,
  inicio,
  fim,
}: EvolutionChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);
  const janelaRef = useRef<JanelaVisivel | null>(null);

  const [granularidade, setGranularidade] = useState<Granularidade>("tudo");
  const [metricasAtivas, setMetricasAtivas] = useState<MetricaGrafico[]>(["entradas", "saidas"]);
  const [avisoMetricas, setAvisoMetricas] = useState<string | null>(null);
  const avisoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [janelaVisivel, setJanelaVisivel] = useState<JanelaVisivel | null>(null);
  const [expandido, setExpandido] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detecta dark mode
  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Detecta telas pequenas (esconde toolbar nativa e usa botões grandes)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const check = () => setIsMobile(mq.matches);
    check();
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  const serie = useMemo(() => montarSerie(pontos, granularidade), [pontos, granularidade]);

  // Escala real da série (para labels, descrição e granularidade de ticks)
  const escalaSerieAtual: EscalaSerie = useMemo(() => {
    if (granularidade === "ano") return "mes";
    if (granularidade === "semana") return "semana";
    if (granularidade === "mes") return "dia";
    if (granularidade === "dia") return "dia";
    if (serie.length === 0) {
      if (inicio && fim && dataParaTS(fim) - dataParaTS(inicio) > 62 * DIA_MS) return "mes";
      return "dia";
    }
    const tsList = serie.map((p) => p.ts);
    const minAno = new Date(Math.min(...tsList)).getFullYear();
    const maxAno = new Date(Math.max(...tsList)).getFullYear();
    const spanMs = Math.max(...tsList) - Math.min(...tsList);
    if (maxAno - minAno >= 1) return "ano";
    if (spanMs > 62 * DIA_MS) return "mes";
    return "dia";
  }, [granularidade, serie, inicio, fim]);

  // Rótulo do eixo X conforme a escala. Todos os timestamps são locais (sem UTC),
  // então o dia nunca é deslocado; cada escala gera labels curtos e únicos.
  const formatarLabelEixo = useCallback(
    (val: number) => {
      const ts = typeof val === "number" ? val : Number(val);
      if (Number.isNaN(ts)) return "";
      const d = new Date(ts);
      if (escalaSerieAtual === "ano") return String(d.getFullYear());
      if (escalaSerieAtual === "mes") {
        const mesCurto = d.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
        return `${mesCurto}/${String(d.getFullYear()).slice(-2)}`;
      }
      if (escalaSerieAtual === "semana") return `Sem ${labelDiaCurto(ts)}`;
      return labelDiaCurto(ts);
    },
    [escalaSerieAtual]
  );

  const primeiroTs = serie.length > 0 ? serie[0].ts : 0;
  const ultimoTs = serie.length > 0 ? serie[serie.length - 1].ts : 0;
  const spanDias = Math.max(1, Math.round((ultimoTs - primeiroTs) / DIA_MS));

  // Número de ticks do eixo X: proporcional ao span para nunca gerar labels
  // repetidos no mesmo dia (ex.: 07/10, 07/10, 07/10).
  const tickAmount = useMemo(() => {
    const base = isMobile ? 3 : 6;
    if (escalaSerieAtual === "dia" || escalaSerieAtual === "semana") {
      return Math.max(2, Math.min(base, spanDias));
    }
    return Math.min(base, Math.max(base - 1, serie.length));
  }, [escalaSerieAtual, spanDias, serie.length, isMobile]);

  const zoomAtivo = janelaVisivel !== null && janelaVisivel.max - janelaVisivel.min > 0;

  // Aplica a janela visível no gráfico (zoom/pan). null = tudo.
  const aplicarJanela = useCallback((janela: JanelaVisivel | null) => {
    janelaRef.current = janela;
    setJanelaVisivel(janela);
    if (chartInstanceRef.current) {
      chartInstanceRef.current.updateOptions({
        xaxis: {
          min: janela ? janela.min : undefined,
          max: janela ? janela.max : undefined,
        },
      });
    }
  }, []);

  const resetZoom = useCallback(() => {
    aplicarJanela(null);
  }, [aplicarJanela]);

  const zoomIn = useCallback(() => {
    if (serie.length === 0) return;
    const atual = janelaRef.current || { min: primeiroTs, max: ultimoTs };
    const largura = atual.max - atual.min;
    if (largura <= DIA_MS) return;
    const encolher = largura * 0.25;
    const centro = (atual.min + atual.max) / 2;
    aplicarJanela({ min: centro - encolher / 2, max: centro + encolher / 2 });
  }, [serie.length, primeiroTs, ultimoTs, aplicarJanela]);

  const zoomOut = useCallback(() => {
    const atual = janelaRef.current;
    if (!atual) return;
    const largura = atual.max - atual.min;
    const expandir = largura * 0.25;
    const novoMin = Math.max(primeiroTs, atual.min - expandir);
    const novoMax = Math.min(ultimoTs, atual.max + expandir);
    if (novoMin <= primeiroTs && novoMax >= ultimoTs) resetZoom();
    else aplicarJanela({ min: novoMin, max: novoMax });
  }, [primeiroTs, ultimoTs, aplicarJanela, resetZoom]);

  const moverEsquerda = useCallback(() => {
    const atual = janelaRef.current;
    if (!atual) return;
    const passo = (atual.max - atual.min) * 0.25;
    const novoMin = Math.max(primeiroTs, atual.min - passo);
    const novoMax = Math.min(ultimoTs, atual.max - passo);
    if (novoMax <= novoMin) return;
    aplicarJanela({ min: novoMin, max: novoMax });
  }, [primeiroTs, ultimoTs, aplicarJanela]);

  const moverDireita = useCallback(() => {
    const atual = janelaRef.current;
    if (!atual) return;
    const passo = (atual.max - atual.min) * 0.25;
    const novoMin = Math.max(primeiroTs, atual.min + passo);
    const novoMax = Math.min(ultimoTs, atual.max + passo);
    if (novoMax <= novoMin) return;
    aplicarJanela({ min: novoMin, max: novoMax });
  }, [primeiroTs, ultimoTs, aplicarJanela]);

  const toggleMetrica = (metrica: MetricaGrafico) => {
    setMetricasAtivas((prev) => {
      if (prev.includes(metrica)) return prev;
      if (prev.length >= MAX_METRICAS) {
        setAvisoMetricas(`Selecione no máximo ${MAX_METRICAS} métricas para comparar.`);
        if (avisoTimerRef.current) clearTimeout(avisoTimerRef.current);
        avisoTimerRef.current = setTimeout(() => setAvisoMetricas(null), 2600);
        return prev;
      }
      return [...prev, metrica];
    });
  };

  useEffect(() => {
    return () => {
      if (avisoTimerRef.current) clearTimeout(avisoTimerRef.current);
    };
  }, []);

  // Série em formato [timestamp, valor] para o eixo datetime do ApexCharts
  const series = useMemo(() => {
    return metricasAtivas.map((metrica) => ({
      name: METRICAS_CONFIG[metrica].label,
      color: METRICAS_CONFIG[metrica].color,
      data: serie.map((p) => [p.ts, p[metrica]]),
    }));
  }, [serie, metricasAtivas]);

  // Inicializa (e reinicializa) o gráfico com toolbar nativa do ApexCharts.
  // A toolbar oferece: seleção (zoom por arraste), zoom in, zoom out, pan/mover
  // e reset — comportamentos nativos, sem camada custom de gestos.
  useEffect(() => {
    let isMounted = true;
    const serieAnterior = serie;

    async function initChart() {
      if (!chartRef.current || serie.length === 0) return;

      const ApexChartsModule = (await import("apexcharts")).default;
      if (!isMounted) return;

      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
        } catch {
          // ignore
        }
      }

      // Sincroniza a janela visível quando a série muda (granularidade/período)
      if (janelaRef.current && serieAnterior !== serie) {
        janelaRef.current = null;
        setJanelaVisivel(null);
      }

      const options: ApexOptions = {
        chart: {
          id: "relatorio-evolucao-chart",
          type: "area",
          height: expandido ? 520 : 320,
          animations: { enabled: false },
          toolbar: {
            show: !isMobile,
            tools: {
              download: false,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
            },
            autoSelected: "pan",
          },
          zoom: {
            enabled: true,
            type: "x",
            autoScaleYaxis: true,
          },
          events: {
            zoomed: (_ctx: ApexCharts, opts?: { xaxis: { min: number; max: number } }) => {
              const min = opts?.xaxis?.min ?? null;
              const max = opts?.xaxis?.max ?? null;
              if (min !== null && max !== null) {
                janelaRef.current = { min, max };
                setJanelaVisivel({ min, max });
              }
            },
            selection: (_ctx: ApexCharts, opts?: { xaxis: { min: number; max: number } }) => {
              const min = opts?.xaxis?.min ?? null;
              const max = opts?.xaxis?.max ?? null;
              if (min !== null && max !== null) {
                janelaRef.current = { min, max };
                setJanelaVisivel({ min, max });
              }
            },
            beforeResetZoom: () => {
              janelaRef.current = null;
              setJanelaVisivel(null);
            },
          },
          background: "transparent",
          fontFamily: "inherit",
        },
        dataLabels: { enabled: false },
        markers: {
          size: 5,
          strokeWidth: 0,
          hover: { size: 7 },
        },
        stroke: { curve: "smooth", width: 2.5 },
        fill: {
          type: "gradient",
          gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.04, stops: [0, 95, 100] },
        },
        series,
        xaxis: {
          type: "datetime",
          tickAmount,
          labels: {
            datetimeUTC: false,
            formatter: formatarLabelEixo,
            style: {
              colors: isDarkMode ? "#B8B8B2" : "#666662",
              fontSize: isMobile ? "10px" : "11px",
            },
          },
          axisBorder: { color: isDarkMode ? "#3F3F3B" : "#E2E2DD" },
          axisTicks: { color: isDarkMode ? "#3F3F3B" : "#E2E2DD" },
        },
        yaxis: {
          labels: {
            formatter: (val: number) => {
              if (Math.abs(val) >= 1000) return `R$ ${(val / 1000).toFixed(1)}k`;
              return `R$ ${val.toFixed(0)}`;
            },
            style: {
              colors: isDarkMode ? "#B8B8B2" : "#666662",
              fontSize: "11px",
            },
          },
        },
        grid: {
          borderColor: isDarkMode ? "#2B2B29" : "#F4F4F0",
          strokeDashArray: 3,
        },
        tooltip: {
          enabled: true,
          theme: isDarkMode ? "dark" : "light",
          x: {
            show: true,
            format: "dd/MM/yyyy",
          },
          y: {
            formatter: (val: number) => formatMoney(val),
          },
        },
        legend: { show: false },
      };

      const chart = new ApexChartsModule(chartRef.current, options);
      chart.render();
      chartInstanceRef.current = chart;

      // reaplica a janela salva (ex.: após trocar de granularidade no mobile)
      const janela = janelaRef.current;
      if (janela) {
        chart.updateOptions({ xaxis: { min: janela.min, max: janela.max } });
      }
    }

    initChart();

    return () => {
      isMounted = false;
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
        } catch {
          // ignore
        }
      }
      chartInstanceRef.current = null;
    };
  }, [series, isDarkMode, isMobile, serie, expandido, tickAmount, formatarLabelEixo]);

  // Tecla R reseta zoom/pan; Esc fecha o modo ampliado
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      const tag = alvo?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key.toLowerCase() === "r") resetZoom();
      if (e.key === "Escape" && expandido) setExpandido(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [resetZoom, expandido]);

  const graficoVazio = serie.length === 0;
  const descricaoEscala =
    escalaSerieAtual === "ano"
      ? "agrupado por ano"
      : escalaSerieAtual === "mes"
        ? "agrupado por mês"
        : escalaSerieAtual === "semana"
          ? "agrupado por semana"
          : "por dia";

  const controlesZoomMobile = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={zoomIn}
        disabled={graficoVazio}
        className="w-9 h-9 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] flex items-center justify-center text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
        title="Aproximar"
        aria-label="Aproximar"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={zoomOut}
        disabled={graficoVazio || !zoomAtivo}
        className="w-9 h-9 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] flex items-center justify-center text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
        title="Afastar"
        aria-label="Afastar"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={moverEsquerda}
        disabled={graficoVazio || !zoomAtivo}
        className="w-9 h-9 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] flex items-center justify-center text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
        title="Mover para a esquerda"
        aria-label="Mover para a esquerda"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={moverDireita}
        disabled={graficoVazio || !zoomAtivo}
        className="w-9 h-9 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] flex items-center justify-center text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
        title="Mover para a direita"
        aria-label="Mover para a direita"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={resetZoom}
        disabled={graficoVazio || !zoomAtivo}
        className="w-9 h-9 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] flex items-center justify-center text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
        title="Redefinir (tecla R)"
        aria-label="Redefinir zoom"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );

  const conteudoGrafico = (
    <div className="w-full relative min-h-[300px] sm:min-h-[320px]">
      <div ref={chartRef} className="w-full" />
      {graficoVazio && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-[#888882] pointer-events-none">
          Nenhum dado de venda neste período.
        </div>
      )}
    </div>
  );

  const corpoCard = (
    <>
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
              Evolução no período
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#EEEDE7] dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2] border border-[#E2E2DD] dark:border-[#3F3F3B] shrink-0">
              {periodoLabel}
            </span>
          </div>
          <p className="text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5">
            Linha do tempo financeira interativa com investigação de dias, semanas, meses e anos.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {isMobile && zoomAtivo && (
            <button
              type="button"
              onClick={resetZoom}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 cursor-pointer hover:bg-amber-200 transition-colors"
              title="Redefinir zoom para visão original"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Resetar zoom</span>
            </button>
          )}
          {isMobile && controlesZoomMobile}
          <button
            type="button"
            onClick={() => setExpandido(true)}
            disabled={graficoVazio}
            className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] flex items-center justify-center text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
            title="Ampliar gráfico"
            aria-label="Ampliar gráfico"
          >
            <Maximize2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

      {/* Granularidade */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-bold text-[#888882] mr-1">Granularidade:</span>
        {GRANULARIDADES.map((g) => (
          <button
            key={g.val}
            type="button"
            onClick={() => {
              setGranularidade(g.val);
              setTimeout(resetZoom, 0);
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
              granularidade === g.val
                ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] border-transparent font-bold"
                : "bg-white dark:bg-[#20201E] text-[#666662] dark:text-[#B8B8B2] border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400"
            }`}
          >
            {g.label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-[#888882]">
          {serie.length} {serie.length === 1 ? "ponto" : "pontos"} ({descricaoEscala})
        </span>
      </div>

      {/* Comparar métricas (até 3) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 border-t border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70">
        <span className="text-[11px] font-bold text-[#888882] mr-1 flex items-center gap-1">
          <Layers className="w-3 h-3" />
          Comparar métricas (até {MAX_METRICAS}):
        </span>
        {(Object.keys(METRICAS_CONFIG) as MetricaGrafico[]).map((metrica) => {
          const cfg = METRICAS_CONFIG[metrica];
          const isAtiva = metricasAtivas.includes(metrica);
          return (
            <button
              key={metrica}
              type="button"
              onClick={() => {
                if (isAtiva) {
                  setMetricasAtivas((prev) => (prev.length === 1 ? prev : prev.filter((m) => m !== metrica)));
                } else {
                  toggleMetrica(metrica);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isAtiva
                  ? `${cfg.lightBg} ${cfg.darkBg} font-bold shadow-xs`
                  : "bg-transparent border-transparent text-[#888882] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29]"
              }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {avisoMetricas && (
        <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg px-2.5 py-1.5">
          {avisoMetricas}
        </div>
      )}

      {conteudoGrafico}

      <div className="text-[11px] text-[#888882] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-2 border-t border-[#E2E2DD]/50 dark:border-[#3F3F3B]/50">
        <span className="hidden sm:block">
          Use a toolbar do gráfico para zoom, mover e redefinir. Passe o mouse nos pontos para ver os valores.
        </span>
        <span className="sm:hidden">
          Use os botões do gráfico para aproximar, mover e redefinir. Toque nos pontos para ver os valores.
        </span>
        <span className="opacity-80">
          {granularidade === "ano"
            ? "Ano: exibido por meses."
            : granularidade === "mes"
              ? "Mês: exibido por dias."
              : granularidade === "semana"
                ? "Semana: blocos de 7 dias."
                : "Use os botões e a toolbar para explorar o período."}
        </span>
      </div>
    </>
  );

  if (expandido) {
    return createPortal(
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[90] overflow-y-auto overflow-x-hidden flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-fadeIn"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setExpandido(false);
        }}
      >
        <div className="relative w-full max-w-6xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl shadow-2xl p-4 sm:p-6 z-10 my-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Evolução no período — ampliado
              </h3>
              <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
                {periodoLabel} • {descricaoEscala}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isMobile && controlesZoomMobile}
              <button
                type="button"
                onClick={() => setExpandido(false)}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] flex items-center justify-center text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Fechar gráfico ampliado"
                title="Fechar (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {conteudoGrafico}
          <div className="text-[11px] text-[#888882] hidden sm:block">
            Use a toolbar do gráfico para zoom, mover e redefinir. Passe o mouse nos pontos para ver os valores. Esc: fechar
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return (
    <article className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-4 max-w-full overflow-hidden">
      {corpoCard}
    </article>
  );
}
