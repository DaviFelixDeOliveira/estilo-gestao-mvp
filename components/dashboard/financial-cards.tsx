import { DollarSign, TrendingUp, ArrowDownRight, PieChart } from "lucide-react";

export type ChartSeries = "faturamento" | "entradas" | "saidas" | "resultado";

interface FinancialCardsProps {
  faturamento: number;
  entradas: number;
  saidas: number;
  resultado: number;
  quantidadeVendas: number;
  hasData: boolean;
  loading?: boolean;
  activeSeries: ChartSeries;
  onSelectSeries: (series: ChartSeries) => void;
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function FinancialCards({
  faturamento,
  entradas,
  saidas,
  resultado,
  quantidadeVendas,
  hasData,
  loading = false,
  activeSeries,
  onSelectSeries,
}: FinancialCardsProps) {
  let resultadoColor = "text-[#2F2F2D] dark:text-[#F4F4F0]";
  let resultadoActiveRing = "border-neutral-400 dark:border-neutral-400 ring-2 ring-neutral-400/10";
  let resultadoIconBg = "bg-[#FAF9F5] dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0]";

  if (resultado > 0) {
    resultadoColor = "text-emerald-600 dark:text-emerald-400";
    resultadoActiveRing = "border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/10";
    resultadoIconBg = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  } else if (resultado < 0) {
    resultadoColor = "text-rose-600 dark:text-rose-400";
    resultadoActiveRing = "border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/10";
    resultadoIconBg = "bg-rose-500/10 text-rose-600 dark:text-rose-400";
  }

  return (
    <section
      aria-label="Indicadores principais"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      {/* 1. Faturamento */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectSeries("faturamento")}
        title="Clique para destacar Faturamento no gráfico"
        className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#222220] border shadow-xs flex flex-col justify-between min-h-[128px] cursor-pointer transition-all hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 ${
          activeSeries === "faturamento"
            ? "border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/10"
            : "border-[#E2E2DD] dark:border-[#3F3F3B]"
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2]">
          <span>Faturamento</span>
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight mt-3 mb-1 text-blue-600 dark:text-blue-400 ${
              !hasData && !loading
                ? "opacity-70 text-neutral-400 dark:text-neutral-500"
                : ""
            }`}
          >
            {loading ? (
              <div className="h-7 w-28 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            ) : (
              formatBRL(faturamento)
            )}
          </div>
          <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2] leading-tight break-words">
            {loading
              ? "Carregando..."
              : hasData
                ? `${quantidadeVendas} venda${quantidadeVendas === 1 ? "" : "s"} concluída${quantidadeVendas === 1 ? "" : "s"}`
                : "Nenhuma venda no período"}
          </p>
        </div>
      </div>

      {/* 2. Entradas */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectSeries("entradas")}
        title="Clique para destacar Entradas no gráfico"
        className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#222220] border shadow-xs flex flex-col justify-between min-h-[128px] cursor-pointer transition-all hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xs active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
          activeSeries === "entradas"
            ? "border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/10"
            : "border-[#E2E2DD] dark:border-[#3F3F3B]"
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2]">
          <span>Entradas</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight mt-3 mb-1 text-emerald-600 dark:text-emerald-400 ${
              !hasData && !loading
                ? "opacity-70 text-neutral-400 dark:text-neutral-500"
                : ""
            }`}
          >
            {loading ? (
              <div className="h-7 w-28 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            ) : (
              formatBRL(entradas)
            )}
          </div>
          <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2] leading-tight break-words">
            {loading
              ? "Carregando..."
              : hasData
                ? "Recebimentos em caixa"
                : "Nenhum recebimento em caixa"}
          </p>
        </div>
      </div>

      {/* 3. Saídas */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectSeries("saidas")}
        title="Clique para destacar Saídas no gráfico"
        className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#222220] border shadow-xs flex flex-col justify-between min-h-[128px] cursor-pointer transition-all hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-xs active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-400 ${
          activeSeries === "saidas"
            ? "border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/10"
            : "border-[#E2E2DD] dark:border-[#3F3F3B]"
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2]">
          <span>Saídas</span>
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight mt-3 mb-1 text-rose-600 dark:text-rose-400 ${
              !hasData && !loading
                ? "opacity-70 text-neutral-400 dark:text-neutral-500"
                : ""
            }`}
          >
            {loading ? (
              <div className="h-7 w-28 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            ) : (
              formatBRL(saidas)
            )}
          </div>
          <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2] leading-tight break-words">
            {saidas > 0 ? "Despesas registradas" : "Sem despesas registradas"}
          </p>
        </div>
      </div>

      {/* 4. Resultado estimado */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectSeries("resultado")}
        title="Clique para destacar Resultado no gráfico"
        className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#222220] border shadow-xs flex flex-col justify-between min-h-[128px] cursor-pointer transition-all hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-xs active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-neutral-400 ${
          activeSeries === "resultado"
            ? resultadoActiveRing
            : "border-[#E2E2DD] dark:border-[#3F3F3B]"
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2]">
          <span>Resultado estimado</span>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${resultadoIconBg}`}>
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight mt-3 mb-1 ${resultadoColor} ${
              !hasData && !loading
                ? "opacity-70 text-neutral-400 dark:text-neutral-500"
                : ""
            }`}
          >
            {loading ? (
              <div className="h-7 w-28 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            ) : (
              formatBRL(resultado)
            )}
          </div>
          <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2] leading-tight break-words">
            {hasData
              ? resultado >= 0
                ? "Saldo líquido positivo"
                : "Saldo líquido negativo"
              : "Aguardando movimentação inicial"}
          </p>
        </div>
      </div>
    </section>
  );
}
