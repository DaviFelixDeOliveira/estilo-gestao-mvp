"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Maximize2, RotateCcw, ZoomIn, ZoomOut, X } from "lucide-react";
import type ApexCharts from "apexcharts";
import type { ApexOptions } from "apexcharts";

interface LucratividadeChartProps {
  categorias: Array<{
    category: string;
    faturamento: number;
    custo: number;
    lucro: number;
    margem: number;
  }>;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function LucratividadeChart({ categorias }: LucratividadeChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandido, setExpandido] = useState(false);
  // Faixa de categorias visível (zoom/pan). null = todas.
  const [faixa, setFaixa] = useState<{ ini: number; fim: number } | null>(null);

  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const ultimoIndice = Math.max(0, categorias.length - 1);

  const listaVisivel = useMemo(() => {
    if (!faixa) return categorias;
    const ini = Math.max(0, faixa.ini);
    const fim = Math.min(ultimoIndice, faixa.fim);
    if (ini >= fim) return categorias.slice(ini, ini + 1);
    return categorias.slice(ini, fim + 1);
  }, [categorias, faixa, ultimoIndice]);

  const vazio = categorias.length === 0;
  const zoomAtivo = faixa !== null;

  const aplicarFaixa = useCallback(
    (ini: number, fim: number) => {
      const nIni = Math.max(0, Math.min(ultimoIndice, ini));
      const nFim = Math.max(0, Math.min(ultimoIndice, fim));
      if (nIni === 0 && nFim === ultimoIndice) {
        setFaixa(null);
      } else if (nIni < nFim || (categorias.length === 1 && nIni === nFim)) {
        setFaixa({ ini: nIni, fim: nFim });
      }
    },
    [ultimoIndice, categorias.length]
  );

  const resetZoom = useCallback(() => setFaixa(null), []);

  const zoomIn = useCallback(() => {
    const atual = faixa || { ini: 0, fim: ultimoIndice };
    const largura = Math.max(1, atual.fim - atual.ini);
    const encolher = Math.max(1, Math.round(largura * 0.25));
    const novoIni = Math.min(atual.fim - 1, atual.ini + encolher);
    const novoFim = Math.max(novoIni, atual.fim - encolher);
    if (novoIni >= novoFim && largura === 1) return;
    aplicarFaixa(novoIni, Math.max(novoIni, novoFim));
  }, [faixa, ultimoIndice, aplicarFaixa]);

  const zoomOut = useCallback(() => {
    if (!faixa) return;
    const largura = faixa.fim - faixa.ini;
    const expandir = Math.max(1, Math.round(largura * 0.25));
    const novoIni = Math.max(0, faixa.ini - expandir);
    const novoFim = Math.min(ultimoIndice, faixa.fim + expandir);
    aplicarFaixa(novoIni, novoFim);
  }, [faixa, ultimoIndice, aplicarFaixa]);

  // Inicializa o gráfico ApexCharts (barra horizontal)
  useEffect(() => {
    let isMounted = true;

    async function initChart() {
      if (!chartRef.current || listaVisivel.length === 0) return;

      const ApexChartsModule = (await import("apexcharts")).default;
      if (!isMounted) return;

      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
        } catch {
          // ignore
        }
      }

      const options: ApexOptions = {
        chart: {
          type: "bar",
          height: expandido ? 480 : 280,
          toolbar: { show: false },
          background: "transparent",
          fontFamily: "inherit",
          animations: { enabled: false },
        },
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 4,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        series: [
          {
            name: "Faturamento",
            color: "#3B82F6",
            data: listaVisivel.map((c) => c.faturamento),
          },
          {
            name: "Custo",
            color: "#EF4444",
            data: listaVisivel.map((c) => c.custo),
          },
          {
            name: "Lucro",
            color: "#10B981",
            data: listaVisivel.map((c) => c.lucro),
          },
        ],
        xaxis: {
          categories: listaVisivel.map((c) => c.category),
          labels: {
            formatter: (val: string) => {
              const num = Number(val.replace(/\D/g, "")) || 0;
              if (Math.abs(num) >= 1000) return `R$ ${(num / 1000).toFixed(1)}k`;
              return `R$ ${num.toFixed(0)}`;
            },
            style: {
              colors: isDarkMode ? "#B8B8B2" : "#666662",
              fontSize: "11px",
            },
          },
          axisBorder: { color: isDarkMode ? "#3F3F3B" : "#E2E2DD" },
          axisTicks: { color: isDarkMode ? "#3F3F3B" : "#E2E2DD" },
        },
        yaxis: {
          labels: {
            style: {
              colors: isDarkMode ? "#B8B8B2" : "#666662",
              fontSize: "11px",
              fontWeight: 600,
            },
          },
        },
        grid: {
          borderColor: isDarkMode ? "#2B2B29" : "#F4F4F0",
          strokeDashArray: 3,
        },
        tooltip: {
          theme: isDarkMode ? "dark" : "light",
          y: { formatter: (val: number) => formatMoney(val) },
        },
        legend: {
          position: "top",
          horizontalAlign: "right",
          labels: {
            colors: isDarkMode ? "#B8B8B2" : "#666662",
          },
        },
      };

      const chart = new ApexChartsModule(chartRef.current, options);
      chart.render();
      chartInstanceRef.current = chart;
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
  }, [listaVisivel, isDarkMode, expandido]);

  // === Roda do mouse (zoom) + Tecla R (reset) + Esc (fecha ampliado) ===
  // Pan por arraste não é oferecido neste gráfico: a interação avançada fica
  // nos botões + / - / reset, que são estáveis e honestos no texto de ajuda.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || categorias.length === 0) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      const tag = alvo?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key.toLowerCase() === "r") {
        setFaixa(null);
      }
      if (e.key === "Escape" && expandido) {
        setExpandido(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [containerRef, categorias.length, expandido, zoomIn, zoomOut]);

  const controlesZoom = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={zoomIn}
        disabled={vazio}
        className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] flex items-center justify-center text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
        title="Aproximar visualização"
        aria-label="Aproximar visualização"
      >
        <ZoomIn className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
      </button>
      <button
        type="button"
        onClick={zoomOut}
        disabled={vazio || !zoomAtivo}
        className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] flex items-center justify-center text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
        title="Afastar visualização"
        aria-label="Afastar visualização"
      >
        <ZoomOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
      </button>
      <button
        type="button"
        onClick={resetZoom}
        disabled={vazio || !zoomAtivo}
        className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] flex items-center justify-center text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
        title="Redefinir zoom (tecla R)"
        aria-label="Redefinir zoom"
      >
        <RotateCcw className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
      </button>
    </div>
  );

  const corpoGrafico = (
    <div
      ref={containerRef}
      className="w-full relative min-h-[260px] sm:min-h-[280px]"
      style={{ touchAction: "pan-y" }}
    >
      <div ref={chartRef} className="w-full" />
      {vazio && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-[#888882]">
          Nenhuma categoria com vendas neste período.
        </div>
      )}
    </div>
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
        <div className="relative w-full max-w-5xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl shadow-2xl p-4 sm:p-6 z-10 my-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
              Lucratividade — ampliado
            </h3>
            <div className="flex items-center gap-2">
              {controlesZoom}
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
          {corpoGrafico}
          <div className="text-[11px] text-[#888882]">
            Roda do mouse: zoom • R: redefinir • Esc: fechar
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpandido(true)}
          disabled={vazio}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] text-[11px] font-semibold text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
          title="Ampliar gráfico"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Ampliar gráfico</span>
        </button>
        {controlesZoom}
      </div>
      {corpoGrafico}
      <div className="text-[11px] text-[#888882]">
        Roda do mouse: zoom • Botões para ajustar • R: redefinir
      </div>
    </div>
  );
}
