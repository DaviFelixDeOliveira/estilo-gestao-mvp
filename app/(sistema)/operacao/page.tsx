import Link from "next/link";
import { Scissors, Package, Layers, ArrowRight } from "lucide-react";

export default function OperacaoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Operação
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Gestão operacional de serviços, produtos e controle de estoque.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Módulo Serviços (Ativo) */}
        <Link
          href="/operacao/servicos"
          className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 mb-4">
              <Scissors className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              Serviços
              <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
            </h3>
            <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              Cadastre, edite preços, custos e gerencie o catálogo para o PDV e Vitrine.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              Disponível
            </span>
          </div>
        </Link>

        {/* Módulo Produtos (Ativo) */}
        <Link
          href="/operacao/produtos"
          className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 mb-4">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              Produtos
              <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
            </h3>
            <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              Controle de produtos para revenda, categorias e precificação.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              Disponível
            </span>
          </div>
        </Link>

        {/* Módulo Estoque (Em preparação) */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 opacity-75 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Estoque
            </h3>
            <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              Entradas, perdas, ajustes e alertas de reposição de mercadorias.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
              Em breve
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
