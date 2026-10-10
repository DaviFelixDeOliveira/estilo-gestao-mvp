import Link from "next/link";
import { AlertTriangle, Info, X } from "lucide-react";

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

function formatBRL(val: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val);
}

export function LowStockModal({
  isOpen,
  onClose,
  produtos,
}: LowStockModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="low-stock-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#222220] rounded-2xl shadow-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] p-5 sm:p-6 space-y-4 max-h-[85vh] flex flex-col animate-slideUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E2DD] dark:border-[#3F3F3B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="low-stock-modal-title"
                className="text-base font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]"
              >
                Produtos com Estoque Baixo
              </h3>
              <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2]">
                Itens com saldo igual ou abaixo do estoque mínimo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Affected Products */}
        <div className="divide-y divide-[#EEEEEA] dark:divide-[#3F3F3B] overflow-y-auto flex-1 pr-1 space-y-1">
          {produtos.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#888882]">
              Nenhum produto com estoque baixo no momento.
            </div>
          ) : (
            produtos.map((p) => (
              <div
                key={p.id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0] text-sm">
                    {p.nome}
                  </h4>
                  <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2] mt-0.5">
                    Preço de venda: {formatBRL(p.preco_venda)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold text-xs">
                    Atual: {p.estoque_atual}
                  </span>
                  <span className="block text-[10px] text-neutral-400 mt-0.5">
                    Mínimo: {p.estoque_minimo ?? 0}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Informational Footer Callout */}
        <div className="p-3.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-start gap-2.5 text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            Itens com estoque baixo podem ficar indisponíveis para venda. Você pode registrar novas entradas na tela de estoque.
          </span>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-[#EEEEEA] dark:border-[#3F3F3B]">
          <Link
            href="/operacao/estoque"
            onClick={onClose}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
          >
            Gerenciar Estoque →
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
