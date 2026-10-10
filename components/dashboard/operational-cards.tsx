interface OperationalCardsProps {
  vendasRealizadas: number;
  servicosRealizados: number;
  produtosVendidos: number;
  estoqueBaixoCount: number;
  loading?: boolean;
  onOpenLowStockModal: () => void;
}

export function OperationalCards({
  vendasRealizadas,
  servicosRealizados,
  produtosVendidos,
  estoqueBaixoCount,
  loading = false,
  onOpenLowStockModal,
}: OperationalCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {/* 1. Vendas realizadas */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs transition-colors dark:border-zinc-800/80 dark:bg-zinc-900">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Vendas
          </span>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {loading ? "..." : vendasRealizadas}
          </span>
        </div>
      </div>

      {/* 2. Serviços realizados */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs transition-colors dark:border-zinc-800/80 dark:bg-zinc-900">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879a3 3 0 11-4.242-4.242L12 12m0 0l-2.879-2.879a3 3 0 114.242-4.242L12 12z"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Serviços
          </span>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {loading ? "..." : servicosRealizados}
          </span>
        </div>
      </div>

      {/* 3. Produtos vendidos */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs transition-colors dark:border-zinc-800/80 dark:bg-zinc-900">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Produtos
          </span>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {loading ? "..." : produtosVendidos}
          </span>
        </div>
      </div>

      {/* 4. Estoque baixo */}
      <button
        type="button"
        onClick={onOpenLowStockModal}
        disabled={estoqueBaixoCount === 0 || loading}
        className={`flex items-center justify-between rounded-2xl border p-4 text-left shadow-2xs transition-all ${
          estoqueBaixoCount > 0
            ? "border-amber-500/30 bg-amber-50/40 hover:border-amber-500/60 dark:border-amber-500/30 dark:bg-amber-950/20 dark:hover:border-amber-500/50 cursor-pointer"
            : "border-zinc-200 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 cursor-default"
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              estoqueBaixoCount > 0
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Estoque baixo
            </span>
            <span
              className={`text-xl font-bold tracking-tight ${
                estoqueBaixoCount > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {loading ? "..." : estoqueBaixoCount}
            </span>
          </div>
        </div>

        {estoqueBaixoCount > 0 && !loading && (
          <span className="text-xs font-semibold text-amber-700 underline-offset-4 hover:underline dark:text-amber-400 shrink-0">
            Ver itens
          </span>
        )}
      </button>
    </div>
  );
}
