import { Scissors, Coffee, ShoppingBag, AlertTriangle } from "lucide-react";

interface OperationalCardsProps {
  servicosRealizados: number;
  bebidasVendidas: number;
  produtosVendidos: number;
  estoqueBaixoCount: number;
  loading?: boolean;
  onOpenOperationalDetail?: (tipo: "servicos" | "bebidas" | "produtos") => void;
  onOpenLowStockModal: () => void;
}

export function OperationalCards({
  servicosRealizados,
  bebidasVendidas,
  produtosVendidos,
  estoqueBaixoCount,
  loading = false,
  onOpenOperationalDetail,
  onOpenLowStockModal,
}: OperationalCardsProps) {
  return (
    <section
      aria-label="Indicadores operacionais"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      {/* 1. Serviços realizados (Azul / Informativo - Clicável) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenOperationalDetail?.("servicos")}
        className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-blue-400 dark:hover:border-blue-500 flex items-center gap-3 cursor-pointer transition-all hover:shadow-xs active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 group"
        title="Clique para visualizar o detalhamento dos serviços realizados"
      >
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Scissors className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2] leading-tight break-words">
            Serviços realizados
          </span>
          <span className="text-base sm:text-lg font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block mt-0.5">
            {loading ? "..." : servicosRealizados}
          </span>
        </div>
      </div>

      {/* 2. Bebidas vendidas (Âmbar - Clicável) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenOperationalDetail?.("bebidas")}
        className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-amber-400 dark:hover:border-amber-500 flex items-center gap-3 cursor-pointer transition-all hover:shadow-xs active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400 group"
        title="Clique para visualizar o detalhamento das bebidas vendidas"
      >
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Coffee className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2] leading-tight break-words">
            Bebidas vendidas
          </span>
          <span className="text-base sm:text-lg font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block mt-0.5">
            {loading ? "..." : bebidasVendidas}
          </span>
        </div>
      </div>

      {/* 3. Outros produtos (Púrpura - Clicável) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenOperationalDetail?.("produtos")}
        className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-purple-400 dark:hover:border-purple-500 flex items-center gap-3 cursor-pointer transition-all hover:shadow-xs active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-400 group"
        title="Clique para visualizar o detalhamento de outros produtos vendidos"
      >
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <ShoppingBag className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2] leading-tight break-words">
            Outros produtos
          </span>
          <span className="text-base sm:text-lg font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block mt-0.5">
            {loading ? "..." : produtosVendidos}
          </span>
        </div>
      </div>

      {/* 4. Estoque baixo (Âmbar atenção / Clicável) */}
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenLowStockModal}
        className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-amber-400 dark:hover:border-amber-500 flex items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-xs active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400 group"
        title="Clique para visualizar a lista de produtos com estoque baixo"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              estoqueBaixoCount > 0
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-[#FAF9F5] dark:bg-[#2B2B29] text-[#666662]"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2] leading-tight break-words">
              Estoque baixo
            </span>
            <span
              className={`text-base sm:text-lg font-extrabold block mt-0.5 ${
                estoqueBaixoCount > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-[#2F2F2D] dark:text-[#F4F4F0]"
              }`}
            >
              {loading ? "..." : estoqueBaixoCount}
            </span>
          </div>
        </div>

        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 group-hover:underline shrink-0">
          Ver mais
        </span>
      </div>
    </section>
  );
}
