import Link from "next/link";

export interface ProdutoEstoqueBaixo {
  id: string;
  nome: string;
  estoque_atual: number;
  estoque_minimo: number | null;
  preco_venda: number;
}

interface LowStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  produtos: ProdutoEstoqueBaixo[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function LowStockModal({
  isOpen,
  onClose,
  produtos,
}: LowStockModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="low-stock-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl transition-colors dark:border-zinc-800 dark:bg-zinc-900 sm:p-6 space-y-4 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
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
            <div>
              <h3
                id="low-stock-modal-title"
                className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
              >
                Produtos com estoque baixo
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Itens atingindo ou abaixo do limite mínimo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Lista de itens */}
        <div className="divide-y divide-zinc-100 overflow-y-auto pr-1 space-y-1 dark:divide-zinc-800/60">
          {produtos.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between py-3 text-xs"
            >
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {p.nome}
                </h4>
                <p className="mt-0.5 text-zinc-500 dark:text-zinc-400">
                  Preço de venda: {formatCurrency(p.preco_venda)}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                  Saldo: {p.estoque_atual}
                </span>
                <span className="block mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                  Mínimo: {p.estoque_minimo ?? 0}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/operacao/estoque"
            onClick={onClose}
            className="text-xs font-semibold text-red-600 underline-offset-4 hover:underline dark:text-red-400"
          >
            Gerenciar estoque →
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
