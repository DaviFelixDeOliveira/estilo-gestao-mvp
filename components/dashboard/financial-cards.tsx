interface FinancialCardsProps {
  totalEntradas: number;
  totalSaidas: number;
  resultadoEstimado: number;
  quantidadeVendas: number;
  loading?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function FinancialCards({
  totalEntradas,
  totalSaidas,
  resultadoEstimado,
  quantidadeVendas,
  loading = false,
}: FinancialCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Faturamento */}
      <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs transition-colors dark:border-zinc-800/80 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Faturamento
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {loading ? (
              <div className="h-8 w-28 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            ) : (
              formatCurrency(totalEntradas)
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {loading ? "..." : `${quantidadeVendas} venda${quantidadeVendas === 1 ? "" : "s"} concluída${quantidadeVendas === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      {/* 2. Entradas */}
      <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs transition-colors dark:border-zinc-800/80 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Entradas
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {loading ? (
              <div className="h-8 w-28 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            ) : (
              formatCurrency(totalEntradas)
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Recebimentos em caixa
          </p>
        </div>
      </div>

      {/* 3. Saídas */}
      <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs transition-colors dark:border-zinc-800/80 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Saídas
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {loading ? (
              <div className="h-8 w-28 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            ) : (
              formatCurrency(totalSaidas)
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Despesas registradas
          </p>
        </div>
      </div>

      {/* 4. Resultado estimado */}
      <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs transition-colors dark:border-zinc-800/80 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Resultado estimado
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4">
          <div
            className={`text-2xl font-bold tracking-tight ${
              resultadoEstimado > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : resultadoEstimado < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {loading ? (
              <div className="h-8 w-28 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            ) : (
              formatCurrency(resultadoEstimado)
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Saldo líquido operacional
          </p>
        </div>
      </div>
    </div>
  );
}
